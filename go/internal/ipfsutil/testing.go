package ipfsutil

import (
	"context"
	"testing"

	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_coreapi "github.com/ipfs/go-ipfs/core/coreapi"
	ipfs_mock "github.com/ipfs/go-ipfs/core/mock"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

// CoreAPIMock implements ipfs.CoreAPI and adds some debugging helpers
type CoreAPIMock interface {
	ipfs_interface.CoreAPI

	MockNetwork() libp2p_mocknet.Mocknet
	MockNode() *ipfs_core.IpfsNode
	Close()
}

// TestingCoreAPIUsingMockNet returns a fully initialized mocked Core API with the given mocknet
func TestingCoreAPIUsingMockNet(ctx context.Context, t *testing.T, m libp2p_mocknet.Mocknet) CoreAPIMock {
	t.Helper()

	node, err := ipfs_core.NewNode(ctx, &ipfs_core.BuildCfg{
		Online: true,
		Host:   ipfs_mock.MockHostOption(m),
		ExtraOpts: map[string]bool{
			"pubsub": true,
		},
	})
	if err != nil {
		t.Fatalf("failed to initialize IPFS node mock: %v", err)
	}

	coreapi, err := ipfs_coreapi.NewCoreAPI(node)
	if err != nil {
		t.Fatalf("failed to initialize IPFS Core API mock: %v", err)
	}

	return &coreAPIMock{coreapi, m, node}
}

// TestingCoreAPI returns a fully initialized mocked Core API.
// If you want to do some tests involving multiple peers you should use
// `TestingCoreAPIUsingMockNet` with the same mocknet instead.
func TestingCoreAPI(ctx context.Context, t *testing.T) CoreAPIMock {
	t.Helper()

	m := libp2p_mocknet.New(ctx)

	return TestingCoreAPIUsingMockNet(ctx, t, m)
}

type coreAPIMock struct {
	ipfs_interface.CoreAPI

	mocknet libp2p_mocknet.Mocknet
	node    *ipfs_core.IpfsNode
}

func (m *coreAPIMock) MockNetwork() libp2p_mocknet.Mocknet {
	return m.mocknet
}

func (m *coreAPIMock) MockNode() *ipfs_core.IpfsNode {
	return m.node
}

func (m *coreAPIMock) Close() {
	m.node.Close()
}
