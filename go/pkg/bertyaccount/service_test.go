package bertyaccount

import (
	"context"
	"io/ioutil"
	"os"
	"testing"

	codec "github.com/gogo/protobuf/codec"
	proto "github.com/golang/protobuf/proto"
	"github.com/stretchr/testify/require"
	"github.com/tj/assert"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

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
		args := []string{
			"--log.filters=info+:bty*,-*.grpc warn+:*.grpc error+:*",
			"--log.format=console",
			"--node.display-name=",
			"--node.listeners=/ip4/127.0.0.1/tcp/0/grpcws",
			"--p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/0.0.0.0/tcp/0",
			"--p2p.local-discovery=false",
			"--p2p.webui-listener=:3000",
			"--store.dir=" + tmpdir,
		}

		res, err := cl.CreateAccount(ctx, &CreateAccount_Request{
			Args: args,
		})
		require.NoError(t, err)
		assert.NotEmpty(t, res.AccountMetadata)
	}

	// call instance `ProtocolService/InstanceGetConfiguration`
	{
		input := &protocoltypes.InstanceGetConfiguration_Request{}
		payload, err := proto.Marshal(input)
		require.NoError(t, err)

		res, err := cl.ClientInvokeUnary(ctx, &ClientInvokeUnary_Request{
			MethodDesc: &MethodDesc{
				Name: "/berty.protocol.v1.ProtocolService/InstanceGetConfiguration",
			},
			Payload: payload,
		})
		require.NoError(t, err)
		require.NotNil(t, res.Error)
		assert.Equal(t, res.Error.GrpcErrorCode, GRPCErrCode_OK)
		assert.Equal(t, res.Error.ErrorCode, errcode.Undefined)

		var output protocoltypes.InstanceGetConfiguration_Reply
		err = proto.Unmarshal(res.Payload, &output)
		require.NoError(t, err)
		assert.NotEmpty(t, output.AccountPK)
		assert.NotEmpty(t, output.PeerID)
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

func createAccountClient(ctx context.Context, t *testing.T, s AccountServiceServer) AccountServiceClient {
	gogo_codec := codec.New(2048)

	srv := grpc.NewServer(grpc.CustomCodec(gogo_codec))
	RegisterAccountServiceServer(srv, s)

	l := grpcutil.NewBufListener(ctx, 2048)

	cc, err := l.NewClientConn(grpc.WithCodec(gogo_codec))
	assert.NoError(t, err)

	cl := NewAccountServiceClient(cc)

	go srv.Serve(l.Listener)

	t.Cleanup(func() { l.Close() })

	return cl
}
