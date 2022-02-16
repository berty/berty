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
	"gopkg.in/square/go-jose.v2"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
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
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("pk is nil"))
	}

	secretArr, err := cryptoutil.KeySliceToArray(secret)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	return &AuthTokenVerifier{
		secret:   secretArr,
		pk:       pk,
		issuerID: base64.StdEncoding.EncodeToString(pk),
	}, nil
}

func NewAuthTokenIssuer(secret []byte, sk ed25519.PrivateKey) (*AuthTokenIssuer, error) {
	if sk == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("sk is nil"))
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
	nonceSlice := make([]byte, len(nonce))
	for i, c := range nonce {
		nonceSlice[i] = c
	}

	jws, err := r.signer.Sign(append(nonceSlice, encrypted...))
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
		return "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("no services specified"))
	}

	if len(codeChallenge) == 0 {
		return "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("no codeChallenge specified"))
	}

	codePayload := &protocoltypes.ServicesTokenCode{
		Services:      services,
		CodeChallenge: codeChallenge,
	}

	payload, err := codePayload.Marshal()
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
		return nil, errcode.ErrCryptoDecrypt
	}

	nonce := [cryptoutil.NonceSize]byte{}
	for i := 0; i < cryptoutil.NonceSize; i++ {
		nonce[i] = data[i]
	}

	decrypted, ok := secretbox.Open(nil, data[cryptoutil.NonceSize:], &nonce, r.secret)
	if !ok {
		return nil, errcode.ErrCryptoDecrypt
	}

	return decrypted, nil
}

func (r *AuthTokenVerifier) VerifyCode(code, codeVerifier string) (*protocoltypes.ServicesTokenCode, error) {
	decrypted, err := r.decryptVerify(code)
	if err != nil {
		return nil, err
	}

	codeObj := &protocoltypes.ServicesTokenCode{}
	if err := codeObj.Unmarshal(decrypted); err != nil {
		return nil, err
	}

	if AuthSessionCodeChallenge(codeVerifier) != codeObj.CodeChallenge {
		return nil, errcode.ErrServicesAuthCodeChallenge
	}

	return codeObj, nil
}

func (r *AuthTokenIssuer) IssueToken(services []string) (string, error) {
	tokenID, err := uuid.NewV4()
	if err != nil {
		return "", errcode.ErrInternal.Wrap(err)
	}

	if len(services) == 0 {
		return "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("no services specified"))
	}

	tokenPayload := &protocoltypes.ServicesTokenCode{
		Services: services,
		TokenID:  tokenID.String(),
	}

	payload, err := tokenPayload.Marshal()
	if err != nil {
		return "", err
	}

	return r.encryptSign(payload)
}

func (r *AuthTokenVerifier) VerifyToken(token, serviceID string) (*protocoltypes.ServicesTokenCode, error) {
	decrypted, err := r.decryptVerify(token)
	if err != nil {
		return nil, err
	}

	tokenObj := &protocoltypes.ServicesTokenCode{}
	if err := tokenObj.Unmarshal(decrypted); err != nil {
		return nil, err
	}

	if tokenObj.TokenID == "" || tokenObj.CodeChallenge != "" {
		return nil, errcode.ErrServicesAuthServiceInvalidToken
	}

	for _, s := range tokenObj.Services {
		if s == serviceID {
			return tokenObj, nil
		}
	}

	return nil, errcode.ErrServicesAuthServiceNotSupported
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

		ctx = context.WithValue(ctx, authtypes.ContextTokenHashField, tokenData.TokenID)
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
