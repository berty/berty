package rdvp

import (
	"context"
	"fmt"
	mrand "math/rand"
	"reflect"

	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"go.uber.org/zap"
	"moul.io/srand"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/omnisearch"
	"berty.tech/berty/v2/go/internal/tinder"
)

type rdvpProvider struct {
	rdvp tinder.AsyncableDriver
}

func NewConstructorFromStr(addrs ...string) func(context.Context, *zap.Logger, host.Host) (omnisearch.Provider, error) {
	return func(ctx context.Context, log *zap.Logger, h host.Host) (omnisearch.Provider, error) {
		var pis []peer.AddrInfo
		{
			maddrs, err := ipfsutil.ParseAndResolveRdvpMaddrs(ctx, log, addrs)
			if err != nil {
				return nil, err
			}
			i := len(maddrs)
			pis = make([]peer.AddrInfo, i)
			for i > 0 {
				i--
				pis[i] = *maddrs[i]
			}
		}
		return NewConstructorFromPeerInfo(pis...)(log, h)
	}
}

func NewConstructorFromPeerInfo(pis ...peer.AddrInfo) func(*zap.Logger, host.Host) (omnisearch.Provider, error) {
	return func(log *zap.Logger, h host.Host) (omnisearch.Provider, error) {
		var rdvClients []tinder.AsyncableDriver
		if lenrdvpeers := len(pis); lenrdvpeers > 0 {
			drivers := make([]tinder.AsyncableDriver, lenrdvpeers)
			for lenrdvpeers > 0 {
				lenrdvpeers--
				peer := pis[lenrdvpeers]
				h.Peerstore().AddAddrs(peer.ID, peer.Addrs, peerstore.PermanentAddrTTL)
				rng := mrand.New(mrand.NewSource(srand.MustSecure())) // nolint:gosec
				drivers[lenrdvpeers] = tinder.NewRendezvousDiscovery(log, h, peer.ID, rng)
			}
			rdvClients = append(rdvClients, drivers...)
		}
		var rdvClient tinder.AsyncableDriver
		switch len(rdvClients) {
		case 0:
			// FIXME: Check if this isn't called when DisableIPFSNetwork true.
			return nil, fmt.Errorf("can't create a discovery provider without any discovery")
		case 1:
			rdvClient = rdvClients[0]
		default:
			rdvClient = tinder.NewAsyncMultiDriver(log, rdvClients...)
		}

		return rdvpProvider{rdvp: rdvClient}, nil
	}
}

var tinderAsyncableDriverType = reflect.TypeOf((*(tinder.AsyncableDriver))(nil)).Elem()

func (rdvpProvider) Available() []reflect.Type {
	return []reflect.Type{tinderAsyncableDriverType}
}

func (p rdvpProvider) Make(t reflect.Type) (reflect.Value, error) {
	if t == tinderAsyncableDriverType {
		return reflect.ValueOf(p.rdvp), nil
	}
	return reflect.Value{}, fmt.Errorf("type %s is not provided by %s", t.Name(), p.Name())
}

func (rdvpProvider) Name() string {
	return "Tinder RDVP Discovery Provider"
}

func (p rdvpProvider) String() string {
	return p.Name()
}
