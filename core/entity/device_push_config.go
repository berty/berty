package entity

import (
	"encoding/base64"

	"berty.tech/core/crypto/keypair"
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

	pubKeyBytes, err := base64.StdEncoding.DecodeString(d.RelayPubkey)
	if err != nil {
		return nil, errorcodes.ErrCryptoKeyDecode.Wrap(err)
	}

	pushInfo, err := keypair.Encrypt(plainPushInfo, pubKeyBytes)
	if err != nil {
		return nil, errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	return &DevicePushIdentifier{
		PushInfo:    pushInfo,
		RelayPubkey: d.RelayPubkey,
		DeviceID:    d.DeviceID,
	}, nil
}

func (d DevicePushConfig) IsNode() {} // required by gqlgen
