package p2p

import (
	"context"
	"io"

	host "github.com/libp2p/go-libp2p-host"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	ma "github.com/multiformats/go-multiaddr"
	mstream "github.com/multiformats/go-multistream"
	"go.uber.org/zap"
)

// Host is an object to interact with the network
type Host struct {
	n    inet.Network
	mux  *mstream.MultistreamMuxer
	cmgr ifconnmgr.ConnManager
}

// NewHost Create fresh Host instance
func NewHost(n inet.Network) *Host {
	h := &Host{
		n:    n,
		cmgr: &ifconnmgr.NullConnMgr{},
		mux:  mstream.NewMultistreamMuxer(),
	}

	n.SetStreamHandler(h.newStreamHandler)
	return h
}

var _ host.Host = (*Host)(nil)

// Addrs returns the listen addresses of the Host
func (h *Host) Addrs() []ma.Multiaddr {
	addrs, err := h.n.InterfaceListenAddresses()
	if err != nil {
		zap.L().Warn("error retrieving network interface addrs: ", zap.Error(err))
		return nil
	}

	return addrs
}

// Network returns the Network interface of the Host
func (h *Host) Network() inet.Network {
	return h.n
}

// Close shuts down the host, its Network, and services.
func (h *Host) Close() error {
	return h.n.Close()
}

// Connect ensures there is a connection between this host and the peer with
// given peer.ID. Connect will absorb the addresses in pi into its internal
// peerstore. If there is not an active connection, Connect will issue a
// h.Network.Dial, and block until a connection is open, or an error is
// returned.
func (h *Host) Connect(ctx context.Context, pi pstore.PeerInfo) error {
	// absorb addresses into peerstore
	h.Peerstore().AddAddrs(pi.ID, pi.Addrs, pstore.TempAddrTTL)

	cs := h.n.ConnsToPeer(pi.ID)
	if len(cs) > 0 {
		return nil
	}

	_, err := h.Network().DialPeer(ctx, pi.ID)
	return err
}

// Peerstore returns the Host's repository of Peer Addresses and Keys.
func (h *Host) Peerstore() pstore.Peerstore {
	return h.n.Peerstore()
}

// ID returns the (local) peer.ID associated with this Host
func (h *Host) ID() peer.ID {
	return h.n.LocalPeer()
}

// NewStream opens a new stream to given peer p, and writes a p2p/protocol
// header with given protocol.ID. If there is no connection to p, attempts
// to create one. If ProtocolID is "", writes no header.
// (Threadsafe)
func (h *Host) NewStream(ctx context.Context, p peer.ID, protos ...protocol.ID) (inet.Stream, error) {
	s, err := h.n.NewStream(ctx, p)
	if err != nil {
		return nil, err
	}

	var protoStrs []string
	for _, pid := range protos {
		protoStrs = append(protoStrs, string(pid))
	}

	selected, err := mstream.SelectOneOf(protoStrs, s)
	if err != nil {
		if errClose := s.Close(); errClose != nil {
			zap.L().Error("An occurred while closing a stream", zap.Error(errClose))
		}
		return nil, err
	}

	selpid := protocol.ID(selected)
	s.SetProtocol(selpid)
	if err := h.Peerstore().AddProtocols(p, selected); err != nil {
		zap.L().Warn("Failed to add protocol to peerstore", zap.Error(err))
	}

	return s, nil
}

// RemoveStreamHandler removes a handler on the mux that was set by
// SetStreamHandler
func (h *Host) RemoveStreamHandler(p protocol.ID) {
	h.Mux().RemoveHandler(string(p))
}

// SetStreamHandler sets the protocol handler on the Host's Mux.
// This is equivalent to:
//   host.Mux().SetHandler(proto, handler)
// (Threadsafe)
func (h *Host) SetStreamHandler(pid protocol.ID, handler inet.StreamHandler) {
	h.Mux().AddHandler(string(pid), func(p string, rwc io.ReadWriteCloser) error {
		is := rwc.(inet.Stream)
		is.SetProtocol(protocol.ID(p))
		handler(is)
		return nil
	})
}

// SetStreamHandlerMatch sets the protocol handler on the Host's Mux
// using a matching function for protocol selection.
func (h *Host) SetStreamHandlerMatch(pid protocol.ID, m func(string) bool, handler inet.StreamHandler) {
	h.Mux().AddHandlerWithFunc(string(pid), m, func(p string, rwc io.ReadWriteCloser) error {
		is := rwc.(inet.Stream)
		is.SetProtocol(protocol.ID(p))
		handler(is)
		return nil
	})
}

// newStreamHandler is the remote-opened stream handler for inet.Network
func (h *Host) newStreamHandler(s inet.Stream) {

	protoID, handle, err := h.Mux().Negotiate(s)
	if err != nil {
		zap.L().Warn("protocol mux failed", zap.Error(err))
		if err := s.Close(); err != nil {
			zap.L().Warn("failed to close stream", zap.Error(err))
		}
		return
	}

	s.SetProtocol(protocol.ID(protoID))

	go func() {
		if err := handle(protoID, s); err != nil {
			zap.L().Error("Error while handling stream", zap.Error(err))
		}
	}()
}

// Mux returns the Mux multiplexing incoming streams to protocol handlers
func (h *Host) Mux() *mstream.MultistreamMuxer {
	return h.mux
}

// ConnManager returns this hosts connection manager
func (h *Host) ConnManager() ifconnmgr.ConnManager {
	return h.cmgr
}
