package entity

import (
	"crypto/x509"
	"encoding/base64"

	"github.com/pkg/errors"
)

func (c Contact) Validate() error {
	if c.ID == "" {
		return ErrInvalidEntity
	}

	pubKeyBytes, err := base64.StdEncoding.DecodeString(c.ID)
	if err != nil {
		return err
	}

	if _, err := x509.ParsePKIXPublicKey(pubKeyBytes); err != nil {
		return errors.Wrap(ErrInvalidEntity, "invalid public key")
	}

	return nil
}

func (c Contact) Filtered() *Contact {
	return &Contact{
		ID:            c.ID,
		DisplayName:   c.DisplayName,
		DisplayStatus: c.DisplayStatus,
		// FIXME: share sigchain
	}
}

func (c Contact) PeerID() string {
	return c.ID // FIXME: use sigchain
}

func (c Contact) IsNode() {} // required by gqlgen
