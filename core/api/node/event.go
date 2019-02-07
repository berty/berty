package node

import (
	"encoding/json"
	"time"

	entity "berty.tech/core/entity"
	"github.com/gogo/protobuf/proto"
)

func GetNodeEvent(event *entity.Event) (*NodeEvent, error) {
	var nodeEvent NodeEvent
	return &nodeEvent, proto.Unmarshal(event.Attributes, &nodeEvent)
}

func NewEvent(kind Kind, attributes proto.Message) (*entity.Event, error) {
	nodeEvent, err := NewNodeEvent(kind, attributes)
	if err != nil {
		return nil, err
	}

	attrs, err := proto.Marshal(nodeEvent)
	if err != nil {
		return nil, err
	}

	return &entity.Event{
		CreatedAt:  time.Now().UTC(),
		Direction:  entity.Event_Node,
		Kind:       entity.Kind_Node,
		Attributes: attrs,
	}, nil
}

func NewNodeEvent(kind Kind, attributes proto.Message) (*NodeEvent, error) {
	attrs, err := json.Marshal(attributes)
	if err != nil {
		return nil, err
	}
	return &NodeEvent{
		Kind:       kind,
		Attributes: attrs,
	}, nil
}
