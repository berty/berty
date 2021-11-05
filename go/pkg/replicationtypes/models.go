package replicationtypes

import (
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func (m *ReplicatedGroup) ToGroup() (*protocoltypes.Group, error) {
	pk, err := messengerutil.B64DecodeBytes(m.PublicKey)
	if err != nil {
		return nil, err
	}

	signPub, err := messengerutil.B64DecodeBytes(m.SignPub)
	if err != nil {
		return nil, err
	}

	linkKey, err := messengerutil.B64DecodeBytes(m.LinkKey)
	if err != nil {
		return nil, err
	}

	return &protocoltypes.Group{
		PublicKey: pk,
		SignPub:   signPub,
		LinkKey:   linkKey,
	}, nil
}
