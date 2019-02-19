package dhtcskv

import (
	"errors"

	record "github.com/libp2p/go-libp2p-record"
)

type translateValidator struct{}

func (translateValidator) Validate(key string, value []byte) error {
	namespace, key, err := record.SplitKey(key)
	if err != nil {
		return err
	}

	if namespace != "bertyTranslate" {
		return errors.New("wrong namespace")
	}

	if len(value) > 2048 {
		return errors.New("value bigger than 2048 bytes")
	}

	if len(key) != 64 {
		return errors.New("key is not a valid SHA256 checksum")
	}

	return nil
}
func (translateValidator) Select(key string, vals [][]byte) (int, error) {
	return 0, nil
}
