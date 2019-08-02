package host

import (
	libp2p "github.com/libp2p/go-libp2p"

	ble "berty.tech/network/transport/ble"

	libp2p_tls "github.com/libp2p/go-libp2p-tls"

	libp2p_mplex "github.com/libp2p/go-libp2p-mplex"
	libp2p_yamux "github.com/libp2p/go-libp2p-yamux"

	libp2p_pstoremem "github.com/libp2p/go-libp2p-peerstore/pstoremem"

	ma "github.com/multiformats/go-multiaddr"
)

const DefaultSwarmKey = `/key/swarm/psk/1.0.0/
/base16/
7beb018da4c79cb018e05305335d265046909f060c1b65e8eef94a107b9387cc`

var DefaultListeners = []string{
	"/ip4/0.0.0.0/tcp/0",
	"/ip4/0.0.0.0/udp/0/quic",
	ble.DefaultBind,
}

var libp2p_default_opts []libp2p.Option

var defaultListeners []ma.Multiaddr

func DefaultLibp2pOpts() []libp2p.Option {
	return []libp2p.Option{
		libp2p.Muxer("/mplex/6.7.0", libp2p_mplex.DefaultTransport),
		libp2p.Muxer("/yamux/1.0.0", libp2p_yamux.DefaultTransport),

		libp2p.Security(libp2p_tls.ID, libp2p_tls.New),
		// libp2p.Security(libp2p_secio.ID, libp2p_tls.New),

		libp2p.Peerstore(libp2p_pstoremem.NewPeerstore()),
	}
}

func Init() {
	defaultListeners := make([]ma.Multiaddr, len(DefaultListeners))
	for i, addr := range DefaultListeners {
		maddr, err := ma.NewMultiaddr(addr)
		if err != nil {
			panic(err)
		}

		defaultListeners[i] = maddr
	}
}
