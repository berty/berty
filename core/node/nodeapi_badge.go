package node

import (
	"berty.tech/core/pkg/notification"
	"context"
	"runtime"

	"berty.tech/core/api/node"
	"berty.tech/core/entity"
)

func getConversationID(e *entity.Event) string {
	switch e.Kind {
	case entity.Kind_ConversationInvite:
		attrs, err := e.GetConversationInviteAttrs()
		if err != nil {
			return ""
		}
		if attrs != nil && attrs.Conversation != nil {
			return attrs.Conversation.ID
		}
		return ""
	case entity.Kind_ConversationMemberInvite:
		attrs, err := e.GetConversationMemberInviteAttrs()
		if err != nil {
			return ""
		}
		if attrs != nil && attrs.Conversation != nil {
			return attrs.Conversation.ID
		}
		return ""
	default:
		return e.TargetAddr
	}
}

func getContactID(e *entity.Event) string {
	return e.SourceContactID
}

func (n *Node) ContactListBadge(ctx context.Context, _ *node.Void) (*node.Badge, error) {
	count := 0
	db := n.sql(ctx)
	err := db.
		Raw(`
			SELECT COUNT(*) FROM contact
			WHERE contact.mutated_at > contact.seen_at
			AND contact.status == ?
		`, entity.Contact_RequestedMe).
		Count(&count).
		Error
	if err != nil {
		return nil, err
	}
	return &node.Badge{Value: int32(count)}, nil
}

func (n *Node) ConversationListBadge(ctx context.Context, _ *node.Void) (*node.Badge, error) {
	count := 0
	db := n.sql(ctx)

	err := db.
		Raw(`
			SELECT COUNT(*) FROM conversation
			JOIN conversation_member ON conversation_member.conversation_id = conversation.id
			JOIN contact ON conversation_member.contact_id = contact.id
			WHERE contact.status == 42 AND (
				conversation.wrote_at > conversation_member.seen_at OR conversation_member.seen_at IS NULL
			)
		`).
		Count(&count).
		Error
	if err != nil {
		return nil, err
	}

	return &node.Badge{Value: int32(count)}, err
}

func (n *Node) ConversationBadge(ctx context.Context, c *entity.Conversation) (*node.Badge, error) {
	count := 0
	err := n.sql(ctx).
		Raw(`
			SELECT COUNT(*) FROM event
			JOIN conversation_member ON conversation_member.conversation_id = event.target_addr AND conversation_member.conversation_id = ?
			JOIN contact ON contact.id = conversation_member.contact_id AND contact.status = 42
			WHERE event.received_at > conversation_member.read_at
			AND (event.kind = ? OR event.kind = ?)
		`, c.ID, entity.Kind_ConversationNewMessage, entity.Kind_ConversationMemberWrite).
		Count(&count).
		Error
	if err != nil {
		return nil, err
	}
	return &node.Badge{Value: int32(count)}, err
}

func (n *Node) countUnread(ctx context.Context) (int, error) {
	countContacts, err := n.ContactListBadge(ctx, &node.Void{})
	if err != nil {
		return 0, err
	}

	countConversations, err := n.ContactListBadge(ctx, &node.Void{})
	if err != nil {
		return 0, err
	}

	return int(countContacts.Value + countConversations.Value), nil
}

func (n *Node) updateAppBadge(ctx context.Context) error {
	if runtime.GOOS != "darwin" {
		return nil
	}

	count, err := n.countUnread(ctx)
	if err != nil {
		return err
	}

	n.DisplayNotification(&notification.Payload{
		Badge: &count,
	})

	return nil
}
