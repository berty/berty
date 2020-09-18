package bertyprotocol

import (
	"crypto/ed25519"
	crand "crypto/rand"
	"net/url"
	"testing"

	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/cryptoutil"
)

func helperGenerateTokenIssuerSecrets(t *testing.T) ([]byte, ed25519.PublicKey, ed25519.PrivateKey) {
	t.Helper()

	pk, sk, err := ed25519.GenerateKey(crand.Reader)
	require.NoError(t, err)

	secret := make([]byte, cryptoutil.KeySize)
	_, err = crand.Read(secret)
	require.NoError(t, err)

	return secret, pk, sk
}

func TestNewAuthTokenVerifier(t *testing.T) {
	secret, pk, _ := helperGenerateTokenIssuerSecrets(t)
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
	secret, _, sk := helperGenerateTokenIssuerSecrets(t)
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
	_, challenge, err := authSessionCodeVerifierAndChallenge()
	require.NoError(t, err)

	secret, _, sk := helperGenerateTokenIssuerSecrets(t)
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
	require.Equal(t, authSessionCodeChallenge("verifier"), "iMnq5o6zALKXGivsnlom_0F5_WYda32GHkxlV7mq7hQ")
}

func TestVerifyCode(t *testing.T) {
	services := []string{"service"}

	verifier, challenge, err := authSessionCodeVerifierAndChallenge()
	require.NoError(t, err)

	_, otherChallenge, err := authSessionCodeVerifierAndChallenge()
	require.NoError(t, err)

	secret, _, sk := helperGenerateTokenIssuerSecrets(t)
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

	secret, _, sk := helperGenerateTokenIssuerSecrets(t)
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

	secret, _, sk := helperGenerateTokenIssuerSecrets(t)
	issuer, err := NewAuthTokenIssuer(secret, sk)
	require.NoError(t, err)
	require.NotNil(t, issuer)

	secret2, _, sk2 := helperGenerateTokenIssuerSecrets(t)
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

func TestServiceAuthServiceInitFlow(t *testing.T) {
	s := service{}

	untypedAS := s.authSession.Load()
	require.Nil(t, untypedAS)

	redirectURL, err := s.authInitURL("")
	require.Error(t, err)
	require.Empty(t, redirectURL)

	redirectURL, err = s.authInitURL("rubbish://")
	require.Error(t, err)
	require.Empty(t, redirectURL)

	redirectURL, err = s.authInitURL("http://")
	require.Error(t, err)
	require.Empty(t, redirectURL)

	redirectURL, err = s.authInitURL("http://localhost")
	require.NoError(t, err)
	require.NotEmpty(t, redirectURL)

	redirectURL, err = s.authInitURL("https://localhost/")
	require.NoError(t, err)
	require.NotEmpty(t, redirectURL)

	untypedAS = s.authSession.Load()
	require.Equal(t, "https://localhost", untypedAS.(*authSession).baseURL)
	codeVerifier := untypedAS.(*authSession).codeVerifier
	state := untypedAS.(*authSession).state

	parsedURL, err := url.Parse(redirectURL)
	require.NoError(t, err)
	require.Equal(t, AuthHTTPPathAuthorize, parsedURL.EscapedPath())
	require.Equal(t, AuthResponseType, parsedURL.Query().Get("response_type"))
	require.Equal(t, AuthClientID, parsedURL.Query().Get("client_id"))
	require.Equal(t, AuthRedirect, parsedURL.Query().Get("redirect_uri"))
	require.Equal(t, state, parsedURL.Query().Get("state"))
	require.Equal(t, authSessionCodeChallenge(codeVerifier), parsedURL.Query().Get("code_challenge"))
	require.Equal(t, AuthCodeChallengeMethod, parsedURL.Query().Get("code_challenge_method"))

	redirectURL2, err := s.authInitURL("http://localhost/")
	require.NoError(t, err)
	require.NotEmpty(t, redirectURL2)
	require.NotEqual(t, redirectURL, redirectURL2)

	require.NotEqual(t, state, s.authSession.Load().(*authSession).state)
	require.NotEqual(t, codeVerifier, s.authSession.Load().(*authSession).codeVerifier)
}
