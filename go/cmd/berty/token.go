package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"strings"

	"github.com/peterbourgon/ff/v3/ffcli"
	"go.uber.org/zap"
	"golang.org/x/crypto/ed25519"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
)

func tokenServerCommand() *ffcli.Command {
	var flags = flag.NewFlagSet("token issuer server", flag.ExitOnError)
	flags.StringVar(&opts.serviceProviderSecret, "secret", opts.serviceProviderSecret, "base64 encoded secret")
	flags.StringVar(&opts.serviceProviderAuthSK, "sk", opts.serviceProviderAuthSK, "base64 encoded signature key")
	flags.StringVar(&opts.serviceProviderListener, "l", opts.serviceProviderListener, "http listener")
	flags.StringVar(&opts.serviceProviderSupported, "s", opts.serviceProviderSupported, "comma separated list of supported services as name@ip:port")

	return &ffcli.Command{
		Name:      "token-server",
		ShortHelp: "token server, a basic token server issuer without auth or logging",
		FlagSet:   flags,
		Exec: func(ctx context.Context, args []string) error {
			cleanup := globalPreRun()
			defer cleanup()

			secret, err := base64.RawStdEncoding.DecodeString(opts.serviceProviderSecret)
			if err != nil {
				return err
			}

			skBytes, err := base64.RawStdEncoding.DecodeString(opts.serviceProviderAuthSK)
			if err != nil {
				return err
			}

			if len(skBytes) != ed25519.SeedSize {
				return fmt.Errorf("invalid sk size")
			}

			sk := ed25519.NewKeyFromSeed(skBytes)

			servicesStrings := strings.Split(opts.serviceProviderSupported, ",")
			services := map[string]string{}
			for _, s := range servicesStrings {
				values := strings.Split(s, "@")
				if len(values) != 2 {
					return fmt.Errorf("malformed service name: %s", s)
				}
				services[values[0]] = values[1]
			}

			if len(services) == 0 {
				return fmt.Errorf("missing services list")
			}

			man, err := bertyprotocol.NewAuthTokenIssuer(secret, sk)
			if err != nil {
				return err
			}

			http.HandleFunc("/oauth/token", replicationTokenServerHTTPOAuthToken(man, services, opts.logger))
			http.HandleFunc("/authorize", replicationTokenServerHTTPAuthorize(man, services, opts.logger))

			pk := sk.Public().(ed25519.PublicKey)
			opts.logger.Info(fmt.Sprintf("running server, corresponding pk is %s", base64.RawStdEncoding.EncodeToString(pk)))

			return http.ListenAndServe(opts.serviceProviderListener, nil)
		},
	}
}

func replicationTokenServerRedirectError(w http.ResponseWriter, redirectURI, errorCode, errorDescription string, logger *zap.Logger) {
	u := fmt.Sprintf("%s?error=%s&error_description=%s", redirectURI, errorCode, url.QueryEscape(errorDescription))
	replicationTokenServerRedirect(w, u, logger)
}

var templateReplicationTokenServerRedirect = template.Must(template.New("redirect").Parse(`<!DOCTYPE html><html lang="en-GB"><head>
<title>Redirection</title>
  <meta http-equiv="refresh" content="1; URL={{.URL}}" />
</head><body><a href="{{.URL}}">Redirection</a></body></html>`))

func replicationTokenServerJSONError(w http.ResponseWriter, errorCode, errorDescription string, logger *zap.Logger) {
	replicationTokenServerJSONResponse(w, map[string]string{
		"error":             errorCode,
		"error_description": errorDescription,
	}, 400, logger)
}

func replicationTokenServerJSONResponse(w http.ResponseWriter, jsonData interface{}, httpCode int, logger *zap.Logger) {
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

func replicationTokenServerRedirect(w http.ResponseWriter, url string, logger *zap.Logger) {
	if err := templateReplicationTokenServerRedirect.Execute(w, struct {
		URL template.URL
	}{
		URL: template.URL(url),
	}); err != nil {
		logger.Error("unable to write redirect response", zap.Error(err))
		w.WriteHeader(500)
	}
}

func replicationTokenServerHTTPAuthorize(manager *bertyprotocol.AuthTokenIssuer, services map[string]string, logger *zap.Logger) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		redirectURI := r.URL.Query().Get("redirect_uri")
		state := r.URL.Query().Get("state")
		codeChallenge := r.URL.Query().Get("code_challenge")

		expectedFixedValues := map[string]string{
			"response_type":         bertyprotocol.AuthResponseType,
			"client_id":             bertyprotocol.AuthClientID,
			"redirect_uri":          bertyprotocol.AuthRedirect,
			"code_challenge_method": bertyprotocol.AuthCodeChallengeMethod,
		}

		for k, v := range expectedFixedValues {
			if got := r.URL.Query().Get(k); got != v {
				replicationTokenServerRedirectError(w, redirectURI, "invalid_request", fmt.Sprintf("expected %s, got %s for %s", v, got, k), logger)
				return
			}
		}

		for _, k := range []string{"state", "code_challenge"} {
			if r.URL.Query().Get(k) == "" {
				replicationTokenServerRedirectError(w, redirectURI, "invalid_request", fmt.Sprintf("expected a value for %s", k), logger)
				return
			}
		}

		if r.Method == "POST" {
			// TODO: allow client scope from "scope" query parameter
			_ = services
			servicesIDs := []string{bertyprotocol.ServiceReplicationID}

			code, err := manager.IssueCode(codeChallenge, servicesIDs)
			if err != nil {
				logger.Error("unable to generate token", zap.Error(err))
				w.WriteHeader(500)
				return
			}

			u := fmt.Sprintf("%s?code=%s&state=%s", redirectURI, code, state)
			replicationTokenServerRedirect(w, u, logger)
			return
		}

		_, _ = fmt.Fprint(w, `<!DOCTYPE html><html lang="en-GB"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Token</title></head><form method="POST"><button type="submit">Get token</button></form></html>`)
	}
}

func replicationTokenServerHTTPOAuthToken(manager *bertyprotocol.AuthTokenIssuer, services map[string]string, logger *zap.Logger) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			w.WriteHeader(400)
			return
		}

		code := r.Form.Get("code")
		codeVerifier := r.Form.Get("code_verifier")

		expectedFixedValues := map[string]string{
			"grant_type": bertyprotocol.AuthGrantType,
			"client_id":  bertyprotocol.AuthClientID,
		}

		for k, v := range expectedFixedValues {
			if got := r.Form.Get(k); got != v {
				replicationTokenServerJSONError(w, "invalid_request", fmt.Sprintf("expected %s, got %s for %s", v, got, k), logger)
				return
			}
		}

		for _, k := range []string{"code", "code_verifier"} {
			if r.Form.Get(k) == "" {
				replicationTokenServerJSONError(w, "invalid_request", fmt.Sprintf("expected a value for %s", k), logger)
				return
			}
		}

		codeData, err := manager.VerifyCode(code, codeVerifier)
		if err != nil {
			replicationTokenServerJSONError(w, "invalid_request", "invalid value for code", logger)
			return
		}

		token, err := manager.IssueToken(codeData.Services)
		if err != nil {
			replicationTokenServerJSONError(w, "server_error", "unable to issue token", logger)
			return
		}

		replicationTokenServerJSONResponse(w, map[string]interface{}{
			"access_token": token,
			"token_type":   "bearer",
			"scope":        strings.Join(codeData.Services, ","),
			"services":     services,
		}, 200, logger)
	}
}
