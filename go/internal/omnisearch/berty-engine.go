package omnisearch

import (
	"context"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type bertyEngine struct {
	s *bertyprotocol.Swiper
}

func NewEngine(ctx context.Context, h host.Host, disc discovery.Discovery) (Engine, error) {
	ps, err := pubsub.NewGossipSub(ctx, h,
		pubsub.WithMessageSigning(true),
		pubsub.WithFloodPublish(true),
		pubsub.WithDiscovery(disc),
		pubsub.WithPeerExchange(true),
	)
	if err != nil {
		return nil, err
	}
	return &bertyEngine{s: bertyprotocol.NewSwiper(zap.NewNop(), ps, time.Hour*24)}, nil
}

func (p *bertyEngine) Search(octx context.Context, gwg *sync.WaitGroup, rc chan<- *ResultReturn, previous *ResultReturn) {
	if v, ok := previous.Object.(*messengertypes.BertyID); ok {
		(*gwg).Add(1)
		go func() {
			defer func() {
				rc <- &ResultReturn{Decrement: true} // (*gwg).Done()
			}()
			ctx, cancel := context.WithTimeout(octx, time.Minute)
			lrc := make(chan peer.AddrInfo)
			go p.s.WatchTopic(
				ctx,
				v.AccountPK,
				v.PublicRendezvousSeed,
				lrc,
				cancel,
			)

			for {
				select {
				case pi := <-lrc:
					rc <- &ResultReturn{
						Finder: p,
						Object: pi,
					}
				case <-ctx.Done():
					return
				}
			}
		}()
	}
}

func (*bertyEngine) Name() string {
	return "Berty Engine"
}

func (p *bertyEngine) String() string {
	return p.Name()
}
