package testutil

import (
	context "context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/weshnet/v2/pkg/grpcutil"
)

type service struct {
	logger *zap.Logger

	UnimplementedTestServiceServer
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

	l := grpcutil.NewBufListener(2048)

	cc, err := l.NewClientConn(ctx)
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

func (svc *service) EchoTest(_ context.Context, req *EchoTest_Request) (*EchoTest_Reply, error) {
	if req.TriggerError {
		return nil, errcode.ErrCode_ErrTestEcho
	}

	if req.Delay > 0 {
		time.Sleep(time.Duration(req.Delay) * time.Millisecond)
	}

	return &EchoTest_Reply{Echo: req.Echo}, nil
}

func (svc *service) EchoStreamTest(req *EchoStreamTest_Request, srv TestService_EchoStreamTestServer) error {
	if req.TriggerError {
		return errcode.ErrCode_ErrTestEcho
	}

	for {
		err := srv.Send(&EchoStreamTest_Reply{Echo: req.Echo})
		if err != nil {
			return errcode.ErrCode_ErrTestEchoSend.Wrap(err)
		}

		time.Sleep(time.Duration(req.Delay) * time.Millisecond)
	}
}

func (svc *service) EchoDuplexTest(srv TestService_EchoDuplexTestServer) error {
	for {
		req, err := srv.Recv()
		if err != nil {
			return errcode.ErrCode_ErrTestEchoRecv.Wrap(err)
		}

		if req.TriggerError {
			return errcode.ErrCode_ErrTestEcho
		}

		err = srv.Send(&EchoDuplexTest_Reply{
			Echo: req.Echo,
		})
		if err != nil {
			return errcode.ErrCode_ErrTestEchoSend.Wrap(err)
		}
	}
}
