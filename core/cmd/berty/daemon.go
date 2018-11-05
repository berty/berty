package main

import (
	"berty.tech/core/manager/account"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

var defaultBootstrap = []string{
	"/ip4/104.248.78.238/tcp/4004/ipfs/QmPCbsVWDtLTdCtwfp5ftZ96xccUNe4hegKStgbss8YACT",
}

type daemonOptions struct {
	sql sqlOptions `mapstructure:"sql"`

	grpcBind     string `mapstructure:"grpc-bind"`
	gqlBind      string `mapstructure:"gql-bind"`
	hideBanner   bool   `mapstructure:"hide-banner"`
	dropDatabase bool   `mapstructure:"drop-database"`
	initOnly     bool   `mapstructure:"init-only"`

	// p2p
	identity     string   `mapstructure:"identity"`
	bootstrap    []string `mapstructure:"bootstrap"`
	noP2P        bool     `mapstructure:"no-p2p"`
	bindP2P      []string `mapstructure:"bind-p2p"`
	transportP2P []string `mapstructure:"transport-p2p"`
	hop          bool     `mapstructure:"hop"` // relay hop
	mdns         bool     `mapstructure:"mdns"`

	nickname string `mapstructure:"nickname"`
	password string `mapstructure:"password"`
}

func daemonSetupFlags(flags *pflag.FlagSet, opts *daemonOptions) {
	flags.StringVar(&opts.nickname, "nickname", "berty-daemon", "set account nickname")
	flags.StringVar(&opts.password, "password", "secure", "set account password")
	flags.BoolVar(&opts.dropDatabase, "drop-database", false, "drop database to force a reinitialization")
	flags.BoolVar(&opts.hideBanner, "hide-banner", false, "hide banner")
	flags.BoolVar(&opts.initOnly, "init-only", false, "stop after node initialization (useful for integration tests")
	flags.BoolVar(&opts.noP2P, "no-p2p", false, "Disable p2p Driver")
	flags.BoolVar(&opts.hop, "hop", false, "enable relay hop (should not be enable for client)")
	flags.BoolVar(&opts.mdns, "mdns", true, "enable mdns discovery")
	flags.StringVar(&opts.grpcBind, "grpc-bind", ":1337", "gRPC listening address")
	flags.StringVar(&opts.gqlBind, "gql-bind", ":8700", "Bind graphql api")
	flags.StringVarP(&opts.identity, "p2p-identity", "i", "", "set p2p identity")
	flags.StringSliceVar(&opts.bootstrap, "bootstrap", defaultBootstrap, "boostrap peers")
	//	flags.StringSliceVar(&opts.bindP2P, "bind-p2p", []string{"/ip4/0.0.0.0/tcp/0", "/ble/00000000-0000-0000-0000-000000000000"}, "p2p listening address")
	flags.StringSliceVar(&opts.bindP2P, "bind-p2p", []string{"/ip4/0.0.0.0/tcp/0"}, "p2p listening address")
	flags.StringSliceVar(&opts.transportP2P, "transport-p2p", []string{"default"}, "p2p transport to enable")
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

	var err error
	a := &account.Account{}

	defer a.PanicHandler()

	accountOptions := account.Options{
		account.WithName(opts.nickname),
		account.WithPassphrase(opts.password),
		account.WithDatabase(&account.DatabaseOptions{
			Path: "/tmp",
			Drop: opts.dropDatabase,
		}),
		account.WithBanner(banner),
		account.WithGrpcServer(&account.GrpcServerOptions{
			Bind:         opts.grpcBind,
			Interceptors: true,
			JaegerAddr:   jaegerAddr,
		}),
		account.WithGQL(&account.GQLOptions{
			Bind:         opts.gqlBind,
			Interceptors: true,
			JaegerAddr:   jaegerAddr,
		}),
	}
	if !opts.noP2P {
		accountOptions = append(accountOptions, account.WithP2PNetwork(
			&account.P2PNetworkOptions{
				Bind:      opts.bindP2P,
				Transport: opts.transportP2P,
				Bootstrap: opts.bootstrap,
				MDNS:      opts.mdns,
				Relay:     opts.hop,
				Metrics:   true,
				Identity:  opts.identity,
			},
		))
	} else {
		accountOptions = append(accountOptions, account.WithEnqueurNetwork())
	}

	if opts.initOnly {
		accountOptions = append(accountOptions, account.WithInitOnly())
	}
	a, err = account.New(accountOptions...)
	if err != nil {
		return err
	}

	defer a.Close()

	err = a.Open()
	if err != nil {
		return err
	}

	if opts.initOnly {
		return nil
	}

	return <-a.ErrChan()
}
