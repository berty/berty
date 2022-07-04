package accountutils

import "berty.tech/berty/v2/go/pkg/errcode"

type NativeKeystore interface {
	Put(key string, data []byte) error
	Get(key string) ([]byte, error)
}

type MemNativeKeystore struct {
	dict map[string][]byte
}

var _ NativeKeystore = (*MemNativeKeystore)(nil)

func (ks *MemNativeKeystore) Get(key string) ([]byte, error) {
	value, ok := ks.dict[key]
	if !ok {
		return nil, errcode.ErrNotFound
	}
	return value, nil
}

func (ks *MemNativeKeystore) Put(key string, value []byte) error {
	ks.dict[key] = value
	return nil
}

func NewMemNativeKeystore() NativeKeystore {
	return &MemNativeKeystore{dict: make(map[string][]byte)}
}
