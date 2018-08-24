package test

import (
	"context"
	"errors"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
)

type NetworkMock struct {
	network.Driver
	apps []*AppMock
}

func (n *NetworkMock) SendEventToContact(context.Context, string, *p2p.Event) error {
	return errors.New("not implemented")
}

func (n *NetworkMock) AddApp(app *AppMock) {
	n.apps = append(n.apps, app)
}

func NewNetworkMock() *NetworkMock {
	return &NetworkMock{
		apps: make([]*AppMock, 0),
	}
}
