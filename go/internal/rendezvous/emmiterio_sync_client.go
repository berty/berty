package rendezvous

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	emitter "github.com/emitter-io/go/v2"
	"github.com/golang/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-rendezvous"
	pb "github.com/libp2p/go-libp2p-rendezvous/pb"
	"github.com/multiformats/go-multiaddr"
)

type emitterClientFactory struct{}

func NewEmitterClient() rendezvous.RendezvousSyncClient {
	return &emitterClientFactory{}
}

func (e *emitterClientFactory) GetServiceType() string {
	return ServiceType
}

func (e *emitterClientFactory) Subscribe(ctx context.Context, psDetailsStr string) (<-chan *rendezvous.Registration, error) {
	psDetails := &EmitterPubSubSubscriptionDetails{}

	err := json.Unmarshal([]byte(psDetailsStr), psDetails)
	if err != nil {
		return nil, fmt.Errorf("unable to decode json: %w", err)
	}

	ch := make(chan *rendezvous.Registration)
	cl, err := emitter.Connect(psDetails.ServerAddr, func(client *emitter.Client, message emitter.Message) {})
	if err != nil {
		close(ch)
		return nil, fmt.Errorf("unable to connect to pubsub broker: %w", err)
	}

	cl.OnDisconnect(func(client *emitter.Client, err error) {
		close(ch)
	})

	err = cl.Subscribe(psDetails.ReadKey, psDetails.ChannelName, func(client *emitter.Client, message emitter.Message) {
		reg := &pb.RegistrationRecord{}

		err := proto.Unmarshal(message.Payload(), reg)
		if err != nil {
			return
		}

		pid, err := peer.Decode(reg.Id)
		if err != nil {
			return
		}

		maddrs := make([]multiaddr.Multiaddr, len(reg.Addrs))
		for i, addrBytes := range reg.Addrs {
			maddrs[i], err = multiaddr.NewMultiaddrBytes(addrBytes)
			if err != nil {
				return
			}
		}

		ch <- &rendezvous.Registration{
			Peer: peer.AddrInfo{
				ID:    pid,
				Addrs: maddrs,
			},
			Ns:  reg.Ns,
			Ttl: int(reg.Ttl),
		}
	})
	if err != nil {
		return nil, fmt.Errorf("unable to subscribe to broker's channel: %w", err)
	}

	go func() {
		<-ctx.Done()
		cl.Disconnect(time.Millisecond * 100)
	}()

	return ch, nil
}
