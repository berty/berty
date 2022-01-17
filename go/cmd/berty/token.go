package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"net"
	"net/http"
	"strings"

	"github.com/oklog/run"
	"github.com/peterbourgon/ff/v3/ffcli"
	"golang.org/x/crypto/ed25519"

	"berty.tech/berty/v2/go/pkg/bertyauth"
)

// This server is a showcase of a PKCE OAuth 2 token issuer. Its behavior is to
// generate a random identifier and sign it, thus allowing a no storage service
// operation. The actual token contains a random identifier and the list of
// services granted by the user, this encrypted value is not accessible to
// end users. The value returned to the app also contains a map of the services
// endpoints indexed by their identifiers.
//
// For example the JSON response for /oauth/token can include:
//  {
//  "access_token":
//  	"a_token",
//  "token_type":
//      "bearer",
//  "scope":
//  	"replication,contacts,backup",
// 	"services": {
//      "replication": "host:1234",
//      "contacts": "host:5678",
//      "backup": "other_host:1337"
//    }
//  }
//
// Where a_token will follow this construction:
//    sig(sk, crypt(secret, (uuid, "replication,contacts,backup"])))
//
// -no-click flag allows automation, i.e. the following line will take a
//      AuthServiceInitFlow issued URL and outputs a URL which can be provided
//      to AuthServiceCompleteFlow
//
//      curl "http://localhost:8080/authorize?..." -s | grep href= | cut -d'"' -f2 | sed 's/&amp;/\&/'
//
func tokenServerCommand() *ffcli.Command {
	var (
		secretFlag       = ""
		authSKFlag       = ""
		listenerFlag     = "127.0.0.1:8080"
		supportedFlag    = ""
		privacyPolicyURL = ""
		generate         = false
		noClick          = false
	)
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("token issuer server p", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		manager.SetupLoggingFlags(fs) // also available at root level
		fs.StringVar(&secretFlag, "auth.secret", secretFlag, "base64 encoded secret")
		fs.StringVar(&authSKFlag, "auth.sk", authSKFlag, "base64 encoded signature key")
		fs.StringVar(&listenerFlag, "http.listener", listenerFlag, "http listener")
		fs.StringVar(&supportedFlag, "svc", supportedFlag, "comma separated list of supported services as name@ip:port")
		fs.BoolVar(&generate, "generate", false, "generate a single token and output it on stdout")
		fs.StringVar(&privacyPolicyURL, "privacy-policy-url", "", "url of privacy policies")
		fs.BoolVar(&noClick, "no-click", false, "disable the login screen and redirect to the next token step directly")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "token-server",
		ShortUsage:     "berty [global flags] token-server [flags]",
		ShortHelp:      "token server, a basic token server issuer without auth or logging",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			ctx, cancel := context.WithCancel(ctx)
			defer cancel()

			g := run.Group{}
			g.Add(func() error {
				<-ctx.Done()
				return ctx.Err()
			}, func(error) {
				cancel()
			})

			if len(args) > 0 {
				return flag.ErrHelp
			}

			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}

			secret, err := base64.RawStdEncoding.DecodeString(secretFlag)
			if err != nil {
				return err
			}

			skBytes, err := base64.RawStdEncoding.DecodeString(authSKFlag)
			if err != nil {
				return err
			}

			if len(skBytes) != ed25519.SeedSize {
				return fmt.Errorf("invalid sk size")
			}

			sk := ed25519.NewKeyFromSeed(skBytes)

			l, err := net.Listen("tcp", listenerFlag)
			if err != nil {
				return err
			}

			servicesStrings := strings.Split(supportedFlag, ",")
			services := map[string]string{}
			for _, s := range servicesStrings {
				values := strings.Split(s, "@")
				if len(values) != 2 {
					return fmt.Errorf("malformed service name: %s", s)
				}
				services[values[0]] = values[1]
			}

			server, err := bertyauth.NewAuthTokenServer(secret, sk, services, &bertyauth.AuthTokenOptions{
				Logger:           logger,
				NoClick:          noClick,
				PrivacyPolicyURL: privacyPolicyURL,
			})
			if err != nil {
				return err
			}

			if generate {
				token, err := server.IssueRandomTokenForServices()
				if err != nil {
					return err
				}

				fmt.Println(token)
				return nil
			}

			g.Add(func() error {
				return http.Serve(l, server)
			}, func(err error) {
				l.Close()
			})

			pk := sk.Public().(ed25519.PublicKey)
			logger.Info(fmt.Sprintf("running server, corresponding pk is %s", base64.RawStdEncoding.EncodeToString(pk)))

			return g.Run()
		},
	}
}
