package node

import (
	"context"
	"encoding/base64"

	"github.com/gogo/protobuf/proto"
	"google.golang.org/grpc"

	"time"

	"berty.tech/core/api/p2p"
	netp2p "berty.tech/core/network/p2p"
	"github.com/pkg/errors"
)

// WithP2PGrpcServer registers the Node as a 'berty.p2p' protobuf server implementation
func WithP2PGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

func (n *Node) HandleEnvelope(ctx context.Context, input *p2p.Envelope) (*p2p.Void, error) {
	return &p2p.Void{}, n.handleEnvelope(ctx, input)
}

func (n *Node) Ping(ctx context.Context, input *p2p.PingInput) (*p2p.Void, error) {
	_, err := n.networkDriver.Dial(ctx, input.Destination, time.Second*5, netp2p.ProtocolID)

	if err != nil {
		return nil, errors.Wrap(err, "unable to ping")
	}

	return &p2p.Void{}, nil
}

func (n *Node) handleEnvelope(ctx context.Context, input *p2p.Envelope) error {
	event, err := n.OpenEnvelope(input)
	if err != nil {
		return err
	}
	return n.handleEvent(ctx, event)
}

func (n *Node) OpenEnvelope(envelope *p2p.Envelope) (*p2p.Event, error) {
	event := p2p.Event{}
	if err := proto.Unmarshal(envelope.EncryptedEvent, &event); err != nil {
		return nil, err
	}

	event.SenderID = base64.StdEncoding.EncodeToString(envelope.SignerPublicKey)

	return &event, nil
}
