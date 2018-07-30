package p2p

import "github.com/gogo/protobuf/proto"

func (e *Event) SetAttrs(attrs proto.Message) error {
	raw, err := proto.Marshal(attrs)
	if err != nil {
		return err
	}
	e.Attributes = raw
	return nil
}
