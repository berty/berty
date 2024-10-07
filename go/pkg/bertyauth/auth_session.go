package bertyauth

import (
	"crypto/sha256"
	"encoding/base64"

	"berty.tech/weshnet/v2/pkg/cryptoutil"
)

type AuthSession struct {
	State        string
	CodeVerifier string // CodeVerifier base64 encoded random value
	BaseURL      string
}

func AuthSessionCodeChallenge(codeVerifier string) string {
	codeChallenge := sha256.Sum256([]byte(codeVerifier))

	return base64.RawURLEncoding.EncodeToString(codeChallenge[:])
}

func AuthSessionCodeVerifierAndChallenge() (string, string, error) {
	verifierArr, err := cryptoutil.GenerateNonce()
	if err != nil {
		return "", "", err
	}

	verifier := base64.RawURLEncoding.EncodeToString(verifierArr[:])

	return verifier, AuthSessionCodeChallenge(verifier), nil
}

func NewAuthSession(baseURL string) (*AuthSession, string, error) {
	state, err := cryptoutil.GenerateNonce()
	if err != nil {
		return nil, "", err
	}

	verifier, challenge, err := AuthSessionCodeVerifierAndChallenge()
	if err != nil {
		return nil, "", err
	}

	auth := &AuthSession{
		BaseURL:      baseURL,
		State:        base64.RawURLEncoding.EncodeToString(state[:]),
		CodeVerifier: verifier,
	}

	return auth, challenge, nil
}
