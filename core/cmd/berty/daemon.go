package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"strings"

	"berty.tech/core/manager/account"
	"berty.tech/core/network/p2p"
	"berty.tech/core/pkg/banner"
	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/pkg/logmanager"
	"berty.tech/core/pkg/notification"
	"berty.tech/core/push"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

type daemonOptions struct {
	sql sqlOptions `mapstructure:"sql"`

	grpcBind         string   `mapstructure:"grpc-bind"`
	gqlBind          string   `mapstructure:"gql-bind"`
	hideBanner       bool     `mapstructure:"hide-banner"`
	dropDatabase     bool     `mapstructure:"drop-database"`
	initOnly         bool     `mapstructure:"init-only"`
	withBot          bool     `mapstructure:"with-bot"`
	notification     bool     `mapstructure:"notification"`
	apnsCerts        []string `mapstructure:"apns-certs"`
	apnsDevVoipCerts []string `mapstructure:"apns-dev-voip-certs"`
	fcmAPIKeys       []string `mapstructure:"fcm-api-keys"`
	privateKeyFile   string   `mapstructure:"private-key-file"`

	// p2p
	identity       string   `mapstructure:"identity"`
	bootstrap      []string `mapstructure:"bootstrap"`
	noP2P          bool     `mapstructure:"no-p2p"`
	bindP2P        []string `mapstructure:"bind-p2p"`
	transportP2P   []string `mapstructure:"transport-p2p"`
	hop            bool     `mapstructure:"hop"` // relay hop
	mdns           bool     `mapstructure:"mdns"`
	PrivateNetwork bool     `mapstructure:"private-network"`
	SwarmKeyPath   string   `mapstructure:"swarm-key"`

	nickname string `mapstructure:"nickname"`
}

func daemonSetupFlags(flags *pflag.FlagSet, opts *daemonOptions) {
	flags.StringVar(&opts.nickname, "nickname", "berty-daemon", "set account nickname")
	flags.BoolVar(&opts.dropDatabase, "drop-database", false, "drop database to force a reinitialization")
	flags.BoolVar(&opts.notification, "notification", false, "enable local notification")
	flags.BoolVar(&opts.hideBanner, "hide-banner", false, "hide banner")
	flags.BoolVar(&opts.initOnly, "init-only", false, "stop after node initialization (useful for integration tests")
	flags.BoolVar(&opts.noP2P, "no-p2p", false, "Disable p2p Driver")
	flags.BoolVar(&opts.hop, "hop", false, "enable relay hop (should not be enable for client)")
	flags.BoolVar(&opts.withBot, "bot", false, "enable bot")
	flags.BoolVar(&opts.mdns, "mdns", true, "enable mdns discovery")
	flags.BoolVar(&opts.PrivateNetwork, "private-network", true, "enable private network with the default swarm key")
	flags.StringVar(&opts.SwarmKeyPath, "swarm-key", "", "path to a custom swarm key, only peers that use the same swarm key will be able to talk with you")
	flags.StringVar(&opts.grpcBind, "grpc-bind", ":1337", "gRPC listening address")
	flags.StringVar(&opts.gqlBind, "gql-bind", ":8700", "Bind graphql api")
	flags.StringVarP(&opts.identity, "p2p-identity", "i", "", "set p2p identity")
	flags.StringSliceVar(&opts.bootstrap, "bootstrap", p2p.DefaultBootstrap, "boostrap peers")
	flags.StringSliceVar(&opts.bindP2P, "bind-p2p", []string{"/ip4/0.0.0.0/tcp/0", "/ip4/0.0.0.0/udp/0/quic", "/ble/00000000-0000-0000-0000-000000000000"}, "p2p listening address")
	flags.StringSliceVar(&opts.apnsCerts, "apns-certs", []string{}, "Path of APNs certificates, delimited by commas")
	flags.StringSliceVar(&opts.apnsDevVoipCerts, "apns-dev-voip-certs", []string{}, "Path of APNs VoIP development certificates, delimited by commas")
	flags.StringSliceVar(&opts.fcmAPIKeys, "fcm-api-keys", []string{}, "API keys for Firebase Cloud Messaging, in the form packageid:token, delimited by commas")
	flags.StringVar(&opts.privateKeyFile, "private-key-file", "", "set private key file for node")
	// flags.StringSliceVar(&opts.bindP2P, "bind-p2p", []string{"/ip4/0.0.0.0/tcp/0"}, "p2p listening address")
	flags.StringSliceVar(&opts.transportP2P, "transport-p2p", []string{"default", "quic" /*, "ble"*/}, "p2p transport to enable")
	_ = viper.BindPFlags(flags)
}

