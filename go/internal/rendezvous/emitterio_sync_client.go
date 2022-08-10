package rendezvous

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	emitter "github.com/emitter-io/go/v2"
	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/peer"
	rendezvous "github.com/libp2p/go-libp2p-rendezvous"
	pb "github.com/libp2p/go-libp2p-rendezvous/pb"
	"github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

type registrationMessage struct {
	registration *rendezvous.Registration
	psDetails    *EmitterPubSubSubscriptionDetails
}

type emitterClient struct {
	client *emitter.Client
	ctx    context.Context
	cancel context.CancelFunc
	usage  int
}

type emitterClientManager struct {
	ctx      context.Context
	clients  map[string]*emitterClient
	outChans map[string][]chan *rendezvous.Registration
	inChan   chan *registrationMessage
	mu       sync.Mutex
	logger   *zap.Logger
}

func (e *emitterClient) subscribeToServerUpdates(inChan chan *registrationMessage, psDetails *EmitterPubSubSubscriptionDetails) (err error) {
	return e.client.Subscribe(psDetails.ReadKey, psDetails.ChannelName, func(client *emitter.Client, message emitter.Message) {
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

		inChan <- &registrationMessage{
			registration: &rendezvous.Registration{
				Peer: peer.AddrInfo{
					ID:    pid,
					Addrs: maddrs,
				},
				Ns:  reg.Ns,
				Ttl: int(reg.Ttl),
			},
			psDetails: psDetails,
		}
	})
}

func (e *emitterClientManager) getClient(psDetails *EmitterPubSubSubscriptionDetails) (client *emitterClient, err error) {
	var ok bool
	if client, ok = e.clients[psDetails.ServerAddr]; ok {
		return
	}

	cl, err := emitter.Connect(psDetails.ServerAddr, func(client *emitter.Client, message emitter.Message) {})
	if err != nil {
		return
	}

	wrapCtx, cancel := context.WithCancel(context.Background())
	client = &emitterClient{
		ctx:    wrapCtx,
		cancel: cancel,
		client: cl,
	}
	e.clients[psDetails.ServerAddr] = client

	return
}

func (e *emitterClientManager) Subscribe(ctx context.Context, psDetailsStr string) (<-chan *rendezvous.Registration, error) {
	psDetails := &EmitterPubSubSubscriptionDetails{}

	err := json.Unmarshal([]byte(psDetailsStr), psDetails)
	if err != nil {
		return nil, fmt.Errorf("unable to decode json: %w", err)
	}

	e.mu.Lock()
	defer e.mu.Unlock()

	client, err := e.getClient(psDetails)
	if err != nil {
		return nil, fmt.Errorf("unable to : %w", err)
	}

	sliceName := makeOutChanName(psDetails.ServerAddr, psDetails.ChannelName)
	if _, ok := e.outChans[sliceName]; !ok {
		if err := client.subscribeToServerUpdates(e.inChan, psDetails); err != nil {
			return nil, fmt.Errorf("unable to subscribe to broker's channel: %w", err)
		}
	}

	ch := make(chan *rendezvous.Registration)
	e.outChans[sliceName] = append(e.outChans[sliceName], ch)
	client.usage++

	go func() {
		select {
		case <-ctx.Done():
		case <-client.ctx.Done():
		}

		e.unsubscribe(psDetails, ch)
		close(ch)
	}()

	return ch, nil
}

type EmitterClientOptions struct {
	Logger *zap.Logger
}

func NewEmitterClient(ctx context.Context, opts *EmitterClientOptions) rendezvous.RendezvousSyncClient {
	if opts == nil {
		opts = &EmitterClientOptions{}
	}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	manager := &emitterClientManager{
		ctx:      ctx,
		clients:  map[string]*emitterClient{},
		logger:   opts.Logger,
		outChans: map[string][]chan *rendezvous.Registration{},
		inChan:   make(chan *registrationMessage),
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				close(manager.inChan)
				return
			case registration := <-manager.inChan:
				outChanName := makeOutChanName(registration.psDetails.ServerAddr, registration.psDetails.ChannelName)

				manager.mu.Lock()
				channels, ok := manager.outChans[outChanName]
				manager.mu.Unlock()
				if !ok {
					manager.logger.Warn("received an event for an unknown channel", zap.String("channel", registration.psDetails.ChannelName))
					continue
				}

				for _, ch := range channels {
					ch <- registration.registration
				}
			}
		}
	}()

	return manager
}

func (e *emitterClientManager) GetServiceType() string {
	return EmitterServiceType
}

func makeOutChanName(serverAddr, channelName string) string {
	return fmt.Sprintf("%s:%s", serverAddr, channelName)
}

func (e *emitterClientManager) unsubscribe(details *EmitterPubSubSubscriptionDetails, ch chan *rendezvous.Registration) {
	e.mu.Lock()
	defer e.mu.Unlock()

	sliceName := makeOutChanName(details.ServerAddr, details.ChannelName)
	for i, outChan := range e.outChans[sliceName] {
		if outChan == ch {
			e.outChans[sliceName] = append(e.outChans[sliceName][:i], e.outChans[sliceName][i+1:]...)
			break
		}
	}

	client, err := e.getClient(details)
	if err != nil {
		e.logger.Error("unable to find client", zap.Error(err))
		return
	}

	if len(e.outChans[sliceName]) == 0 {
		if err := client.client.Unsubscribe(details.ReadKey, details.ChannelName); err != nil {
			e.logger.Error("unable to unsubscribe from client", zap.Error(err))
		}
	}

	client.usage--
	if client.usage <= 0 {
		e.clients[details.ServerAddr].cancel()
		delete(e.clients, details.ServerAddr)
	}
}
