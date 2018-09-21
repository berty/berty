package graphql

import (
	"encoding/base64"
	"fmt"
	"strings"

	"berty.tech/core/api/node/graphql/model"
	"berty.tech/core/api/node/graphql/scalar"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
)

type EntityKind string

var (
	ContactKind            EntityKind = "CONTACT"
	ConversationKind       EntityKind = "CONVERSATION"
	EventKind              EntityKind = "EVENT"
	DeviceKind             EntityKind = "DEVICE"
	ConversationMemberKind EntityKind = "CONVERSATION_MEMBER"
)

var EntityKindMap = map[string]EntityKind{
	"CONTACT":             ContactKind,
	"CONVERSATION":        ConversationKind,
	"EVENT":               EventKind,
	"DEVICE":              DeviceKind,
	"CONVERSATION_MEMBER": ConversationMemberKind,
}

type globalID struct {
	Kind EntityKind
	ID   string
}

func (gid *globalID) String() string {
	id := strings.Join([]string{string(gid.Kind), gid.ID}, ":")
	return base64.StdEncoding.EncodeToString([]byte(id))

}

func (gid *globalID) FromString(e string) error {
	bs, err := base64.StdEncoding.DecodeString(e)
	if err != nil {
		return err
	}

	sid := strings.SplitN(string(bs), ":", 2)
	if len(sid) != 2 {
		return fmt.Errorf("not a valid global id `%s`", bs)
	}

	if kind, ok := EntityKindMap[sid[0]]; ok {
		gid.Kind = kind
		gid.ID = sid[1]
		return nil
	}

	return fmt.Errorf("unknown entity kind `%s`", sid[0])
}

func convertContactStatus(value entity.Contact_Status) *model.BertyEntityContactStatus {
	ret, ok := map[entity.Contact_Status]model.BertyEntityContactStatus{
		entity.Contact_Unknown:         model.BertyEntityContactStatusUnknown,
		entity.Contact_IsFriend:        model.BertyEntityContactStatusIsFriend,
		entity.Contact_IsTrustedFriend: model.BertyEntityContactStatusIsTrustedFriend,
		entity.Contact_IsRequested:     model.BertyEntityContactStatusIsRequested,
		entity.Contact_RequestedMe:     model.BertyEntityContactStatusRequestedMe,
		entity.Contact_IsBlocked:       model.BertyEntityContactStatusIsBlocked,
		entity.Contact_Myself:          model.BertyEntityContactStatusMyself,
	}[value]

	if !ok {
		t := model.BertyEntityContactStatusUnknown
		return &t
	}

	return &ret
}

func convertContact(contact *entity.Contact) *model.BertyEntityContact {
	if contact == nil {
		return &model.BertyEntityContact{}
	}

	contactGlobalID := &globalID{
		Kind: ContactKind,
		ID:   contact.ID,
	}

	return &model.BertyEntityContact{
		ID:          contactGlobalID.String(),
		Status:      convertContactStatus(contact.Status),
		DisplayName: &contact.DisplayName,
		CreatedAt:   &scalar.DateTime{Value: &contact.CreatedAt},
		UpdatedAt:   &scalar.DateTime{Value: &contact.UpdatedAt},
		DeletedAt:   &scalar.DateTime{Value: contact.DeletedAt},
	}
}

func convertConversationMemberStatus(value entity.ConversationMember_Status) *model.BertyEntityConversationMemberStatus {
	ret, ok := map[entity.ConversationMember_Status]model.BertyEntityConversationMemberStatus{
		entity.ConversationMember_Unknown: model.BertyEntityConversationMemberStatusUnknown,
		entity.ConversationMember_Owner:   model.BertyEntityConversationMemberStatusOwner,
		entity.ConversationMember_Active:  model.BertyEntityConversationMemberStatusActive,
		entity.ConversationMember_Blocked: model.BertyEntityConversationMemberStatusBlocked,
	}[value]

	if !ok {
		t := model.BertyEntityConversationMemberStatusUnknown
		return &t
	}

	return &ret
}

func convertConversationMember(conversationMember *entity.ConversationMember) *model.BertyEntityConversationMember {
	if conversationMember == nil {
		return &model.BertyEntityConversationMember{}
	}

	conversationMemberGlobalID := &globalID{
		Kind: ConversationMemberKind,
		ID:   conversationMember.ID,
	}

	return &model.BertyEntityConversationMember{
		ID:             conversationMemberGlobalID.String(),
		Status:         convertConversationMemberStatus(conversationMember.Status),
		Contact:        convertContact(conversationMember.Contact),
		ConversationID: &conversationMember.ConversationID,
		ContactID:      &conversationMember.ContactID,
		CreatedAt:      &scalar.DateTime{Value: &conversationMember.CreatedAt},
		UpdatedAt:      &scalar.DateTime{Value: &conversationMember.UpdatedAt},
		DeletedAt:      &scalar.DateTime{Value: conversationMember.DeletedAt},
	}
}

