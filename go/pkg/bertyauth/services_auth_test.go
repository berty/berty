package bertyauth

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNewAuthTokenVerifier(t *testing.T) {
	secret, pk, _ := HelperGenerateTokenIssuerSecrets(t)
	verifier, err := NewAuthTokenVerifier(secret, pk)

	require.NoError(t, err)
	require.NotNil(t, verifier)

	verifier, err = NewAuthTokenVerifier(secret, nil)

	require.Error(t, err)
	require.Nil(t, verifier)

	secret = []byte{1, 2, 3}
	verifier, err = NewAuthTokenVerifier(secret, pk)

	require.Error(t, err)
	require.Nil(t, verifier)
}

func TestNewAuthTokenIssuer(t *testing.T) {
	secret, _, sk := HelperGenerateTokenIssuerSecrets(t)
	issuer, err := NewAuthTokenIssuer(secret, sk)

	require.NoError(t, err)
	require.NotNil(t, issuer)

	issuer, err = NewAuthTokenIssuer(secret, nil)
	require.Error(t, err)
	require.Nil(t, issuer)

	issuer, err = NewAuthTokenIssuer(nil, sk)
	require.Error(t, err)
	require.Nil(t, issuer)

	secret = []byte{1, 2, 3}
	issuer, err = NewAuthTokenIssuer(secret, sk)
	require.Error(t, err)
	require.Nil(t, issuer)
}

func TestIssueCode(t *testing.T) {
	_, challenge, err := AuthSessionCodeVerifierAndChallenge()
	require.NoError(t, err)

	secret, _, sk := HelperGenerateTokenIssuerSecrets(t)
	issuer, err := NewAuthTokenIssuer(secret, sk)

	require.NoError(t, err)
	require.NotNil(t, issuer)

	code, err := issuer.IssueCode(challenge, []string{})
	require.Error(t, err)
	require.Empty(t, code)

	code, err = issuer.IssueCode(challenge, nil)
	require.Error(t, err)
	require.Empty(t, code)

	code, err = issuer.IssueCode("", []string{"service"})
	require.Error(t, err)
	require.Empty(t, code)

	code, err = issuer.IssueCode(challenge, []string{"service"})
	require.NoError(t, err)
	require.NotEmpty(t, code)

	code2, err := issuer.IssueCode(challenge, []string{"service"})
	require.NoError(t, err)
	require.NotEmpty(t, code)

	require.NotEqual(t, code, code2)
}

func TestAuthSessionCodeChallenge(t *testing.T) {
	require.Equal(t, AuthSessionCodeChallenge("verifier"), "iMnq5o6zALKXGivsnlom_0F5_WYda32GHkxlV7mq7hQ")
}

func TestVerifyCode(t *testing.T) {
	services := []string{"service"}

	verifier, challenge, err := AuthSessionCodeVerifierAndChallenge()
	require.NoError(t, err)

	_, otherChallenge, err := AuthSessionCodeVerifierAndChallenge()
	require.NoError(t, err)

	secret, _, sk := HelperGenerateTokenIssuerSecrets(t)
	issuer, err := NewAuthTokenIssuer(secret, sk)

	require.NoError(t, err)
	require.NotNil(t, issuer)

	code, err := issuer.IssueCode(challenge, services)
	require.NoError(t, err)
	require.NotEmpty(t, code)

	otherCode, err := issuer.IssueCode(otherChallenge, services)
	require.NoError(t, err)
	require.NotEmpty(t, code)

	tokenCode, err := issuer.VerifyCode(code, verifier)
	require.NoError(t, err)
	require.NotEmpty(t, tokenCode)
	require.Equal(t, services, tokenCode.Services)
	require.Equal(t, challenge, tokenCode.CodeChallenge)

	tokenCode, err = issuer.VerifyCode(code, "rubbish")
	require.Error(t, err)
	require.Empty(t, tokenCode)

	tokenCode, err = issuer.VerifyCode("rubbish", verifier)
	require.Error(t, err)
	require.Empty(t, tokenCode)

	tokenCode, err = issuer.VerifyCode(otherCode, verifier)
	require.Error(t, err)
	require.Empty(t, tokenCode)
}

func TestIssueToken(t *testing.T) {
	services := []string{"service"}

	secret, _, sk := HelperGenerateTokenIssuerSecrets(t)
	issuer, err := NewAuthTokenIssuer(secret, sk)
	require.NoError(t, err)
	require.NotNil(t, issuer)

	token, err := issuer.IssueToken(services)
	require.NoError(t, err)
	require.NotEmpty(t, token)

	token2, err := issuer.IssueToken(services)
	require.NoError(t, err)
	require.NotEmpty(t, token)
	require.NotEqual(t, token, token2)

	token, err = issuer.IssueToken(nil)
	require.Error(t, err)
	require.Empty(t, token)

	token, err = issuer.IssueToken([]string{})
	require.Error(t, err)
	require.Empty(t, token)
}

func TestVerifyToken(t *testing.T) {
	services := []string{"service"}

	secret, _, sk := HelperGenerateTokenIssuerSecrets(t)
	issuer, err := NewAuthTokenIssuer(secret, sk)
	require.NoError(t, err)
	require.NotNil(t, issuer)

	secret2, _, sk2 := HelperGenerateTokenIssuerSecrets(t)
	issuer2, err := NewAuthTokenIssuer(secret2, sk2)
	require.NoError(t, err)
	require.NotNil(t, issuer2)

	token, err := issuer.IssueToken(services)
	require.NoError(t, err)
	require.NotEmpty(t, token)

	tokenCode, err := issuer.VerifyToken(token, "service")
	require.NoError(t, err)
	require.NotEmpty(t, tokenCode)

	tokenCode, err = issuer.VerifyToken(token, "service2")
	require.Error(t, err)
	require.Empty(t, tokenCode)

	tokenCode, err = issuer2.VerifyToken(token, "service")
	require.Error(t, err)
	require.Empty(t, tokenCode)

	tokenCode, err = issuer.VerifyToken(token, "")
	require.Error(t, err)
	require.Empty(t, tokenCode)

	tokenCode, err = issuer.VerifyToken("", "service")
	require.Error(t, err)
	require.Empty(t, tokenCode)
}
