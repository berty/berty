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

// UnmarshalAppMessage tries to parse an AppMessage payload in the corresponding type.
// Since this function returns a proto.Message interface, you still need to cast the returned value, but this function allows you to make it safely.
func UnmarshalAppMessage(payload []byte) (proto.Message, AppMessage_Type, error) {
	// FIXME: generate this function to avoid human error
	var am AppMessage
	err := proto.Unmarshal(payload, &am)
	if err != nil {
		return nil, AppMessage_TypeUndefined, err
	}

	switch am.Type {
	case AppMessage_TypeAcknowledge:
		var ret AppMessage_Acknowledge
		err := proto.Unmarshal(am.GetPayload(), &ret)
		return &ret, am.Type, err
	case AppMessage_TypeUserMessage:
		var ret AppMessage_UserMessage
		err := proto.Unmarshal(am.GetPayload(), &ret)
		return &ret, am.Type, err
	case AppMessage_TypeUserReaction:
		var ret AppMessage_UserReaction
		err := proto.Unmarshal(am.GetPayload(), &ret)
		return &ret, am.Type, err
	case AppMessage_TypeGroupInvitation:
		var ret AppMessage_GroupInvitation
		err := proto.Unmarshal(am.GetPayload(), &ret)
		return &ret, am.Type, err
	case AppMessage_TypeSetGroupName:
		var ret AppMessage_SetGroupName
		err := proto.Unmarshal(am.GetPayload(), &ret)
		return &ret, am.Type, err
	case AppMessage_TypeSetUserName:
		var ret AppMessage_SetUserName
		err := proto.Unmarshal(am.GetPayload(), &ret)
		return &ret, am.Type, err
	}

	return nil, am.Type, errcode.TODO.Wrap(fmt.Errorf("unsupported AppMessage Type: %q", am.Type))
}
