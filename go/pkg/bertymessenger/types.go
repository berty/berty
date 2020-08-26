package bertymessenger

import (
	"encoding/json"
	"fmt"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/gogo/protobuf/proto"
	"moul.io/godev"
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
		return json.Marshal(AppMessage_TypeUndefined.String())
	}

	if v, ok := AppMessage_Type_name[int32(*x)]; ok {
		return json.Marshal(v)
	}

	return json.Marshal(AppMessage_TypeUndefined.String())
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
		return nil, AppMessage_TypeUndefined, err
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

func (event *StreamEvent) Debug() string {
	output := "=== EVENT DEBUG ===\n"
	if event == nil {
		return output + "event is nil\n"
	}

	output += "event: " + godev.PrettyJSONPB(event) + "\n"

	eventPayload, err := event.UnmarshalPayload()
	if err != nil {
		return output + fmt.Sprintf("invalid payload: %v", err)
	}

	output += "eventPayload: " + godev.PrettyJSONPB(eventPayload)

	// FIXME: switch on the payload type to unmarshal nested payloads
	return output
}
