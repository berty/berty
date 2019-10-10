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
}

// TestingCoreAPI returns a fully initialized mocked Core API
func TestingCoreAPI(ctx context.Context, t *testing.T) CoreAPIMock {
	t.Helper()

	mocknet := libp2p_mocknet.New(ctx)
	node, err := ipfs_core.NewNode(ctx, &ipfs_core.BuildCfg{
		Online: true,
		Host:   ipfs_mock.MockHostOption(mocknet),
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

	return &coreAPIMock{coreapi, mocknet, node}
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
