package ipfsutil

import (
	"context"

	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_coreapi "github.com/ipfs/go-ipfs/core/coreapi"
	ipfs_mock "github.com/ipfs/go-ipfs/core/mock"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"

	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"

	"github.com/pkg/errors"
)

type MockedCoreAPI interface {
	ipfs_interface.CoreAPI

	MockNetwork() libp2p_mocknet.Mocknet
	MockNode() *ipfs_core.IpfsNode
}

func NewMockCoreAPI(ctx context.Context) (MockedCoreAPI, error) {
	mocknet := libp2p_mocknet.New(ctx)
	node, err := ipfs_core.NewNode(ctx, &ipfs_core.BuildCfg{
		Online: true,
		Host:   ipfs_mock.MockHostOption(mocknet),
		ExtraOpts: map[string]bool{
			"pubsub": true,
		},
	})

	if err != nil {
		return nil, errors.Wrap(err, "failed to mocked ipfs node")
	}

	coreapi, err := ipfs_coreapi.NewCoreAPI(node)
	if err != nil {
		return nil, errors.Wrap(err, "failed to init coreapi")
	}

	return &mockedCoreAPI{coreapi, mocknet, node}, nil
}

type mockedCoreAPI struct {
	ipfs_interface.CoreAPI

	mocknet libp2p_mocknet.Mocknet
	node    *ipfs_core.IpfsNode
}

func (m *mockedCoreAPI) MockNetwork() libp2p_mocknet.Mocknet {
	return m.mocknet
}

func (m *mockedCoreAPI) MockNode() *ipfs_core.IpfsNode {
	return m.node
}
