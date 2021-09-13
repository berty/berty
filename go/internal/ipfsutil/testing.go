package ipfsutil

import (
	"context"
	"fmt"
	"math/rand"
	"testing"
	"time"

	ipfs_mobile "github.com/ipfs-shipyard/gomobile-ipfs/go/pkg/ipfsmobile"
	ds "github.com/ipfs/go-datastore"
	dsync "github.com/ipfs/go-datastore/sync"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_mock "github.com/ipfs/go-ipfs/core/mock"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	host "github.com/libp2p/go-libp2p-core/host"
	p2pnetwork "github.com/libp2p/go-libp2p-core/network"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/protocol"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	rendezvous "github.com/libp2p/go-libp2p-rendezvous"
	p2p_rpdb "github.com/libp2p/go-libp2p-rendezvous/db/sqlite"
	p2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/tinder"
)

// CoreAPIMock implements ipfs.CoreAPI and adds some debugging helpers
type CoreAPIMock interface {
	API() ExtendedCoreAPI

	PubSub() *pubsub.PubSub
	Tinder() tinder.Service
	MockNetwork() p2p_mocknet.Mocknet
	MockNode() *ipfs_core.IpfsNode
	Close()
}

func TestingRepo(t testing.TB, datastore ds.Datastore) ipfs_repo.Repo {
	t.Helper()
	repo, err := MemRepo()
	require.NoError(t, err)
	return repo
}

type TestingAPIOpts struct {
	Logger    *zap.Logger
	Mocknet   p2p_mocknet.Mocknet
	RDVPeer   p2p_peer.AddrInfo
	Datastore ds.Batching
}

// TestingCoreAPIUsingMockNet returns a fully initialized mocked Core API with the given mocknet
func TestingCoreAPIUsingMockNet(ctx context.Context, t testing.TB, opts *TestingAPIOpts) (CoreAPIMock, func()) {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	datastore := opts.Datastore
	if datastore == nil {
		datastore = dsync.MutexWrap(ds.NewMapDatastore())
	}

	repo := TestingRepo(t, datastore)

	var ps *pubsub.PubSub
	var disc tinder.Service
	configureRouting := func(h host.Host, r routing.Routing) error {
		var err error
		drivers := []*tinder.Driver{}
		if opts.RDVPeer.ID != "" {
			// opts.Mocknet.ConnectPeers(node.Identity, opts.RDVPeer.ID)
			h.Peerstore().AddAddrs(opts.RDVPeer.ID, opts.RDVPeer.Addrs, peerstore.PermanentAddrTTL)
			// @FIXME(gfanton): use rand as argument
			rdvp := tinder.NewRendezvousDiscovery(opts.Logger, h, opts.RDVPeer.ID, rand.New(rand.NewSource(rand.Int63())))
			if _, err = opts.Mocknet.LinkPeers(h.ID(), opts.RDVPeer.ID); err != nil {
				return err
			}

			driver := tinder.NewDriverFromUnregisterDiscovery("rdpv", rdvp, nil)
			drivers = append(drivers, driver)
		}

		if r != nil {
			driver := tinder.NewDriverFromRouting("dht", r, nil)
			drivers = append(drivers, driver)
		}

		// minBackoff, maxBackoff := time.Second, time.Minute
		// rng := rand.New(rand.NewSource(rand.Int63()))
		tinderOpts := &tinder.Opts{
			Logger:                 opts.Logger,
			AdvertiseResetInterval: time.Minute,
			AdvertiseGracePeriod:   time.Minute,
			BackoffStrategy: &tinder.BackoffOpts{
				StratFactory: discovery.NewFixedBackoff(time.Second),
			},
			// BackoffStratFactory: discovery.NewExponentialBackoff(minBackoff, maxBackoff, discovery.FullJitter, time.Second, 5.0, 0, rng),
		}

		// enable discovery monitor
		disc, err = tinder.NewService(tinderOpts, h, drivers...)
		if err != nil {
			return fmt.Errorf("unable to monitor discovery driver: %w", err)
		}

		pubsubtracker, err := NewPubsubMonitor(opts.Logger, h)
		if err != nil {
			return err
		}

		ps, err = pubsub.NewGossipSub(ctx, h,
			pubsub.WithMessageSigning(true),
			pubsub.WithFloodPublish(true),
			pubsub.WithDiscovery(disc),
			pubsub.WithPeerExchange(true),
			pubsubtracker.EventTracerOption(),
		)

		return err
	}

	mrepo := ipfs_mobile.NewRepoMobile("", repo)
	mnode, err := NewIPFSMobile(ctx, mrepo, &MobileOptions{
		HostOption:        ipfs_mock.MockHostOption(opts.Mocknet),
		RoutingConfigFunc: configureRouting,
		ExtraOpts: map[string]bool{
			"pubsub": false,
		},
	})

	require.NoError(t, err, "failed to initialize IPFS node mock")
	require.NotNil(t, ps, "pubsub should not be nil")
	require.NotNil(t, disc, "discovery should not be nil")

	exapi, err := NewExtendedCoreAPIFromNode(mnode.IpfsNode)
	require.NoError(t, err, "unable to extend core api from node")

	psapi := NewPubSubAPI(ctx, opts.Logger, disc, ps)
	exapi = InjectPubSubCoreAPIExtendedAdapter(exapi, psapi)
	EnableConnLogger(ctx, opts.Logger, mnode.PeerHost())

	api := &coreAPIMock{
		coreapi: exapi,
		mocknet: opts.Mocknet,
		pubsub:  ps,
		node:    mnode.IpfsNode,
		tinder:  disc,
	}

	return api, func() {
		_ = mnode.Close()
		_ = mnode.PeerHost().Close()
		_ = repo.Close()
	}
}

// TestingCoreAPI returns a fully initialized mocked Core API.
// If you want to do some tests involving multiple peers you should use
// `TestingCoreAPIUsingMockNet` with the same mocknet instead.
func TestingCoreAPI(ctx context.Context, t testing.TB) (CoreAPIMock, func()) {
	t.Helper()

	m := p2p_mocknet.New(ctx)
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
	mocknet p2p_mocknet.Mocknet
	node    *ipfs_core.IpfsNode
	tinder  tinder.Service
}

func (m *coreAPIMock) ConnMgr() ConnMgr {
	return m.node.PeerHost.ConnManager()
}

func (m *coreAPIMock) NewStream(ctx context.Context, p p2p_peer.ID, pids ...protocol.ID) (p2pnetwork.Stream, error) {
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

func (m *coreAPIMock) MockNetwork() p2p_mocknet.Mocknet {
	return m.mocknet
}

func (m *coreAPIMock) MockNode() *ipfs_core.IpfsNode {
	return m.node
}

func (m *coreAPIMock) PubSub() *pubsub.PubSub {
	return m.pubsub
}

func (m *coreAPIMock) Tinder() tinder.Service {
	return m.tinder
}

func (m *coreAPIMock) Close() {
	m.node.Close()
	m.tinder.Close()
}
