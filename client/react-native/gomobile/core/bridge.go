package core

import (
	"context"
	"fmt"

	"berty.tech/core/api/helper"
	"berty.tech/core/daemon"
	network_config "berty.tech/core/network/config"
	"google.golang.org/grpc"
)

var sqlConfig = &daemon.SQLConfig{
	Name: "berty.state.db",
	Key:  "s3cur3",
}

var config = &daemon.Config{
	SqlOpts:          sqlConfig,
	GrpcBind:         ":0",
	GqlBind:          ":0",
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
	Ble:              true,
	Mdns:             true,
	DhtServer:        false,
	PrivateNetwork:   true,
	SwarmKeyPath:     "",
}

type NativeBridge struct {
	bridge *daemon.Daemon

	server *grpc.Server
	conn   *grpc.ClientConn
}

// @FIXME: NewNativeBridge must  not panic, for now Initialize and Dial (should) never
// return an error so it safe, but keep an eye on it.
func NewNativeBridge(loggerNative NativeLogger) *NativeBridge {
	bridge := daemon.New()
	if _, err := bridge.Initialize(context.Background(), config); err != nil {
		panic(err)
	}

	if err := setupLogger("debug", loggerNative); err != nil {
		panic(err)
	}

	initBleFunc()

	iogrpc := helper.NewIOGrpc()
	dialer := iogrpc.NewDialer()
	listener := iogrpc.Listener()

	dialOpts := append([]grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithDialer(dialer),
	})

	gs := grpc.NewServer()
	daemon.RegisterDaemonServer(gs, bridge)

	conn, err := grpc.Dial("", dialOpts...)
	if err != nil {
		panic(err)
	}

	go func() {
		if err := gs.Serve(listener); err != nil {
			fmt.Errorf("serve error %s", err)
		}
	}()

	return &NativeBridge{
		bridge: bridge,

		server: gs,
		conn:   conn,
	}
}

func (n *NativeBridge) Invoke(method string, msgIn string) (string, error) {
	in, err := helper.NewLazyMessage().FromBase64(msgIn)
	if err != nil {
		return "", err
	}

	out := helper.NewLazyMessage()
	err = n.conn.Invoke(context.TODO(), method, in, out, helper.GrpcCallWithLazyCodec())
	return out.Base64(), err
}
