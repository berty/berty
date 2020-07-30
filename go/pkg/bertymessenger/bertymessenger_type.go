package bertymessenger

import (
	"encoding/json"
	"fmt"
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
