package bertyvcissuer

import (
	"context"
	"crypto/ed25519"
	crand "crypto/rand"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"testing"
	"time"

	ariesDocLD "github.com/hyperledger/aries-framework-go/pkg/doc/ld"
	"github.com/multiformats/go-multibase"
	"github.com/multiformats/go-multicodec"
	"go.uber.org/zap"
	"golang.org/x/crypto/curve25519"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/bertyvcissuer/templates"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	weshnet_vc "berty.tech/weshnet/pkg/bertyvcissuer"
	"berty.tech/weshnet/pkg/cryptoutil"
	"berty.tech/weshnet/pkg/verifiablecredstypes"
)

const cryptoChallengeTimeout = 10 * time.Minute

type SendVerificationCodeData struct {
	Recipient      string
	Code           string
	NetworkContext string
	Context        string
}

type VerificationCodeSender interface {
	SendVerificationCode(ctx context.Context, verificationData SendVerificationCodeData) error
	ValidateIdentifier(ctx context.Context, rawIdentifier string) (sanitized string, err error)
}

type VCIssuer struct {
	serverRootURL       string
	issuerID            string
	issuerSignKey       ed25519.PrivateKey
	issuerPriv          *[32]byte
	issuerPub           *[32]byte
	flow                *FlowConfig
	logger              *zap.Logger
	ariesDocumentLoader *ariesDocLD.DocumentLoader
}

type FlowConfig struct {
	Type             verifiablecredstypes.FlowType
	CodeGenerator    func(state *verifiablecredstypes.StateCode) (string, error)
	CodeSenderClient VerificationCodeSender
}

type Config struct {
	ServerRootURL string
	IssuerID      string
	IssuerSignKey *[32]byte
	Flow          *FlowConfig
	Logger        *zap.Logger
}

func New(config *Config) (*VCIssuer, error) {
	if config == nil {
		return nil, ErrNewConfigMissing
	}

	if config.Logger == nil {
		config.Logger = zap.NewNop()
	}

	if config.IssuerSignKey == nil {
		return nil, ErrNewConfigPrivateKeyMissing
	}

	issuerPub := &[32]byte{}
	curve25519.ScalarBaseMult(issuerPub, config.IssuerSignKey)

	ed25519PrivKey := ed25519.NewKeyFromSeed(config.IssuerSignKey[:])

	if len(config.IssuerID) == 0 {
		config.Logger.Warn("IssuerID not defined, falling back to a raw key representation. This is considered insecure as it don't allow key rotation/revocation")

		keyTypePrefix := make([]byte, 2)
		binary.PutUvarint(keyTypePrefix, uint64(multicodec.Ed25519Pub))

		mbKey, err := multibase.Encode(multibase.Base58BTC, append(keyTypePrefix, ed25519PrivKey.Public().(ed25519.PublicKey)...))
		if err != nil {
			return nil, err
		}

		config.IssuerID = fmt.Sprintf("did:key:%s#%s", mbKey, mbKey)
	}

	if config.Flow == nil {
		return nil, ErrNewConfigFlowMissing
	}

	if config.Flow.Type == verifiablecredstypes.FlowType_FlowTypeUndefined {
		return nil, ErrNewConfigFlowTypeMissing
	}

	if config.Flow.Type == verifiablecredstypes.FlowType_FlowTypeAuth || config.Flow.Type == verifiablecredstypes.FlowType_FlowTypeProof {
		return nil, ErrNewConfigFlowTypeUnimplemented
	}

	if config.Flow.Type == verifiablecredstypes.FlowType_FlowTypeCode {
		if config.Flow.CodeGenerator == nil {
			return nil, ErrNewConfigFlowCodeGeneratorMissing
		}

		if config.Flow.CodeSenderClient == nil {
			return nil, ErrNewConfigFlowCodeSenderMissing
		}
	}

	issuer := &VCIssuer{
		serverRootURL: config.ServerRootURL,
		issuerID:      config.IssuerID,
		issuerSignKey: ed25519PrivKey,
		issuerPriv:    config.IssuerSignKey,
		issuerPub:     issuerPub,
		flow:          config.Flow,
		logger:        config.Logger,
	}

	if err := issuer.initContextStore(); err != nil {
		return nil, err
	}

	return issuer, nil
}

