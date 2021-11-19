package tinder

import (
	"context"
	"sync"

	"github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/host"
	bhost "github.com/libp2p/go-libp2p/p2p/host/basic"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/notify"
)

type NetworkUpdate struct {
	logger       *zap.Logger
	notify       *notify.Notify
	locker       *sync.Mutex
	sub          event.Subscription
	once         sync.Once
	currentAddrs []ma.Multiaddr
}

func NewNetworkUpdate(logger *zap.Logger, h host.Host) (*NetworkUpdate, error) {
	sub, err := h.EventBus().Subscribe(new(event.EvtLocalAddressesUpdated))
	if err != nil {
		return nil, err
	}

	locker := &sync.Mutex{}
	nu := &NetworkUpdate{
		logger:       logger,
		sub:          sub,
		locker:       locker,
		notify:       notify.New(locker),
		currentAddrs: h.Network().ListenAddresses(),
	}

	go nu.subscribeToNetworkUpdate()

	nu.logger.Debug("network update subscribe started")
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

func (n *NetworkUpdate) subscribeToNetworkUpdate() {
	for evt := range n.sub.Out() {
		e := evt.(event.EvtLocalAddressesUpdated)
		if e.Diffs {
			// log diffs
			var nadd, ndel int
			for _, uaddr := range e.Current {
				switch uaddr.Action {
				case event.Added:
					n.logger.Debug("new addr", logutil.PrivateString("addr", uaddr.Address.String()))
					nadd++
				case event.Removed:
					n.logger.Debug("removed addr", logutil.PrivateString("addr", uaddr.Address.String()))
					ndel++
				}
			}

			n.logger.Debug("network update", zap.Int("del", ndel), zap.Int("add", nadd), zap.Int("total", nadd+ndel))

			// update current addrs
			n.locker.Lock()
			n.currentAddrs = getAddrsFromUpdatedAddress(e.Current)
			n.notify.Broadcast()
			n.locker.Unlock()
		}
	}
}

func (n *NetworkUpdate) Close() (err error) {
	// use once to avoid panic if called twice
	n.once.Do(func() { err = n.sub.Close() })
	return err
}

func diffAddrs(a, b []ma.Multiaddr) []ma.Multiaddr {
	diff := []ma.Multiaddr{}

	seta := make(map[string]ma.Multiaddr, len(a))
	for _, addr := range a {
		seta[addr.String()] = addr
	}

	setb := make(map[string]struct{})
	for _, maddr := range b {
		key := maddr.String()
		if _, found := seta[key]; !found {
			delete(seta, key)
			diff = append(diff, maddr)
		} else {
			setb[key] = struct{}{}
		}
	}

	for key, maddr := range seta {
		if _, found := setb[key]; !found {
			diff = append(diff, maddr)
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
