package bertyprotocol

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyauth"
)

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
	require.Equal(t, "https://localhost", untypedAS.(*bertyauth.AuthSession).BaseURL)
	codeVerifier := untypedAS.(*bertyauth.AuthSession).CodeVerifier
	state := untypedAS.(*bertyauth.AuthSession).State

	parsedURL, err := url.Parse(redirectURL)
	require.NoError(t, err)
	require.Equal(t, authtypes.AuthHTTPPathAuthorize, parsedURL.EscapedPath())
	require.Equal(t, authtypes.AuthResponseType, parsedURL.Query().Get("response_type"))
	require.Equal(t, authtypes.AuthClientID, parsedURL.Query().Get("client_id"))
	require.Equal(t, authtypes.AuthRedirect, parsedURL.Query().Get("redirect_uri"))
	require.Equal(t, state, parsedURL.Query().Get("state"))
	require.Equal(t, bertyauth.AuthSessionCodeChallenge(codeVerifier), parsedURL.Query().Get("code_challenge"))
	require.Equal(t, authtypes.AuthCodeChallengeMethod, parsedURL.Query().Get("code_challenge_method"))

	redirectURL2, err := s.authInitURL("http://localhost/")
	require.NoError(t, err)
	require.NotEmpty(t, redirectURL2)
	require.NotEqual(t, redirectURL, redirectURL2)

	require.NotEqual(t, state, s.authSession.Load().(*bertyauth.AuthSession).State)
	require.NotEqual(t, codeVerifier, s.authSession.Load().(*bertyauth.AuthSession).CodeVerifier)
}
