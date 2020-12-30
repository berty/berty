package testutil

import (
	context "context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type service struct {
	logger *zap.Logger
}

type Options struct {
	Logger *zap.Logger
}

func (o *Options) applyDefault() {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}
}

func TestingNewServiceClient(ctx context.Context, t *testing.T, opts *Options) (*grpc.ClientConn, *grpc.Server) {
	t.Helper()

	srv := grpc.NewServer()
	svc := NewService(opts)
	RegisterTestServiceServer(srv, svc)

	l := grpcutil.NewBufListener(ctx, 2048)

	cc, err := l.NewClientConn()
	assert.NoError(t, err)

	go func() {
		_ = srv.Serve(l.Listener)
	}()

	t.Cleanup(func() { l.Close() })

	return cc, srv
}

func NewService(opts *Options) TestServiceServer {
	opts.applyDefault()
	return &service{
		logger: opts.Logger,
	}
}

func (svc *service) EchoTest(ctx context.Context, req *EchoTest_Request) (*EchoTest_Reply, error) {
	if req.TriggerError {
		return nil, errcode.ErrTestEcho
	}

	if req.Delay > 0 {
		time.Sleep(time.Duration(req.Delay) * time.Millisecond)
	}

	return &EchoTest_Reply{Echo: req.Echo}, nil
}

func (svc *service) EchoStreamTest(req *EchoStreamTest_Request, srv TestService_EchoStreamTestServer) error {
	if req.TriggerError {
		return errcode.ErrTestEcho
	}

	for {
		err := srv.Send(&EchoStreamTest_Reply{Echo: req.Echo})
		if err != nil {
			return errcode.ErrTestEchoSend.Wrap(err)
		}

		time.Sleep(time.Duration(req.Delay) * time.Millisecond)
	}
}

func (svc *service) EchoDuplexTest(srv TestService_EchoDuplexTestServer) error {
	for {
		req, err := srv.Recv()
		if err != nil {
			return errcode.ErrTestEchoRecv.Wrap(err)
		}

		if req.TriggerError {
			return errcode.ErrTestEcho
		}

		err = srv.Send(&EchoDuplexTest_Reply{
			Echo: req.Echo,
		})
		if err != nil {
			return errcode.ErrTestEchoSend.Wrap(err)
		}
	}
}
