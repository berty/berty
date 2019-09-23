package contacts

import (
	"context"
	"net"

	"berty.tech/go/pkg/iface"
)

type contact struct{}

func (c *contact) GetID() []byte {
	panic("implement me")
}

func (c *contact) GetRendezvousPoint() []byte {
	panic("implement me")
}

func (c *contact) GetSigChain() iface.SigChain {
	panic("implement me")
}

func (c *contact) ListDevices(ctx context.Context) (chan<- iface.Device, error) {
	panic("implement me")
}

func (c *contact) AcceptRequest(ctx context.Context) error {
	panic("implement me")
}

func (c *contact) DiscardRequest(ctx context.Context) error {
	panic("implement me")
}

func (c *contact) OpenStream(ctx context.Context) (net.Conn, error) {
	panic("implement me")
}

func (c *contact) Remove(ctx context.Context) error {
	panic("implement me")
}

var _ iface.Contact = (*contact)(nil)
