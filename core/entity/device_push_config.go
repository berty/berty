package entity

import (
	"berty.tech/core/crypto/public"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/push"
	"github.com/google/uuid"
)

func (d *DevicePushConfig) CreateDevicePushIdentifier() (*DevicePushIdentifier, error) {
	nonce, err := uuid.New().MarshalBinary()
	if err != nil {
		return nil, errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	plainPushStruct := &push.PushDestination{
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

	return &DevicePushIdentifier{
		PushInfo:    pushInfo,
		PushRelayID: string(d.RelayID[:]),
		DeviceID:    d.DeviceID,
	}, nil
}

func (d DevicePushConfig) IsNode() {} // required by gqlgen
