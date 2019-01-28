package pubsub

import (
	"context"
	fmt "fmt"
	"sync"
	"time"

	"berty.tech/core/network/p2p/protocol/provider"
	ggio "github.com/gogo/protobuf/io"
	cid "github.com/ipfs/go-cid"
	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	p2pps "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"
)

const (
	ID      = protocol.ID("/berty/provider/1.0.0")
	TopicID = "berty/provider"
)

// Provider is a provider.Provider
var _ provider.Provider = (*Provider)(nil)

type Provider struct {
	sub      *p2pps.Subscription
	subReady sync.Mutex

	host host.Host
	ps   *p2pps.PubSub

	handler provider.Handler

	subs  map[string]struct{}
	muSub sync.Mutex

	providers   map[string][]pstore.PeerInfo
	peers       map[peer.ID]string
	muProviders sync.Mutex
}

func New(ctx context.Context, host host.Host) (*Provider, error) {
	ps, err := p2pps.NewGossipSub(ctx, host)
	if err != nil {
		return nil, err
	}

	provider := &Provider{
		sub:     nil,
		handler: provider.NoopHandler,
		host:    host,
		subs:    make(map[string]struct{}),

		providers: make(map[string][]pstore.PeerInfo),
		peers:     make(map[peer.ID]string),
		ps:        ps,
	}

	host.SetStreamHandler(ID, provider.handleStream)

	go func() {
		if err := provider.handleSubscription(ctx); err != nil {
			logger().Warn("subscription error", zap.Error(err))
		}
	}()

	return provider, nil
}

func (p *Provider) RegisterHandler(h provider.Handler) {
	p.handler = h
}

func (p *Provider) getSub(ctx context.Context) (*p2pps.Subscription, error) {
	p.subReady.Lock()
	defer p.subReady.Unlock()

	if p.sub == nil {
		sub, err := p.ps.Subscribe(TopicID)
		if err != nil {
			return nil, err
		}

		// wait for heartbeats to build mesh
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(time.Second * 2):

		}
		p.sub = sub
	}

	return p.sub, nil
}

func (p *Provider) cancelSub() {
	p.subReady.Lock()
	defer p.subReady.Unlock()

	if p.sub != nil {
		p.sub.Cancel()
		p.sub = nil
	}
}

func (p *Provider) isReady(ctx context.Context) error {
	_, err := p.getSub(ctx)
	return err
}

func (p *Provider) newProviderInfo(id string) (*ProviderInfo, error) {
	info := &pstore.PeerInfo{
		ID:    p.host.ID(),
		Addrs: p.host.Addrs(),
	}

	bin, err := info.MarshalJSON()
	if err != nil {
		return nil, err
	}

	return &ProviderInfo{
		Id:       id,
		PeerInfo: bin,
	}, nil
}

func (p *Provider) getPeerInfo(peer *ProviderInfo) (*pstore.PeerInfo, error) {
	pinfo := &pstore.PeerInfo{}
	data := peer.GetPeerInfo()
	return pinfo, pinfo.UnmarshalJSON(data)
}

func (p *Provider) unSubscribe(id string) error {
	p.muSub.Lock()
	defer p.muSub.Unlock()

	if _, ok := p.subs[id]; ok {
		delete(p.subs, id)
		return nil
	}

	return fmt.Errorf("not subscribed to this id")
}

func (p *Provider) subscribe(id string) error {
	p.muSub.Lock()
	defer p.muSub.Unlock()

	if _, ok := p.subs[id]; !ok {
		p.subs[id] = struct{}{}
		return nil
	}

	return fmt.Errorf("already subscribed to this id")
}

func (p *Provider) isSubscribeTo(id string) (ok bool) {
	p.muSub.Lock()
	_, ok = p.subs[id]
	p.muSub.Unlock()
	return
}

func (p *Provider) getProvider(pid peer.ID) (string, error) {
	p.muProviders.Lock()
	defer p.muProviders.Unlock()

	if peer, ok := p.peers[pid]; ok {
		return peer, nil
	}

	return "", fmt.Errorf("get peer Unknown key `%s`", pid)
}

