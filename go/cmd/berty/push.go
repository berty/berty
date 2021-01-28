package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"

	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
)

func pushServerCommand() *ffcli.Command {
	var (
		apns *string
		fcm  *string
		sk   *string
	)

	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty push-server", flag.ExitOnError)
		apns = fs.String("apns", "", "Apple's apns certs path, comma-separated")
		fcm = fs.String("fcm", "", "Firebase's FCM API keys, formatted like app_id:api_key and comma-separated")
		sk = fs.String("push-private-key", "", "Push server private key, base64 formatted")
		manager.SetupLoggingFlags(fs) // also available at root level
		manager.SetupProtocolAuth(fs)
		manager.SetupDefaultGRPCListenersFlags(fs)
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "push-server",
		ShortHelp:      "push relay server",
		ShortUsage:     "berty [global flags] push-server [flags]",
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Options:        ffSubcommandOptions(),
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			var err error

			if manager.Node.Protocol.AuthSecret == "" {
				return fmt.Errorf("node.auth-secret cannot be empty")
			}

			if manager.Node.Protocol.AuthPublicKey == "" {
				return fmt.Errorf("node.auth-pk cannot be empty")
			}

			if sk == nil || *sk == "" {
				return fmt.Errorf("push-private-key cannot be empty")
			}

			keyBytes, err := base64.RawURLEncoding.DecodeString(*sk)
			if err != nil {
				return fmt.Errorf("invalid private key supplied")
			}

			key, err := cryptoutil.KeySliceToArray(keyBytes)
			if err != nil {
				return err
			}

			apnsDispatchers, err := bertyprotocol.PushDispatcherLoadAPNSCertificates(apns)
			if err != nil {
				return err
			}

			fcmDispatchers, err := bertyprotocol.PushDispatcherLoadFirebaseAPIKey(fcm)
			if err != nil {
				return err
			}

			dispatchers := append(apnsDispatchers, fcmDispatchers...)

			server, mux, err := manager.GetGRPCServer()
			if err != nil {
				return err
			}

			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}

			pushService, err := bertyprotocol.NewPushService(key, dispatchers, logger)
			if err != nil {
				return err
			}

			bertyprotocol.RegisterPushServiceServer(server, pushService)
			if err := bertyprotocol.RegisterPushServiceHandlerServer(ctx, mux, pushService); err != nil {
				return err
			}

			return manager.RunWorkers()
		},
	}
}
