package bertybridge

import (
	"io/ioutil"
	"os"
	"testing"

	"github.com/gogo/protobuf/proto"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/goleak"
	"go.uber.org/zap"
	"golang.org/x/net/context"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
)

func TestProtocolBridge(t *testing.T) {
	var (
		err             error
		messengerBridge *MessengerBridge
		bridgeClient    *Client
		grpcClient      *grpc.ClientConn
		req, res        []byte
	)

	if os.Getenv("WITH_GOLEAK") == "1" {
		defer goleak.VerifyNone(t,
			goleak.IgnoreTopFunction("github.com/syndtr/goleveldb/leveldb.(*DB).mpoolDrain"),           // inherited from one of the imports (init)
			goleak.IgnoreTopFunction("github.com/ipfs/go-log/writer.(*MirrorWriter).logRoutine"),       // inherited from one of the imports (init)
			goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-connmgr.(*BasicConnMgr).background"), // inherited from github.com/ipfs/go-ipfs/core.NewNode
			goleak.IgnoreTopFunction("github.com/jbenet/goprocess/periodic.callOnTicker.func1"),        // inherited from github.com/ipfs/go-ipfs/core.NewNode
			goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-connmgr.(*decayer).process"),         // inherited from github.com/ipfs/go-ipfs/core.NewNode)
			goleak.IgnoreTopFunction("go.opencensus.io/stats/view.(*worker).start"),                    // inherited from github.com/ipfs/go-ipfs/core.NewNode)
			goleak.IgnoreTopFunction("github.com/desertbit/timer.timerRoutine"),                        // inherited from github.com/ipfs/go-ipfs/core.NewNode)
		)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mc, cleanup := ipfsutil.TestingCoreAPI(ctx, t)
	defer cleanup()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	config := NewMessengerConfig()
	config.AddGRPCListener("/ip4/127.0.0.1/tcp/0/grpc")
	config.AddGRPCListener("/ip4/127.0.0.1/tcp/0/grpcweb")
	config.ipfsCoreAPI(mc.API())

	messengerBridge, err = newProtocolBridge(ctx, logger, config)
	require.NoError(t, err)

	defer func() {
		err = messengerBridge.Close()
		assert.NoErrorf(t, err, "messengerBridge.Close")
	}()

	logger.Info(
		"listeners",
		zap.String("gRPC", messengerBridge.GRPCListenerAddr()),
		zap.String("gRPC web", messengerBridge.GRPCWebListenerAddr()),
	)

	// clients

	bridgeClient, cleanup, err = messengerBridge.NewGRPCClient()
	require.NoError(t, err)
	assert.NotNil(t, bridgeClient)

	defer cleanup()

	grpcClient, err = grpc.Dial(messengerBridge.GRPCListenerAddr(), grpc.WithBlock(), grpc.WithInsecure())

	require.NoError(t, err)

	defer func() { _ = grpcClient.Close() }()

	// setup unary test
	msg := &bertytypes.InstanceGetConfiguration_Request{}

	req, err = proto.Marshal(msg)
	require.NoError(t, err)

	// bridgeClient test
	res, err = bridgeClient.UnaryRequest(ctx, "/berty.protocol.v1.ProtocolService/InstanceGetConfiguration", req)
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
	//	"/berty.protocol.v1.ProtocolService/ContactGet",
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
	var err error

	const n_try = 4

	testutil.FilterStabilityAndSpeed(t, testutil.Unstable, testutil.Slow)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	rootdir, err := ioutil.TempDir("", "ipfs")
	require.NoError(t, err)

	defer os.RemoveAll(rootdir)

	// coreAPI, cleanup := ipfsutil.TestingCoreAPI(ctx, t)
	// defer cleanup()

	config := NewMessengerConfig()
	config.RootDirectory(rootdir)

	var node_id_1 p2p_peer.ID
	var device_pk_1 []byte
	{
		protocol, err := newProtocolBridge(ctx, logger, config)
		require.NoError(t, err)

		// get grpc client
		client, cleanup, err := newServiceClient(protocol)
		if !assert.NoError(t, err) {
			protocol.Close()
			assert.FailNow(t, "unable to create client")
		}

		defer cleanup()

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

		protocol, err := newProtocolBridge(ctx, logger, config)
		require.NoError(t, err)

		// get grpc client
		client, cleanup, err := newServiceClient(protocol)
		if !assert.NoError(t, err) {
			protocol.Close()
			assert.FailNow(t, "unable to create client")
		}

		defer cleanup()

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
