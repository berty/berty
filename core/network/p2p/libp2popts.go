package p2p

// This file wraps all libp2p configuration options

import (
	"net"

	libp2p "github.com/libp2p/go-libp2p"
	circuit "github.com/libp2p/go-libp2p-circuit"
	crypto "github.com/libp2p/go-libp2p-crypto"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	pnet "github.com/libp2p/go-libp2p-interface-pnet"
	metrics "github.com/libp2p/go-libp2p-metrics"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	"github.com/libp2p/go-libp2p/config"
	ma "github.com/multiformats/go-multiaddr"
)

func WithLibp2pOption(opts ...libp2p.Option) Option {
	return func(dc *driverConfig) error {
		for _, o := range opts {
			dc.libp2pOpt = append(dc.libp2pOpt, o)
		}
		return nil
	}
}

// WithListenAddrStrings configures libp2p to listen on the given (unparsed)
// addresses.
func WithListenAddrStrings(s ...string) Option {
	return WithLibp2pOption(libp2p.ListenAddrStrings(s...))
}

// WithListenAddrs configures libp2p to listen on the given addresses.
func WithListenAddrs(addrs ...ma.Multiaddr) Option {
	return WithLibp2pOption(libp2p.ListenAddrs(addrs...))
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
	return WithLibp2pOption(libp2p.Security(name, tpt))
}

// WithInsecure is an option that completely disables all transport security.
// It's incompatible with all other transport security protocols.
func WithInsecure() Option {
	return WithLibp2pOption(libp2p.NoSecurity)
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
	return WithLibp2pOption(libp2p.Muxer(name, tpt))

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
	return WithLibp2pOption(libp2p.Transport(tpt))
}

// WithPeerstore configures libp2p to use the given peerstore.
func WithPeerstore(ps pstore.Peerstore) Option {
	return WithLibp2pOption(libp2p.Peerstore(ps))
}

// WithPrivateNetwork configures libp2p to use the given private network protector.
func WithPrivateNetwork(prot pnet.Protector) Option {
	return WithLibp2pOption(libp2p.PrivateNetwork(prot))
}

// WithBandwidthReporter configures libp2p to use the given bandwidth reporter.
func WithBandwidthReporter(rep metrics.Reporter) Option {
	return WithLibp2pOption(libp2p.BandwidthReporter(rep))
}

// WithIdentity configures libp2p to use the given private key to identify itself.
func WithIdentity(sk crypto.PrivKey) Option {
	return WithLibp2pOption(libp2p.Identity(sk))
}

// WithConnectionManager configures libp2p to use the given connection manager.
func WithConnectionManager(connman ifconnmgr.ConnManager) Option {
	return WithLibp2pOption(libp2p.ConnectionManager(connman))
}

// WithAddrsFactory configures libp2p to use the given address factory.
func WithAddrsFactory(factory config.AddrsFactory) Option {
	return WithLibp2pOption(libp2p.AddrsFactory(factory))
}

// WithRelay configures libp2p to enable the relay transport.
func WithRelay(options ...circuit.RelayOpt) Option {
	return WithLibp2pOption(libp2p.EnableRelay(options...))
}

// WithFilterAddresses configures libp2p to never dial nor accept connections from
// the given addresses.
func WithFilterAddresses(addrs ...*net.IPNet) Option {
	return WithLibp2pOption(libp2p.FilterAddresses(addrs...))
}

// WithNATPortMap configures libp2p to use the default NATManager. The default
// NATManager will attempt to open a port in your network's firewall using UPnP.
func WithNATPortMap() Option {
	return WithLibp2pOption(libp2p.NATPortMap())
}

// WithNATManager will configure libp2p to use the requested NATManager. This
// function should be passed a NATManager *constructor* that takes a libp2p Network.
func WithNATManager(nm config.NATManagerC) Option {
	return WithLibp2pOption(libp2p.NATManager(nm))
}

// bellow are warpers around default libp2p options

// WithDefaultSecurity use secio as defalt security transport
// cf. https://github.com/libp2p/go-libp2p-secio
func WithDefaultSecurity() Option {
	return WithLibp2pOption(libp2p.DefaultSecurity)
}

// WithRandomIdentity generates a random identity as default identity
func WithRandomIdentity() Option {
	return WithLibp2pOption(libp2p.RandomIdentity)
}

// WithDefaultPeerstore configures libp2p to use the default peerstore.
func WithDefaultPeerstore() Option {
	return WithLibp2pOption(libp2p.DefaultPeerstore)
}

// WithDefaultMuxers configures libp2p to use the stream connection multiplexers.
func WithDefaultMuxers() Option {
	return WithLibp2pOption(libp2p.DefaultMuxers)
}

// WithDefaultTransports are the default libp2p transports. tcp/ws
func WithDefaultTransports() Option {
	return WithLibp2pOption(libp2p.DefaultTransports)
}

// WithDefaults Fallback on default values with above options if not defined
func WithDefaults() Option {
	return WithLibp2pOption(libp2p.FallbackDefaults)
}
