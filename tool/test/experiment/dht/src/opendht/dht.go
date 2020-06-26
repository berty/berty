package opendht

import (
	"errors"

	"berty.tech/berty/experiment/dht"
)

var _ dht.DHT = (*DHT)(nil)

type DHT struct {
}

func New() *DHT {
	return &DHT{}
}

func (d *DHT) Run() error {
	return nil
}

func (*DHT) Shutdown() error {
	return errors.New("not implemented")
}

func (d *DHT) Bootstrap(url string) error {
	return nil
}

func (*DHT) Put(key string, value interface{}) error {
	return errors.New("not implemented")
}

func (*DHT) Get(key string) (interface{}, error) {
	return nil, errors.New("not implemented")
}

func (*DHT) Remove(key string) error {
	return errors.New("not implemented")
}
