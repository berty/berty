package bertyprotocol

import (
	"context"
	stdcrypto "crypto"
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/base64"

	"github.com/gofrs/uuid"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"golang.org/x/crypto/nacl/secretbox"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gopkg.in/square/go-jose.v2"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type ContextAuthValue uint32

const ContextTokenHashField ContextAuthValue = iota
const ServiceReplicationID = "rpl"

type AuthTokenVerifier struct {
	secret *[32]byte
	pk     stdcrypto.PublicKey
}

type AuthTokenIssuer struct {
	*AuthTokenVerifier
	signer jose.Signer
}

func NewAuthTokenVerifier(secret []byte, pk ed25519.PublicKey) (*AuthTokenVerifier, error) {
	secretArr, err := cryptoutil.KeySliceToArray(secret)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	return &AuthTokenVerifier{
		secret: secretArr,
		pk:     pk,
	}, nil
}

func NewAuthTokenIssuer(secret []byte, sk ed25519.PrivateKey) (*AuthTokenIssuer, error) {
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
	codePayload := &bertytypes.ServicesTokenCode{
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

func (r *AuthTokenVerifier) VerifyCode(code, codeVerifier string) (*bertytypes.ServicesTokenCode, error) {
	decrypted, err := r.decryptVerify(code)
	if err != nil {
		return nil, err
	}

	codeObj := &bertytypes.ServicesTokenCode{}
	if err := codeObj.Unmarshal(decrypted); err != nil {
		return nil, err
	}

	codeVerifierBytes, err := base64.RawURLEncoding.DecodeString(codeVerifier)
	if err != nil {
		return nil, err
	}

	codeChallengeArr := sha256.Sum256([]byte(base64.RawURLEncoding.EncodeToString(codeVerifierBytes)))
	codeChallenge := make([]byte, sha256.Size)
	for i, c := range codeChallengeArr {
		codeChallenge[i] = c
	}

	if base64.RawURLEncoding.EncodeToString(codeChallenge) != codeObj.CodeChallenge {
		return nil, errcode.ErrServicesAuthCodeChallenge
	}

	return codeObj, nil
}

func (r *AuthTokenIssuer) IssueToken(services []string) (string, error) {
	tokenID, err := uuid.NewV4()
	if err != nil {
		return "", errcode.ErrInternal.Wrap(err)
	}

	tokenPayload := &bertytypes.ServicesTokenCode{
		Services: services,
		TokenID:  tokenID.String(),
	}

	payload, err := tokenPayload.Marshal()
	if err != nil {
		return "", err
	}

	return r.encryptSign(payload)
}

func (r *AuthTokenVerifier) VerifyToken(token, serviceID string) (*bertytypes.ServicesTokenCode, error) {
	decrypted, err := r.decryptVerify(token)
	if err != nil {
		return nil, err
	}

	tokenObj := &bertytypes.ServicesTokenCode{}
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

		return context.WithValue(ctx, ContextTokenHashField, tokenData.TokenID), nil
	}
}
