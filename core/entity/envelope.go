package entity

import (
	"crypto/x509"
	"encoding/base64"

	"berty.tech/core/crypto/keypair"
	"berty.tech/core/pkg/errorcodes"
	"github.com/jinzhu/gorm"
)

func (e *Envelope) GetDataToSign() ([]byte, error) {
	return e.EncryptedEvent, nil
}

func (e *Envelope) GetSignedValue() keypair.SignableValue {
	return e
}

func (e *Envelope) GetDeviceForEnvelope(db *gorm.DB) (*Device, error) {
	devices, err := SenderAliasGetCandidates(db, e.Source)

	if err != nil {
		return nil, errorcodes.ErrEnvelopeNoDeviceFound.Wrap(err)
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

	return nil, errorcodes.ErrEnvelopeNoDeviceFound.New()
}
