package bertyauth

import (
	"context"
	stdcrypto "crypto"
	"crypto/ed25519"
	"encoding/base64"
	"fmt"

	"github.com/gofrs/uuid"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"golang.org/x/crypto/nacl/secretbox"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"
	"gopkg.in/square/go-jose.v2"

	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/v2/pkg/cryptoutil"
)

type AuthTokenVerifier struct {
	secret   *[32]byte
	pk       stdcrypto.PublicKey
	issuerID string
}

type AuthTokenIssuer struct {
	*AuthTokenVerifier
	signer jose.Signer
}

func NewAuthTokenVerifier(secret []byte, pk ed25519.PublicKey) (*AuthTokenVerifier, error) {
	if pk == nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("pk is nil"))
	}

	secretArr, err := cryptoutil.KeySliceToArray(secret)
	if err != nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(err)
	}

	return &AuthTokenVerifier{
		secret:   secretArr,
		pk:       pk,
		issuerID: base64.StdEncoding.EncodeToString(pk),
	}, nil
}

func NewAuthTokenIssuer(secret []byte, sk ed25519.PrivateKey) (*AuthTokenIssuer, error) {
	if sk == nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("sk is nil"))
	}

	tokVerifier, err := NewAuthTokenVerifier(secret, sk.Public().(ed25519.PublicKey))
	if err != nil {
		return nil, err
	}

	signer, err := jose.NewSigner(jose.SigningKey{
		Algorithm: jose.EdDSA,
		Key:       sk,
	}, &jose.SignerOptions{})
	if err != nil {
		return nil, err
	}

	return &AuthTokenIssuer{
		AuthTokenVerifier: tokVerifier,
		signer:            signer,
	}, nil
}

func (r *AuthTokenIssuer) encryptSign(payload []byte) (string, error) {
	nonce, err := cryptoutil.GenerateNonce()
	if err != nil {
		return "", err
	}

	encrypted := secretbox.Seal(nil, payload, nonce, r.secret)

	jws, err := r.signer.Sign(append(nonce[:], encrypted...))
	if err != nil {
		return "", err
	}

	tok, err := jws.CompactSerialize()
	if err != nil {
		return "", err
	}

	return tok, nil
}

func (r *AuthTokenIssuer) IssueCode(codeChallenge string, services []string) (string, error) {
	if len(services) == 0 {
		return "", errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("no services specified"))
	}

	if len(codeChallenge) == 0 {
		return "", errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("no codeChallenge specified"))
	}

	codePayload := &messengertypes.ServicesTokenCode{
		Services:      services,
		CodeChallenge: codeChallenge,
	}

	payload, err := proto.Marshal(codePayload)
	if err != nil {
		return "", err
	}

	return r.encryptSign(payload)
}

func (r *AuthTokenVerifier) decryptVerify(token string) ([]byte, error) {
	parsed, err := jose.ParseSigned(token)
	if err != nil {
		return nil, err
	}

	data, err := parsed.Verify(r.pk)
	if err != nil {
		return nil, err
	}

	if len(data) < secretbox.Overhead+cryptoutil.NonceSize {
		return nil, errcode.ErrCode_ErrCryptoDecrypt
	}

	nonce := [cryptoutil.NonceSize]byte{}
	for i := 0; i < cryptoutil.NonceSize; i++ {
		nonce[i] = data[i]
	}

	decrypted, ok := secretbox.Open(nil, data[cryptoutil.NonceSize:], &nonce, r.secret)
	if !ok {
		return nil, errcode.ErrCode_ErrCryptoDecrypt
	}

	return decrypted, nil
}

func (r *AuthTokenVerifier) VerifyCode(code, codeVerifier string) (*messengertypes.ServicesTokenCode, error) {
	decrypted, err := r.decryptVerify(code)
	if err != nil {
		return nil, err
	}

	codeObj := &messengertypes.ServicesTokenCode{}
	if err := proto.Unmarshal(decrypted, codeObj); err != nil {
		return nil, err
	}

	if AuthSessionCodeChallenge(codeVerifier) != codeObj.CodeChallenge {
		return nil, errcode.ErrCode_ErrServicesAuthCodeChallenge
	}

	return codeObj, nil
}

func (r *AuthTokenIssuer) IssueToken(services []string) (string, error) {
	tokenID, err := uuid.NewV4()
	if err != nil {
		return "", errcode.ErrCode_ErrInternal.Wrap(err)
	}

	if len(services) == 0 {
		return "", errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("no services specified"))
	}

	tokenPayload := &messengertypes.ServicesTokenCode{
		Services: services,
		TokenId:  tokenID.String(),
	}

	payload, err := proto.Marshal(tokenPayload)
	if err != nil {
		return "", err
	}

	return r.encryptSign(payload)
}

func (r *AuthTokenVerifier) VerifyToken(token, serviceID string) (*messengertypes.ServicesTokenCode, error) {
	decrypted, err := r.decryptVerify(token)
	if err != nil {
		return nil, err
	}

	tokenObj := &messengertypes.ServicesTokenCode{}
	if err := proto.Unmarshal(decrypted, tokenObj); err != nil {
		return nil, err
	}

	if tokenObj.TokenId == "" || tokenObj.CodeChallenge != "" {
		return nil, errcode.ErrCode_ErrServicesAuthServiceInvalidToken
	}

	for _, s := range tokenObj.Services {
		if s == serviceID {
			return tokenObj, nil
		}
	}

	return nil, errcode.ErrCode_ErrServicesAuthServiceNotSupported
}

func (r *AuthTokenVerifier) GRPCAuthInterceptor(serviceID string) func(ctx context.Context) (context.Context, error) {
	return func(ctx context.Context) (context.Context, error) {
		token, err := grpc_auth.AuthFromMD(ctx, "bearer")
		if err != nil {
			return nil, err
		}

		tokenData, err := r.VerifyToken(token, serviceID)
		if err != nil {
			return nil, status.Errorf(codes.PermissionDenied, err.Error())
		}

		ctx = context.WithValue(ctx, authtypes.ContextTokenHashField, tokenData.TokenId)
		ctx = context.WithValue(ctx, authtypes.ContextTokenIssuerField, r.issuerID)

		return ctx, nil
	}
}

func GetAuthTokenVerifier(secret, pk string) (*AuthTokenVerifier, error) {
	rawSecret, err := base64.RawStdEncoding.DecodeString(secret)
	if err != nil {
		return nil, err
	}

	rawPK, err := base64.RawStdEncoding.DecodeString(pk)
	if err != nil {
		return nil, err
	}

	if len(rawPK) != ed25519.PublicKeySize {
		return nil, fmt.Errorf("empty or invalid pk size")
	}

	return NewAuthTokenVerifier(rawSecret, rawPK)
}
