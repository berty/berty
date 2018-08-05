package provider

import (
	"context"
	"fmt"
	"sync"

	ggio "github.com/gogo/protobuf/io"
	"github.com/libp2p/go-floodsub"
	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	mh "github.com/multiformats/go-multihash"

	"go.uber.org/zap"
)

const (
	ID = protocol.ID("/berty/provider/1.0.0")
)

var validateFunc = func(remoteid string) bool { return true }

type Provider struct {
	host host.Host
	ps   *floodsub.PubSub

	subs  map[string]*floodsub.Subscription
	muSub sync.Mutex

	providers   map[string][]pstore.PeerInfo
	peers       map[peer.ID]string
	muProviders sync.Mutex

	cproviders   map[string][]chan []pstore.PeerInfo
	muCProviders sync.Mutex
}

func New(ctx context.Context, host host.Host) (*Provider, error) {
	ps, err := floodsub.NewGossipSub(ctx, host)
	if err != nil {
		return nil, err
	}

	provider := &Provider{
		host:       host,
		subs:       make(map[string]*floodsub.Subscription),
		providers:  make(map[string][]pstore.PeerInfo),
		peers:      make(map[peer.ID]string),
		cproviders: make(map[string][]chan []pstore.PeerInfo),
		ps:         ps,
	}

	host.SetStreamHandler(ID, provider.handleStream)
	return provider, nil

}

func getID(k string) (string, error) {
	h, err := mh.Sum([]byte(k), mh.SHA2_256, -1)
	if err != nil {
		return "", err
	}

	return h.String(), nil
}

func (p *Provider) newProviderInfo(id string) (*ProviderInfo, error) {
	info := &pstore.PeerInfo{
		ID:    p.host.ID(),
		Addrs: p.host.Addrs(),
	}

	bi, err := info.MarshalJSON()
	if err != nil {
		return nil, err
	}

	return &ProviderInfo{
		Id:       id,
		PeerInfo: bi,
	}, nil
}

func (p *Provider) getPeerInfo(pi *ProviderInfo) (*pstore.PeerInfo, error) {
	pinfo := &pstore.PeerInfo{}
	data := pi.GetPeerInfo()
	return pinfo, pinfo.UnmarshalJSON(data)
}

func (p *Provider) getSub(k string) (*floodsub.Subscription, error) {
	p.muSub.Lock()
	defer p.muSub.Unlock()

	if sub, ok := p.subs[k]; ok {
		return sub, nil
	}

	return nil, fmt.Errorf("get sub Unknown key `%s`", k)
}

func (p *Provider) registerSub(k string, sub *floodsub.Subscription) error {
	p.muSub.Lock()
	defer p.muSub.Unlock()

	if sub, ok := p.subs[k]; !ok {
		p.subs[k] = sub
		return nil
	}

	return fmt.Errorf("Key already exist `%s`", k)
}

func (p *Provider) unregisterSub(k string) error {
	p.muSub.Lock()
	defer p.muSub.Unlock()

	if _, ok := p.subs[k]; ok {
		delete(p.subs, k)
		return nil
	}

	return fmt.Errorf("unregister sub unknown key `%s`", k)
}

func (p *Provider) addPeers(id string, pis ...pstore.PeerInfo) []pstore.PeerInfo {
	p.muProviders.Lock()
	defer p.muProviders.Unlock()

	for _, pi := range pis {
		if _, ok := p.peers[pi.ID]; ok {
			zap.L().Warn("peer id already registered")
			continue
		}

		p.peers[pi.ID] = id
	}

	if _, ok := p.providers[id]; !ok {
		p.providers[id] = pis
		return pis
	}

	p.providers[id] = append(p.providers[id], pis...)
	return p.providers[id]
}

func (p *Provider) removePeers(id string) error {
	p.muProviders.Lock()
	defer p.muProviders.Unlock()

	if pis, ok := p.providers[id]; !ok {
		for _, pi := range pis {
			if _, ok := p.peers[pi.ID]; ok {
				delete(p.peers, pi.ID)
			}
		}

		delete(p.providers, id)
		return nil
	}

	return fmt.Errorf("remove peers unknown key `%s`", id)
}

func (p *Provider) getPeers(id string) ([]pstore.PeerInfo, error) {
	p.muProviders.Lock()
	defer p.muProviders.Unlock()

	if peers, ok := p.providers[id]; ok {
		return peers, nil
	}

	return nil, fmt.Errorf("get peer Unknown key `%s`", id)
}

func (p *Provider) createProviderSignal(id string) <-chan []pstore.PeerInfo {
	p.muCProviders.Lock()
	defer p.muCProviders.Unlock()

	c := make(chan []pstore.PeerInfo)

	if _, ok := p.cproviders[id]; !ok {
		p.cproviders[id] = make([]chan []pstore.PeerInfo, 0)
	}

	p.cproviders[id] = append(p.cproviders[id], c)
	return c
}

func (p *Provider) removeProviderSignal(id string) error {
	p.muCProviders.Lock()
	defer p.muCProviders.Unlock()

	if _, ok := p.cproviders[id]; !ok {
		delete(p.cproviders, id)
		return nil
	}

	return fmt.Errorf("remove provider Unknown key `%s`", id)
}

func (p *Provider) getProvider(pid peer.ID) (string, error) {
	p.muProviders.Lock()
	defer p.muProviders.Unlock()

	if peer, ok := p.peers[pid]; ok {
		return peer, nil
	}

	return "", fmt.Errorf("get peer Unknown key `%s`", pid)
}

