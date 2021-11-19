package bertyprotocol

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"go.uber.org/zap"
	"golang.org/x/net/context/ctxhttp"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyauth"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

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

	baseURL = strings.TrimSuffix(baseURL, "/")

	auth, codeChallenge, err := bertyauth.NewAuthSession(baseURL)
	if err != nil {
		return "", err
	}

	s.authSession.Store(auth)

	return fmt.Sprintf("%s%s?response_type=%s&client_id=%s&redirect_uri=%s&state=%s&code_challenge=%s&code_challenge_method=%s",
		baseURL,
		authtypes.AuthHTTPPathAuthorize,
		authtypes.AuthResponseType,
		authtypes.AuthClientID,
		url.QueryEscape(authtypes.AuthRedirect),
		auth.State,
		codeChallenge,
		authtypes.AuthCodeChallengeMethod,
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

	auth, ok := authUntyped.(*bertyauth.AuthSession)
	if !ok {
		return nil, errcode.ErrServicesAuthNotInitialized
	}

	if auth.State != state {
		return nil, errcode.ErrServicesAuthWrongState
	}

	endpoint := fmt.Sprintf("%s%s", auth.BaseURL, authtypes.AuthHTTPPathTokenExchange)
	s.logger.Debug("auth service start", logutil.PrivateString("endpoint", endpoint))
	res, err := ctxhttp.PostForm(ctx, http.DefaultClient, endpoint, url.Values{
		"grant_type":    {authtypes.AuthGrantType},
		"code":          {code},
		"client_id":     {authtypes.AuthClientID},
		"code_verifier": {auth.CodeVerifier},
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

	resMsg := &protocoltypes.AuthExchangeResponse{}
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

	s.logger.Debug("auth flow services", zap.Any("services", services))

	svcToken := &protocoltypes.ServiceToken{
		Token:             resMsg.AccessToken,
		AuthenticationURL: auth.BaseURL,
		SupportedServices: services,
		Expiration:        -1,
	}

	if _, err := s.accountGroup.metadataStore.SendAccountServiceTokenAdded(ctx, svcToken); err != nil {
		return nil, err
	}

	// @FIXME(gfanton):  should be handle on the client (js) side
	registeredPushServer := 0
	for _, service := range services {
		if service.ServiceType != authtypes.ServicePushID {
			continue
		}

		s.logger.Debug("registering push server", logutil.PrivateString("endpoint", service.GetServiceEndpoint()))
		client, err := s.getPushClient(service.ServiceEndpoint)
		if err != nil {
			s.logger.Warn("unable to connect to push server", logutil.PrivateString("endpoint", service.ServiceEndpoint), zap.Error(err))
			continue
		}

		repl, err := client.ServerInfo(ctx, &pushtypes.PushServiceServerInfo_Request{})

		s.logger.Debug("server info", zap.Int("supported push services ", len(repl.GetSupportedTokenTypes())))

		if err != nil {
			s.logger.Warn("unable to get server info from push server", logutil.PrivateString("endpoint", service.ServiceEndpoint), zap.Error(err))
			continue
		}

		_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{
			Server: &protocoltypes.PushServer{
				ServerKey:   repl.PublicKey,
				ServiceAddr: service.ServiceEndpoint,
			},
		})

		if err != nil {
			s.logger.Warn("unable to set push server", zap.Error(err))
			continue
		}

		registeredPushServer++
		s.logger.Debug("push server registered", logutil.PrivateString("endpoint", service.GetServiceEndpoint()))
	}

	if registeredPushServer == 0 {
		s.logger.Warn("no push server found/registered")
	}

	return &protocoltypes.AuthServiceCompleteFlow_Reply{
		TokenID: svcToken.TokenID(),
	}, nil
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

func (s *service) DebugAuthServiceSetToken(ctx context.Context, request *protocoltypes.DebugAuthServiceSetToken_Request) (*protocoltypes.DebugAuthServiceSetToken_Reply, error) {
	services := make([]*protocoltypes.ServiceTokenSupportedService, len(request.Token.Services))
	i := 0
	for k, v := range request.Token.Services {
		services[i] = &protocoltypes.ServiceTokenSupportedService{
			ServiceType:     k,
			ServiceEndpoint: v,
		}
		i++
	}

	svcToken := &protocoltypes.ServiceToken{
		Token:             request.Token.AccessToken,
		AuthenticationURL: request.AuthenticationURL,
		SupportedServices: services,
		Expiration:        -1,
	}

	if _, err := s.accountGroup.metadataStore.SendAccountServiceTokenAdded(ctx, svcToken); err != nil {
		return nil, err
	}

	return &protocoltypes.DebugAuthServiceSetToken_Reply{}, nil
}
