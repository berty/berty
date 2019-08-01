package berty

import (
	fmt "fmt"
	"strings"

	inet "github.com/libp2p/go-libp2p-net"
	ma "github.com/multiformats/go-multiaddr"
)

func getDirection(dir inet.Direction) ConnMetadata_Direction {
	switch dir {
	case inet.DirUnknown:
		return ConnMetadata_DirUnknown
	case inet.DirInbound:
		return ConnMetadata_DirInbound
	case inet.DirOutbound:
		return ConnMetadata_DirOutbound
	}

	return ConnMetadata_DirUnknown
}

func getProtocols(m ma.Multiaddr) (ps []*Protocol) {
	ma.ForEach(m, func(c ma.Component) bool {
		p := &Protocol{
			Name:  c.Protocol().Name,
			Value: c.Value(),
		}

		ps = append(ps, p)
		return true
	})

	return
}

func getAddr(m ma.Multiaddr) *Addr {
	return &Addr{
		Full:      m.String(),
		Protocols: getProtocols(m),
	}
}

func NewConnMetadataFromConn(c inet.Conn) *ConnMetadata {
	raddr := getAddr(c.RemoteMultiaddr())
	laddr := getAddr(c.LocalMultiaddr())

	return &ConnMetadata{
		Direction:  getDirection(c.Stat().Direction),
		RemoteAddr: raddr,
		LocalAddr:  laddr,
	}
}
func (p *Protocol) ToString() string {
	return p.Name + ":" + p.Value
}

func (a *Addr) ToString() string {
	ps := make([]string, len(a.Protocols))
	for i, p := range a.Protocols {
		ps[i] = p.Name
	}

	return fmt.Sprintf("%s (%s)", a.Full, strings.Join(ps, ","))
}

func (m *ConnMetadata) ToString() string {
	switch m.Direction {
	case ConnMetadata_DirInbound:
		return fmt.Sprintf("from %s", m.RemoteAddr.ToString())
	case ConnMetadata_DirOutbound:
		return fmt.Sprintf("to %s", m.RemoteAddr.ToString())
	default:
		return m.RemoteAddr.ToString()
	}
}
