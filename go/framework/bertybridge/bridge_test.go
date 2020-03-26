package bertybridge

import (
	"testing"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertydemo"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
)

func TestProtocolBridge(t *testing.T) {
	var (
		err          error
		protocol     *Protocol
		bridgeClient *Client
		grpcClient   *grpc.ClientConn
		req, res     []byte
		//results      [][]byte
	)

	ctx := context.Background()
	coreAPI := ipfsutil.TestingCoreAPI(ctx, t)

	logger := testutil.Logger(t)
	config := NewProtocolConfig()
	config.AddGRPCListener("/ip4/127.0.0.1/tcp/0/grpc")
	config.AddGRPCListener("/ip4/127.0.0.1/tcp/0/grpcweb")
	config.ipfsCoreAPI(coreAPI)

	protocol, err = newProtocolBridge(logger, config)
	require.NoError(t, err)

	defer func() {
		err = protocol.Close()
		assert.NoErrorf(t, err, "protocol.Close")

		coreAPI.Close()
	}()

	logger.Info(
		"listeners",
		zap.String("gRPC", protocol.GRPCListenerAddr()),
		zap.String("gRPC web", protocol.GRPCWebListenerAddr()),
	)

	// clients

	bridgeClient, err = protocol.NewGRPCClient()
	require.NoError(t, err)
	assert.NotNil(t, bridgeClient)

	grpcClient, err = grpc.Dial(protocol.GRPCListenerAddr(), grpc.WithBlock(), grpc.WithInsecure())
	require.NoError(t, err)

	// setup unary test
	msg := &bertytypes.InstanceGetConfiguration_Request{}

	req, err = proto.Marshal(msg)
	require.NoError(t, err)

	// bridgeClient test
	res, err = bridgeClient.UnaryRequest("/berty.protocol.ProtocolService/InstanceGetConfiguration", req)
	require.NoError(t, err)

	out := &bertytypes.InstanceGetConfiguration_Reply{}
	err = proto.Unmarshal(res, out)
	require.NoError(t, err)

	// webclient test
	cc := bertyprotocol.NewProtocolServiceClient(grpcClient)
	_, err = cc.InstanceGetConfiguration(ctx, msg)
	require.NoError(t, err)

	//results, err = makeGrpcRequest(
	//	protocol.GRPCWebListenerAddr(),
	//	"/berty.protocol.ProtocolService/ContactGet",
	//	[][]byte{req},
	//	false,
	//)
	//require.NoError(t, err)
	//
	//for _, res = range results {
	//	out := &bertyprotocol.InstanceGetConfiguration{}
	//	err = proto.Unmarshal(res, out)
	//	require.NoError(t, err)
	//}
}

func TestDemoBridge(t *testing.T) {
	var (
		err          error
		demo         *Demo
		bridgeClient *Client
		grpcClient   *grpc.ClientConn
		req, res     []byte
		//results      [][]byte
	)

	ctx := context.Background()
	// coreAPI := ipfsutil.TestingCoreAPI(ctx, t)

	logger := testutil.Logger(t)
	config := NewDemoConfig()
	config.AddGRPCListener("/ip4/127.0.0.1/tcp/0/grpc")
	config.AddGRPCListener("/ip4/127.0.0.1/tcp/0/grpcweb")

	demo, err = newDemoBridge(logger, config)
	require.NoError(t, err)

	defer func() {
		err = demo.Close()
		assert.NoErrorf(t, err, "demo.Close")
	}()

	logger.Info(
		"listeners",
		zap.String("gRPC", demo.GRPCListenerAddr()),
		zap.String("gRPC web", demo.GRPCWebListenerAddr()),
	)

	// clients

	bridgeClient, err = demo.NewGRPCClient()
	require.NoError(t, err)
	assert.NotNil(t, bridgeClient)

	grpcClient, err = grpc.Dial(demo.GRPCListenerAddr(), grpc.WithBlock(), grpc.WithInsecure())
	require.NoError(t, err)

	// setup unary test
	msg := &bertydemo.LogToken_Request{}

	req, err = proto.Marshal(msg)
	require.NoError(t, err)

	// bridgeClient test
	res, err = bridgeClient.UnaryRequest("/berty.protocol.DemoService/LogToken", req)
	require.NoError(t, err)

	out := &bertydemo.LogToken_Reply{}
	err = proto.Unmarshal(res, out)
	require.NoError(t, err)

	// webclient test
	cc := bertydemo.NewDemoServiceClient(grpcClient)
	_, err = cc.LogToken(ctx, msg)
	require.NoError(t, err)
}
