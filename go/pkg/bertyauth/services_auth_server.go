package bertyauth

import (
	"crypto/ed25519"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"strings"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type AuthTokenServer struct {
	issuer   *AuthTokenIssuer
	services map[string]string
	logger   *zap.Logger
	noClick  bool
}

type AuthTokenOptions struct {
	NoClick bool
	Logger  *zap.Logger
}

func NewAuthTokenServer(secret []byte, sk ed25519.PrivateKey, services map[string]string, opts *AuthTokenOptions) (*AuthTokenServer, error) {
	if opts == nil {
		opts = &AuthTokenOptions{}
	}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	if len(services) == 0 {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing services list"))
	}

	issuer, err := NewAuthTokenIssuer(secret, sk)
	if err != nil {
		return nil, err
	}

	return &AuthTokenServer{
		issuer:   issuer,
		services: services,
		logger:   opts.Logger,
		noClick:  opts.NoClick,
	}, nil
}

func (a *AuthTokenServer) serveMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc(authtypes.AuthHTTPPathTokenExchange, a.authTokenServerHTTPOAuthToken)
	mux.HandleFunc(authtypes.AuthHTTPPathAuthorize, a.authTokenServerHTTPAuthorize)

	return mux
}

func (a *AuthTokenServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	a.serveMux().ServeHTTP(w, r)
}

func (a *AuthTokenServer) authTokenServerRedirectError(w http.ResponseWriter, redirectURI, errorCode, errorDescription string, logger *zap.Logger) {
	u := fmt.Sprintf("%s?error=%s&error_description=%s", redirectURI, errorCode, url.QueryEscape(errorDescription))
	a.authTokenServerRedirect(w, u, logger)
}

func (a *AuthTokenServer) authTokenServerJSONError(w http.ResponseWriter, errorCode, errorDescription string, logger *zap.Logger) {
	a.authTokenServerJSONResponse(w, map[string]string{
		"error":             errorCode,
		"error_description": errorDescription,
	}, 400, logger)
}

func (a *AuthTokenServer) authTokenServerJSONResponse(w http.ResponseWriter, jsonData interface{}, httpCode int, logger *zap.Logger) {
	data, err := json.Marshal(jsonData)
	if err != nil {
		logger.Error("unable to marshal JSON response", zap.Error(err))
		w.WriteHeader(500)
		return
	}

	w.Header().Add("content-type", "application/json")
	w.WriteHeader(httpCode)

	if _, err := fmt.Fprint(w, string(data)); err != nil {
		logger.Error("unable to write response", zap.Error(err))
	}
}

func (a *AuthTokenServer) authTokenServerRedirect(w http.ResponseWriter, url string, logger *zap.Logger) {
	if err := templateAuthTokenServerRedirect.Execute(w, struct {
		URL template.URL
	}{
		URL: template.URL(url), // nolint:gosec
	}); err != nil {
		logger.Error("unable to write redirect response", zap.Error(err))
		w.WriteHeader(500)
	}
}

func (a *AuthTokenServer) authTokenServerHTTPAuthorize(w http.ResponseWriter, r *http.Request) {
	redirectURI := r.URL.Query().Get("redirect_uri")
	state := r.URL.Query().Get("state")
	codeChallenge := r.URL.Query().Get("code_challenge")

	for _, vs := range [][2]string{
		{"redirect_uri", authtypes.AuthRedirect},
		{"response_type", authtypes.AuthResponseType},
		{"client_id", authtypes.AuthClientID},
		{"code_challenge_method", authtypes.AuthCodeChallengeMethod},
	} {
		if got := r.URL.Query().Get(vs[0]); got != vs[1] {
			a.authTokenServerRedirectError(w, redirectURI, "invalid_request", fmt.Sprintf("unexpected value for %s", vs[0]), a.logger)
			return
		}
	}

	if state == "" {
		a.authTokenServerRedirectError(w, redirectURI, "invalid_request", "unexpected value for state", a.logger)
		return
	}

	if codeChallenge == "" {
		a.authTokenServerRedirectError(w, redirectURI, "invalid_request", "unexpected value for code_challenge", a.logger)
		return
	}

	if r.Method == "POST" || a.noClick {
		// TODO: allow client scope from "scope" query parameter
		servicesIDs := []string{authtypes.ServiceReplicationID, authtypes.ServicePushID}

		code, err := a.issuer.IssueCode(codeChallenge, servicesIDs)
		if err != nil {
			a.logger.Error("unable to generate token", zap.Error(err))
			w.WriteHeader(500)
			return
		}

		u := fmt.Sprintf("%s?code=%s&state=%s", redirectURI, code, state)
		a.authTokenServerRedirect(w, u, a.logger)
		return
	}

	_, _ = fmt.Fprint(w, templateAuthTokenServerAuthorizeButton)
}

func (a *AuthTokenServer) authTokenServerHTTPOAuthToken(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		w.WriteHeader(400)
		return
	}

	if got := r.Form.Get("grant_type"); authtypes.AuthGrantType != got {
		a.authTokenServerJSONError(w, "invalid_request", fmt.Sprintf("expected %s, got %s for %s", authtypes.AuthGrantType, got, "grant_type"), a.logger)
		return
	}

	codeData, err := a.issuer.VerifyCode(r.Form.Get("code"), r.Form.Get("code_verifier"))
	if err != nil {
		a.authTokenServerJSONError(w, "invalid_request", "invalid value for code", a.logger)
		return
	}

	token, err := a.issuer.IssueToken(codeData.Services)
	if err != nil {
		a.authTokenServerJSONError(w, "server_error", "unable to issue token", a.logger)
		return
	}

	a.authTokenServerJSONResponse(w, map[string]interface{}{
		"access_token": token,
		"token_type":   "bearer",
		"scope":        strings.Join(codeData.Services, ","),
		"services":     a.services,
	}, 200, a.logger)
}

func (a *AuthTokenServer) IssueRandomTokenForServices() (string, error) {
	return IssueRandomToken(a.issuer, a.services)
}

func IssueRandomToken(issuer *AuthTokenIssuer, services map[string]string) (string, error) {
	servicesKeys := []string(nil)
	for key := range services {
		servicesKeys = append(servicesKeys, key)
	}

	token, err := issuer.IssueToken(servicesKeys)
	if err != nil {
		return "", err
	}

	data := map[string]interface{}{
		"access_token": token,
		"token_type":   "bearer",
		"scope":        strings.Join(servicesKeys, ","),
		"services":     services,
	}

	jsoned, err := json.Marshal(data)
	if err != nil {
		return "", err
	}

	return string(jsoned), nil
}
