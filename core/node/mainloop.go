package node

import (
	"context"

	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
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

			event.SenderID = n.b64pubkey

			switch {
			case event.ReceiverID != "": // ContactEvent
				envelope.Source = n.aliasEnvelopeForContact(&envelope, event)
				envelope.ChannelID = event.ReceiverID
				envelope.EncryptedEvent = eventBytes // FIXME: encrypt for receiver

			case event.ConversationID != "": //ConversationEvent
				envelope.Source = n.aliasEnvelopeForConversation(&envelope, event)
				envelope.ChannelID = event.ConversationID
				envelope.EncryptedEvent = eventBytes // FIXME: encrypt for conversation

			default:
				logger().Error("unhandled event type")
			}

			if envelope.Signature, err = keypair.Sign(n.crypto, &envelope); err != nil {
				logger().Error("failed to sign envelope", zap.Error(err))
				continue
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
