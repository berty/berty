package graphql

import (
	"encoding/base64"

	"github.com/berty/berty/core/api/node/graphql/models"
	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
)

func convertContactStatus(value entity.Contact_Status) *model.BertyEntityContactStatus {
	ret, ok := map[entity.Contact_Status]model.BertyEntityContactStatus{
		entity.Contact_Unknown:         model.BertyEntityContactStatusUnknown,
		entity.Contact_IsFriend:        model.BertyEntityContactStatusUnknown,
		entity.Contact_IsTrustedFriend: model.BertyEntityContactStatusUnknown,
		entity.Contact_IsRequested:     model.BertyEntityContactStatusUnknown,
		entity.Contact_RequestedMe:     model.BertyEntityContactStatusUnknown,
		entity.Contact_IsBlocked:       model.BertyEntityContactStatusUnknown,
		entity.Contact_Myself:          model.BertyEntityContactStatusUnknown,
	}[value]

	if ok == false {
		t := model.BertyEntityContactStatusUnknown
		return &t
	}

	return &ret
}

func convertContact(contact *entity.Contact, err error) (*model.BertyEntityContact, error) {
	if contact == nil {
		return &model.BertyEntityContact{}, err
	}

	return &model.BertyEntityContact{
		ID:          &contact.ID,
		Status:      convertContactStatus(contact.Status),
		DisplayName: &contact.DisplayName,
	}, err
}

func convertConversationMemberStatus(value entity.ConversationMember_Status) *model.BertyEntityConversationMemberStatus {
	ret, ok := map[entity.ConversationMember_Status]model.BertyEntityConversationMemberStatus{
		entity.ConversationMember_Unknown: model.BertyEntityConversationMemberStatusUnknown,
		entity.ConversationMember_Owner:   model.BertyEntityConversationMemberStatusOwner,
		entity.ConversationMember_Active:  model.BertyEntityConversationMemberStatusActive,
		entity.ConversationMember_Blocked: model.BertyEntityConversationMemberStatusBlocked,
	}[value]

	if ok == false {
		t := model.BertyEntityConversationMemberStatusUnknown
		return &t
	}

	return &ret
}

func convertConversationMember(conversationMember *entity.ConversationMember) *model.BertyEntityConversationMember {
	if conversationMember == nil {
		return &model.BertyEntityConversationMember{}
	}

	contact, _ := convertContact(conversationMember.Contact, nil)

	return &model.BertyEntityConversationMember{
		ID:             &conversationMember.ID,
		Status:         convertConversationMemberStatus(conversationMember.Status),
		Contact:        contact,
		ConversationID: &conversationMember.ConversationID,
		ContactID:      &conversationMember.ContactID,
	}
}

func convertConversation(conversation *entity.Conversation, err error) (*model.BertyEntityConversation, error) {
	if conversation == nil {
		return &model.BertyEntityConversation{}, err
	}

	var members []*model.BertyEntityConversationMember
	for i := range conversation.Members {
		member := conversation.Members[i]
		if member == nil {
			continue
		}

		members = append(members, convertConversationMember(member))
	}

	return &model.BertyEntityConversation{
		ID:      &conversation.ID,
		Title:   &conversation.Title,
		Topic:   &conversation.Topic,
		Members: members,
	}, err
}

func convertUint32(value uint32) *int {
	t := int(value)

	return &t
}

func convertBytes(value *[]byte) *string {
	if value == nil {
		return nil
	}

	encoded := base64.StdEncoding.EncodeToString(*value)

	return &encoded
}

func convertEvent(event *p2p.Event, err error) (*model.BertyP2pEvent, error) {
	if event == nil {
		return &model.BertyP2pEvent{}, err
	}

	return &model.BertyP2pEvent{
		ID:                 &event.ID,
		SenderID:           &event.SenderID,
		Direction:          convertEventDirection(event.Direction),
		SenderAPIVersion:   convertUint32(event.SenderAPIVersion),
		ReceiverAPIVersion: convertUint32(event.ReceiverAPIVersion),
		Receiver:           &event.ReceiverID,
		Kind:               convertEventKind(event.Kind),
		Attributes:         convertBytes(&event.Attributes),
		ConversationID:     &event.ConversationID,
	}, err
}

func convertEventKind(value p2p.Kind) *model.BertyP2pKind {
	ret, ok := map[p2p.Kind]model.BertyP2pKind{
		p2p.Kind_Unknown:                model.BertyP2pKindUnknown,
		p2p.Kind_Sent:                   model.BertyP2pKindSent,
		p2p.Kind_Ack:                    model.BertyP2pKindAck,
		p2p.Kind_Ping:                   model.BertyP2pKindPing,
		p2p.Kind_ContactRequest:         model.BertyP2pKindContactRequest,
		p2p.Kind_ContactRequestAccepted: model.BertyP2pKindContactRequestAccepted,
		p2p.Kind_ContactShareMe:         model.BertyP2pKindContactShareMe,
		p2p.Kind_ContactShare:           model.BertyP2pKindContactShare,
		p2p.Kind_ConversationInvite:     model.BertyP2pKindConversationInvite,
		p2p.Kind_ConversationNewMessage: model.BertyP2pKindConversationNewMessage,
	}[value]

	if ok == false {
		t := model.BertyP2pKindUnknown
		return &t
	}

	return &ret
}

func convertEventDirection(value p2p.Event_Direction) *model.BertyP2pEventDirection {
	ret, ok := map[p2p.Event_Direction]model.BertyP2pEventDirection{
		p2p.Event_UnknownDirection: model.BertyP2pEventDirectionUnknownDirection,
		p2p.Event_Incoming:         model.BertyP2pEventDirectionIncoming,
		p2p.Event_Outgoing:         model.BertyP2pEventDirectionOutgoing,
	}[value]

	if ok == false {
		t := model.BertyP2pEventDirectionUnknownDirection
		return &t
	}

	return &ret
}

func memberSliceFromContactIds(contactIds []string) []*entity.ConversationMember {
	var members []*entity.ConversationMember

	for i := range contactIds {
		contactId := contactIds[i]

		members = append(members, &entity.ConversationMember{
			ContactID: contactId,
		})
	}

	return members
}
