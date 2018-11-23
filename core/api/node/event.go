package node

import (
	"encoding/json"
	"time"

	"berty.tech/core/api/p2p"
	"github.com/gogo/protobuf/proto"
)

func GetNodeEvent(event *p2p.Event) (*NodeEvent, error) {
	var nodeEvent NodeEvent
	return &nodeEvent, proto.Unmarshal(event.Attributes, &nodeEvent)
}

func NewEvent(kind Kind, attributes proto.Message) (*p2p.Event, error) {
	nodeEvent, err := NewNodeEvent(kind, attributes)
	if err != nil {
		return nil, err
	}

	attrs, err := proto.Marshal(nodeEvent)
	if err != nil {
		return nil, err
	}

	return &p2p.Event{
		CreatedAt:  time.Now().UTC(),
		Direction:  p2p.Event_Node,
		Kind:       p2p.Kind_Node,
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
