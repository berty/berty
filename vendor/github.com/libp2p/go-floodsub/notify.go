package floodsub

import (
	inet "github.com/libp2p/go-libp2p-net"
	ma "github.com/multiformats/go-multiaddr"
)

var _ inet.Notifiee = (*PubSubNotif)(nil)

type PubSubNotif PubSub

func (p *PubSubNotif) OpenedStream(n inet.Network, s inet.Stream) {
}

func (p *PubSubNotif) ClosedStream(n inet.Network, s inet.Stream) {
}

func (p *PubSubNotif) Connected(n inet.Network, c inet.Conn) {
	go func() {
		s, err := p.host.NewStream(p.ctx, c.RemotePeer(), p.rt.Protocols()...)
		if err != nil {
			log.Warning("opening new stream to peer: ", err, c.LocalPeer(), c.RemotePeer())
			return
		}

		select {
		case p.newPeers <- s:
		case <-p.ctx.Done():
			s.Reset()
		}
	}()
}

func (p *PubSubNotif) Disconnected(n inet.Network, c inet.Conn) {
}

func (p *PubSubNotif) Listen(n inet.Network, _ ma.Multiaddr) {
}

func (p *PubSubNotif) ListenClose(n inet.Network, _ ma.Multiaddr) {
}
