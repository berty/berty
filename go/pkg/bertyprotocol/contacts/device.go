package contacts

import (
	"context"
	"net"

	"berty.tech/go/pkg/iface"
)

type device struct {
}

func (d *device) GetID() []byte {
	panic("implement me")
}

func (d *device) GetContact() iface.Contact {
	panic("implement me")
}

func (d *device) OpenStreamToDevice(ctx context.Context) (net.Conn, error) {
	panic("implement me")
}

var _ iface.Device = (*device)(nil)
