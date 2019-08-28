package daemon

import (
	"berty.tech/core/manager/account"
	"berty.tech/core/pkg/banner"
	"berty.tech/core/pkg/logmanager"
	"context"
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

		// account.WithJaegerAddrName("jaeger.berty.io:6831", accountName+":mobile"),
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
		account.WithGrpcWeb(&account.GrpcWebOptions{
			Bind:         cfg.GrpcWebBind,
			Interceptors: true,
		}),
		account.WithPrivateKeyFile(cfg.PrivateKeyFile),
	}

	if cfg.GrpcWebBind != "" {
		accountOptions = append(accountOptions,
			account.WithGrpcWeb(&account.GrpcWebOptions{
				Bind:         cfg.GrpcWebBind,
				Interceptors: true,
			}))
	}

	if !cfg.NoP2P {
		accountOptions = append(accountOptions, account.WithNetwork(
			NewNetworkDriver(ctx, cfg.NetworkConfig),
		))
	} else {
		accountOptions = append(accountOptions, account.WithEnqueurNetwork())
	}

	if cfg.WithBot {
		accountOptions = append(accountOptions, account.WithBot())
	}

	if d.Notification != nil {
		accountOptions = append(accountOptions, account.WithNotificationDriver(d.Notification))
	}

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

	if d.appConfig.LocalGRPC {
		_, err = d.StartLocalGRPC(ctx, &Void{})
		if err != nil {
			logger().Error(err.Error())
			d.appConfig.LocalGRPC = false
		}
		// Continue if local gRPC fails (e.g wifi not connected)
		// Still re-enableable via toggle in devtools
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
