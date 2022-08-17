package bertyvcissuer

import (
	"crypto"
	"crypto/ed25519"
	crand "crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
	"github.com/piprate/json-gold/ld"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/verifiablecredstypes"
)

func TestFlow(t *testing.T) {
	logger := zap.NewNop()

	const state = "teststate"
	const expectedIdentifier = "+33123456789"

	_, issuerPriv, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	accountPub, accountPriv, err := ed25519.GenerateKey(crand.Reader)
	require.NoError(t, err)

	rdvSeed := []byte("testrdvseed")

	issuer, err := New(&Config{
		ServerRootURL: "http://example.com",
		IssuerSignKey: issuerPriv,
		Logger:        logger,
		Flow: &FlowConfig{
			Type:          verifiablecredstypes.FlowType_FlowTypeCode,
			CodeGenerator: CodeGeneratorZero,
			CodeSenderClient: &PhoneCodeSenderMockService{
				Logger: logger,
			},
		},
	})
	require.NoError(t, err)

	req := httptest.NewRequest("GET", fmt.Sprintf("http://example.com/%s", PathChallenge), nil)
	wri := httptest.NewRecorder()
	issuer.challenge(wri, req)

	require.Equal(t, 400, wri.Code)

	req = httptest.NewRequest("GET", fmt.Sprintf("http://example.com/%s?berty_id=", PathChallenge), nil)
	wri = httptest.NewRecorder()
	issuer.challenge(wri, req)

	require.Equal(t, 400, wri.Code)

	id := &messengertypes.BertyID{
		DisplayName:          "displayName",
		PublicRendezvousSeed: rdvSeed,
		AccountPK:            accountPub,
	}
	link := id.GetBertyLink()
	_, web, err := bertylinks.MarshalLink(link)
	require.NoError(t, err)

	req = httptest.NewRequest("GET", fmt.Sprintf("http://example.com/%s?berty_id=%s&redirect_uri=%s&state=%s", PathChallenge, url.QueryEscape(web), DefaultRedirectURI, state), nil)
	wri = httptest.NewRecorder()
	issuer.challenge(wri, req)
	require.Equal(t, 200, wri.Code)

	challengeStruct := &verifiablecredstypes.AccountCryptoChallenge{}
	err = json.Unmarshal([]byte(wri.Body.String()), challengeStruct)
	require.NoError(t, err)

	challenge, err := base64.URLEncoding.DecodeString(challengeStruct.Challenge)
	require.NoError(t, err)

	challengeSig, err := accountPriv.Sign(crand.Reader, challenge, crypto.Hash(0))
	require.NoError(t, err)

	req = httptest.NewRequest("GET", fmt.Sprintf("http://example.com/%s?&challenge=%sFAIL&challenge_sig=%s", PathAuthenticate, challengeStruct.Challenge, base64.URLEncoding.EncodeToString(challengeSig)), nil)
	wri = httptest.NewRecorder()
	issuer.authenticate(wri, req)
	require.Equal(t, 400, wri.Code)

	req = httptest.NewRequest("GET", fmt.Sprintf("http://example.com/%s?&challenge=%s&challenge_sig=%sFAIL", PathAuthenticate, challengeStruct.Challenge, base64.URLEncoding.EncodeToString(challengeSig)), nil)
	wri = httptest.NewRecorder()
	issuer.authenticate(wri, req)
	require.Equal(t, 400, wri.Code)

	req = httptest.NewRequest("GET", fmt.Sprintf("http://example.com/%s?&challenge=%s&challenge_sig=%s", PathAuthenticate, challengeStruct.Challenge, base64.URLEncoding.EncodeToString(challengeSig)), nil)
	wri = httptest.NewRecorder()
	issuer.authenticate(wri, req)
	require.Equal(t, 302, wri.Code)

	pageURL := wri.Header().Get("Location")
	require.NotEmpty(t, pageURL)

	req = httptest.NewRequest("GET", pageURL, nil)
	wri = httptest.NewRecorder()
	issuer.authenticate(wri, req)
	require.Equal(t, 200, wri.Code)

	// Invalid phone number
	data := url.Values{}
	data.Set("identifier", "foo")
	req = httptest.NewRequest("POST", pageURL, strings.NewReader(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	wri = httptest.NewRecorder()
	issuer.authenticate(wri, req)
	require.Equal(t, 200, wri.Code)
	require.Contains(t, wri.Body.String(), "Invalid identifier")

	// Valid phone number
	data = url.Values{}
	data.Set("identifier", expectedIdentifier)
	req = httptest.NewRequest("POST", pageURL, strings.NewReader(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	wri = httptest.NewRecorder()
	issuer.authenticate(wri, req)
	require.Equal(t, 302, wri.Code)
	pageURL = wri.Header().Get("Location")
	require.NotEmpty(t, pageURL)

	req = httptest.NewRequest("GET", pageURL, nil)
	wri = httptest.NewRecorder()
	issuer.proof(wri, req)
	require.Equal(t, 200, wri.Code)

	// Wrong code
	data = url.Values{}
	data.Set("code", "123")
	req = httptest.NewRequest("POST", pageURL, strings.NewReader(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	wri = httptest.NewRecorder()
	issuer.proof(wri, req)
	require.Equal(t, 200, wri.Code)
	require.Contains(t, wri.Body.String(), "Invalid code submitted")

	// Correct code
	data = url.Values{}
	data.Set("code", "000000")
	req = httptest.NewRequest("POST", pageURL, strings.NewReader(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	wri = httptest.NewRecorder()
	issuer.proof(wri, req)
	require.Equal(t, 200, wri.Code, wri.Body.String()+"\n")
	pageURL = wri.Header().Get("x-auth-redirect")
	require.NotEmpty(t, pageURL)
	require.Contains(t, pageURL, "berty://vc/proof")

	parsedURL, err := url.Parse(pageURL)
	require.NoError(t, err)
	require.NotEmpty(t, parsedURL.Query().Get("state"))
	require.NotEmpty(t, parsedURL.Query().Get("credentials"))

	require.Equal(t, state, parsedURL.Query().Get("state"))

	credentialsStr := parsedURL.Query().Get("credentials")
	credentials, err := base64.StdEncoding.DecodeString(credentialsStr)
	require.NoError(t, err)
	require.NotEmpty(t, credentials)

	// Parse JWS and make sure it's coincide with JSON.
	// parsedCredential, err := verifiable.ParseCredential(
	//	credentials,
	//	verifiable.WithPublicKeyFetcher(verifiable.SingleKey(issuerPubKey, kms.ED25519)),
	//	verifiable.WithJSONLDDocumentLoader(getJSONLDDocumentLoader()))

	parsedCredential, err := verifiable.ParseCredential(
		credentials,
		verifiable.WithPublicKeyFetcher(EmbeddedPublicKeyFetcher),
		verifiable.WithJSONLDDocumentLoader(ld.NewDefaultDocumentLoader(http.DefaultClient)),
	)
	require.NoError(t, err)
	require.Equal(t, web, parsedCredential.ID)
	foundSubject, err := extractSubjectFromVC(parsedCredential)
	require.Equal(t, expectedIdentifier, foundSubject)
	validCredentials := credentials
	_ = validCredentials

	credentials = makeSignatureOfJWSInvalid(t, validCredentials)
	parsedCredential, err = verifiable.ParseCredential(
		credentials,
		verifiable.WithPublicKeyFetcher(EmbeddedPublicKeyFetcher),
		verifiable.WithJSONLDDocumentLoader(ld.NewDefaultDocumentLoader(http.DefaultClient)),
	)
	require.Error(t, err)

	credentials = makeContentOfJWSInvalid(t, validCredentials)
	parsedCredential, err = verifiable.ParseCredential(
		credentials,
		verifiable.WithPublicKeyFetcher(EmbeddedPublicKeyFetcher),
		verifiable.WithJSONLDDocumentLoader(ld.NewDefaultDocumentLoader(http.DefaultClient)),
	)
	require.Error(t, err)
}

func makeContentOfJWSInvalid(t *testing.T, credentials []byte) []byte {
	t.Helper()

	str := string(credentials)
	posStart := strings.Index(str, ".")
	posEnd := strings.LastIndex(str, ".")
	if posStart < 0 || posEnd < 0 {
		t.Fail()
	}

	decoded, err := base64.StdEncoding.DecodeString(str[posStart+1 : posEnd])
	require.NoError(t, err)

	encoded := base64.StdEncoding.EncodeToString([]byte(strings.Replace(string(decoded), "+33123456789", "+81234567890", 1)))

	str = str[0:posStart+1] + encoded + str[posEnd:]

	return []byte(str)
}

func makeSignatureOfJWSInvalid(t *testing.T, credentials []byte) []byte {
	t.Helper()

	str := string(credentials)
	pos := strings.LastIndex(str, ".")
	if pos < 0 {
		t.Fail()
	}

	str = str[:pos+4] + "AAAAAAAAAAAA" + str[pos+16:]

	return []byte(str)
}
