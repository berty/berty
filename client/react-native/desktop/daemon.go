package main

import (
	"context"
	"encoding/json"
	"fmt"

	"berty.tech/core/api/helper"
	"berty.tech/core/daemon"
	astilectron "github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
	"google.golang.org/grpc"
)

type DaemonDesktop struct {
	daemon *daemon.Daemon

	server *grpc.Server
	conn   *grpc.ClientConn
}

func NewDaemonDesktop() (*DaemonDesktop, error) {
	daemon := daemon.New()

	iogrpc := helper.NewIOGrpc()
	dialer := iogrpc.NewDialer()
	listener := iogrpc.NewListener()

	dialOpts := append([]grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithDialer(icdialer),
	})

	gs := grpc.NewServer()
	daemon.RegisterDaemonServer(gs, daemon)

	conn, err := grpc.Dial("", dialOpts...)
	if err != nil {
		return nil, err
	}

	go func() {
		if err := gs.Serve(listener); err != nil {
			fmt.Errorf("serve error %s", err)
		}
	}()

	return &NativeBridge{
		daemon: daemon,

		server: gs,
		conn:   conn,
	}
}

func stringPayload(message json.RawMessage) (string, error) {
	payload := ""

	if err := json.Unmarshal(message, &payload); err != nil {
		return err.Error(), err
	}

	return payload, nil
}

func (d *DaemonDesktop) Start(ctx context.Context, cfg *daemon.Config) error {
	return d.daemon.Start(ctx, cfg)
}

func (d *DaemonDesktop) handleMessages(_ *astilectron.Window, m bootstrap.MessageIn) (interface{}, error) {
	method := m.name
	encoded, err := stringPayload(m.payload)
	if err != nil {
		return nil, err
	}
	res, err := d.Invoke(method, encoded)
	if err != nil {
		return nil, err
	}

	return &res, nil
}

func (n *DaemonDesktop) Invoke(method string, msgIn string) (string, error) {
	in, err := helper.NewLazyMessage().FromBase64(msgIn)
	if err != nil {
		return "", err
	}

	out := helper.NewLazyMessage()
	err := n.conn.Invoke(context.TODO(), method, in, out, helper.GrpcCallWithLazyCodec())
	return out.Base64(), err
}