func convertConversation(conversation *entity.Conversation) *model.BertyEntityConversation {
	if conversation == nil {
		return &model.BertyEntityConversation{}
	}

	var members []*model.BertyEntityConversationMember
	for i := range conversation.Members {
		member := conversation.Members[i]
		if member == nil {
			continue
		}

		members = append(members, convertConversationMember(member))
	}

	conversationGlobalID := &globalID{
		Kind: ConversationKind,
		ID:   conversation.ID,
	}

	return &model.BertyEntityConversation{
		ID:        conversationGlobalID.String(),
		Title:     &conversation.Title,
		Topic:     &conversation.Topic,
		Members:   members,
		CreatedAt: &scalar.DateTime{Value: &conversation.CreatedAt},
		UpdatedAt: &scalar.DateTime{Value: &conversation.UpdatedAt},
		DeletedAt: &scalar.DateTime{Value: conversation.DeletedAt},
	}
}

func convertUint32(value uint32) *int {
	t := int(value)

	return &t
}

// func convertBytes(value *[]byte) *string {
// 	if value == nil {
// 		return nil
// 	}
//
// 	encoded := base64.StdEncoding.EncodeToString(*value)
//
// 	return &encoded
// }

func convertAttributes(e *p2p.Event) *string {
	jsonBytes, err := e.GetJSONAttrs()
	if err != nil {
		logger().Error(err.Error())
		return nil
	}
	jsonString := string(jsonBytes)
	return &jsonString
}

func convertEvent(event *p2p.Event) *model.BertyP2pEvent {
	if event == nil {
		return &model.BertyP2pEvent{}
	}

	eventGlobalID := &globalID{
		Kind: EventKind,
		ID:   event.ID,
	}

	conversationGlobalID := globalID{
		Kind: ConversationKind,
		ID:   event.ConversationID,
	}
	conversationID := conversationGlobalID.String()

	return &model.BertyP2pEvent{
		ID:                 eventGlobalID.String(),
		SenderID:           &event.SenderID,
		Direction:          convertEventDirection(event.Direction),
		SenderAPIVersion:   convertUint32(event.SenderAPIVersion),
		ReceiverAPIVersion: convertUint32(event.ReceiverAPIVersion),
		ReceiverID:         &event.ReceiverID,
		Kind:               convertEventKind(event.Kind),
		Attributes:         convertAttributes(event),
		ConversationID:     &conversationID,
		CreatedAt:          &scalar.DateTime{Value: &event.CreatedAt},
		UpdatedAt:          &scalar.DateTime{Value: &event.UpdatedAt},
		DeletedAt:          &scalar.DateTime{Value: event.DeletedAt},
		SentAt:             &scalar.DateTime{Value: event.SentAt},
		ReceivedAt:         &scalar.DateTime{Value: event.ReceivedAt},
		AckedAt:            &scalar.DateTime{Value: event.AckedAt},
	}
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

	if !ok {
		t := model.BertyP2pKindUnknown
		return &t
	}

	return &ret
}

func convertModelToP2pEventKind(value *model.BertyP2pKind) *p2p.Kind {
	ret, ok := map[model.BertyP2pKind]p2p.Kind{
		model.BertyP2pKindUnknown:                p2p.Kind_Unknown,
		model.BertyP2pKindSent:                   p2p.Kind_Sent,
		model.BertyP2pKindAck:                    p2p.Kind_Ack,
		model.BertyP2pKindPing:                   p2p.Kind_Ping,
		model.BertyP2pKindContactRequest:         p2p.Kind_ContactRequest,
		model.BertyP2pKindContactRequestAccepted: p2p.Kind_ContactRequestAccepted,
		model.BertyP2pKindContactShareMe:         p2p.Kind_ContactShareMe,
		model.BertyP2pKindContactShare:           p2p.Kind_ContactShare,
		model.BertyP2pKindConversationInvite:     p2p.Kind_ConversationInvite,
		model.BertyP2pKindConversationNewMessage: p2p.Kind_ConversationNewMessage,
	}[*value]

	if !ok {
		t := p2p.Kind_Unknown
		return &t
	}
	return &ret
}

// func convertTime(value *time.Time) *string {
// 	if value == nil {
// 		return nil
// 	}

// 	t := value.UTC().Format(time.RFC3339

// 	return &t
// }

func convertEventDirection(value p2p.Event_Direction) *model.BertyP2pEventDirection {
	ret, ok := map[p2p.Event_Direction]model.BertyP2pEventDirection{
		p2p.Event_UnknownDirection: model.BertyP2pEventDirectionUnknownDirection,
		p2p.Event_Incoming:         model.BertyP2pEventDirectionIncoming,
		p2p.Event_Outgoing:         model.BertyP2pEventDirectionOutgoing,
	}[value]

	if !ok {
		t := model.BertyP2pEventDirectionUnknownDirection
		return &t
	}

	return &ret
}

func memberSliceFromContactIds(contactsID []string) ([]*entity.ConversationMember, error) {
	members := make([]*entity.ConversationMember, len(contactsID))
	for i, cid := range contactsID {
		var gid globalID
		err := gid.FromString(cid)
		if err != nil {
			return nil, err
		}

		members[i] = &entity.ConversationMember{
			ContactID: gid.ID,
		}
	}

	return members, nil
}
