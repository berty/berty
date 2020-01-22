package bertydemo

import (
	"testing"

	"berty.tech/berty/go/internal/grpcutil"
	"github.com/stretchr/testify/assert"
	grpc "google.golang.org/grpc"
)

type cleanFunc func()

func testingClient(t *testing.T, opts *Opts) (*Client, cleanFunc) {
	t.Helper()

	demo, err := New(opts)
	if err != nil {
		t.Fatal(err)
	}

	return demo, func() {
		demo.Close()
	}
}

func testingClientService(t *testing.T, srv DemoServiceServer) (DemoServiceClient, cleanFunc) {
	t.Helper()

	listener := grpcutil.NewPipeListener()

	server := grpc.NewServer()
	RegisterDemoServiceServer(server, srv)

	conn, err := listener.NewClientConn(grpc.WithInsecure())
	if err != nil {
		t.Fatal(err)
	}

	go server.Serve(listener)

	return NewDemoServiceClient(conn), func() {
		listener.Close()
	}
}

func checkErr(t *testing.T, err error) {
	t.Helper()

	if !assert.NoError(t, err) {
		t.Fatal("fatal")
	}
}
