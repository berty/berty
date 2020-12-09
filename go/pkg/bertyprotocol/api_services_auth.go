package bertyprotocol

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"golang.org/x/net/context/ctxhttp"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const (
	AuthResponseType        = "code"
	AuthGrantType           = "authorization_code"
	AuthRedirect            = "berty://services-auth/"
	AuthClientID            = "berty"
	AuthCodeChallengeMethod = "S256"
)

type authExchangeResponse struct {
	AccessToken      string            `json:"access_token"`
	Scope            string            `json:"scope"`
	Error            string            `json:"error"`
	ErrorDescription string            `json:"error_description"`
	Services         map[string]string `json:"services"`
}

type authSession struct {
	state        string
	codeVerifier string // codeVerifier base64 encoded random value
	baseURL      string
}

func authSessionCodeChallenge(codeVerifier string) string {
	codeChallengeArr := sha256.Sum256([]byte(codeVerifier))
	codeChallenge := make([]byte, sha256.Size)
	for i, c := range codeChallengeArr {
		codeChallenge[i] = c
	}

	return base64.RawURLEncoding.EncodeToString(codeChallenge)
}

func authSessionCodeVerifierAndChallenge() (string, string, error) {
	verifierArr, err := cryptoutil.GenerateNonce()
	if err != nil {
		return "", "", err
	}

	codeVerifierBytes := make([]byte, cryptoutil.NonceSize)
	for i, c := range verifierArr {
		codeVerifierBytes[i] = c
	}

	verifier := base64.RawURLEncoding.EncodeToString(codeVerifierBytes)

	return verifier, authSessionCodeChallenge(verifier), nil
}

func newAuthSession(baseURL string) (*authSession, string, error) {
	state, err := cryptoutil.GenerateNonce()
	if err != nil {
		return nil, "", err
	}

	verifier, challenge, err := authSessionCodeVerifierAndChallenge()
	if err != nil {
		return nil, "", err
	}

	stateBytes := make([]byte, cryptoutil.NonceSize)
	for i, c := range state {
		stateBytes[i] = c
	}

	auth := &authSession{
		baseURL:      baseURL,
		state:        base64.RawURLEncoding.EncodeToString(stateBytes),
		codeVerifier: verifier,
	}

	return auth, challenge, nil
}

func (s *service) authInitURL(baseURL string) (string, error) {
	parsedAuthURL, err := url.Parse(baseURL)
	if err != nil {
		return "", errcode.ErrServicesAuthInvalidURL
	}

	switch parsedAuthURL.Scheme {
	case "http", "https":
	default:
		return "", errcode.ErrServicesAuthInvalidURL
	}

	if parsedAuthURL.Host == "" {
		return "", errcode.ErrServicesAuthInvalidURL
	}

	if strings.HasSuffix(baseURL, "/") {
		baseURL = baseURL[:len(baseURL)-1]
	}

	auth, codeChallenge, err := newAuthSession(baseURL)
	if err != nil {
		return "", err
	}

	s.authSession.Store(auth)

	return fmt.Sprintf("%s%s?response_type=%s&client_id=%s&redirect_uri=%s&state=%s&code_challenge=%s&code_challenge_method=%s",
		baseURL,
		AuthHTTPPathAuthorize,
		AuthResponseType,
		AuthClientID,
		url.QueryEscape(AuthRedirect),
		auth.state,
		codeChallenge,
		AuthCodeChallengeMethod,
	), nil
}

func (s *service) AuthServiceCompleteFlow(ctx context.Context, request *protocoltypes.AuthServiceCompleteFlow_Request) (*protocoltypes.AuthServiceCompleteFlow_Reply, error) {
	u, err := url.Parse(request.CallbackURL)
	if err != nil {
		return nil, err
	}

	if e := u.Query().Get("error"); e != "" {
		return nil, errcode.ErrServicesAuthServer.Wrap(fmt.Errorf("got error: %s (%s)", e, u.Query().Get("error_description")))
	}

	code, state := u.Query().Get("code"), u.Query().Get("state")

	authUntyped := s.authSession.Load()
	if authUntyped == nil {
		return nil, errcode.ErrServicesAuthNotInitialized
	}

	auth, ok := authUntyped.(*authSession)
	if !ok {
		return nil, errcode.ErrServicesAuthNotInitialized
	}

	if auth.state != state {
		return nil, errcode.ErrServicesAuthWrongState
	}

	endpoint := fmt.Sprintf("%s%s", auth.baseURL, AuthHTTPPathTokenExchange)
	res, err := ctxhttp.PostForm(ctx, http.DefaultClient, endpoint, url.Values{
		"grant_type":    {AuthGrantType},
		"code":          {code},
		"client_id":     {AuthClientID},
		"code_verifier": {auth.codeVerifier},
	})
	if err != nil {
		return nil, errcode.ErrStreamWrite.Wrap(err)
	}

	defer res.Body.Close()

	if res.StatusCode >= 300 {
		return nil, errcode.ErrServicesAuthInvalidResponse.Wrap(fmt.Errorf("invalid status code %d", res.StatusCode))
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, errcode.ErrStreamRead.Wrap(err)
	}

	resMsg := &authExchangeResponse{}
	if err := json.Unmarshal(body, &resMsg); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if resMsg.Error != "" {
		return nil, errcode.ErrServicesAuthServer.Wrap(err)
	}

	if resMsg.AccessToken == "" {
		return nil, errcode.ErrServicesAuthInvalidResponse.Wrap(fmt.Errorf("missing access token in response"))
	}

	if len(resMsg.Services) == 0 {
		return nil, errcode.ErrServicesAuthInvalidResponse.Wrap(fmt.Errorf("no services returned along token"))
	}

	services := make([]*protocoltypes.ServiceTokenSupportedService, len(resMsg.Services))
	i := 0
	for k, v := range resMsg.Services {
		services[i] = &protocoltypes.ServiceTokenSupportedService{
			ServiceType:     k,
			ServiceEndpoint: v,
		}
		i++
	}

	if _, err := s.accountGroup.metadataStore.SendAccountServiceTokenAdded(ctx, &protocoltypes.ServiceToken{
		Token:             resMsg.AccessToken,
		AuthenticationURL: auth.baseURL,
		SupportedServices: services,
		Expiration:        -1,
	}); err != nil {
		return nil, err
	}

	return &protocoltypes.AuthServiceCompleteFlow_Reply{}, nil
}

func (s *service) AuthServiceInitFlow(ctx context.Context, request *protocoltypes.AuthServiceInitFlow_Request) (*protocoltypes.AuthServiceInitFlow_Reply, error) {
	u, err := s.authInitURL(request.AuthURL)
	if err != nil {
		return nil, err
	}

	return &protocoltypes.AuthServiceInitFlow_Reply{
		URL:       u,
		SecureURL: strings.HasPrefix(u, "https://"),
	}, nil
}

func (s *service) ServicesTokenList(request *protocoltypes.ServicesTokenList_Request, server protocoltypes.ProtocolService_ServicesTokenListServer) error {
	for _, t := range s.accountGroup.metadataStore.listServiceTokens() {
		if server.Context().Err() != nil {
			break
		}

		if err := server.Send(&protocoltypes.ServicesTokenList_Reply{
			TokenID: t.TokenID(),
			Service: t,
		}); err != nil {
			return err
		}
	}

	return nil
}