func newDaemonCommand() *cobra.Command {
	opts := &daemonOptions{}
	cmd := &cobra.Command{
		Use: "daemon",
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := viper.Unmarshal(opts); err != nil {
				return err
			}
			if err := viper.Unmarshal(&opts.sql); err != nil {
				return err
			}
			return daemon(opts)
		},
	}

	daemonSetupFlags(cmd.Flags(), opts)
	sqlSetupFlags(cmd.Flags(), &opts.sql)
	return cmd
}

func daemon(opts *daemonOptions) error {
	ctx := context.Background()
	var err error
	a := &account.Account{}

	defer a.PanicHandler()
	defer func() {
		_ = logmanager.G().LogRotate()
	}()
	deviceinfo.SetStoragePath("/tmp")
	accountOptions := account.Options{
		account.WithJaegerAddrName(jaegerAddr, jaegerName+":node"),
		account.WithRing(logmanager.G().Ring()),
		account.WithName(opts.nickname),
		account.WithPassphrase(opts.sql.key),
		account.WithDatabase(&account.DatabaseOptions{
			Path: ".",
			Drop: opts.dropDatabase,
		}),
		account.WithBanner(banner.QOTD()),
		account.WithGrpcServer(&account.GrpcServerOptions{
			Bind:         opts.grpcBind,
			Interceptors: true,
		}),
		account.WithGQL(&account.GQLOptions{
			Bind:         opts.gqlBind,
			Interceptors: true,
		}),
		account.WithPrivateKeyFile(opts.privateKeyFile),
	}
	if !opts.noP2P {
		var swarmKey io.Reader

		if opts.PrivateNetwork {
			swarmKey = strings.NewReader(p2p.DefaultSwarmKey)
		}

		if opts.SwarmKeyPath != "" {
			file, err := os.Open(opts.SwarmKeyPath)
			if err != nil {
				return fmt.Errorf("swarm key error: %s", err)
			}

			swarmKey = bufio.NewReader(file)
		}

		accountOptions = append(accountOptions, account.WithP2PNetwork(
			&account.P2PNetworkOptions{
				Bind:      opts.bindP2P,
				Transport: opts.transportP2P,
				Bootstrap: opts.bootstrap,
				MDNS:      opts.mdns,
				Relay:     opts.hop,
				Metrics:   true,
				Identity:  opts.identity,
				SwarmKey:  swarmKey,
			},
		))
	} else {
		accountOptions = append(accountOptions, account.WithEnqueurNetwork())
	}

	if opts.withBot {
		accountOptions = append(accountOptions, account.WithBot())
	}

	if opts.notification {
		notificationDriver := notification.NewDesktopNotification()
		accountOptions = append(accountOptions, account.WithNotificationDriver(notificationDriver))
	}

	pushDispatchers, err := listPushDispatchers(opts)
	if err != nil {
		return err
	}

	accountOptions = append(accountOptions, account.WithPushManager(push.New(pushDispatchers...)))

	if opts.initOnly {
		accountOptions = append(accountOptions, account.WithInitOnly())
	}
	a, err = account.New(ctx, accountOptions...)
	if err != nil {
		return err
	}
	defer a.Close(ctx)

	err = a.Open(ctx)
	if err != nil {
		return err
	}

	if opts.initOnly {
		return nil
	}

	return <-a.ErrChan()
}

func listPushDispatchers(opts *daemonOptions) ([]push.Dispatcher, error) {
	var pushDispatchers []push.Dispatcher
	for _, certs := range []struct {
		Certs    []string
		ForceDev bool
	}{
		{Certs: opts.apnsCerts, ForceDev: false},
		{Certs: opts.apnsDevVoipCerts, ForceDev: true},
	} {
		for _, cert := range certs.Certs {
			dispatcher, err := push.NewAPNSDispatcher(cert, certs.ForceDev)
			if err != nil {
				return nil, err
			}

			pushDispatchers = append(pushDispatchers, dispatcher)
		}
	}

	for _, apiKey := range opts.fcmAPIKeys {
		dispatcher, err := push.NewFCMDispatcher(apiKey)
		if err != nil {
			return nil, err
		}

		pushDispatchers = append(pushDispatchers, dispatcher)
	}

	return pushDispatchers, nil
}
