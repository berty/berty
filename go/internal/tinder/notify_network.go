package tinder

import (
	"context"
	"sync"

	"berty.tech/berty/v2/go/internal/notify"
	"github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/host"
	bhost "github.com/libp2p/go-libp2p/p2p/host/basic"
	ma "github.com/multiformats/go-multiaddr"
)

type NetworkUpdate struct {
	notify       *notify.Notify
	locker       *sync.Mutex
	sub          event.Subscription
	currentAddrs []ma.Multiaddr
}

func NewNetworkUpdate(h host.Host) (*NetworkUpdate, error) {
	sub, err := h.EventBus().Subscribe(new(event.EvtLocalAddressesUpdated))
	if err != nil {
		return nil, err
	}

	locker := &sync.Mutex{}
	nu := &NetworkUpdate{
		sub:          sub,
		locker:       locker,
		notify:       notify.New(locker),
		currentAddrs: h.Network().ListenAddresses(),
	}

	go nu.subscribeToNetworkUpdate()

	return nu, nil
}

func (n *NetworkUpdate) WaitForUpdate(ctx context.Context, currentAddrs []ma.Multiaddr, factory bhost.AddrsFactory) bool {
	n.locker.Lock()
	defer n.locker.Unlock()

	for {
		// check for new/removed addrs
		if diff := diffAddrs(currentAddrs, n.currentAddrs); len(diff) > 0 {
			// filter addrs
			if factory == nil {
				return true
			}

			if filtered := factory(diff); len(filtered) > 0 {
				return true
			}
		}

		// wait until context is done or network is updated
		if ok := n.notify.Wait(ctx); !ok {
			return false
		}
	}
}

func (n *NetworkUpdate) GetLastUpdatedAddrs(ctx context.Context) (addrs []ma.Multiaddr) {
	n.locker.Lock()
	addrs = n.currentAddrs
	n.locker.Unlock()
	return
}

func (n *NetworkUpdate) Close() error {
	return n.sub.Close()
}

func (n *NetworkUpdate) subscribeToNetworkUpdate() {
	for evt := range n.sub.Out() {
		e := evt.(event.EvtLocalAddressesUpdated)
		if e.Diffs {
			n.locker.Lock()
			n.currentAddrs = getAddrsFromUpdatedAddress(e.Current)
			n.notify.Broadcast()
			n.locker.Unlock()
		}
	}
}

func diffAddrs(a, b []ma.Multiaddr) []ma.Multiaddr {
	mb := make(map[string]struct{}, len(b))
	for _, addr := range b {
		mb[addr.String()] = struct{}{}
	}

	var diff []ma.Multiaddr
	for _, addr := range a {
		if _, found := mb[addr.String()]; !found {
			diff = append(diff, addr)
		}
	}

	return diff
}

func getAddrsFromUpdatedAddress(updated []event.UpdatedAddress) []ma.Multiaddr {
	addrs := make([]ma.Multiaddr, len(updated))
	for i, uaddr := range updated {
		addrs[i] = uaddr.Address
	}
	return addrs
}
