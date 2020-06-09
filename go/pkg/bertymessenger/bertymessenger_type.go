package bertymessenger

import (
	"encoding/json"
	"fmt"
)

func (x *AppMessageType) UnmarshalJSON(bytes []byte) error {
	if x == nil {
		return fmt.Errorf("invalid input")
	}

	named := ""

	if err := json.Unmarshal(bytes, &named); err != nil {
		return err
	}

	if v, ok := AppMessageType_value[named]; ok {
		v := AppMessageType(v)
		*x = v
	}

	return nil
}

func (x *AppMessageType) MarshalJSON() ([]byte, error) {
	if x == nil {
		return json.Marshal(AppMessageType_Undefined.String())
	}

	if v, ok := AppMessageType_name[int32(*x)]; ok {
		return json.Marshal(v)
	}

	return json.Marshal(AppMessageType_Undefined.String())
}
