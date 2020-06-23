package tinder

import (
	"context"

	cid "github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/peer"
	p2p_routing "github.com/libp2p/go-libp2p-core/routing"
)

type NoopRouting struct {
}

// Implementation of routing.ContentRouting interface
func (nr *NoopRouting) Provide(context.Context, cid.Cid, bool) error {
	return nil
}

// Implementation of routing.ContentRouting interface
func (nr *NoopRouting) FindProvidersAsync(context.Context, cid.Cid, int) <-chan peer.AddrInfo {
	return make(chan peer.AddrInfo)
}

// Implementation of routing.PeerRouting interface
func (nr *NoopRouting) FindPeer(context.Context, peer.ID) (peer.AddrInfo, error) {
	return peer.AddrInfo{}, nil
}

// Implementation of routing.ValueStore interface
func (nr *NoopRouting) PutValue(context.Context, string, []byte, ...p2p_routing.Option) error {
	return nil
}

// Implementation of routing.ValueStore interface
func (nr *NoopRouting) GetValue(context.Context, string, ...p2p_routing.Option) ([]byte, error) {
	return make([]byte, 0), nil
}

// Implementation of routing.ValueStore interface
func (nr *NoopRouting) SearchValue(context.Context, string, ...p2p_routing.Option) (<-chan []byte, error) {
	return make(chan []byte), nil
}

// Implementation of routing.Routing interface
func (nr *NoopRouting) Bootstrap(context.Context) error {
	return nil
}
