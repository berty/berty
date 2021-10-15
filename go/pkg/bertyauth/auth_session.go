package bertyauth

import (
	"crypto/sha256"
	"encoding/base64"

	"berty.tech/berty/v2/go/internal/cryptoutil"
)

type AuthSession struct {
	State        string
	CodeVerifier string // CodeVerifier base64 encoded random value
	BaseURL      string
}

func AuthSessionCodeChallenge(codeVerifier string) string {
	codeChallengeArr := sha256.Sum256([]byte(codeVerifier))
	codeChallenge := make([]byte, sha256.Size)
	for i, c := range codeChallengeArr {
		codeChallenge[i] = c
	}

	return base64.RawURLEncoding.EncodeToString(codeChallenge)
}

func AuthSessionCodeVerifierAndChallenge() (string, string, error) {
	verifierArr, err := cryptoutil.GenerateNonce()
	if err != nil {
		return "", "", err
	}

	codeVerifierBytes := make([]byte, cryptoutil.NonceSize)
	for i, c := range verifierArr {
		codeVerifierBytes[i] = c
	}

	verifier := base64.RawURLEncoding.EncodeToString(codeVerifierBytes)

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

	stateBytes := make([]byte, cryptoutil.NonceSize)
	for i, c := range state {
		stateBytes[i] = c
	}

	auth := &AuthSession{
		BaseURL:      baseURL,
		State:        base64.RawURLEncoding.EncodeToString(stateBytes),
		CodeVerifier: verifier,
	}

	return auth, challenge, nil
}
