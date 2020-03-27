package ipfsutil

import (
	"context"
	crand "crypto/rand"
	"encoding/base64"
	"testing"

	ds "github.com/ipfs/go-datastore"
	dsync "github.com/ipfs/go-datastore/sync"

	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_coreapi "github.com/ipfs/go-ipfs/core/coreapi"
	ipfs_mock "github.com/ipfs/go-ipfs/core/mock"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"

	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

// CoreAPIMock implements ipfs.CoreAPI and adds some debugging helpers
type CoreAPIMock interface {
	ipfs_interface.CoreAPI

	MockNetwork() libp2p_mocknet.Mocknet
	MockNode() *ipfs_core.IpfsNode
	Close()
}

func TestingRepo(t testing.TB) ipfs_repo.Repo {
	t.Helper()

	c := ipfs_cfg.Config{}
	priv, pub, err := libp2p_ci.GenerateKeyPairWithReader(libp2p_ci.RSA, 2048, crand.Reader)
	if err != nil {
		t.Fatalf("failed to generate pair key: %v", err)
	}

	pid, err := libp2p_peer.IDFromPublicKey(pub)
	if err != nil {
		t.Fatalf("failed to get pid from pub key: %v", err)
	}

	privkeyb, err := priv.Bytes()
	if err != nil {
		t.Fatalf("failed to get raw priv key: %v", err)
	}

	c.Bootstrap = []string{}
	c.Addresses.Swarm = []string{"/ip6/::/tcp/0"}
	c.Identity.PeerID = pid.Pretty()
	c.Identity.PrivKey = base64.StdEncoding.EncodeToString(privkeyb)

	dstore := dsync.MutexWrap(ds.NewMapDatastore())
	return &ipfs_repo.Mock{
		D: dstore,
		C: c,
	}
}

// TestingCoreAPIUsingMockNet returns a fully initialized mocked Core API with the given mocknet
func TestingCoreAPIUsingMockNet(ctx context.Context, t testing.TB, m libp2p_mocknet.Mocknet) CoreAPIMock {
	t.Helper()

	r := TestingRepo(t)
	node, err := ipfs_core.NewNode(ctx, &ipfs_core.BuildCfg{
		Repo:   r,
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
func TestingCoreAPI(ctx context.Context, t testing.TB) CoreAPIMock {
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
