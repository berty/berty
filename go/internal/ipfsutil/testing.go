package ipfsutil

import (
	"context"
	crand "crypto/rand"
	"encoding/base64"
	"math/rand"
	"testing"
	"time"

	tinder "berty.tech/berty/v2/go/internal/tinder"
	ds "github.com/ipfs/go-datastore"
	dsync "github.com/ipfs/go-datastore/sync"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_mock "github.com/ipfs/go-ipfs/core/mock"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"

	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto"
	host "github.com/libp2p/go-libp2p-core/host"
	p2pnetwork "github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/protocol"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	rendezvous "github.com/libp2p/go-libp2p-rendezvous"
	p2p_rpdb "github.com/libp2p/go-libp2p-rendezvous/db/sqlite"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

// CoreAPIMock implements ipfs.CoreAPI and adds some debugging helpers
type CoreAPIMock interface {
	API() ExtendedCoreAPI

	PubSub() *pubsub.PubSub
	Tinder() tinder.Driver
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

type TestingAPIOpts struct {
	Logger  *zap.Logger
	Mocknet libp2p_mocknet.Mocknet
	RDVPeer peer.AddrInfo
}

// TestingCoreAPIUsingMockNet returns a fully initialized mocked Core API with the given mocknet
func TestingCoreAPIUsingMockNet(ctx context.Context, t testing.TB, opts *TestingAPIOpts) (CoreAPIMock, func()) {
	t.Helper()

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	var ps *pubsub.PubSub
	var disc tinder.Driver

	repo := TestingRepo(t)
	exapi, node, err := NewCoreAPIFromRepo(ctx, repo, &CoreAPIConfig{
		DisableCorePubSub: true,
		Host:              ipfs_mock.MockHostOption(opts.Mocknet),
		HostConfig: func(h host.Host, r routing.Routing) error {
			var err error

			if opts.RDVPeer.ID != "" {
				// opts.Mocknet.ConnectPeers(node.Identity, opts.RDVPeer.ID)
				h.Peerstore().AddAddrs(opts.RDVPeer.ID, opts.RDVPeer.Addrs, peerstore.PermanentAddrTTL)
				// @FIXME(gfanton): use rand as argument
				disc = tinder.NewRendezvousDiscovery(opts.Logger, h, opts.RDVPeer.ID, rand.New(rand.NewSource(rand.Int63())))
			} else {
				disc = tinder.NewDriverRouting(opts.Logger, "dht", r)
			}

			minBackoff, maxBackoff := time.Second, time.Minute
			rng := rand.New(rand.NewSource(rand.Int63()))
			disc, err = tinder.NewService(
				opts.Logger,
				disc,
				discovery.NewExponentialBackoff(minBackoff, maxBackoff, discovery.FullJitter, time.Second, 5.0, 0, rng),
			)
			if err != nil {
				return err
			}

			ps, err = pubsub.NewGossipSub(ctx, h,
				pubsub.WithMessageSigning(true),
				pubsub.WithFloodPublish(true),
				pubsub.WithDiscovery(disc),
				pubsub.WithPeerExchange(true),
			)

			return err
		},
	})

	require.NoError(t, err, "failed to initialize IPFS node mock")
	require.NotNil(t, ps)
	require.NotNil(t, disc)

	_, err = opts.Mocknet.LinkPeers(node.Identity, opts.RDVPeer.ID)

	psapi := NewPubSubAPI(ctx, opts.Logger, disc, ps)
	exapi = InjectPubSubCoreAPIExtendedAdaptater(exapi, psapi)
	EnableConnLogger(ctx, opts.Logger, node.PeerHost)

	api := &coreAPIMock{
		coreapi: exapi,
		mocknet: opts.Mocknet,
		pubsub:  ps,
		node:    node,
		tinder:  disc,
	}

	return api, func() {
		_ = node.Close()
		_ = node.PeerHost.Close()
		_ = repo.Close()
	}
}

// TestingCoreAPI returns a fully initialized mocked Core API.
// If you want to do some tests involving multiple peers you should use
// `TestingCoreAPIUsingMockNet` with the same mocknet instead.
func TestingCoreAPI(ctx context.Context, t testing.TB) (CoreAPIMock, func()) {
	t.Helper()

	m := libp2p_mocknet.New(ctx)
	rdvPeer, err := m.GenPeer()
	require.NoError(t, err)

	_, cleanrdvp := TestingRDVP(ctx, t, rdvPeer)
	api, cleanapi := TestingCoreAPIUsingMockNet(ctx, t, &TestingAPIOpts{
		Mocknet: m,
		RDVPeer: rdvPeer.Network().Peerstore().PeerInfo(rdvPeer.ID()),
	})

	cleanup := func() {
		cleanapi()
		cleanrdvp()
		_ = rdvPeer.Close()
	}
	return api, cleanup
}

func TestingRDVP(ctx context.Context, t testing.TB, h host.Host) (*rendezvous.RendezvousService, func()) {
	db, err := p2p_rpdb.OpenDB(ctx, ":memory:")
	require.NoError(t, err)

	svc := rendezvous.NewRendezvousService(h, db)
	cleanup := func() {
		_ = db.Close() // dont use me for now as db is open in_memory
	}
	return svc, cleanup
}

type coreAPIMock struct {
	coreapi ExtendedCoreAPI

	pubsub  *pubsub.PubSub
	mocknet libp2p_mocknet.Mocknet
	node    *ipfs_core.IpfsNode
	tinder  tinder.Driver
}

func (m *coreAPIMock) ConnMgr() ConnMgr {
	return m.node.PeerHost.ConnManager()
}

func (m *coreAPIMock) NewStream(ctx context.Context, p libp2p_peer.ID, pids ...protocol.ID) (p2pnetwork.Stream, error) {
	return m.node.PeerHost.NewStream(ctx, p, pids...)
}

func (m *coreAPIMock) SetStreamHandler(pid protocol.ID, handler p2pnetwork.StreamHandler) {
	m.node.PeerHost.SetStreamHandler(pid, handler)
}

func (m *coreAPIMock) RemoveStreamHandler(pid protocol.ID) {
	m.node.PeerHost.RemoveStreamHandler(pid)
}

func (m *coreAPIMock) API() ExtendedCoreAPI {
	return m.coreapi
}

func (m *coreAPIMock) MockNetwork() libp2p_mocknet.Mocknet {
	return m.mocknet
}

func (m *coreAPIMock) MockNode() *ipfs_core.IpfsNode {
	return m.node
}

func (m *coreAPIMock) PubSub() *pubsub.PubSub {
	return m.pubsub
}

func (m *coreAPIMock) Tinder() tinder.Driver {
	return m.tinder
}

func (m *coreAPIMock) Close() {
	m.node.Close()
}
