package main

import (
	"context"
	"crypto/ed25519"
	"encoding/base64"
	"flag"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/oklog/run"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/bertyvcissuer"
	"berty.tech/weshnet/pkg/verifiablecredstypes"
)

func vcIssuerCommand() *ffcli.Command {
	listenerFlag := ""
	serverRootURL := ""
	vcIssuerPrivKey := ""

	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty vc-issuer", flag.ExitOnError)
		fs.StringVar(&listenerFlag, "http.listener", listenerFlag, "http listener")
		fs.StringVar(&serverRootURL, "http.server-root", serverRootURL, "http server root")
		fs.StringVar(&vcIssuerPrivKey, "vc-sk", vcIssuerPrivKey, "Verifiable Credentials Issuer private key (base64 encoded)")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "vc-issuer",
		ShortUsage:     "berty [global flags] vc-issuer [flags]",
		ShortHelp:      "start a verified credentials issuer service",
		Options:        ffSubcommandOptions(),
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			ctx, cancel := context.WithCancel(ctx)
			defer cancel()

			if listenerFlag == "" {
				return fmt.Errorf("missing -http.listener flag")
			}

			if serverRootURL == "" {
				return fmt.Errorf("missing -http.server-root flag")
			}

			if vcIssuerPrivKey == "" {
				return fmt.Errorf("missing -vc-sk flag")
			}

			g := run.Group{}
			g.Add(func() error {
				<-ctx.Done()
				return ctx.Err()
			}, func(error) {
				cancel()
			})

			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}

			skBytes, err := base64.RawStdEncoding.DecodeString(vcIssuerPrivKey)
			if err != nil {
				return err
			}

			if len(skBytes) != ed25519.SeedSize {
				return fmt.Errorf("invalid sk size")
			}

			issuerPrivateKey := &[32]byte{}
			copy(issuerPrivateKey[:], skBytes)

			l, err := net.Listen("tcp", listenerFlag)
			if err != nil {
				return err
			}

			vcConfig := &bertyvcissuer.Config{
				ServerRootURL: serverRootURL,
				IssuerSignKey: issuerPrivateKey,
				Flow: &bertyvcissuer.FlowConfig{
					Type:          verifiablecredstypes.FlowType_FlowTypeCode, // TODO
					CodeGenerator: bertyvcissuer.CodeGeneratorZero,            // TODO
					CodeSenderClient: &bertyvcissuer.PhoneCodeSenderMockService{
						Logger: logger,
					}, // TODO
				},
				Logger: logger,
			}

			issuer, err := bertyvcissuer.New(vcConfig)
			if err != nil {
				return err
			}

			server := &http.Server{
				Handler:           issuer,
				ReadHeaderTimeout: time.Second * 5,
			}

			g.Add(func() error {
				return server.Serve(l)
			}, func(err error) {
				l.Close()
			})

			return g.Run()
		},
	}
}
