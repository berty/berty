package grpcutil

import (
	"context"
	"fmt"
	"io"
	"net"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/protocol"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"go.uber.org/multierr"

	"berty.tech/berty/v2/go/pkg/errcode"
)

const BertyGRPCEndpointPID protocol.ID = "/berty/0.0.1"

type libp2pListener struct {
	h host.Host

	incomingChan chan manet.Conn
	closeChan    chan struct{}
	closeLock    sync.Mutex
}

func ListenLibp2p(h host.Host) Listener {
	list := &libp2pListener{
		h:            h,
		incomingChan: make(chan manet.Conn),
		closeChan:    make(chan struct{}),
	}

	h.SetStreamHandler(BertyGRPCEndpointPID, list.handle)
	return list
}

func (l *libp2pListener) Accept() (manet.Conn, error) {
	select {
	case c := <-l.incomingChan:
		return c, nil
	case <-l.closeChan:
		return nil, errcode.ErrClosing
	}
}

func (l *libp2pListener) Close() error {
	l.closeLock.Lock()
	defer l.closeLock.Unlock()
	select {
	case <-l.closeChan:
		return errcode.ErrClosing
	default:
	}
	close(l.closeChan)
	l.h.RemoveStreamHandler(BertyGRPCEndpointPID)
	return nil
}

func (l *libp2pListener) Addr() net.Addr {
	return netAddrPeerIDMockup{id: l.h.ID()}
}

func (l *libp2pListener) Multiaddr() ma.Multiaddr {
	maddr, _ := ma.NewComponent("p2p", l.h.ID().String())
	return maddr
}

func (l *libp2pListener) GRPCMultiaddr() ma.Multiaddr {
	c, _ := ma.NewComponent("grpc", "")
	return l.Multiaddr().Encapsulate(c)
}

type netAddrPeerIDMockup struct {
	id peer.ID
}

func (netAddrPeerIDMockup) Network() string {
	return "p2p"
}

func (p netAddrPeerIDMockup) String() string {
	return p.id.String()
}

func (l *libp2pListener) handle(s network.Stream) {
	var netConn manet.Conn = &netConnBundler{
		networkStreamForwarder: s,
		s:                      s,
	}
	select {
	case l.incomingChan <- netConn:
	case <-l.closeChan:
		s.Reset() // nolint:errcheck
	}
}

type netConnBundler struct {
	networkStreamForwarder

	s network.Stream
}

// Theses are the function from the stream we want to keep
type networkStreamForwarder interface {
	io.ReadWriter

	SetDeadline(t time.Time) error
	SetReadDeadline(t time.Time) error
	SetWriteDeadline(t time.Time) error
}

func (n *netConnBundler) Close() error {
	return n.s.Reset()
}

func (n *netConnBundler) LocalMultiaddr() ma.Multiaddr {
	return n.s.Conn().LocalMultiaddr()
}

func (n *netConnBundler) LocalAddr() net.Addr {
	maddr, _ := manet.ToNetAddr(n.LocalMultiaddr())
	return maddr
}

func (n *netConnBundler) RemoteMultiaddr() ma.Multiaddr {
	return n.s.Conn().RemoteMultiaddr()
}

func (n *netConnBundler) RemoteAddr() net.Addr {
	maddr, _ := manet.ToNetAddr(n.RemoteMultiaddr())
	return maddr
}

func IsPeerIDOrP2PMaddr(target string) bool {
	// Is it a peerid ?
	_, err := peer.Decode(target)
	if err != nil {
		// No. Is it a maddr ?
		maddr, err := ma.NewMultiaddr(target)
		if err != nil {
			return false
		}
		var isP2P bool
		ma.ForEach(maddr, func(c ma.Component) bool {
			if c.Protocol().Code == ma.P_P2P {
				isP2P = true
				return false // break
			}
			return true // continue
		})
		return isP2P
	}
	return true
}

// NewDialContext returns a dialcontext function using the libp2p host, it expects the target string to be either a peer id, or `/p2p/peerID` terminated maddr.
func NewContextDialer(h host.Host) func(context.Context, string) (net.Conn, error) {
	return func(ctx context.Context, target string) (net.Conn, error) {
		// Is it a peerid ?
		id, perr := peer.Decode(target)
		if perr != nil {
			// No. Is it a maddr ?
			maddr, err := ma.NewMultiaddr(target)
			if err != nil {
				return nil, fmt.Errorf("target %q is neither peer ID or maddr (%w)", target, multierr.Combine(perr, err))
			}
			var lastP2P *ma.Component
			ma.ForEach(maddr, func(c ma.Component) bool {
				if c.Protocol().Code == ma.P_P2P {
					lastP2P = &c
				}
				return true // continue
			})
			if lastP2P == nil {
				return nil, fmt.Errorf("target %q is neither peer ID (%w) or p2p terminated maddr %q", target, perr, maddr.String())
			}
			id = peer.ID(lastP2P.Value())
			// Add the network part to the peerstore
			h.Peerstore().AddAddr(id, maddr.Decapsulate(lastP2P), time.Hour)
		}
		s, err := h.NewStream(ctx, id, BertyGRPCEndpointPID)
		if err != nil {
			return nil, err
		}
		return &netConnBundler{
			networkStreamForwarder: s,
			s:                      s,
		}, nil
	}
}