func (i *VCIssuer) serveMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc(weshnet_vc.PathChallenge, i.challenge)
	mux.HandleFunc(weshnet_vc.PathAuthenticate, i.authenticate)
	mux.HandleFunc(weshnet_vc.PathProof, i.proof)

	return mux
}

func (i *VCIssuer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	i.serveMux().ServeHTTP(w, r)
}

func (i *VCIssuer) error(err error, w http.ResponseWriter, _ *http.Request) {
	i.logger.Warn("error", zap.Error(err))

	out, err := json.Marshal(JSONError{Error: err.Error()})
	if err != nil {
		w.WriteHeader(400)
		return
	}

	w.WriteHeader(400)
	_, _ = w.Write(out)
}

func (i *VCIssuer) challenge(w http.ResponseWriter, r *http.Request) {
	bertyID := r.URL.Query().Get(weshnet_vc.ParamBertyID)
	nonce, err := cryptoutil.GenerateNonce()
	if err != nil {
		i.error(err, w, r)
		return
	}

	state := r.URL.Query().Get(weshnet_vc.ParamState)
	if len(state) == 0 {
		i.error(ErrFlowStateMissing, w, r)
		return
	}

	redirectURI := r.URL.Query().Get(weshnet_vc.ParamRedirectURI)
	if len(redirectURI) == 0 {
		i.error(ErrFlowRedirectURIMissing, w, r)
		return
	}

	challenge, _, err := i.computeChallenge(time.Now(), bertyID, nonce[:], state, redirectURI)
	if err != nil {
		i.error(err, w, r)
		return
	}

	w.WriteHeader(200)
	data, err := json.Marshal(JSONChallenge{Challenge: base64.URLEncoding.EncodeToString(challenge)})
	if err != nil {
		i.error(err, w, r)
		return
	}

	_, err = w.Write(data)
	if err != nil {
		i.logger.Error("unable to write response", zap.Error(err))
	}
}