// @TODO: for the moment handleStream accept any id,
// improve to match published message
func (p *Provider) handleStream(s inet.Stream) {
	defer inet.FullClose(s)

	pbr := ggio.NewDelimitedReader(s, inet.MessageSizeMax)

	remoteProvider := &ProviderInfo{}
	if err := pbr.ReadMsg(remoteProvider); err != nil {
		logger().Error("invalid provider info", zap.Error(err))
		return
	}

	pinfo, err := p.getPeerInfo(remoteProvider)
	if err != nil {
		logger().Error("malformed provider info", zap.Error(err))
		return
	}

	id, err := cid.Decode(remoteProvider.GetId())
	if err != nil {
		logger().Error("invalid provider id", zap.String("id", id.String()), zap.Error(err))
	}

	peerID := s.Conn().RemotePeer()
	logger().Debug("receiving new connection",
		zap.String("subID", id.String()),
		zap.String("peerID", peerID.Pretty()))

	p.handler(id, *pinfo)
}

func (p *Provider) handleSubscription(ctx context.Context) error {
	for {
		sub, err := p.getSub(ctx)
		if err != nil {
			logger().Warn("sub error", zap.Error(err))
			continue
		}

		m, err := sub.Next(ctx)
		if err != nil {
			p.cancelSub()
			continue
		}

		remoteProvider := ProviderInfo{}
		err = remoteProvider.Unmarshal(m.Data)
		if err != nil {
			logger().Warn("sub error", zap.Error(err))
			continue
		}

		id, err := cid.Decode(remoteProvider.GetId())
		if err != nil {
			logger().Warn("decode id error", zap.String("id", id.String()), zap.Error(err))
		}

		pinfo := pstore.PeerInfo{}
		data := remoteProvider.GetPeerInfo()
		if err := pinfo.UnmarshalJSON(data); err != nil {
			logger().Warn("sub error", zap.Error(err))
			continue
		}

		if pinfo.ID == p.host.ID() {
			continue
		}

		if !p.isSubscribeTo(remoteProvider.GetId()) {
			logger().Debug("not subscribed", zap.String("ID", remoteProvider.GetId()))
			continue
		}

		logger().Debug("subscription got a new message",
			zap.String("subID", id.String()),
			zap.String("peerID", pinfo.ID.Pretty()))

		// Absorb peer into the peerstore
		p.host.Peerstore().AddAddrs(pinfo.ID, pinfo.Addrs, pstore.RecentlyConnectedAddrTTL)
		cctx := context.Background()
		if err := p.host.Connect(cctx, pinfo); err != nil {
			logger().Warn("connect error", zap.Error(err))
			continue
		}

		logger().Debug("succefully connected",
			zap.String("subID", id.String()),
			zap.String("peerID", pinfo.ID.Pretty()))

		self, err := p.newProviderInfo(id.String())
		if err != nil {
			logger().Error("new provider error", zap.Error(err))
			continue
		}

		s, err := p.host.NewStream(ctx, pinfo.ID, ID)
		if err != nil {
			logger().Error("new stream", zap.Error(err))
			continue
		}

		pbw := ggio.NewDelimitedWriter(s)
		if err := pbw.WriteMsg(self); err != nil {
			logger().Error("write stream", zap.Error(err))
		} else {
			p.handler(id, pinfo)
		}

		go inet.FullClose(s)
	}
}

func (p *Provider) Announce(ctx context.Context, id string) error {
	pi, err := p.newProviderInfo(id)
	if err != nil {
		return err
	}

	b, err := pi.Marshal()
	if err != nil {
		return err
	}

	if err := p.isReady(ctx); err != nil {
		return fmt.Errorf("announce failed %s", err)
	}

	logger().Debug("announcing", zap.String("subID", id))
	return p.ps.Publish(TopicID, b)
}

func (p *Provider) Subscribe(ctx context.Context, id string) error {
	if err := p.isReady(ctx); err != nil {
		return fmt.Errorf("subscribe failed %s", err)
	}

	logger().Debug("subscribing", zap.String("subID", id))
	return p.subscribe(id)
}

func (p *Provider) Provide(ctx context.Context, id cid.Cid) error {
	// Do not return an error here, it's ok to provide the same id multiple
	// time. But keep logging to track if this method become over called
	if err := p.Subscribe(ctx, id.String()); err != nil {
		logger().Warn("subscribing", zap.String("subID", id.String()), zap.Error(err))
	}

	return nil
}

func (p *Provider) FindProviders(ctx context.Context, id cid.Cid) error {
	return p.Announce(ctx, id.String())
}
