package bertybridge

import (
	"io/ioutil"
	"os"
	"testing"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gogo/protobuf/proto"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
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
	coreAPI, cleanup := ipfsutil.TestingCoreAPI(ctx, t)
	defer cleanup()

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

func TestPersistenceProtocol(t *testing.T) {
	var err error //results      [][]byte

	const n_try = 4

	testutil.SkipSlow(t)

	ctx := context.Background()

	logger := testutil.Logger(t)
	rootdir, err := ioutil.TempDir("", "ipfs")
	require.NoError(t, err)

	defer os.RemoveAll(rootdir)

	// coreAPI, cleanup := ipfsutil.TestingCoreAPI(ctx, t)
	// defer cleanup()

	config := NewProtocolConfig()
	config.RootDirectory(rootdir)

	var node_id_1 p2p_peer.ID
	var device_pk_1 []byte
	{
		protocol, err := newProtocolBridge(logger, config)
		require.NoError(t, err)

		// get grpc client
		client, err := newServiceClient(protocol)
		if !assert.NoError(t, err) {
			protocol.Close()
			assert.FailNow(t, "unable to create client")
		}

		// get node id
		node_id_1 = protocol.node.Identity
		assert.NotEmpty(t, node_id_1)

		res, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
		assert.NoError(t, err)

		device_pk_1 = res.DevicePK
		assert.NotEmpty(t, device_pk_1)

		err = protocol.Close()
		require.NoError(t, err)
	}

	var node_id_2 p2p_peer.ID
	var device_pk_2 []byte
	{

		protocol, err := newProtocolBridge(logger, config)
		require.NoError(t, err)

		// get grpc client
		client, err := newServiceClient(protocol)
		if !assert.NoError(t, err) {
			protocol.Close()
			assert.FailNow(t, "unable to create client")
		}

		// get node id
		node_id_2 = protocol.node.Identity
		assert.NotEmpty(t, node_id_2)

		res, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
		assert.NoError(t, err)

		device_pk_2 = res.DevicePK
		assert.NotEmpty(t, device_pk_2)

		err = protocol.Close()
		require.NoError(t, err)
	}

	assert.Equal(t, node_id_1, node_id_2, "IPFS node should have the same ID after reboot")
	assert.Equal(t, device_pk_1, device_pk_2, "Device should have the same PK after reboot")
}
