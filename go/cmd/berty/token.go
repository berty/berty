package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"net/http"
	"strings"

	"github.com/peterbourgon/ff/v3/ffcli"
	"golang.org/x/crypto/ed25519"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
)

// This server is a showcase of a PKCE OAuth 2 token issuer. Its behavior is to
// generate a random identifier and sign it, thus allowing a no storage service
// operation. The actual token contains a random identifier and the list of
// services granted by the user, this value is encrypted an not accessible to
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
func tokenServerCommand() *ffcli.Command {
	var (
		fs            = flag.NewFlagSet("token issuer server", flag.ExitOnError)
		secretFlag    = ""
		authSKFlag    = ""
		listenerFlag  = ":8080"
		supportedFlag = ""
	)
	fs.StringVar(&secretFlag, "secret", secretFlag, "base64 encoded secret")
	fs.StringVar(&authSKFlag, "sk", authSKFlag, "base64 encoded signature key")
	fs.StringVar(&listenerFlag, "l", listenerFlag, "http listener")
	fs.StringVar(&supportedFlag, "s", supportedFlag, "comma separated list of supported services as name@ip:port")

	return &ffcli.Command{
		Name:       "token-server",
		ShortUsage: "berty [global flags] token-server [flags]",
		ShortHelp:  "token server, a basic token server issuer without auth or logging",
		FlagSet:    fs,
		Exec: func(ctx context.Context, args []string) error {
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

			servicesStrings := strings.Split(supportedFlag, ",")
			services := map[string]string{}
			for _, s := range servicesStrings {
				values := strings.Split(s, "@")
				if len(values) != 2 {
					return fmt.Errorf("malformed service name: %s", s)
				}
				services[values[0]] = values[1]
			}

			server, err := bertyprotocol.NewAuthTokenServer(secret, sk, services, logger)
			if err != nil {
				return err
			}

			pk := sk.Public().(ed25519.PublicKey)
			logger.Info(fmt.Sprintf("running server, corresponding pk is %s", base64.RawStdEncoding.EncodeToString(pk)))

			return http.ListenAndServe(listenerFlag, server)
		},
	}
}
