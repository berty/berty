package entity

import (
	"crypto/x509"
	"encoding/base64"

	"berty.tech/core/pkg/errorcodes"
)

func (c Contact) Validate() error {
	if c.ID == "" {
		return errorcodes.ErrContactReqKeyMissing.New()
	}

	pubKeyBytes, err := base64.StdEncoding.DecodeString(c.ID)
	if err != nil {
		return errorcodes.ErrContactReqKey.Wrap(err)
	}

	if _, err := x509.ParsePKIXPublicKey(pubKeyBytes); err != nil {
		return errorcodes.ErrContactReqKey.Wrap(err)
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
