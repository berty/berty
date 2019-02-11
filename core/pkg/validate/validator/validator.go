package validator

import (
	"crypto/x509"
	"encoding/base64"

	"berty.tech/core/pkg/errorcodes"
)

func IsContactKey(key string) error {
	if key == "" {
		return errorcodes.ErrContactReqKeyMissing.New()
	}

	pubKeyBytes, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		return errorcodes.ErrContactReqKey.Wrap(err)
	}

	if _, err := x509.ParsePKIXPublicKey(pubKeyBytes); err != nil {
		return errorcodes.ErrContactReqKey.Wrap(err)
	}
	return nil
}
