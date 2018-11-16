// This file include some helper/warper options for the Driver

package p2p

import (
	"fmt"
	"net"
	"strings"

	"berty.tech/core/entity"
	"berty.tech/core/network/ble"
	grpc_ot "github.com/grpc-ecosystem/go-grpc-middleware/tracing/opentracing"
	"github.com/jinzhu/gorm"
	libp2p "github.com/libp2p/go-libp2p"
	circuit "github.com/libp2p/go-libp2p-circuit"
	crypto "github.com/libp2p/go-libp2p-crypto"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	pnet "github.com/libp2p/go-libp2p-interface-pnet"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
	metrics "github.com/libp2p/go-libp2p-metrics"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	"github.com/libp2p/go-libp2p/config"
	ma "github.com/multiformats/go-multiaddr"
	uuid "github.com/satori/go.uuid"
)

var DefaultBootstrap = []string{
	"/ip4/104.248.78.238/tcp/4004/ipfs/QmTeeg5PbTmrJKNiBndzmJmvpvBtZArhMxsgDdzxZXLE29",
	"/ip4/104.248.78.238/tcp/443/ipfs/QmTeeg5PbTmrJKNiBndzmJmvpvBtZArhMxsgDdzxZXLE29",
	"/ip4/104.248.78.238/tcp/80/ipfs/QmTeeg5PbTmrJKNiBndzmJmvpvBtZArhMxsgDdzxZXLE29",
}

var BootstrapIpfs = []string{
	"/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
	"/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
	"/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
	"/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
	"/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
}

type Option func(*driverConfig) error

func (c *driverConfig) Apply(opts ...Option) error {
	for i, opt := range opts {
		if err := opt(c); err != nil {
			return fmt.Errorf("option %d failed: %s", i, err)
		}
	}

	return nil
}

func WithMDNS() Option {
	return func(dc *driverConfig) error {
		dc.enableMDNS = true
		return nil
	}
}

// WithDHTOptions creates a new DHT with the specified options.
func WithDHTOptions(opts ...dhtopt.Option) Option {
	return func(dc *driverConfig) error {
		dc.dhtOpts = opts
		return nil
	}
}

// WithDHTBoostrapConfig specifies parameters used bootstrapping the DHT.
func WithDHTBoostrapConfig(bc *dht.BootstrapConfig) Option {
	return func(dc *driverConfig) error {
		dc.dhtBoostrapConfig = *bc
		return nil
	}
}

// WithBootstrap configure boostrap connection
func WithBootstrap(addrs ...string) Option {
	return func(dc *driverConfig) error {
		dc.bootstrap = addrs
		return nil
	}
}

// WithJaeger configure boostrap connection
func WithJaeger(jaeger *grpc_ot.Option) Option {
	return func(dc *driverConfig) error {
		dc.jaeger = jaeger
		return nil
	}
}

// WithBootstrapSync configure boostrap connection synchronously
func WithBootstrapSync(addrs ...string) Option {
	return func(dc *driverConfig) error {
		dc.bootstrapSync = true
		dc.bootstrap = addrs
		return nil
	}
}

// WithRelayClient will allow client to use relay
func WithRelayClient() Option {
	return WithRelay(circuit.OptActive)
}

// WithRelayHOP will create a relay hop that can be use by client
func WithRelayHOP() Option {
	return WithRelay(circuit.OptActive, circuit.OptHop)
}

func WithLibp2pOption(opts ...libp2p.Option) Option {
	return func(dc *driverConfig) error {
		for _, o := range opts {
			dc.libp2pOpt = append(dc.libp2pOpt, o)
		}
		return nil
	}
}

// all next methods wraps all libp2p configuration options

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

// WithTransportBle create ble transport
func WithTransportBle(maSlice []string, db *gorm.DB) Option {
	return func(dc *driverConfig) error {
		for i, v := range maSlice {
			if strings.HasPrefix(v, "/ble/") {
				var conf entity.Config
				err := db.First(&conf).Error
				if err != nil {
					id, err := uuid.NewV4()
					if err != nil {
						return err
					}
					conf.ID = id.String()
				}
				maSlice[i] = fmt.Sprintf("/ble/%s", conf.ID)
				sourceMultiAddr, err := ma.NewMultiaddr(maSlice[i])
				if err != nil {
					return err
				}
				bleTPT, err := ble.NewBLETransport(conf.ID, sourceMultiAddr)
				if err != nil {
					break
				}
				dc.libp2pOpt = append(dc.libp2pOpt, libp2p.Transport(bleTPT))
			}
		}
		return nil
	}
}