func (i *VCIssuer) computeChallenge(timestamp time.Time, bertyIDLink string, nonce []byte, state string, redirectURI string) (digest []byte, parsedLink *messengertypes.BertyLink, err error) {
	parsedLink, err = bertylinks.UnmarshalLink(bertyIDLink, nil)
	if err != nil {
		return nil, nil, errcode.ErrInvalidInput.Wrap(err)
	}

	timestampBytes, err := timestamp.MarshalBinary()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	out := &verifiablecredstypes.StateChallenge{
		Timestamp:   timestampBytes,
		Nonce:       nonce,
		BertyLink:   bertyIDLink,
		State:       state,
		RedirectURI: redirectURI,
	}

	digest, err = out.Marshal()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	boxed, err := box.SealAnonymous(nil, digest, i.issuerPub, crand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	return boxed, parsedLink, nil
}

func (i *VCIssuer) checkAndGetChallenge(challengeStr string) (*verifiablecredstypes.StateChallenge, []byte, error) {
	challengeBytes, err := base64.URLEncoding.DecodeString(challengeStr)
	if err != nil {
		return nil, nil, err
	}

	decryptedChallengeBytes, ok := box.OpenAnonymous(nil, challengeBytes, i.issuerPub, i.issuerPriv)
	if !ok {
		return nil, nil, ErrChallengeAuthenticity
	}

	challenge := &verifiablecredstypes.StateChallenge{}
	if err := challenge.Unmarshal(decryptedChallengeBytes); err != nil {
		return nil, nil, ErrChallengeVerify
	}

	issuedAt := time.Now()
	if err := issuedAt.UnmarshalBinary(challenge.Timestamp); err != nil {
		return nil, nil, ErrChallengeVerify
	}

	if issuedAt.Before(time.Now().Add(-cryptoChallengeTimeout)) {
		return nil, nil, ErrChallengeExpired
	}

	return challenge, challengeBytes, nil
}

func (i *VCIssuer) checkChallengeIssuerSig(challenge *verifiablecredstypes.StateChallenge, challengeBytes []byte, challengeSigStr string) error {
	challengeClientSig, err := base64.URLEncoding.DecodeString(challengeSigStr)
	if err != nil {
		return err
	}

	link, err := bertylinks.UnmarshalLink(challenge.BertyLink, nil)
	if err != nil {
		return err
	}

	if ok := ed25519.Verify(link.BertyID.AccountPK, challengeBytes, challengeClientSig); !ok {
		return ErrChallengeFailed
	}

	return nil
}

func (i *VCIssuer) checkAuthenticateChallenge(w http.ResponseWriter, r *http.Request) {
	challengeStr := r.URL.Query().Get(weshnet_vc.ParamChallenge)
	challenge, challengeBytes, err := i.checkAndGetChallenge(challengeStr)
	if err != nil {
		i.error(err, w, r)
		return
	}

	challengeSigStr := r.URL.Query().Get(weshnet_vc.ParamChallengeSig)
	if err := i.checkChallengeIssuerSig(challenge, challengeBytes, challengeSigStr); err != nil {
		i.error(err, w, r)
		return
	}

	timestamp, err := time.Now().MarshalBinary()
	if err != nil {
		i.error(err, w, r)
		return
	}

	stateStr, err := i.sealVerifiableContext(&verifiablecredstypes.StateCode{
		Timestamp:   timestamp,
		BertyLink:   challenge.BertyLink,
		RedirectURI: challenge.RedirectURI,
		State:       challenge.State,
	})
	if err != nil {
		i.error(err, w, r)
		return
	}

	http.Redirect(w, r, makeAuthenticateURL(i.serverRootURL, stateStr), 302)
}

func (i *VCIssuer) sealVerifiableContext(state *verifiablecredstypes.StateCode) (string, error) {
	stateToSerialize, err := state.Marshal()
	if err != nil {
		return "", errcode.ErrSerialization.Wrap(err)
	}

	stateData, err := box.SealAnonymous(nil, stateToSerialize, i.issuerPub, crand.Reader)
	if err != nil {
		return "", errcode.ErrCryptoEncrypt.Wrap(err)
	}

	return base64.URLEncoding.EncodeToString(stateData), nil
}

func (i *VCIssuer) openVerifiableContext(stateBase64 string) (*verifiablecredstypes.StateCode, error) {
	stateBytes, err := base64.URLEncoding.DecodeString(stateBase64)
	if err != nil {
		return nil, err
	}

	stateBytes, ok := box.OpenAnonymous(nil, stateBytes, i.issuerPub, i.issuerPriv)
	if !ok {
		return nil, err
	}

	state := &verifiablecredstypes.StateCode{}
	if err := state.Unmarshal(stateBytes); err != nil {
		return nil, err
	}

	issuedAt := time.Time{}
	if err := issuedAt.UnmarshalBinary(state.Timestamp); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if issuedAt.Before(time.Now().Add(-cryptoChallengeTimeout)) {
		return nil, ErrChallengeExpired
	}

	return state, nil
}

func (i *VCIssuer) authenticate(w http.ResponseWriter, r *http.Request) {
	stateStr := r.URL.Query().Get(weshnet_vc.ParamContext)
	if len(stateStr) == 0 {
		i.checkAuthenticateChallenge(w, r)
		return
	}

	state, err := i.openVerifiableContext(stateStr)
	if err != nil {
		i.error(err, w, r)
		return
	}

	formErrors := []string(nil)

	if r.Method == http.MethodPost {
		if err := r.ParseForm(); err != nil {
			i.error(err, w, r)
			return
		}
		state.Identifier = r.PostForm.Get(weshnet_vc.ParamIdentifier)
		if len(state.Identifier) == 0 {
			r.Method = http.MethodGet
			i.authenticate(w, r)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		sanitized, err := i.flow.CodeSenderClient.ValidateIdentifier(ctx, state.Identifier)
		if err != nil {
			formErrors = append(formErrors, ErrMsgInvalidIdentifier)
		} else {
			state.Identifier = sanitized
			state.Code, err = i.flow.CodeGenerator(state)

			if err == nil {
				stateStr, err := i.sealVerifiableContext(state)
				if err != nil {
					i.error(err, w, r)
					return
				}

				ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
				defer cancel()

				if err := i.flow.CodeSenderClient.SendVerificationCode(ctx, SendVerificationCodeData{
					Recipient: sanitized,
					Code:      state.Code,
					Context:   stateStr,
				}); err != nil {
					formErrors = append(formErrors, ErrMsgUnableToSendCode)
				} else {
					http.Redirect(w, r, makeProofURL(i.serverRootURL, stateStr), 302)
					return
				}
			} else {
				formErrors = append(formErrors, ErrMsgUnableToGenerateCode)
			}
		}
	}

	if err := templates.TemplateIdentifierInput.Execute(w, &templates.TemplateParamsIdentifier{
		Context:                stateStr,
		IdentifierLabel:        "Identifier",
		IdentifierPlaceholder:  "Identifier",
		IdentifierSubmitButton: "Get validation code",
		FormErrors:             formErrors,
	}); err != nil {
		i.error(err, w, r)
		return
	}
}

func (i *VCIssuer) proof(w http.ResponseWriter, r *http.Request) {
	stateStr := r.URL.Query().Get(weshnet_vc.ParamContext)
	if len(stateStr) == 0 {
		i.error(fmt.Errorf("missing context"), w, r)
		return
	}

	state, err := i.openVerifiableContext(stateStr)
	if err != nil {
		i.error(err, w, r)
		return
	}

	if len(state.Code) == 0 {
		http.Redirect(w, r, makeAuthenticateURL(i.serverRootURL, stateStr), 302)
		return
	}

	formErrors := []string(nil)

	if r.Method == http.MethodPost {
		if err := r.ParseForm(); err != nil {
			i.error(err, w, r)
			return
		}

		code := r.PostForm.Get(weshnet_vc.ParamCode)

		if code == state.Code {
			signedProof, err := i.CreateSignedProof(state.BertyLink, state.Identifier)
			if err != nil {
				i.error(err, w, r)
				return
			}

			uri := makeRedirectSuccessURI(state.RedirectURI, state.State, signedProof)
			w.Header().Add("x-auth-redirect", uri)

			if err := templates.TemplateRedirect.Execute(w, &templates.TemplateParamsRedirect{
				URI: uri,
			}); err != nil {
				i.error(err, w, r)
			}

			return
		}

		formErrors = append(formErrors, ErrMsgInvalidCode)
	}

	if err := templates.TemplateConfirmationInput.Execute(w,
		&templates.TemplateParamsConfirmation{
			Context:          stateStr,
			CodeLabel:        "Code",
			CodePlaceholder:  "Code",
			CodeSubmitButton: "Verify",
			FormErrors:       formErrors,
		}); err != nil {
		i.error(err, w, r)
		return
	}
}

func (i *VCIssuer) TestHelperIssueTokenCallbackURI(t *testing.T, initURL string, identifier string) string {
	t.Helper()

	timestamp, err := time.Now().MarshalBinary()
	if err != nil {
		t.Error(err)
		return ""
	}

	parsedInitURL, err := url.Parse(initURL)
	if err != nil {
		t.Error(err)
		return ""
	}

	challengeStr := parsedInitURL.Query().Get(weshnet_vc.ParamChallenge)
	challenge, challengeBytes, err := i.checkAndGetChallenge(challengeStr)
	if err != nil {
		t.Error(err)
		return ""
	}

	challengeSigStr := parsedInitURL.Query().Get(weshnet_vc.ParamChallengeSig)
	if err := i.checkChallengeIssuerSig(challenge, challengeBytes, challengeSigStr); err != nil {
		t.Error(err)
		return ""
	}

	stateCode := &verifiablecredstypes.StateCode{
		Timestamp:   timestamp,
		BertyLink:   challenge.BertyLink,
		RedirectURI: challenge.RedirectURI,
		State:       challenge.State,
	}

	signedProof, err := i.CreateSignedProof(challenge.BertyLink, identifier)
	if err != nil {
		t.Error(err)
		return ""
	}

	return makeRedirectSuccessURI(stateCode.RedirectURI, stateCode.State, signedProof)
}

func (i *VCIssuer) GetIssuerID() string {
	return i.issuerID
}

func (i *VCIssuer) GetServerRootURL() string {
	return i.serverRootURL
}
