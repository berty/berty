package bertybridge

import (
	context "context"
	"testing"

	proto "github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/testutil"
	errcode "berty.tech/berty/v2/go/pkg/errcode"
)

const echoStringTest = "Im sorry Dave, Im afraid I cant do that"

func TestNewService(t *testing.T) {
	s := NewService(&Options{})

	err := s.Close()
	assert.NoError(t, err)
}

func TestUnaryService(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	cl := createBridgeTestingClient(t, ctx, logger)

	// call `testutil.TestService/EchoTest` with empty request,
	{
		input := &testutil.EchoTest_Request{
			Echo:         echoStringTest,
			TriggerError: false,
		}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		res, err := cl.ClientInvokeUnary(ctx, &ClientInvokeUnary_Request{
			MethodDesc: &MethodDesc{
				Name: "/testutil.TestService/EchoTest",
			},
			Payload: payload,
		})

		require.NoError(t, err)
		require.NotNil(t, res.Error)
		assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
		assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)
		assert.Nil(t, res.Error.ErrorDetails)
	}
}

func TestUnaryServiceError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	cl := createBridgeTestingClient(t, ctx, logger)

	// call `testutil.TestService/EchoTest` with empty request,
	{
		input := &testutil.EchoTest_Request{
			Echo:         echoStringTest,
			TriggerError: true,
		}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		res, err := cl.ClientInvokeUnary(ctx, &ClientInvokeUnary_Request{
			MethodDesc: &MethodDesc{
				Name: "/testutil.TestService/EchoTest",
			},
			Payload: payload,
		})

		require.NoError(t, err)
		require.NotNil(t, res.Error)
		assert.Equal(t, GRPCErrCode_UNAVAILABLE, res.Error.GrpcErrorCode)
		assert.Equal(t, errcode.ErrTestEcho, res.Error.ErrorCode)
		require.NotNil(t, res.Error.ErrorDetails)
		assert.Greater(t, len(res.Error.ErrorDetails.Codes), 0)
	}
}

func TestStreamService(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	cl := createBridgeTestingClient(t, ctx, logger)

	// call instance `MessengerService/EchoTest`
	var streamid string
	{
		input := &testutil.EchoTest_Request{
			Delay: 10,
			Echo:  echoStringTest,
		}

		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		res, err := cl.CreateClientStream(ctx, &ClientCreateStream_Request{
			MethodDesc: &MethodDesc{
				Name:           "/testutil.TestService/EchoStreamTest",
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
			assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
			assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)

			var output testutil.EchoTest_Reply
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

func TestStreamServiceError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	cl := createBridgeTestingClient(t, ctx, logger)

	// test echoTest error
	var streamid string
	{
		input := &testutil.EchoTest_Request{
			TriggerError: true,
			Delay:        0,
			Echo:         echoStringTest,
		}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		res, err := cl.CreateClientStream(ctx, &ClientCreateStream_Request{
			MethodDesc: &MethodDesc{
				Name:           "/testutil.TestService/EchoTest",
				IsServerStream: true,
			},
			Payload: payload,
		})

		require.NoError(t, err)
		require.NotEmpty(t, res.StreamId)
		require.NotNil(t, res.Error)

		assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
		assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)
		streamid = res.StreamId
	}

	{
		res, err := cl.ClientStreamCloseAndRecv(ctx, &ClientStreamCloseAndRecv_Request{
			StreamId: streamid,
		})

		require.NoError(t, err)
		require.NotNil(t, res.Error)

		assert.Equal(t, GRPCErrCode_UNAVAILABLE, res.Error.GrpcErrorCode)
		assert.Equal(t, errcode.ErrTestEcho, res.Error.ErrorCode)
	}
}

func TestDuplexStreamService(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	cl := createBridgeTestingClient(t, ctx, logger)

	// test echoTest error
	var streamid string
	{
		res, err := cl.CreateClientStream(ctx, &ClientCreateStream_Request{
			MethodDesc: &MethodDesc{
				Name:           "/testutil.TestService/EchoDuplexTest",
				IsServerStream: true,
				IsClientStream: true,
			},
		})

		require.NoError(t, err)
		require.NotEmpty(t, res.StreamId)
		require.NotNil(t, res.Error)

		assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
		assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)
		streamid = res.StreamId
	}

	// send echo test
	{
		input := &testutil.EchoDuplexTest_Request{
			Echo: echoStringTest,
		}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		for i := 0; i < 10; i++ {
			// test send
			{
				res, err := cl.ClientStreamSend(ctx, &ClientStreamSend_Request{
					StreamId: streamid,
					Payload:  payload,
				})

				require.NoError(t, err)
				require.NotNil(t, res.Error)
				assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
				assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)
			}

			// test recv
			{
				res, err := cl.ClientStreamRecv(ctx, &ClientStreamRecv_Request{
					StreamId: streamid,
				})

				require.NoError(t, err)
				require.NotNil(t, res.Error)
				assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
				assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)

				var output testutil.EchoDuplexTest_Reply
				err = proto.Unmarshal(res.Payload, &output)
				require.NoError(t, err)

				assert.Equal(t, echoStringTest, output.Echo)
			}
		}
	}
}

