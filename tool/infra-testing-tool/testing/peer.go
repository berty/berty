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
	Messenger messengertypes.MessengerServiceClient
	Protocol protocoltypes.ProtocolServiceClient

	Cc *grpc.ClientConn

	Ip string
	Groups map[string][]byte
	DevicePK []byte
	Acks sync.Map
	Messages []MessageHistory
}

type MessageHistory struct {
	MessageType uint64
	Sender []byte
	ReceivedAt time.Time
	Payload []byte
}

const (
	grpcPort = "9091"
)

func NewPeer(ip string) (p Peer, err error) {
	p.Ip = ip

	p.Groups = make(map[string][]byte)

	ctx := context.Background()
	cc, err := grpc.DialContext(ctx, p.GetHost(), grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		return p, err
	}

	p.Cc = cc

	p.Messenger = messengertypes.NewMessengerServiceClient(p.Cc)
	p.Protocol = protocoltypes.NewProtocolServiceClient(p.Cc)

	resp, err := p.Messenger.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	if err != nil {
		return p, err
	}

	p.DevicePK = []byte(resp.Account.PublicKey)

	return p, err
}

func (p *Peer) GetHost() string {
	return fmt.Sprintf("%s:%s", p.Ip, grpcPort)
}
