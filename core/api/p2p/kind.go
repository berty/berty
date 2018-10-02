package p2p

import (
	"encoding/json"

	"github.com/gogo/protobuf/proto"
)

func (e *Event) SetAttrs(attrs proto.Message) error {
	raw, err := proto.Marshal(attrs)
	if err != nil {
		return err
	}
	e.Attributes = raw
	return nil
}

func (e *Event) GetJSONAttrs() ([]byte, error) {
	attrs := e.GetAttributes()

	json, err := json.Marshal(attrs)
	if err != nil {
		return nil, err
	}

	return json, nil
}
