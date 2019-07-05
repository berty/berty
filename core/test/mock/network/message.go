package network

import (
	"berty.tech/core/entity"
	"berty.tech/network/protocol/berty"
	"github.com/gogo/protobuf/proto"
)

func GetEnvelopeFromMessage(msg *berty.Message) (*entity.Envelope, error) {
	input := &entity.Envelope{}
	if err := proto.Unmarshal(msg.Data, input); err != nil {
		logger().Error("failed to unmarshal envelope")
		return nil, err
	}

	return input, nil
}
