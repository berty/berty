package p2p

import (
	"berty.tech/core/crypto/public"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"github.com/google/uuid"
)

func CreateDevicePushIdentifier(d *entity.DevicePushConfig) (*entity.DevicePushIdentifier, error) {
	nonce, err := uuid.New().MarshalBinary()
	if err != nil {
		return nil, errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	plainPushStruct := &DevicePushToDecrypted{
		PushId:   d.PushID,
		Nonce:    nonce,
		PushType: d.PushType,
	}

	plainPushInfo, err := plainPushStruct.Marshal()
	if err != nil {
		return nil, errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	pushInfo, err := public.Encrypt(plainPushInfo, d.RelayID)
	if err != nil {
		return nil, errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	return &entity.DevicePushIdentifier{
		PushInfo:    pushInfo,
		PushRelayID: string(d.RelayID[:]),
		DeviceID:    d.DeviceID,
	}, nil
}
