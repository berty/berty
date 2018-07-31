package relay

import (
	"fmt"
	"net"

	pb "github.com/libp2p/go-libp2p-circuit/pb"

	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
)

var _ manet.Listener = (*RelayListener)(nil)

type RelayListener Relay

func (l *RelayListener) Relay() *Relay {
	return (*Relay)(l)
}

func (r *Relay) Listener() *RelayListener {
	// TODO: Only allow one!
	return (*RelayListener)(r)
}

func (l *RelayListener) Accept() (manet.Conn, error) {
	select {
	case c := <-l.incoming:
		err := l.Relay().writeResponse(c.Stream, pb.CircuitRelay_SUCCESS)
		if err != nil {
			log.Debugf("error writing relay response: %s", err.Error())
			c.Stream.Reset()
			return nil, err
		}

		// TODO: Pretty print.
		log.Infof("accepted relay connection: %s", c)

		return c, nil
	case <-l.ctx.Done():
		return nil, l.ctx.Err()
	}
}

func (l *RelayListener) Addr() net.Addr {
	return &NetAddr{
		Relay:  "any",
		Remote: "any",
	}
}

func (l *RelayListener) Multiaddr() ma.Multiaddr {
	a, err := ma.NewMultiaddr(fmt.Sprintf("/p2p-circuit/ipfs/%s", l.self.Pretty()))
	if err != nil {
		panic(err)
	}
	return a
}

func (l *RelayListener) Close() error {
	// TODO: noop?
	return nil
}
