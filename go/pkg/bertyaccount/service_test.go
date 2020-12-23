package bertyaccount

import (
	"context"
	"io/ioutil"
	"os"
	"testing"

	proto "github.com/golang/protobuf/proto"
	"github.com/stretchr/testify/require"
	"github.com/tj/assert"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

const echoStringTest = "Im sorry Dave, Im afraid I cant do that"

func TestNewService(t *testing.T) {
	s, err := NewService(&Options{})
	require.NoError(t, err)

	err = s.Close()
	assert.NoError(t, err)
}

func TestGRPCUnaryService(t *testing.T) {
	tmpdir, err := ioutil.TempDir("", "test")
	require.NoError(t, err)
	defer os.RemoveAll(tmpdir)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	s, err := NewService(&Options{
		RootDirectory: tmpdir,
	})
	require.NoError(t, err)

	cl := createAccountClient(ctx, t, s)

	// create an account
	{
		args := testConfig(tmpdir)
		res, err := cl.CreateAccount(ctx, &CreateAccount_Request{
			Args: args,
		})
		require.NoError(t, err)
		assert.NotEmpty(t, res.AccountMetadata)
	}

	// call instance `MessengerService/ContactRequest` with empty request,
	// should trigger an error
	{
		input := &messengertypes.ContactRequest{}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		res, err := cl.ClientInvokeUnary(ctx, &ClientInvokeUnary_Request{
			MethodDesc: &MethodDesc{
				Name: "/berty.messenger.v1.MessengerService/ContactRequest",
			},
			Payload: payload,
		})

		require.NoError(t, err)
		require.NotNil(t, res.Error)
		assert.NotEqual(t, res.Error.GrpcErrorCode, GRPCErrCode_OK)
		assert.NotEqual(t, res.Error.GrpcErrorCode, errcode.Undefined)
		require.NotNil(t, res.Error.ErrorDetails)
		assert.Greater(t, len(res.Error.ErrorDetails.Codes), 0)
	}
}

func TestGRPCStreamService(t *testing.T) {
	tmpdir, err := ioutil.TempDir("", "test")
	require.NoError(t, err)
	defer os.RemoveAll(tmpdir)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	s, err := NewService(&Options{
		RootDirectory: tmpdir,
	})
	require.NoError(t, err)

	cl := createAccountClient(ctx, t, s)

	// create an account
	{
		args := testConfig(tmpdir)
		res, err := cl.CreateAccount(ctx, &CreateAccount_Request{
			Args: args,
		})
		require.NoError(t, err)
		assert.NotEmpty(t, res.AccountMetadata)
	}

	// call instance `MessengerService/EchoTest`
	var streamid string
	{
		input := &messengertypes.EchoTest_Request{
			Delay: 10,
			Echo:  echoStringTest,
		}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		res, err := cl.CreateClientStream(ctx, &ClientCreateStream_Request{
			MethodDesc: &MethodDesc{
				Name:           "/berty.messenger.v1.MessengerService/EchoTest",
				IsServerStream: true,
			},
			Payload: payload,
		})

		require.NoError(t, err)
		require.NotEmpty(t, res.StreamId)

		streamid = res.StreamId
	}

	// test stream reply
	{
		for i := 0; i < 10; i++ {
			res, err := cl.ClientStreamRecv(ctx, &ClientStreamRecv_Request{
				StreamId: streamid,
			})
			require.NoError(t, err)
			require.NotNil(t, res.Error)
			assert.Equal(t, res.Error.GrpcErrorCode, GRPCErrCode_OK)
			assert.Equal(t, res.Error.ErrorCode, errcode.Undefined)

			var output messengertypes.EchoTest_Reply
			err = proto.Unmarshal(res.Payload, &output)
			require.NoError(t, err)

			assert.Equal(t, echoStringTest, output.Echo)
		}
	}

	// test close stream
	{
		res, err := cl.ClientStreamClose(ctx, &ClientStreamClose_Request{
			StreamId: streamid,
		})

		require.NoError(t, err)
		require.NotNil(t, res.Error)
		assert.Equal(t, res.Error.GrpcErrorCode, GRPCErrCode_OK)
		assert.Equal(t, res.Error.ErrorCode, errcode.Undefined)
	}
}

func TestGRPCStreamServiceError(t *testing.T) {
	tmpdir, err := ioutil.TempDir("", "test")
	require.NoError(t, err)
	defer os.RemoveAll(tmpdir)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	s, err := NewService(&Options{
		RootDirectory: tmpdir,
	})
	require.NoError(t, err)

	cl := createAccountClient(ctx, t, s)

	// create an account
	{
		args := testConfig(tmpdir)
		res, err := cl.CreateAccount(ctx, &CreateAccount_Request{
			Args: args,
		})
		require.NoError(t, err)
		assert.NotEmpty(t, res.AccountMetadata)
	}

	// test echoTest error
	var streamid string
	{
		input := &messengertypes.EchoTest_Request{
			TriggerError: true,
			Delay:        10,
			Echo:         echoStringTest,
		}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		res, err := cl.CreateClientStream(ctx, &ClientCreateStream_Request{
			MethodDesc: &MethodDesc{
				Name:           "/berty.messenger.v1.MessengerService/EchoTest",
				IsServerStream: true,
			},
			Payload: payload,
		})

		require.NoError(t, err)
		require.NotEmpty(t, res.StreamId)
		require.NotNil(t, res.Error)
		assert.Equal(t, res.Error.GrpcErrorCode, GRPCErrCode_OK)
		assert.Equal(t, res.Error.ErrorCode, errcode.Undefined)
		streamid = res.StreamId
	}

	{
		res, err := cl.ClientStreamCloseAndRecv(ctx, &ClientStreamCloseAndRecv_Request{
			StreamId: streamid,
		})

		require.NoError(t, err)
		require.NotNil(t, res.Error)
		assert.NotEqual(t, res.Error.GrpcErrorCode, GRPCErrCode_OK)
		assert.NotEqual(t, res.Error.ErrorCode, errcode.Undefined)
	}
}

func createAccountClient(ctx context.Context, t *testing.T, s AccountServiceServer) AccountServiceClient {
	srv := grpc.NewServer()
	RegisterAccountServiceServer(srv, s)

	l := grpcutil.NewBufListener(ctx, 2048)

	cc, err := l.NewClientConn()
	assert.NoError(t, err)

	cl := NewAccountServiceClient(cc)

	go srv.Serve(l.Listener)

	t.Cleanup(func() { l.Close() })

	return cl
}

func testConfig(storedir string) []string {
	return []string{
		"--log.filters=info+:bty*,-*.grpc warn+:*.grpc error+:*",
		"--log.format=console",
		"--node.display-name=",
		"--node.listeners=",
		"--p2p.swarm-listeners=/ip6/0.0.0.0/tcp/0",
		"--p2p.local-discovery=false",
		"--store.dir=" + storedir,
	}
}
