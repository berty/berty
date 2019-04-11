package daemon

import (
	"context"
	fmt "fmt"
	"io/ioutil"
	"os"

	"berty.tech/core/manager/account"
	"berty.tech/core/network"
	network_config "berty.tech/core/network/config"
	"berty.tech/core/pkg/banner"
	"berty.tech/core/pkg/logmanager"
	"berty.tech/core/push"
	"go.uber.org/zap"
)

func (d *Daemon) daemon(ctx context.Context, cfg *Config, accountName string) error {
	var err error
	a := &account.Account{}

	defer func() {
		_ = logmanager.G().LogRotate()
	}()

	accountOptions := account.Options{
		// account.WithJaegerAddrName(jaegerAddr, jaegerName+":node"),

		account.WithJaegerAddrName("jaeger.berty.io:6831", accountName+":mobile"),
		account.WithRing(logmanager.G().Ring()),
		account.WithName(accountName),
		account.WithPassphrase(cfg.SqlOpts.Key),
		account.WithDatabase(&account.DatabaseOptions{
			Path: ".",
			Drop: cfg.DropDatabase,
		}),
		account.WithBanner(banner.QOTD()),
		account.WithGrpcServer(&account.GrpcServerOptions{
			Bind:         cfg.GrpcBind,
			Interceptors: true,
		}),
		account.WithGQL(&account.GQLOptions{
			Bind:         cfg.GqlBind,
			Interceptors: true,
		}),
		account.WithPrivateKeyFile(cfg.PrivateKeyFile),
	}
	if !cfg.NoP2P {
		swarmKey := network_config.DefaultSwarmKey

		if cfg.SwarmKeyPath != "" {
			file, err := os.Open(cfg.SwarmKeyPath)
			if err != nil {
				return fmt.Errorf("swarm key error: %s", err)
			}
			swarmKeyBytes, err := ioutil.ReadAll(file)
			if err != nil {
				return fmt.Errorf("swarm key error: %s", err)
			}
			swarmKey = string(swarmKeyBytes)
		}

		accountOptions = append(accountOptions, account.WithNetwork(
			network.New(ctx,
				network.WithDefaultOptions(),
				network.WithConfig(&network_config.Config{
					DefaultBind:      len(cfg.BindP2P) == 0,
					Bind:             cfg.BindP2P,
					MDNS:             cfg.Mdns,
					DHTServer:        cfg.DhtServer,
					WS:               true,
					TCP:              true,
					BLE:              cfg.Ble,
					QUIC:             true,
					Metric:           true,
					Ping:             true,
					DefaultBootstrap: false,
					Bootstrap:        cfg.Bootstrap,
					HOP:              cfg.Hop,
					SwarmKey:         swarmKey,
					Identity:         cfg.Identity,
					Persist:          false,
					OverridePersist:  false,
					PeerCache:        cfg.PeerCache,

					//					DHTKVLogDatastore: cfg.DhtkvLogDatastore,
				}),
			),
		))
	} else {
		accountOptions = append(accountOptions, account.WithEnqueurNetwork())
	}

	if cfg.WithBot {
		accountOptions = append(accountOptions, account.WithBot())
	}

	accountOptions = append(accountOptions, account.WithNotificationDriver(d.Notification))

	pushDispatchers, err := listPushDispatchers(cfg)
	if err != nil {
		return err
	}

	accountOptions = append(accountOptions, account.WithPushManager(push.New(pushDispatchers...)))

	if cfg.InitOnly {
		accountOptions = append(accountOptions, account.WithInitOnly())
	}

	a, err = account.New(ctx, accountOptions...)
	if err != nil {
		return err
	}

	err = a.Open(ctx)
	if err != nil {
		return err
	}

	go func() {
		var err error

		select {
		case err = <-a.ErrChan():
		case <-ctx.Done():
			err = ctx.Err()
		}

		if err != nil {
			logger().Error("daemon stoped", zap.Error(err))
		}
	}()

	// d.currentAccount = a
	return nil
}

func listPushDispatchers(cfg *Config) ([]push.Dispatcher, error) {
	var pushDispatchers []push.Dispatcher
	for _, certs := range []struct {
		Certs    []string
		ForceDev bool
	}{
		{Certs: cfg.ApnsCerts, ForceDev: false},
		{Certs: cfg.ApnsDevVoipCerts, ForceDev: true},
	} {
		for _, cert := range certs.Certs {
			dispatcher, err := push.NewAPNSDispatcher(cert, certs.ForceDev)
			if err != nil {
				return nil, err
			}

			pushDispatchers = append(pushDispatchers, dispatcher)
		}
	}

	for _, apiKey := range cfg.FcmAPIKeys {
		dispatcher, err := push.NewFCMDispatcher(apiKey)
		if err != nil {
			return nil, err
		}

		pushDispatchers = append(pushDispatchers, dispatcher)
	}

	return pushDispatchers, nil
}

// func (d *Daemon) daemon(cfg *Config) error {
// 	var err error
// 	_ = logmanager.G().LogRotate()

// 	grpcPort, err := getRandomPort()
// 	if err != nil {
// 		return err
// 	}
// 	gqlPort, err := getRandomPort()
// 	if err != nil {
// 		return err
// 	}

// 	var a *account.Account

// 	networkDriver, err := network.New(b.rootContext, b.NetworkConfig)
// 	if err != nil {
// 		return err
// 	}

//      accountOptions := account.Options{
//              account.WithNetwork(networkDriver, nil),
//              account.WithJaegerAddrName("jaeger.berty.io:6831", cfg.Nickname+":mobile"),
//              account.WithRing(logmanager.G().Ring()),
//              account.WithName(cfg.Nickname),
//              account.WithPassphrase("secure"),
//              account.WithDatabase(&account.DatabaseOptions{
//                      Path: ".",
//                      Drop: false,
//              }),
//              account.WithGrpcServer(&account.GrpcServerOptions{
//                      Bind:         fmt.Sprintf(":%d", grpcPort),
//                      Interceptors: false,
//              }),
//              account.WithGQL(&account.GQLOptions{
//                      Bind:         fmt.Sprintf(":%d", gqlPort),
//                      Interceptors: false,
//              }),
//      }

// 	accountOptions = append(accountOptions, account.WithNotificationDriver(b.Notification))
// 	if appConfig.BotMode {
// 		accountOptions = append(accountOptions, account.WithBot())
// 	}

// 	a, err = account.New(rootContext, accountOptions...)
// 	if err != nil {
// 		return err
// 	}
// 	defer account.Delete(rootContext, a)

// 	err = a.Open(rootContext)
// 	if err != nil {
// 		return err
// 	}
// 	defer a.Close(rootContext)

// 	if appConfig.LocalGRPC {
// 		err := StartLocalGRPC()
// 		if err != nil {
// 			logger().Error(err.Error())
// 			appConfig.LocalGRPC = false
// 		}
// 		// Continue if local gRPC fails (e.g wifi not connected)
// 		// Still re-enableable via toggle in devtools
// 	}

// 	logger().Debug("daemon started")
// 	return <-a.ErrChan()
// }
