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

type InvokePayload struct {
}

type DaemonDesktop struct {
	bridge *daemon.Daemon

	server *grpc.Server
	conn   *grpc.ClientConn
}

func NewDaemonDesktop() (*DaemonDesktop, error) {
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
		return nil, err
	}

	go func() {
		if err := gs.Serve(listener); err != nil {
			fmt.Errorf("serve error %s", err)
		}
	}()

	return &DaemonDesktop{
		bridge: bridge,

		server: gs,
		conn:   conn,
	}, nil
}

func stringPayload(message json.RawMessage) (string, error) {
	payload := ""

	if err := json.Unmarshal(message, &payload); err != nil {
		return err.Error(), err
	}

	return payload, nil
}

func (d *DaemonDesktop) Initialize(ctx context.Context, req *daemon.Config) error {
	_, err := d.bridge.Initialize(ctx, req)
	return err
}

func (d *DaemonDesktop) handleMessages(_ *astilectron.Window, m bootstrap.MessageIn) (interface{}, error) {
	fmt.Printf("\n\n\n handle messages\n\n")
	defer fmt.Printf("\n\n end here\n\n")

	method := m.Name

	fmt.Printf("name %s\n", method)
	fmt.Printf("payload: %#v\n", m.Payload)

	encoded, err := stringPayload(m.Payload)
	if err != nil {
		fmt.Printf("string payload: %s\n", err.Error())
		return nil, err
	}
	res, err := d.Invoke(method, encoded)
	if err != nil {
		fmt.Printf("error: %s\n", err.Error())
		return nil, err
	}

	return &res, nil
}

func (d *DaemonDesktop) Invoke(method string, msgIn string) (string, error) {
	in, err := helper.NewLazyMessage().FromBase64(msgIn)
	if err != nil {
		return "", err
	}

	out := helper.NewLazyMessage()
	err = d.conn.Invoke(context.TODO(), method, in, out, helper.GrpcCallWithLazyCodec())
	return out.Base64(), err
}
