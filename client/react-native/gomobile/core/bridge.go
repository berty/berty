package core

import (
	"context"
	"fmt"

	"berty.tech/core/api/helper"
	"berty.tech/core/daemon"
	"google.golang.org/grpc"
)

type NativeBridge struct {
	bridge *daemon.Daemon

	server *grpc.Server
	conn   *grpc.ClientConn
}

func NewNativeBridge() *NativeBridge {
	bridge := daemon.New()

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
