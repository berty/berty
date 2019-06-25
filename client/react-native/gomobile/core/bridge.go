package core

import (
	"context"
	"fmt"

	"berty.tech/core/api/helper"
	"berty.tech/core/daemon"
	network_config "berty.tech/core/network/config"
	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/pkg/errorcodes"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"
)

var (
	bridge             = daemon.New()
	NotificationDriver = NewMobileNotification()

	DeviceInfoAppStateUnknown    string = deviceinfo.Application_Unknown.String()
	DeviceInfoAppStateKill       string = deviceinfo.Application_Kill.String()
	DeviceInfoAppStateBackground string = deviceinfo.Application_Background.String()
	DeviceInfoAppStateForeground string = deviceinfo.Application_Foreground.String()
)

// @FIXME: this is not very secure..
var sqlConfig = &daemon.SQLConfig{
	Name: "berty.state.db",
	Key:  "s3cur3",
}

var config = &daemon.Config{
	SqlOpts:          sqlConfig,
	GrpcBind:         ":1337",
	GqlBind:          ":8700",
	GrpcWebBind:      ":8737",
	HideBanner:       true,
	DropDatabase:     false,
	InitOnly:         false,
	WithBot:          false,
	Notification:     true,
	ApnsCerts:        []string{},
	ApnsDevVoipCerts: []string{},
	FcmAPIKeys:       []string{},
	PrivateKeyFile:   "",
	PeerCache:        true,
	Identity:         "",
	Bootstrap:        network_config.DefaultBootstrap,
	NoP2P:            false,
	BindP2P:          []string{},
	TransportP2P:     []string{},
	Hop:              false,
	Ble:              false,
	Mdns:             true,
	DhtServer:        false,
	PrivateNetwork:   true,
	SwarmKeyPath:     "",
}

type NativeBridge interface {
	Invoke(method string, msgIn string) (string, error)
}

type nativeBridge struct {
	server *grpc.Server
	conn   *grpc.ClientConn
}

// @FIXME: NewNativeBridge must not panic, for now Initialize and Dial (should) never
// return an error so it safe, but keep an eye on it.
func NewNativeBridge(loggerNative NativeLogger) NativeBridge {
	storagePath := bridge.GetStoragePath()
	if storagePath == "" {
		panic("`SetStoragePath` should be before `NewNativeBridge`")
	}

	// setup notification
	bridge.Notification = NotificationDriver

	// setup logger
	if err := SetupLogger("debug", storagePath, loggerNative); err != nil {
		panic(err)
	}

	// setup daemon
	if _, err := bridge.Initialize(context.Background(), config); err != nil {
		panic(err)
	}

	bindBleFunc()

	iogrpc := helper.NewIOGrpc()

	dlogger := zap.L().Named("daemon.grpc")
	serverUnaryOpts := []grpc.UnaryServerInterceptor{
		// grpc_auth.UnaryServerInterceptor(myAuthFunction),
		grpc_ctxtags.UnaryServerInterceptor(),
		grpc_zap.UnaryServerInterceptor(dlogger),
		grpc_recovery.UnaryServerInterceptor(grpc_recovery.WithRecoveryHandler(errorcodes.RecoveryHandler)),
		errorcodes.UnaryServerInterceptor(),
	}

	serverInterceptors := []grpc.ServerOption{
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(serverUnaryOpts...)),
	}

	gs := grpc.NewServer(serverInterceptors...)
	daemon.RegisterDaemonServer(gs, bridge)

	dialer := iogrpc.NewDialer()
	dialOpts := append([]grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithDialer(dialer),
	})

	conn, err := grpc.Dial("", dialOpts...)
	if err != nil {
		panic(err)
	}

	listener := iogrpc.Listener()
	go func() {
		if err := gs.Serve(listener); err != nil {
			fmt.Errorf("serve error %s", err)
		}
	}()

	return &nativeBridge{
		server: gs,
		conn:   conn,
	}
}

func (n *nativeBridge) Invoke(method string, msgIn string) (string, error) {
	in, err := helper.NewLazyMessage().FromBase64(msgIn)
	if err != nil {
		return "", err
	}

	out := helper.NewLazyMessage()
	err = n.conn.Invoke(context.TODO(), method, in, out, helper.GrpcCallWithLazyCodec())
	return out.Base64(), err
}
