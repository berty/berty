package bertymessenger

import (
	"encoding/json"
	"fmt"

	"github.com/gogo/protobuf/proto"

	"berty.tech/berty/v2/go/pkg/errcode"
)

func (x *AppMessage_Type) UnmarshalJSON(bytes []byte) error {
	if x == nil {
		return fmt.Errorf("invalid input")
	}

	named := ""

	if err := json.Unmarshal(bytes, &named); err != nil {
		return err
	}

	if v, ok := AppMessage_Type_value[named]; ok {
		v := AppMessage_Type(v)
		*x = v
	}

	return nil
}

func (x *AppMessage_Type) MarshalJSON() ([]byte, error) {
	if x == nil {
		return json.Marshal(AppMessage_Undefined.String())
	}

	if v, ok := AppMessage_Type_name[int32(*x)]; ok {
		return json.Marshal(v)
	}

	return json.Marshal(AppMessage_Undefined.String())
}

func (x AppMessage_Type) MarshalPayload(sentDate int64, payload proto.Message) ([]byte, error) {
	p, err := proto.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return proto.Marshal(&AppMessage{Type: x, Payload: p, SentDate: sentDate})
}

// UnmarshalPayload tries to parse an AppMessage payload in the corresponding type.
// Since this function returns a proto.Message interface, you still need to cast the returned value, but this function allows you to make it safely.
func (am AppMessage) UnmarshalPayload() (proto.Message, error) {
	var message proto.Message

	switch am.GetType() {
	case AppMessage_TypeAcknowledge:
		message = &AppMessage_Acknowledge{}
	case AppMessage_TypeUserMessage:
		message = &AppMessage_UserMessage{}
	case AppMessage_TypeUserReaction:
		message = &AppMessage_UserReaction{}
	case AppMessage_TypeGroupInvitation:
		message = &AppMessage_GroupInvitation{}
	case AppMessage_TypeSetGroupName:
		message = &AppMessage_SetGroupName{}
	case AppMessage_TypeSetUserName:
		message = &AppMessage_SetUserName{}
	default:
		return nil, errcode.TODO.Wrap(fmt.Errorf("unsupported AppMessage type: %q", am.GetType()))
	}

	return message, proto.Unmarshal(am.GetPayload(), message)
}

func UnmarshalAppMessage(payload []byte) (proto.Message, AppMessage, error) {
	// FIXME: generate this function to avoid human error
	var am AppMessage
	err := proto.Unmarshal(payload, &am)
	if err != nil {
		return nil, AppMessage{}, err
	}

	msg, err := am.UnmarshalPayload()
	return msg, am, err
}

func (event *StreamEvent) UnmarshalPayload() (proto.Message, error) {
	var message proto.Message

	switch event.GetType() {
	case StreamEvent_TypeAccountUpdated:
		message = &StreamEvent_AccountUpdated{}
	case StreamEvent_TypeContactUpdated:
		message = &StreamEvent_ContactUpdated{}
	case StreamEvent_TypeConversationUpdated:
		message = &StreamEvent_ConversationUpdated{}
	case StreamEvent_TypeInteractionUpdated:
		message = &StreamEvent_InteractionUpdated{}
	case StreamEvent_TypeMemberUpdated:
		message = &StreamEvent_MemberUpdated{}
	case StreamEvent_TypeDeviceUpdated:
		message = &StreamEvent_DeviceUpdated{}
	case StreamEvent_TypeNotified:
		message = &StreamEvent_Notified{}
	default:
		return nil, errcode.TODO.Wrap(fmt.Errorf("unsupported StreamEvent type: %q", event.GetType()))
	}

	return message, proto.Unmarshal(event.GetPayload(), message)
}

func (event *StreamEvent_Notified) UnmarshalPayload() (proto.Message, error) {
	var message proto.Message

	switch event.GetType() {
	case StreamEvent_Notified_TypeBasic:
		message = &StreamEvent_Notified_Basic{}
	case StreamEvent_Notified_TypeMessageReceived:
		message = &StreamEvent_Notified_MessageReceived{}
	default:
		return nil, errcode.TODO.Wrap(fmt.Errorf("unsupported Notified type: %q", event.GetType()))
	}

	return message, proto.Unmarshal(event.GetPayload(), message)
}

func (interaction *Interaction) UnmarshalPayload() (proto.Message, error) {
	appMessage := AppMessage{
		Type:    interaction.GetType(),
		Payload: interaction.GetPayload(),
	}
	return appMessage.UnmarshalPayload()
}

func (event *StreamEvent) MarshalJSON() ([]byte, error) {
	type Alias StreamEvent

	payload, err := event.UnmarshalPayload()
	return json.Marshal(&struct {
		*Alias
		Payload proto.Message `json:"$payload,omitempty"`
		Type    string        `json:"$type"`
		Error   error         `json:"$error,omitempty"`
	}{
		Alias:   (*Alias)(event),
		Payload: payload,
		Type:    event.GetType().String(),
		Error:   err,
	})
}

func (interaction *Interaction) MarshalJSON() ([]byte, error) {
	type Alias Interaction

	payload, err := interaction.UnmarshalPayload()
	return json.Marshal(&struct {
		*Alias
		Payload proto.Message `json:"$payload,omitempty"`
		Type    string        `json:"$type"`
		Error   error         `json:"$error,omitempty"`
	}{
		Alias:   (*Alias)(interaction),
		Payload: payload,
		Type:    interaction.GetType().String(),
		Error:   err,
	})
}

func (contact *Contact) MarshalJSON() ([]byte, error) {
	type Alias Contact

	return json.Marshal(&struct {
		*Alias
		State string `json:"$state"`
	}{
		Alias: (*Alias)(contact),
		State: contact.GetState().String(),
	})
}
