package tcpreuse

import (
	"context"
	"net"
)

type singleDialer net.TCPAddr

func (d *singleDialer) Dial(network, address string) (net.Conn, error) {
	return d.DialContext(context.Background(), network, address)
}

func (d *singleDialer) DialContext(ctx context.Context, network, address string) (net.Conn, error) {
	return reuseDial(ctx, (*net.TCPAddr)(d), network, address)
}
