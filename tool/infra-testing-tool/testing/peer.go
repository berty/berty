package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"fmt"
	"google.golang.org/grpc"
	"sync"
	"time"
)

type Peer struct {
	Cc *grpc.ClientConn
	Messenger messengertypes.MessengerServiceClient
	Protocol  protocoltypes.ProtocolServiceClient

	Ip       string
	Groups   map[string][]byte
	DevicePK []byte
	Acks     sync.Map
	Messages []MessageHistory
}

type MessageHistory struct {
	MessageType uint64
	Sender      []byte
	ReceivedAt  time.Time
	Payload     []byte
}

const (
	defaultGrpcPort = "9091"
)

// NewPeer returns a peer with default variables already instantiated
func NewPeer(ip string) (p Peer, err error) {
	p.Ip = ip

	p.Groups = make(map[string][]byte)

	ctx := context.Background()
	cc, err := grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		return p, err
	}

	p.Cc = cc

	p.getSvcClients()

	//resp, err := p.Messenger.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	//if err != nil {
	//	return p, err
	//}

	resp, err := p.Protocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return p, err
	}

	p.DevicePK = resp.DevicePK

	return p, err
}

func (p *Peer) getSvcClients() {
	p.Messenger = messengertypes.NewMessengerServiceClient(p.Cc)
	p.Protocol = protocoltypes.NewProtocolServiceClient(p.Cc)
}

func (p *Peer) GetHost() string {
	return fmt.Sprintf("%s:%s", p.Ip, defaultGrpcPort)
}