func (p *Provider) getProviderPeers(id string) ([]pstore.PeerInfo, error) {
	p.muProviders.Lock()
	defer p.muProviders.Unlock()

	if pis, ok := p.providers[id]; ok {
		return pis, nil
	}

	return nil, fmt.Errorf("get peer Unknown key `%s`", id)
}

func (p *Provider) getProviderSignal(id string) ([]chan []pstore.PeerInfo, error) {
	p.muCProviders.Lock()
	defer p.muCProviders.Unlock()

	if cc, ok := p.cproviders[id]; ok {
		return cc, nil
	}

	return nil, fmt.Errorf("get provider Unknown key `%s`", id)
}

func (p *Provider) handleStream(s inet.Stream) {
	defer inet.FullClose(s)

	pbr := ggio.NewDelimitedReader(s, inet.MessageSizeMax)

	remoteProvider := new(ProviderInfo)
	if err := pbr.ReadMsg(remoteProvider); err != nil {
		zap.L().Warn("Invalid provider info", zap.Error(err))
		return
	}

	cc, err := p.getProviderSignal(remoteProvider.GetId())
	if err != nil {
		zap.L().Warn("Unknow provider id", zap.Error(err))
		return
	}

	pinfo, err := p.getPeerInfo(remoteProvider)
	if err != nil {
		zap.L().Warn("Get peer info error", zap.Error(err))
		return
	}

	id := remoteProvider.GetId()
	peers := p.addPeers(id, *pinfo)
	for _, c := range cc {
		c <- peers
	}

	p.removeProviderSignal(id)
}

type ValidateProvider func(remoteid string) bool

func (p *Provider) handleSubscription(id string, s *floodsub.Subscription, fp ValidateProvider) error {
	if err := p.registerSub(id, s); err != nil {
		s.Cancel()
		return err
	}

	ctx := context.Background()
	for {
		m, err := s.Next(ctx)
		if err != nil {
			zap.L().Warn("Sub error", zap.Error(err))
			return err
		}

		remoteProvider := ProviderInfo{}
		err = remoteProvider.Unmarshal(m.Data)
		if err != nil {
			zap.L().Warn("Sub error", zap.Error(err))
			continue
		}

		if ok := fp(remoteProvider.GetId()); !ok {
			zap.L().Warn("Peer validation failed")
		}

		pinfo := pstore.PeerInfo{}
		data := remoteProvider.GetPeerInfo()
		if err := pinfo.UnmarshalJSON(data); err != nil {
			zap.L().Warn("Sub error", zap.Error(err))
			continue
		}

		// Absorb peer into the peerstore
		p.host.Peerstore().AddAddrs(pinfo.ID, pinfo.Addrs, pstore.RecentlyConnectedAddrTTL)
		cctx := context.Background()
		if err := p.host.Connect(cctx, pinfo); err != nil {
			zap.L().Warn("Connect error", zap.Error(err))
			continue
		}

		p.addPeers(id, pinfo)

		self, err := p.newProviderInfo(id)
		if err != nil {
			zap.L().Error("New provider error", zap.Error(err))
			continue
		}

		s, err := p.host.NewStream(ctx, pinfo.ID, ID)
		if err != nil {
			zap.L().Error("New stream ", zap.Error(err))
			continue
		}

		pbw := ggio.NewDelimitedWriter(s)
		if err := pbw.WriteMsg(self); err != nil {
			zap.L().Error("Write stream", zap.Error(err))
		}

		go inet.FullClose(s)
	}
}

func (p *Provider) GetPeersForKey(k string) ([]pstore.PeerInfo, error) {
	id, err := getID(k)
	if err != nil {
		return nil, err
	}

	return p.getPeers(id)
}

func (p *Provider) Wait(ctx context.Context, k string) ([]pstore.PeerInfo, error) {
	id, err := getID(k)
	if err != nil {
		return []pstore.PeerInfo{}, err
	}

	c := p.createProviderSignal(id)

	select {
	case <-ctx.Done():
		p.removeProviderSignal(id)
		return []pstore.PeerInfo{}, ctx.Err()
	case pis := <-c:
		return pis, nil
	}
}

func (p *Provider) AnnounceAndWait(ctx context.Context, k string) ([]pstore.PeerInfo, error) {
	id, err := getID(k)
	if err != nil {
		return nil, err
	}

	pi, err := p.newProviderInfo(id)
	if err != nil {
		return nil, err
	}

	b, err := pi.Marshal()
	if err != nil {
		return nil, err
	}

	c := p.createProviderSignal(id)
	if err := p.ps.Publish(id, b); err != nil {
		return nil, fmt.Errorf("publish error %s", err)
	}

	select {
	case <-ctx.Done():
		p.removeProviderSignal(id)
		return []pstore.PeerInfo{}, ctx.Err()
	case pis := <-c:
		return pis, nil
	}

}

func (p *Provider) Announce(k string) error {
	id, err := getID(k)
	if err != nil {
		return err
	}

	pi, err := p.newProviderInfo(id)
	if err != nil {
		return err
	}

	b, err := pi.Marshal()
	if err != nil {
		return err
	}

	return p.ps.Publish(id, b)
}

func (p *Provider) SubscribeWithValidate(k string, fp ValidateProvider) error {
	id, err := getID(k)
	if err != nil {
		return err
	}

	if _, err := p.getSub(id); err == nil {
		return fmt.Errorf("Already subscribed to `%s`", id)
	}

	s, err := p.ps.Subscribe(id)
	if err != nil {
		return err
	}

	go func() {
		if err := p.handleSubscription(id, s, fp); err != nil {
			zap.L().Error("Subscription error", zap.String("Provider id", id), zap.Error(err))
		}
	}()

	return nil
}

func (p *Provider) Subscribe(k string) error {
	return p.SubscribeWithValidate(k, validateFunc)
}
