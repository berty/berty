package bot

import (
	"berty.tech/core/api/node"
	"berty.tech/core/entity"
)

func (b *Bot) Reply(e *Event, m *entity.Message) error {
	_, err := b.client.Node().ConversationAddMessage(e.ctx, &node.ConversationAddMessageInput{
		Conversation: &entity.Conversation{ID: e.ConversationID},
		Message:      m,
	})
	return err
}
