package provider

import (
	"context"
	fmt "fmt"
	"sync"
	"time"

	ggio "github.com/gogo/protobuf/io"
	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	mh "github.com/multiformats/go-multihash"
	"go.uber.org/zap"
)

const (
	ID      = protocol.ID("/berty/provider/1.0.0")
	TopicID = "berty/provider"
)

type Handler func(string, pstore.PeerInfo)

type Provider struct {
	sub      *pubsub.Subscription
	subReady sync.Mutex

	host host.Host
	ps   *pubsub.PubSub

	handler Handler

	pubs  map[string][]chan []pstore.PeerInfo
	muPub sync.Mutex

	subs  map[string]struct{}
	muSub sync.Mutex

	providers   map[string][]pstore.PeerInfo
	peers       map[peer.ID]string
	muProviders sync.Mutex
}

func getID(k string) (string, error) {
	h, err := mh.Sum([]byte(k), mh.SHA2_256, -1)
	if err != nil {
		return "", err
	}

	return h.String(), nil
}

func New(ctx context.Context, host host.Host, handler Handler) (*Provider, error) {
	ps, err := pubsub.NewGossipSub(ctx, host)
	if err != nil {
		return nil, err
	}

	provider := &Provider{
		sub:     nil,
		host:    host,
		handler: handler,
		pubs:    make(map[string][]chan []pstore.PeerInfo),
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

func (p *Provider) getSub() (*pubsub.Subscription, error) {
	p.subReady.Lock()
	defer p.subReady.Unlock()

	if p.sub == nil {
		sub, err := p.ps.Subscribe(TopicID)
		if err != nil {
			return nil, err
		}

		// wait for heartbeats to build mesh
		<-time.After(time.Second * 2)
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

func (p *Provider) isReady() error {
	_, err := p.getSub()
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

func (p *Provider) consumePubs(id string, pis ...pstore.PeerInfo) {
	p.muPub.Lock()
	defer p.muPub.Unlock()

	if pubs, ok := p.pubs[id]; ok {
		for _, pub := range pubs {
			pub <- pis
		}

		delete(p.pubs, id)
	}
}

func (p *Provider) createPub(id string) <-chan []pstore.PeerInfo {
	p.muPub.Lock()
	defer p.muPub.Unlock()

	pub := make(chan []pstore.PeerInfo, 1)
	if pubs, ok := p.pubs[id]; ok {
		p.pubs[id] = append(pubs, pub)
	} else {
		p.pubs[id] = make([]chan []pstore.PeerInfo, 1)
		p.pubs[id][0] = pub
	}

	return pub
}

func (p *Provider) addPeers(id string, pis ...pstore.PeerInfo) {
	p.muProviders.Lock()
	defer p.muProviders.Unlock()

	for _, pi := range pis {
		if _, ok := p.peers[pi.ID]; ok {
			logger().Warn("peer id already registered")
			continue
		}

		if s, err := pi.MarshalJSON(); err == nil {
			logger().Debug("new peer discovered", zap.String("ID", id), zap.String("info", string(s)))
		}

		p.peers[pi.ID] = id
		p.handler(id, pi)
	}

	if _, ok := p.providers[id]; !ok {
		p.providers[id] = pis
		return
	}

	p.providers[id] = append(p.providers[id], pis...)
}

func (p *Provider) getPeers(id string) ([]pstore.PeerInfo, error) {
	p.muProviders.Lock()
	defer p.muProviders.Unlock()

	if peers, ok := p.providers[id]; ok {
		return peers, nil
	}

	return nil, fmt.Errorf("get peer Unknown key `%s`", id)
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
		logger().Warn("invalid provider info", zap.Error(err))
		return
	}

	pinfo, err := p.getPeerInfo(remoteProvider)
	if err != nil {
		logger().Warn("get peer info error", zap.Error(err))
		return
	}

	id := remoteProvider.GetId()

	p.addPeers(id, *pinfo)
	p.consumePubs(id, *pinfo)
}

func (p *Provider) handleSubscription(ctx context.Context) error {
	for {

		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		sub, err := p.getSub()
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

		id := remoteProvider.GetId()
		if !p.isSubscribeTo(id) {
			logger().Debug("not subscribed", zap.String("ID", remoteProvider.GetId()))
			continue
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

		// Absorb peer into the peerstore
		p.host.Peerstore().AddAddrs(pinfo.ID, pinfo.Addrs, pstore.RecentlyConnectedAddrTTL)
		cctx := context.Background()
		if err := p.host.Connect(cctx, pinfo); err != nil {
			logger().Warn("connect error", zap.Error(err))
			continue
		}

		self, err := p.newProviderInfo(id)
		if err != nil {
			logger().Error("new provider error", zap.Error(err))
			continue
		}

		s, err := p.host.NewStream(ctx, pinfo.ID, ID)
		if err != nil {
			logger().Error("new stream", zap.Error(err))
			continue
		}

		p.addPeers(id, pinfo)

		pbw := ggio.NewDelimitedWriter(s)
		if err := pbw.WriteMsg(self); err != nil {
			logger().Error("write stream", zap.Error(err))
		} else {
			p.handler(id, pinfo)
		}

		go inet.FullClose(s)
	}
}

func (p *Provider) GetPeersForProvider(id string) ([]pstore.PeerInfo, error) {
	return p.getPeers(id)
}

func (p *Provider) Announce(id string) error {
	pi, err := p.newProviderInfo(id)
	if err != nil {
		return err
	}

	b, err := pi.Marshal()
	if err != nil {
		return err
	}

	return p.ps.Publish(TopicID, b)
}

func (p *Provider) AnnounceAndWait(ctx context.Context, id string) ([]pstore.PeerInfo, error) {
	if ps, _ := p.GetPeersForProvider(id); len(ps) > 0 {
		return ps, nil
	}

	cpub := p.createPub(id)
	defer p.consumePubs(id)

	err := p.Announce(id)
	if err != nil {
		return nil, err
	}

	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case ps := <-cpub:
		return ps, nil
	}
}

func (p *Provider) Subscribe(ctx context.Context, id string) error {
	if err := p.isReady(); err != nil {
		return fmt.Errorf("subscribe failed %s", err)
	}

	return p.subscribe(id)
}
