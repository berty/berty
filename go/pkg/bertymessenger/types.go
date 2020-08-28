package bertymessenger

import (
	"encoding/json"
	"fmt"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/gogo/protobuf/proto"
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

func (x AppMessage_Type) MarshalPayload(payload proto.Message) ([]byte, error) {
	p, err := proto.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return proto.Marshal(&AppMessage{Type: x, Payload: p})
}

// UnmarshalPayload tries to parse an AppMessage payload in the corresponding type.
// Since this function returns a proto.Message interface, you still need to cast the returned value, but this function allows you to make it safely.
func (am AppMessage) UnmarshalPayload() (proto.Message, error) {
	switch am.GetType() {
	case AppMessage_TypeAcknowledge:
		var ret AppMessage_Acknowledge
		return &ret, proto.Unmarshal(am.GetPayload(), &ret)
	case AppMessage_TypeUserMessage:
		var ret AppMessage_UserMessage
		return &ret, proto.Unmarshal(am.GetPayload(), &ret)
	case AppMessage_TypeUserReaction:
		var ret AppMessage_UserReaction
		return &ret, proto.Unmarshal(am.GetPayload(), &ret)
	case AppMessage_TypeGroupInvitation:
		var ret AppMessage_GroupInvitation
		return &ret, proto.Unmarshal(am.GetPayload(), &ret)
	case AppMessage_TypeSetGroupName:
		var ret AppMessage_SetGroupName
		return &ret, proto.Unmarshal(am.GetPayload(), &ret)
	case AppMessage_TypeSetUserName:
		var ret AppMessage_SetUserName
		return &ret, proto.Unmarshal(am.GetPayload(), &ret)
	}

	return nil, errcode.TODO.Wrap(fmt.Errorf("unsupported AppMessage type: %q", am.GetType()))
}

func UnmarshalAppMessage(payload []byte) (proto.Message, AppMessage_Type, error) {
	// FIXME: generate this function to avoid human error
	var am AppMessage
	err := proto.Unmarshal(payload, &am)
	if err != nil {
		return nil, AppMessage_Undefined, err
	}

	msg, err := am.UnmarshalPayload()
	return msg, am.Type, err
}

func (event *StreamEvent) UnmarshalPayload() (proto.Message, error) {
	switch event.GetType() {
	case StreamEvent_TypeAccountUpdated:
		var ret StreamEvent_AccountUpdated
		return &ret, proto.Unmarshal(event.GetPayload(), &ret)
	case StreamEvent_TypeContactUpdated:
		var ret StreamEvent_ContactUpdated
		return &ret, proto.Unmarshal(event.GetPayload(), &ret)
	case StreamEvent_TypeConversationUpdated:
		var ret StreamEvent_ConversationUpdated
		return &ret, proto.Unmarshal(event.GetPayload(), &ret)
	case StreamEvent_TypeInteractionUpdated:
		var ret StreamEvent_InteractionUpdated
		return &ret, proto.Unmarshal(event.GetPayload(), &ret)
	}

	return nil, errcode.TODO.Wrap(fmt.Errorf("unsupported StreamEvent type: %q", event.GetType()))
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
