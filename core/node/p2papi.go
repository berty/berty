package node

import (
	"context"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"
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
	return &p2p.Void{}, n.handleEnvelope(ctx, input)
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
	event.SenderID = n.UserID()

	return &event, nil
}

// Start is the node's mainloop
func (n *Node) Start() error {
	pubkey, err := n.keypair.GetPubKey()
	if err != nil {
		return err
	}
	ctx := context.Background()
	for {
		event := <-n.outgoingEvents
		envelope := p2p.Envelope{}
		eventBytes, err := proto.Marshal(event)
		if err != nil {
			logger().Warn("failed to marshal outgoing event", zap.Error(err))
		}
		switch {
		case event.ReceiverID != "": // ContactEvent
			envelope.ChannelID = event.ReceiverID
			envelope.EncryptedEvent = eventBytes // FIXME: encrypt for receiver
			envelope.SignerPublicKey = pubkey
		case event.ConversationID != "": //ConversationEvent
			envelope.ChannelID = event.ConversationID
			envelope.EncryptedEvent = eventBytes // FIXME: encrypt for conversation
			envelope.SignerPublicKey = pubkey    // FIXME: use a signature instead of exposing the pubkey
		default:
			logger().Error("unhandled event type")
		}
		if err := n.networkDriver.Emit(ctx, &envelope); err != nil {
			logger().Error("failed to emit envelope on network", zap.Error(err))
		}
	}
}
