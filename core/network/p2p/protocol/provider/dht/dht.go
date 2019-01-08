package dht

import (
	"context"
	"sync"
	"time"

	"berty.tech/core/network/p2p/protocol/provider"
	cid "github.com/ipfs/go-cid"
	host "github.com/libp2p/go-libp2p-host"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	inet "github.com/libp2p/go-libp2p-net"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// Provider is a provider.Provider
var _ provider.Provider = (*Provider)(nil)

type Provider struct {
	host    host.Host
	handler provider.Handler

	dht *dht.IpfsDHT

	muReady *sync.Cond
	ready   bool
}

func New(host host.Host, dht *dht.IpfsDHT) *Provider {
	cond := sync.NewCond(&sync.Mutex{})
	ready := false
	if cs := host.Network().Conns(); len(cs) > 0 {
		ready = true
	}

	p := &Provider{
		host: host,

		dht:     dht,
		handler: provider.NoopHandler,

		muReady: cond,
		ready:   ready,
	}

	host.Network().Notify(p.providerNotify())

	return p
}

func (p *Provider) isReady(ctx context.Context) error {
	cready := make(chan *struct{})
	go func() {
		p.muReady.L.Lock()
		if !p.ready {
			p.muReady.Wait()
		}
		cready <- nil
		p.muReady.L.Unlock()
	}()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-cready:
		return nil
	}
}

func (p *Provider) RegisterHandler(handler provider.Handler) {
	p.handler = handler
}

func (p *Provider) FindProviders(ctx context.Context, id cid.Cid) error {
	go func() {
		logger().Debug("find provider", zap.String("id", id.String()))
		if err := p.isReady(ctx); err != nil {
			logger().Error("provider is not ready", zap.Error(err))
			return
		}

		for pi := range p.dht.FindProvidersAsync(ctx, id, dht.KValue) {
			logger().Debug("found provider!", zap.String("peerID", pi.ID.Pretty()), zap.String("id", id.String()))
			p.handler(id, &pi)
		}

	}()

	return nil
}

func (p *Provider) Provide(ctx context.Context, id cid.Cid) error {
	go func() {
		logger().Debug("providing", zap.String("id", id.String()))
		if err := p.isReady(ctx); err != nil {
			logger().Error("provider is not ready", zap.Error(err))
			return
		}

		if err := p.dht.Provide(ctx, id, true); err != nil {
			logger().Error("provide", zap.Error(err))
		}
	}()

	return nil
}

type providerNotify Provider

func (p *Provider) providerNotify() *providerNotify {
	return (*providerNotify)(p)
}

func (p *providerNotify) Listen(net inet.Network, a ma.Multiaddr)      {}
func (p *providerNotify) ListenClose(net inet.Network, a ma.Multiaddr) {}
func (p *providerNotify) OpenedStream(net inet.Network, s inet.Stream) {}
func (p *providerNotify) ClosedStream(net inet.Network, s inet.Stream) {}

func (p *providerNotify) Connected(s inet.Network, c inet.Conn) {
	go func() {
		p.muReady.L.Lock()
		if !p.ready {
			// Wait for datastore to be ready
			time.Sleep(2 * time.Second)
			p.ready = true

			logger().Debug("DHT is now ready")

			// Advertise Provider/FindProviders that dht should be ready
			p.muReady.Broadcast()
		}
		p.muReady.L.Unlock()
	}()
}

func (p *providerNotify) Disconnected(s inet.Network, c inet.Conn) {
	go func() {
		p.muReady.L.Lock()
		if len(s.Conns()) == 0 {
			p.ready = false
		}
		p.muReady.L.Unlock()
	}()
}
