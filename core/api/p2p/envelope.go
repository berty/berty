package p2p

import (
	"crypto/x509"
	"encoding/base64"

	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	"berty.tech/core/errorcodes"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
)

func (e *Envelope) GetDataToSign() ([]byte, error) {
	return e.EncryptedEvent, nil
}

func (e *Envelope) GetSignedValue() keypair.SignableValue {
	return e
}

func (e *Envelope) GetDeviceForEnvelope(db *gorm.DB) (*entity.Device, error) {
	devices, err := entity.SenderAliasGetCandidates(db, e.Source)

	if err != nil {
		return nil, errors.Wrap(err, "unable go retrieve candidate devices")
	}

	for _, device := range devices {
		decoded, err := base64.StdEncoding.DecodeString(device.ID)

		if err != nil {
			continue
		}

		pubKey, err := x509.ParsePKIXPublicKey(decoded)

		if err != nil {
			continue
		}

		err = keypair.CheckSignature(e, pubKey)

		if err == nil {
			return device, nil
		}
	}

	return nil, errorcodes.ErrorNoDeviceFoundForEnvelope
}