func TestDuplexStreamServiceError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	cl := createBridgeTestingClient(t, ctx, logger)

	// test echoTest error
	var streamid string
	{
		res, err := cl.CreateClientStream(ctx, &ClientCreateStream_Request{
			MethodDesc: &MethodDesc{
				Name:           "/testutil.TestService/EchoDuplexTest",
				IsServerStream: true,
				IsClientStream: true,
			},
		})

		require.NoError(t, err)
		require.NotEmpty(t, res.StreamId)
		require.NotNil(t, res.Error)

		assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
		assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)
		streamid = res.StreamId
	}

	// send echo test
	{
		input := &testutil.EchoDuplexTest_Request{
			Echo: echoStringTest,
		}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		for i := 0; i < 10; i++ {
			// test send
			{
				res, err := cl.ClientStreamSend(ctx, &ClientStreamSend_Request{
					StreamId: streamid,
					Payload:  payload,
				})

				require.NoError(t, err)
				require.NotNil(t, res.Error)
				assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
				assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)
			}

			// test recv
			{
				res, err := cl.ClientStreamRecv(ctx, &ClientStreamRecv_Request{
					StreamId: streamid,
				})

				require.NoError(t, err)
				require.NotNil(t, res.Error)
				assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
				assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)

				var output testutil.EchoDuplexTest_Reply
				err = proto.Unmarshal(res.Payload, &output)
				require.NoError(t, err)

				assert.Equal(t, echoStringTest, output.Echo)
			}
		}
	}

	{
		input := &testutil.EchoDuplexTest_Request{
			Echo:         echoStringTest,
			TriggerError: true,
		}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		// test send
		{
			res, err := cl.ClientStreamSend(ctx, &ClientStreamSend_Request{
				StreamId: streamid,
				Payload:  payload,
			})

			require.NoError(t, err)
			require.NotNil(t, res.Error)
			assert.Equal(t, GRPCErrCode_OK, res.Error.GrpcErrorCode)
			assert.Equal(t, errcode.Undefined, res.Error.ErrorCode)
		}

		// test recv
		{
			res, err := cl.ClientStreamRecv(ctx, &ClientStreamRecv_Request{
				StreamId: streamid,
			})

			require.NoError(t, err)
			require.NotNil(t, res.Error)
			assert.Equal(t, GRPCErrCode_UNAVAILABLE, res.Error.GrpcErrorCode)
			assert.Equal(t, errcode.ErrTestEcho, res.Error.ErrorCode)
		}

		// should not be able to send again
		{
			_, err := cl.ClientStreamSend(ctx, &ClientStreamSend_Request{
				StreamId: streamid,
				Payload:  payload,
			})

			assert.Error(t, err)
		}
	}
}

func createBridgeTestingClient(t *testing.T, ctx context.Context, logger *zap.Logger) BridgeServiceClient {
	t.Helper()

	srv := grpc.NewServer()

	svc := NewService(&Options{
		Logger: logger,
	})

	RegisterBridgeServiceServer(srv, svc)

	l := grpcutil.NewBufListener(ctx, 2048)

	cc, err := l.NewClientConn()
	require.NoError(t, err)

	go srv.Serve(l.Listener)

	t.Cleanup(func() { l.Close() })

	tcc, srv := testutil.TestingNewServiceClient(ctx, t, &testutil.Options{
		Logger: logger,
	})

	for serviceName := range srv.GetServiceInfo() {
		svc.RegisterService(serviceName, tcc)
	}

	return NewBridgeServiceClient(cc)
}
