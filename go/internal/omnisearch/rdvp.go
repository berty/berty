package omnisearch

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
	"berty.tech/berty/v2/go/internal/tinder"
)

type rdvpProvider struct {
	rdvp tinder.Service
}

func NewRdvpConstructorFromStr(addrs ...string) func(context.Context, *zap.Logger, host.Host) (Provider, error) {
	return func(ctx context.Context, log *zap.Logger, h host.Host) (Provider, error) {
		var pis []peer.AddrInfo
		{
			maddrs, err := ipfsutil.ParseAndResolveMaddrs(ctx, log, addrs)
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
		return NewRdvpConstructorFromPeerInfo(pis...)(log, h)
	}
}

func NewRdvpConstructorFromPeerInfo(pis ...peer.AddrInfo) func(*zap.Logger, host.Host) (Provider, error) {
	return func(log *zap.Logger, h host.Host) (Provider, error) {
		drivers := []*tinder.Driver{}

		rng := mrand.New(mrand.NewSource(srand.MustSecure())) // nolint:gosec
		if lenrdvpeers := len(pis); lenrdvpeers > 0 {
			for lenrdvpeers > 0 {
				lenrdvpeers--
				peer := pis[lenrdvpeers]
				h.Peerstore().AddAddrs(peer.ID, peer.Addrs, peerstore.PermanentAddrTTL)
				rdvp := tinder.NewRendezvousDiscovery(log, h, peer.ID, rng)
				driver := tinder.NewDriverFromUnregisterDiscovery("rdvp", rdvp, tinder.PublicAddrsOnly)
				drivers = append(drivers, driver)
			}
		}

		opts := &tinder.Opts{}
		service, err := tinder.NewService(opts, h, drivers...)
		if err != nil {
			return nil, err
		}

		return rdvpProvider{rdvp: service}, nil
	}
}

var tinderServiceType = reflect.TypeOf((*(tinder.Service))(nil)).Elem()

func (rdvpProvider) Available() []reflect.Type {
	return []reflect.Type{tinderServiceType}
}

func (p rdvpProvider) Make(t reflect.Type) (reflect.Value, error) {
	if t == tinderServiceType {
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
