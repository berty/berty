package record

import (
	"bytes"
	"errors"
	"fmt"

	u "github.com/ipfs/go-ipfs-util"
	mh "github.com/multiformats/go-multihash"
)

// PublicKeyValidator is a Validator that validates public keys.
type PublicKeyValidator struct{}

// Validate conforms to the Validator interface.
//
// It verifies that the passed in record value is the PublicKey that matches the
// passed in key.
func (pkv PublicKeyValidator) Validate(key string, value []byte) error {
	ns, key, err := SplitKey(key)
	if err != nil {
		return err
	}
	if ns != "pk" {
		return errors.New("namespace not 'pk'")
	}

	keyhash := []byte(key)
	if _, err := mh.Cast(keyhash); err != nil {
		return fmt.Errorf("key did not contain valid multihash: %s", err)
	}

	pkh := u.Hash(value)
	if !bytes.Equal(keyhash, pkh) {
		return errors.New("public key does not match storage key")
	}
	return nil
}

// Select conforms to the Validator interface.
//
// It always returns 0 as all public keys are equivalently valid.
func (pkv PublicKeyValidator) Select(k string, vals [][]byte) (int, error) {
	return 0, nil
}

var _ Validator = PublicKeyValidator{}
