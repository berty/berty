package addrutil

import (
	"context"
	"fmt"

	logging "github.com/ipfs/go-log"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
)

var log = logging.Logger("addrutil")

// FilterAddrs is a filter that removes certain addresses, according the given filters.
// if all filters return true, the address is kept.
func FilterAddrs(a []ma.Multiaddr, filters ...func(ma.Multiaddr) bool) []ma.Multiaddr {
	b := make([]ma.Multiaddr, 0, len(a))
	for _, addr := range a {
		good := true
		for _, filter := range filters {
			good = good && filter(addr)
		}
		if good {
			b = append(b, addr)
		}
	}
	return b
}

// AddrOverNonLocalIP returns whether the addr uses a non-local ip link
func AddrOverNonLocalIP(a ma.Multiaddr) bool {
	split := ma.Split(a)
	if len(split) < 1 {
		return false
	}
	if manet.IsIP6LinkLocal(split[0]) {
		return false
	}
	return true
}

// ResolveUnspecifiedAddress expands an unspecified ip addresses (/ip4/0.0.0.0, /ip6/::) to
// use the known local interfaces. If ifaceAddr is nil, we request interface addresses
// from the network stack. (this is so you can provide a cached value if resolving many addrs)
func ResolveUnspecifiedAddress(resolve ma.Multiaddr, ifaceAddrs []ma.Multiaddr) ([]ma.Multiaddr, error) {
	// split address into its components
	split := ma.Split(resolve)

	// if first component (ip) is not unspecified, use it as is.
	if !manet.IsIPUnspecified(split[0]) {
		return []ma.Multiaddr{resolve}, nil
	}

	out := make([]ma.Multiaddr, 0, len(ifaceAddrs))
	for _, ia := range ifaceAddrs {
		// must match the first protocol to be resolve.
		if ia.Protocols()[0].Code != resolve.Protocols()[0].Code {
			continue
		}

		split[0] = ia
		joined := ma.Join(split...)
		out = append(out, joined)
		log.Debug("adding resolved addr:", resolve, joined, out)
	}
	if len(out) < 1 {
		return nil, fmt.Errorf("failed to resolve: %s", resolve)
	}
	return out, nil
}

// ResolveUnspecifiedAddresses expands unspecified ip addresses (/ip4/0.0.0.0, /ip6/::) to
// use the known local interfaces.
func ResolveUnspecifiedAddresses(unspecAddrs, ifaceAddrs []ma.Multiaddr) ([]ma.Multiaddr, error) {

	// todo optimize: only fetch these if we have a "any" addr.
	if len(ifaceAddrs) < 1 {
		var err error
		ifaceAddrs, err = InterfaceAddresses()
		if err != nil {
			return nil, err
		}
		// log.Debug("InterfaceAddresses:", ifaceAddrs)
	}

	var outputAddrs []ma.Multiaddr
	for _, a := range unspecAddrs {
		// unspecified?
		resolved, err := ResolveUnspecifiedAddress(a, ifaceAddrs)
		if err != nil {
			continue // optimistic. if we cant resolve anything, we'll know at the bottom.
		}
		// log.Debug("resolved:", a, resolved)
		outputAddrs = append(outputAddrs, resolved...)
	}

	if len(outputAddrs) < 1 {
		return nil, fmt.Errorf("failed to specify addrs: %s", unspecAddrs)
	}

	log.Event(context.TODO(), "interfaceListenAddresses", func() logging.Loggable {
		var addrs []string
		for _, addr := range outputAddrs {
			addrs = append(addrs, addr.String())
		}
		return logging.Metadata{"addresses": addrs}
	}())

	log.Debug("ResolveUnspecifiedAddresses:", unspecAddrs, ifaceAddrs, outputAddrs)
	return outputAddrs, nil
}

// InterfaceAddresses returns a list of addresses associated with local machine
// Note: we do not return link local addresses. IP loopback is ok, because we
// may be connecting to other nodes in the same machine.
func InterfaceAddresses() ([]ma.Multiaddr, error) {
	maddrs, err := manet.InterfaceMultiaddrs()
	if err != nil {
		return nil, err
	}
	log.Debug("InterfaceAddresses: from manet:", maddrs)

	var out []ma.Multiaddr
	for _, a := range maddrs {
		if !AddrOverNonLocalIP(a) {
			// log.Debug("InterfaceAddresses: skipping unusable:", a)
			continue
		}

		out = append(out, a)
	}

	log.Debug("InterfaceAddresses: usable:", out)
	return out, nil
}

// AddrInList returns whether or not an address is part of a list.
// this is useful to check if NAT is happening (or other bugs?)
func AddrInList(addr ma.Multiaddr, list []ma.Multiaddr) bool {
	for _, addr2 := range list {
		if addr.Equal(addr2) {
			return true
		}
	}
	return false
}

// AddrIsShareableOnWAN returns whether the given address should be shareable on the
// wide area network (wide internet).
func AddrIsShareableOnWAN(addr ma.Multiaddr) bool {
	s := ma.Split(addr)
	if len(s) < 1 {
		return false
	}
	a := s[0]
	if manet.IsIPLoopback(a) || manet.IsIP6LinkLocal(a) || manet.IsIPUnspecified(a) {
		return false
	}
	return manet.IsThinWaist(a)
}

// WANShareableAddrs filters addresses based on whether they're shareable on WAN
func WANShareableAddrs(inp []ma.Multiaddr) []ma.Multiaddr {
	return FilterAddrs(inp, AddrIsShareableOnWAN)
}

// Subtract filters out all addrs in b from a
func Subtract(a, b []ma.Multiaddr) []ma.Multiaddr {
	return FilterAddrs(a, func(m ma.Multiaddr) bool {
		for _, bb := range b {
			if m.Equal(bb) {
				return false
			}
		}
		return true
	})
}

// CheckNATWarning checks if our observed addresses differ. if so,
// informs the user that certain things might not work yet
func CheckNATWarning(observed, expected ma.Multiaddr, listen []ma.Multiaddr) {
	if observed.Equal(expected) {
		return
	}

	if !AddrInList(observed, listen) { // probably a nat
		log.Warningf(natWarning, observed, listen)
	}
}

const natWarning = `Remote peer observed our address to be: %s
The local addresses are: %s
Thus, connection is going through NAT, and other connections may fail.

IPFS NAT traversal is still under development. Please bug us on github or irc to fix this.
Baby steps: http://jbenet.static.s3.amazonaws.com/271dfcf/baby-steps.gif
`
