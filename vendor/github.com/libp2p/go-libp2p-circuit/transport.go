package relay

import (
	"context"
	"fmt"

	host "github.com/libp2p/go-libp2p-host"
	tpt "github.com/libp2p/go-libp2p-transport"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	ma "github.com/multiformats/go-multiaddr"
)

const P_CIRCUIT = 290

var Protocol = ma.Protocol{
	Code:  P_CIRCUIT,
	Size:  0,
	Name:  "p2p-circuit",
	VCode: ma.CodeToVarint(P_CIRCUIT),
}

func init() {
	ma.AddProtocol(Protocol)
}

var _ tpt.Transport = (*RelayTransport)(nil)

type RelayTransport Relay

func (t *RelayTransport) Relay() *Relay {
	return (*Relay)(t)
}

func (r *Relay) Transport() *RelayTransport {
	return (*RelayTransport)(r)
}

func (t *RelayTransport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	// TODO: Ensure we have a connection to the relay, if specified. Also,
	// make sure the multiaddr makes sense.
	if !t.Relay().Matches(laddr) {
		return nil, fmt.Errorf("%s is not a relay address", laddr)
	}
	return t.upgrader.UpgradeListener(t, t.Relay().Listener()), nil
}

func (t *RelayTransport) CanDial(raddr ma.Multiaddr) bool {
	return t.Relay().Matches(raddr)
}

func (t *RelayTransport) Proxy() bool {
	return true
}

func (t *RelayTransport) Protocols() []int {
	return []int{P_CIRCUIT}
}

// AddRelayTransport constructs a relay and adds it as a transport to the host network.
func AddRelayTransport(ctx context.Context, h host.Host, upgrader *tptu.Upgrader, opts ...RelayOpt) error {
	n, ok := h.Network().(tpt.Network)
	if !ok {
		return fmt.Errorf("%v is not a transport network", h.Network())
	}

	r, err := NewRelay(ctx, h, upgrader, opts...)
	if err != nil {
		return err
	}

	// There's no nice way to handle these errors as we have no way to tear
	// down the relay.
	// TODO
	if err := n.AddTransport(r.Transport()); err != nil {
		log.Error("failed to add relay transport:", err)
	} else if err := n.Listen(r.Listener().Multiaddr()); err != nil {
		log.Error("failed to listen on relay transport:", err)
	}
	return nil
}
