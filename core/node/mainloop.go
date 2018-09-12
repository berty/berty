package node

import (
	"context"

	"berty.tech/core/api/p2p"
	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"
)

// Start is the node's mainloop
func (n *Node) Start() error {
	ctx := context.Background()
	for {
		select {
		case event := <-n.outgoingEvents:
			envelope := p2p.Envelope{}
			eventBytes, err := proto.Marshal(event)
			if err != nil {
				logger().Warn("failed to marshal outgoing event", zap.Error(err))
			}
			switch {
			case event.ReceiverID != "": // ContactEvent
				envelope.ChannelID = event.ReceiverID
				envelope.EncryptedEvent = eventBytes // FIXME: encrypt for receiver
				envelope.SignerPublicKey = n.pubkey
			case event.ConversationID != "": //ConversationEvent
				envelope.ChannelID = event.ConversationID
				envelope.EncryptedEvent = eventBytes // FIXME: encrypt for conversation
				envelope.SignerPublicKey = n.pubkey  // FIXME: use a signature instead of exposing the pubkey
			default:
				logger().Error("unhandled event type")
			}
			if err := n.networkDriver.Emit(ctx, &envelope); err != nil {
				logger().Error("failed to emit envelope on network", zap.Error(err))
			}
		case event := <-n.clientEvents:
			n.clientEventsMutex.Lock()
			for _, sub := range n.clientEventsSubscribers {
				if sub.filter(event) {
					sub.queue <- event
				}
			}
			n.clientEventsMutex.Unlock()
		}
	}
}
