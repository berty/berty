package store

import "fmt"

type Noop struct{}

func NewNoopStore() Store {
	return &Noop{}
}

func (np *Noop) Put(key string, value []byte) error {
	return fmt.Errorf("noop store `put` called - [%s]: %v", key, value)
}
func (np *Noop) Get(key string) ([]byte, error) {
	return nil, fmt.Errorf("noop store `get` called - [%s]", key)
}
func (np *Noop) Close() error { return nil }
