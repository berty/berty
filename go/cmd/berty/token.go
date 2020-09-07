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

			server, err := bertyprotocol.NewAuthTokenServer(secret, sk, services, opts.logger)
			if err != nil {
				return err
			}

			pk := sk.Public().(ed25519.PublicKey)
			opts.logger.Info(fmt.Sprintf("running server, corresponding pk is %s", base64.RawStdEncoding.EncodeToString(pk)))

			return http.ListenAndServe(opts.serviceProviderListener, server)
		},
	}
}
