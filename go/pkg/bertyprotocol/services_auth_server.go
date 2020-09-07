package bertyprotocol

import (
	"crypto/ed25519"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"strings"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type AuthTokenServer struct {
	issuer   *AuthTokenIssuer
	services map[string]string
	logger   *zap.Logger
}

func NewAuthTokenServer(secret []byte, sk ed25519.PrivateKey, services map[string]string, logger *zap.Logger) (*AuthTokenServer, error) {
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
		logger:   logger,
	}, nil
}

func (a *AuthTokenServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	mux := http.NewServeMux()
	mux.HandleFunc("/oauth/token", a.authTokenServerHTTPOAuthToken)
	mux.HandleFunc("/authorize", a.authTokenServerHTTPAuthorize)

	mux.ServeHTTP(w, r)
}

func (a *AuthTokenServer) authTokenServerRedirectError(w http.ResponseWriter, redirectURI, errorCode, errorDescription string, logger *zap.Logger) {
	u := fmt.Sprintf("%s?error=%s&error_description=%s", redirectURI, errorCode, url.QueryEscape(errorDescription))
	a.authTokenServerRedirect(w, u, logger)
}

var templateAuthTokenServerRedirect = template.Must(template.New("redirect").Parse(`<!DOCTYPE html><html lang="en-GB"><head>
<title>Redirection</title>
  <meta http-equiv="refresh" content="1; URL={{.URL}}" />
</head><body><a href="{{.URL}}">Redirection</a></body></html>`))

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
		URL: template.URL(url),
	}); err != nil {
		logger.Error("unable to write redirect response", zap.Error(err))
		w.WriteHeader(500)
	}
}

func (a *AuthTokenServer) authTokenServerHTTPAuthorize(w http.ResponseWriter, r *http.Request) {
	redirectURI := r.URL.Query().Get("redirect_uri")
	state := r.URL.Query().Get("state")
	codeChallenge := r.URL.Query().Get("code_challenge")

	expectedFixedValues := map[string]string{
		"response_type":         AuthResponseType,
		"client_id":             AuthClientID,
		"redirect_uri":          AuthRedirect,
		"code_challenge_method": AuthCodeChallengeMethod,
	}

	for k, v := range expectedFixedValues {
		if got := r.URL.Query().Get(k); got != v {
			a.authTokenServerRedirectError(w, redirectURI, "invalid_request", fmt.Sprintf("expected %s, got %s for %s", v, got, k), a.logger)
			return
		}
	}

	for _, k := range []string{"state", "code_challenge"} {
		if r.URL.Query().Get(k) == "" {
			a.authTokenServerRedirectError(w, redirectURI, "invalid_request", fmt.Sprintf("expected a value for %s", k), a.logger)
			return
		}
	}

	if r.Method == "POST" {
		// TODO: allow client scope from "scope" query parameter
		servicesIDs := []string{ServiceReplicationID}

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

	_, _ = fmt.Fprint(w, `<!DOCTYPE html><html lang="en-GB"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Token</title></head><form method="POST"><button type="submit">Get token</button></form></html>`)
}

func (a *AuthTokenServer) authTokenServerHTTPOAuthToken(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		w.WriteHeader(400)
		return
	}

	code := r.Form.Get("code")
	codeVerifier := r.Form.Get("code_verifier")

	expectedFixedValues := map[string]string{
		"grant_type": AuthGrantType,
		"client_id":  AuthClientID,
	}

	for k, v := range expectedFixedValues {
		if got := r.Form.Get(k); got != v {
			a.authTokenServerJSONError(w, "invalid_request", fmt.Sprintf("expected %s, got %s for %s", v, got, k), a.logger)
			return
		}
	}

	for _, k := range []string{"code", "code_verifier"} {
		if r.Form.Get(k) == "" {
			a.authTokenServerJSONError(w, "invalid_request", fmt.Sprintf("expected a value for %s", k), a.logger)
			return
		}
	}

	codeData, err := a.issuer.VerifyCode(code, codeVerifier)
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
