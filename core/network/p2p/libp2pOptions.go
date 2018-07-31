package p2p

// This file wraps all libp2p configuration options

import (
	"net"

	libp2p "github.com/libp2p/go-libp2p"
	crypto "github.com/libp2p/go-libp2p-crypto"
	pnet "github.com/libp2p/go-libp2p-interface-pnet"
	metrics "github.com/libp2p/go-libp2p-metrics"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	"github.com/libp2p/go-libp2p/config"
)

// WithListenAddrStrings configures libp2p to listen on the given (unparsed)
// addresses.
func WithListenAddrStrings(s ...string) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.ListenAddrStrings(s...))
		return nil
	}
}

// WithListenAddrs configures libp2p to listen on the given addresses.
func WithListenAddrs(addrs ...ma.Multiaddr) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.ListenAddrs(addrs...))
		return nil
	}
}

// WithSecurity configures libp2p to use the given security transport (or transport
// constructor).
//
// Name is the protocol name.
//
// The transport can be a constructed security.Transport or a function taking
// any subset of this libp2p node's:
// * Public key
// * Private key
// * Peer ID
// * Host
// * Network
// * Peerstore
func WithSecurity(name string, tpt interface{}) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.Security(name, tpt))
		return nil
	}
}

// WithInsecure is an option that completely disables all transport security.
// It's incompatible with all other transport security protocols.
func WithInsecure() Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.Insecure())
		return nil
	}
}

// WithMuxer configures libp2p to use the given stream multiplexer (or stream
// multiplexer constructor).
//
// Name is the protocol name.
//
// The transport can be a constructed mux.Transport or a function taking any
// subset of this libp2p node's:
// * Peer ID
// * Host
// * Network
// * Peerstore
func WithMuxer(name string, tpt interface{}) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.Muxer(name, tpt))
		return nil
	}

}

// WithTransport configures libp2p to use the given transport (or transport
// constructor).
//
// The transport can be a constructed transport.Transport or a function taking
// any subset of this libp2p node's:
// * Transport Upgrader (*tptu.Upgrader)
// * Host
// * Stream muxer (muxer.Transport)
// * Security transport (security.Transport)
// * Private network protector (pnet.Protector)
// * Peer ID
// * Private Key
// * Public Key
// * Address filter (filter.Filter)
// * Peerstore
func WithTransport(tpt interface{}) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.Transport)
		return nil
	}
}

// WithPeerstore configures libp2p to use the given peerstore.
func WithPeerstore(ps pstore.Peerstore) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.Peerstore(ps))
		return nil
	}
}

// WithPrivateNetwork configures libp2p to use the given private network protector.
func WithPrivateNetwork(prot pnet.Protector) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.PrivateNetwork(prot))
		return nil
	}
}

// WithBandwidthReporter configures libp2p to use the given bandwidth reporter.
func WithBandwidthReporter(rep metrics.Reporter) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.BandwidthReporter(rep))
		return nil
	}
}

// WithIdentity configures libp2p to use the given private key to identify itself.
func WithIdentity(sk crypto.PrivKey) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.Identity(sk))
		return nil
	}
}

// WithConnectionManager configures libp2p to use the given connection manager.
func WithConnectionManager(connman ifconnmgr.ConnManager) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.ConnectionManager(connman))
		return nil
	}
}

// WithAddrsFactory configures libp2p to use the given address factory.
func WithAddrsFactory(factory config.AddrsFactory) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.AddrsFactory(factory))
		return nil
	}
}

// WithEnableRelay configures libp2p to enable the relay transport.
func WithRelay(options ...circuit.RelayOpt) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.EnableRelay(options...))
		return nil
	}
}

// WithFilterAddresses configures libp2p to never dial nor accept connections from
// the given addresses.
func WithFilterAddresses(addrs ...*net.IPNet) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.FilterAddresses(addrs...))
		return nil
	}
}

// WithNATPortMap configures libp2p to use the default NATManager. The default
// NATManager will attempt to open a port in your network's firewall using UPnP.
func WithNATPortMap() Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.NATPortMap())
		return nil
	}
}

// WithNATManager will configure libp2p to use the requested NATManager. This
// function should be passed a NATManager *constructor* that takes a libp2p Network.
func WithNATManager(nm config.NATManagerC) Option {
	return func(dc *DriverConfig) error {
		dc.libp2pOpt = append(dc.libp2pOpt, libp2p.NATManager(nm))
		return nil
	}
}
