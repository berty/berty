package p2p

import (
	"sync"

	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	ma "github.com/multiformats/go-multiaddr"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
)

// Metrics is a network.Metrics
var _ network.Metrics = (*Metrics)(nil)

type Metrics struct {
	host host.Host

	peersHandlers []func(*p2p.Peer) error
	muHPeers      sync.Mutex

	driver *Driver
}

func NewMetrics(d *Driver) network.Metrics {
	m := &Metrics{
		host:          d.host,
		driver:        d,
		peersHandlers: make([]func(*p2p.Peer) error, 0),
	}

	m.host.Network().Notify(m)
	return m
}

func (m *Metrics) Peers() *p2p.Peers {
	peers := m.peers()
	pis := &p2p.Peers{
		List: make([]*p2p.Peer, len(peers)),
	}

	for j, p := range peers {
		pis.List[j] = m.peerInfoToPeer(p)
	}

	return pis
}

func (m *Metrics) MonitorPeers(handler func(*p2p.Peer) error) {
	m.muHPeers.Lock()
	m.peersHandlers = append(m.peersHandlers, handler)
	m.muHPeers.Unlock()
}

func (m *Metrics) handlePeer(id peer.ID) {
	pi := m.host.Peerstore().PeerInfo(id)
	peer := m.peerInfoToPeer(pi)

	m.muHPeers.Lock()
	for i, h := range m.peersHandlers {
		if err := h(peer); err != nil {
			m.peersHandlers = append(m.peersHandlers[:i], m.peersHandlers[i+1:]...)
		}
	}
	m.muHPeers.Unlock()
}

func (m *Metrics) peers() []pstore.PeerInfo {
	return pstore.PeerInfos(m.host.Peerstore(), m.host.Peerstore().Peers())
}

func (m *Metrics) peerInfoToPeer(pi pstore.PeerInfo) *p2p.Peer {
	addrs := make([]string, len(pi.Addrs))
	for i, addr := range pi.Addrs {
		addrs[i] = addr.String()
	}

	var connection p2p.ConnectionType
	switch m.host.Network().Connectedness(pi.ID) {
	case inet.NotConnected:
		connection = p2p.ConnectionType_NOT_CONNECTED
		break
	case inet.Connected:
		connection = p2p.ConnectionType_CONNECTED
		break
	case inet.CanConnect:
		connection = p2p.ConnectionType_CAN_CONNECT
		break
	case inet.CannotConnect:
		connection = p2p.ConnectionType_CANNOT_CONNECT
		break
	default:
		connection = p2p.ConnectionType_NOT_CONNECTED

	}

	return &p2p.Peer{
		ID:         pi.ID.Pretty(),
		Addrs:      addrs,
		Connection: connection,
	}
}

func (m *Metrics) Listen(net inet.Network, a ma.Multiaddr)      {}
func (m *Metrics) ListenClose(net inet.Network, a ma.Multiaddr) {}
func (m *Metrics) OpenedStream(net inet.Network, s inet.Stream) {}
func (m *Metrics) ClosedStream(net inet.Network, s inet.Stream) {}

func (m *Metrics) Connected(s inet.Network, c inet.Conn) {
	go m.handlePeer(c.RemotePeer())
}

func (m *Metrics) Disconnected(s inet.Network, c inet.Conn) {
	go m.handlePeer(c.RemotePeer())
}
