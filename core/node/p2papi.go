package node

import (
	"context"
	"encoding/base64"

	"github.com/gogo/protobuf/proto"
	"google.golang.org/grpc"

	"berty.tech/core/api/p2p"
)

// WithP2PGrpcServer registers the Node as a 'berty.p2p' protobuf server implementation
func WithP2PGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

func (n *Node) HandleEnvelope(ctx context.Context, input *p2p.Envelope) (*p2p.Void, error) {
	n.asyncWaitGroup.Add(1)
	defer n.asyncWaitGroup.Done()
	return &p2p.Void{}, n.handleEnvelope(ctx, input)
}

func (n *Node) Ping(ctx context.Context, _ *p2p.Void) (*p2p.Void, error) {
	return &p2p.Void{}, nil
}

func (n *Node) handleEnvelope(ctx context.Context, input *p2p.Envelope) error {
	n.asyncWaitGroup.Add(1)
	defer n.asyncWaitGroup.Done()
	event, err := n.OpenEnvelope(input)
	if err != nil {
		return err
	}
	return n.handleEvent(ctx, event)
}

func (n *Node) OpenEnvelope(envelope *p2p.Envelope) (*p2p.Event, error) {
	n.asyncWaitGroup.Add(1)
	defer n.asyncWaitGroup.Done()
	event := p2p.Event{}
	if err := proto.Unmarshal(envelope.EncryptedEvent, &event); err != nil {
		return nil, err
	}

	event.SenderID = base64.StdEncoding.EncodeToString(envelope.SignerPublicKey)

	return &event, nil
}
