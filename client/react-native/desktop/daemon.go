package main

import (
	"context"
	"encoding/json"
	"fmt"

	astilectron "github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
	"google.golang.org/grpc"
	grpc_codes "google.golang.org/grpc/codes"
	grpc_status "google.golang.org/grpc/status"

	"berty.tech/core/api/helper"
	"berty.tech/core/daemon"
)

type InvokePayload struct {
	Method  string `json:"method,omitempty"`
	Request string `json:"request,omitempty"`
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

func (d *DaemonDesktop) Initialize(ctx context.Context, req *daemon.Config) error {
	_, err := d.bridge.Initialize(ctx, req)
	return err
}

func (d *DaemonDesktop) handleMessages(w *astilectron.Window, m bootstrap.MessageIn) (interface{}, error) {
	if m.Name == "invoke" {
		return d.handleInvoke(m.Payload)
	}

	// fallback on deprecate handleMessage
	return handleMessages(w, m)
}

func (d *DaemonDesktop) handleInvoke(message json.RawMessage) (interface{}, error) {
	var payload InvokePayload

	if err := json.Unmarshal(message, &payload); err != nil {
		fmt.Println(err)
		return nil, err
	}

	msg, err := d.Invoke(payload.Method, payload.Request)
	if err != nil {
		s, ok := grpc_status.FromError(err)
		if !ok {
			s = grpc_status.New(grpc_codes.Unknown, err.Error())
		}

		return s.Message(), err
	}

	return msg, nil
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
