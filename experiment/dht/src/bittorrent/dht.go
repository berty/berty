package bittorrent

import (
	"errors"

	"berty.tech/experiment/dht"
)

var _ dht.DHT = (*DHT)(nil)

type DHT struct{}

func (*DHT) Run(port int) error {
	return errors.New("not implemented")
}

func (*DHT) Shutdown() error {
	return errors.New("not implemented")
}

func (*DHT) Bootstrap(host string, port string) error {
	return errors.New("not implemented")
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
