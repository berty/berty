package daemon

import (
	"context"
	"net"

	account "berty.tech/core/manager/account"
	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/pkg/notification"
)

type localGRPCInfos struct {
	IsRunning bool
	LocalAddr string
}

type Daemon struct {
	cancel context.CancelFunc
	config *Config

	app          *deviceinfo.Application
	grpcListener net.Listener
	appConfig    *account.StateDB
	rootContext  context.Context
	accountName  string

	// Module
	Logger       NativeLogger
	Notification notification.Driver
}

func New() *Daemon {
	return &Daemon{
		rootContext: context.Background(),
		accountName: "",
		app: &deviceinfo.Application{
			State: deviceinfo.Application_Kill,
			Route: "",
		},
		Notification: notification.NewNoopNotification(),
		Logger:       &NoopLogger{},
	}
}
