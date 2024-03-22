package bertymessenger

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"go.uber.org/zap"
	"golang.org/x/net/context/ctxhttp"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyauth"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/pkg/logutil"
	"berty.tech/weshnet/pkg/protocoltypes"
)

func (svc *service) authInitURL(baseURL string, services ...string) (string, error) {
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

	svc.authSession.Store(auth)

	outURL := fmt.Sprintf("%s%s?response_type=%s&client_id=%s&redirect_uri=%s&state=%s&code_challenge=%s&code_challenge_method=%s",
		baseURL,
		authtypes.AuthHTTPPathAuthorize,
		authtypes.AuthResponseType,
		authtypes.AuthClientID,
		url.QueryEscape(authtypes.AuthRedirect),
		auth.State,
		codeChallenge,
		authtypes.AuthCodeChallengeMethod,
	)

	_ = services

	// if len(services) > 0 {
	// 	outURL = fmt.Sprintf("%s&scope=%s",
	// 		outURL,
	// 		strings.Join(services, ","),
	// 	)
	// }

	return outURL, nil
}

func (svc *service) AuthServiceCompleteFlow(ctx context.Context, request *messengertypes.AuthServiceCompleteFlow_Request) (*messengertypes.AuthServiceCompleteFlow_Reply, error) {
	u, err := url.Parse(request.CallbackURL)
	if err != nil {
		return nil, err
	}

	if e := u.Query().Get("error"); e != "" {
		return nil, errcode.ErrServicesAuthServer.Wrap(fmt.Errorf("got error: %s (%s)", e, u.Query().Get("error_description")))
	}

	code, state := u.Query().Get("code"), u.Query().Get("state")

	authUntyped := svc.authSession.Load()
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
	svc.logger.Debug("auth service start", logutil.PrivateString("endpoint", endpoint))
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

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, errcode.ErrStreamRead.Wrap(err)
	}
	resMsg := &messengertypes.AuthExchangeResponse{}
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

	services := make([]*messengertypes.ServiceTokenSupportedService, len(resMsg.Services))
	i := 0
	for k, v := range resMsg.Services {
		services[i] = &messengertypes.ServiceTokenSupportedService{
			Type:    k,
			Address: v,
		}
		i++
	}

	svc.logger.Debug("auth flow services", zap.Any("services", services))

	serviceToken := &messengertypes.AppMessage_ServiceAddToken{
		Token:             resMsg.AccessToken,
		AuthenticationURL: auth.BaseURL,
		SupportedServices: services,
		Expiration:        -1,
	}

	am, err := messengertypes.AppMessage_TypeServiceAddToken.MarshalPayload(messengerutil.TimestampMs(time.Now()), "", serviceToken)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	_, err = svc.protocolClient.AppMetadataSend(ctx, &protocoltypes.AppMetadataSend_Request{GroupPK: svc.accountGroup, Payload: am})
	if err != nil {
		return nil, errcode.ErrProtocolSend.Wrap(err)
	}

	// @FIXME(gfanton):  should be handle on the client (js) side
	registeredPushServer := 0
	for _, service := range services {
		if service.Type != authtypes.ServicePushID {
			continue
		}

		svc.logger.Debug("registering push server", logutil.PrivateString("endpoint", service.GetAddress()))
		client, err := svc.getPushClient(service.Address)
		if err != nil {
			svc.logger.Warn("unable to connect to push server", logutil.PrivateString("endpoint", service.Address), zap.Error(err))
			continue
		}

		repl, err := client.ServerInfo(ctx, &pushtypes.PushServiceServerInfo_Request{})
		if err != nil {
			svc.logger.Warn("unable to get server info from push server", logutil.PrivateString("endpoint", service.Address), zap.Error(err))
			continue
		}

		svc.logger.Debug("server info", zap.Int("supported push services ", len(repl.GetSupportedTokenTypes())))

		_, err = svc.PushSetServer(ctx, &messengertypes.PushSetServer_Request{
			Server: &messengertypes.PushServer{
				Key:  repl.PublicKey,
				Addr: service.Address,
			},
		})

		if err != nil {
			svc.logger.Warn("unable to set push server", zap.Error(err))
			continue
		}

		registeredPushServer++
		svc.logger.Debug("push server registered", logutil.PrivateString("endpoint", service.GetAddress()))
	}

	if registeredPushServer == 0 {
		svc.logger.Warn("no push server found/registered")
	}

	return &messengertypes.AuthServiceCompleteFlow_Reply{
		TokenID: serviceToken.TokenID(),
	}, nil
}

func (svc *service) AuthServiceInitFlow(ctx context.Context, request *messengertypes.AuthServiceInitFlow_Request) (*messengertypes.AuthServiceInitFlow_Reply, error) {
	u, err := svc.authInitURL(request.AuthURL, request.Services...)
	if err != nil {
		return nil, err
	}

	return &messengertypes.AuthServiceInitFlow_Reply{
		URL:       u,
		SecureURL: strings.HasPrefix(u, "https://"),
	}, nil
}

func (svc *service) ServicesTokenList(req *messengertypes.ServicesTokenList_Request, server messengertypes.MessengerService_ServicesTokenListServer) error {
	accountPK := messengerutil.B64EncodeBytes(svc.accountGroup)

	serviceTokens, err := svc.db.GetServiceTokens(accountPK)
	if err != nil {
		return err
	}

	for _, serviceToken := range serviceTokens {
		if err := server.Send(&messengertypes.ServicesTokenList_Reply{
			Service: serviceToken,
		}); err != nil {
			svc.logger.Error("error while sending token info to client", zap.Error(err))
			return err
		}
	}

	return nil
}

func (svc *service) DebugAuthServiceSetToken(ctx context.Context, request *messengertypes.DebugAuthServiceSetToken_Request) (*messengertypes.DebugAuthServiceSetToken_Reply, error) {
	services := make([]*messengertypes.ServiceTokenSupportedService, len(request.Token.Services))
	i := 0
	for k, v := range request.Token.Services {
		services[i] = &messengertypes.ServiceTokenSupportedService{
			Type:    k,
			Address: v,
		}
		i++
	}

	serviceToken := &messengertypes.AppMessage_ServiceAddToken{
		Token:             request.Token.AccessToken,
		AuthenticationURL: request.AuthenticationURL,
		SupportedServices: services,
		Expiration:        -1,
	}

	am, err := messengertypes.AppMessage_TypeServiceAddToken.MarshalPayload(messengerutil.TimestampMs(time.Now()), "", serviceToken)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	_, err = svc.protocolClient.AppMetadataSend(ctx, &protocoltypes.AppMetadataSend_Request{GroupPK: svc.accountGroup, Payload: am})
	if err != nil {
		return nil, errcode.ErrProtocolSend.Wrap(err)
	}

	return &messengertypes.DebugAuthServiceSetToken_Reply{}, nil
}
