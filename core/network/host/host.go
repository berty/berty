package host

import (
	"context"
	"io"
	"time"

	"github.com/apex/log"

	ihost "github.com/libp2p/go-libp2p-host"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"

	"github.com/libp2p/go-libp2p/p2p/protocol/identify"

	ma "github.com/multiformats/go-multiaddr"
	madns "github.com/multiformats/go-multiaddr-dns"
	msmux "github.com/multiformats/go-multistream"

	"go.uber.org/zap"
)

var (
	// DefaultNegotiationTimeout is the default value for HostOpts.NegotiationTimeout.
	DefaultNegotiationTimeout = time.Second * 60

	// DefaultAddrsFactory is the default value for HostOpts.AddrsFactory.
	DefaultAddrsFactory = func(addrs []ma.Multiaddr) []ma.Multiaddr { return addrs }
)

// AddrsFactory functions can be passed to New in order to override
// addresses returned by Addrs.
type AddrsFactory func([]ma.Multiaddr) []ma.Multiaddr

// Host is an object to interact with the network
type Host struct {
	network inet.Network
	mux     *msmux.MultistreamMuxer
	ids     *identify.IDService
	//	natmgr     nat.NATManager
	addrs      AddrsFactory
	maResolver *madns.Resolver
	cmgr       ifconnmgr.ConnManager

	negtimeout time.Duration

	//	proc goprocess.Process
}

var _ ihost.Host = (*Host)(nil)

// NewHost Create fresh Host instance
func NewHost(net inet.Network) *Host {
	h := &Host{
		network:    net,
		mux:        msmux.NewMultistreamMuxer(),
		negtimeout: DefaultNegotiationTimeout,
		addrs:      DefaultAddrsFactory,
		maResolver: madns.DefaultResolver,
	}

	net.SetConnHandler(h.newConnHandler)
	net.SetStreamHandler(h.newStreamHandler)
	return h
}

// Addrs returns the listen addresses of the Host
func (h *Host) Addrs() []ma.Multiaddr {
	addrs, err := h.network.InterfaceListenAddresses()
	if err != nil {
		zap.L().Error("Retrieving network interface addrs", zap.Error(err))
		return nil
	}

	return addrs
}

// Network returns the Network interface of the Host
func (h *Host) Network() inet.Network {
	return h.network
}

// Close shuts down the host, its Network, and services.
func (h *Host) Close() error {
	return h.Network().Close()
}

// Connect ensures there is a connection between this host and the peer with
// given peer.ID. Connect will absorb the addresses in pi into its internal
// peerstore. If there is not an active connection, Connect will issue a
// h.Network.Dial, and block until a connection is open, or an error is
// returned.
func (h *Host) Connect(ctx context.Context, pi pstore.PeerInfo) error {
	// absorb addresses into peerstore
	h.Peerstore().AddAddrs(pi.ID, pi.Addrs, pstore.TempAddrTTL)

	if h.Network().Connectedness(pi.ID) == inet.Connected {
		return nil
	}

	resolved, err := h.resolveAddrs(ctx, h.Peerstore().PeerInfo(pi.ID))
	if err != nil {
		return err
	}
	h.Peerstore().AddAddrs(pi.ID, resolved, pstore.TempAddrTTL)

	return h.dialPeer(ctx, pi.ID)
}

// dialPeer opens a connection to peer, and makes sure to identify
// the connection once it has been opened.
func (h *Host) dialPeer(ctx context.Context, p peer.ID) error {
	c, err := h.Network().DialPeer(ctx, p)
	if err != nil {
		return err
	}

	// Clear protocols on connecting to new peer to avoid issues caused
	// by misremembering protocols between reconnects
	if err = h.Peerstore().SetProtocols(p); err != nil {
		zap.L().Debug("SetProtocol error", zap.Error(err))
	}

	// identify the connection before returning.
	done := make(chan struct{})
	go func() {
		h.ids.IdentifyConn(c)
		close(done)
	}()

	// respect don contexteone
	select {
	case <-done:
	case <-ctx.Done():
		return ctx.Err()
	}

	return nil
}

func (h *Host) resolveAddrs(ctx context.Context, pi pstore.PeerInfo) ([]ma.Multiaddr, error) {
	proto := ma.ProtocolWithCode(ma.P_IPFS).Name
	p2paddr, err := ma.NewMultiaddr("/" + proto + "/" + pi.ID.Pretty())
	if err != nil {
		return nil, err
	}

	var addrs []ma.Multiaddr
	for _, addr := range pi.Addrs {
		addrs = append(addrs, addr)
		if !madns.Matches(addr) {
			continue
		}

		reqaddr := addr.Encapsulate(p2paddr)
		resaddrs, err := h.maResolver.Resolve(ctx, reqaddr)
		if err != nil {
			log.Infof("error resolving %s: %s", reqaddr, err)
		}
		for _, res := range resaddrs {
			pi, err := pstore.InfoFromP2pAddr(res)
			if err != nil {
				log.Infof("error parsing %s: %s", res, err)
			}
			addrs = append(addrs, pi.Addrs...)
		}
	}

	return addrs, nil
}

// Peerstore returns the Host's repository of Peer Addresses and Keys.
func (h *Host) Peerstore() pstore.Peerstore {
	return h.Network().Peerstore()
}

// ID returns the (local) peer.ID associated with this Host
func (h *Host) ID() peer.ID {
	return h.Network().LocalPeer()
}

// newConnHandler is the remote-opened conn handler for inet.Network
func (h *Host) newConnHandler(c inet.Conn) {
	// Clear protocols on connecting to new peer to avoid issues caused
	// by misremembering protocols between reconnects
	if err := h.Peerstore().SetProtocols(c.RemotePeer()); err != nil {
		zap.L().Debug("SetProtocol error", zap.Error(err))
	}

	h.ids.IdentifyConn(c)
}

// newStreamHandler is the remote-opened stream handler for inet.Network
// TODO: this feels a bit wonky
func (h *Host) newStreamHandler(s inet.Stream) {
	before := time.Now()

	if h.negtimeout > 0 {
		if err := s.SetDeadline(time.Now().Add(h.negtimeout)); err != nil {
			zap.L().Error("Setting stream deadline", zap.Error(err))
			if err = s.Reset(); err != nil {
				zap.L().Warn("Reset error", zap.Error(err))
			}
			return
		}
	}

	lzc, protoID, handle, err := h.Mux().NegotiateLazy(s)
	took := time.Since(before)
	if err != nil {
		if err != io.EOF {
			zap.L().Warn("Protocol mux failed", zap.String("peer", s.Conn().RemotePeer().String()), zap.Error(err), zap.Duration("took", took))
		}

		if err = s.Reset(); err != nil {
			zap.L().Warn("Reset error", zap.Error(err))
		}
		return
	}

	s = &streamWrapper{
		Stream: s,
		rw:     lzc,
	}

	if h.negtimeout > 0 {
		if err = s.SetDeadline(time.Time{}); err != nil {
			zap.L().Error("Resetting stream deadline", zap.Error(err))
			if err = s.Reset(); err != nil {
				zap.L().Warn("Reset error", zap.Error(err))
			}
			return
		}
	}

	s.SetProtocol(protocol.ID(protoID))

	zap.L().Debug("Protocol negotiation took", zap.Duration("took", took))

	go func() {
		if err := handle(protoID, s); err != nil {
			zap.L().Warn("handle error", zap.Error(err))
		}
	}()
}

// NewStream opens a new stream to given peer p, and writes a p2p/protocol
// header with given protocol.ID. If there is no connection to p, attempts
// to create one. If ProtocolID is "", writes no header.
// (Threadsafe)
func (h *Host) NewStream(ctx context.Context, p peer.ID, pids ...protocol.ID) (inet.Stream, error) {
	pref, err := h.preferredProtocol(p, pids)
	if err != nil {
		return nil, err
	}

	if pref != "" {
		return h.newStream(ctx, p, pref)
	}

	var protoStrs []string
	for _, pid := range pids {
		protoStrs = append(protoStrs, string(pid))
	}

	s, err := h.Network().NewStream(ctx, p)
	if err != nil {
		if errClose := s.Close(); errClose != nil {
			zap.L().Error("An occurred while closing a stream", zap.Error(errClose))
		}
		return nil, err
	}

	selected, err := msmux.SelectOneOf(protoStrs, s)
	if err != nil {
		if errReset := s.Reset(); errReset != nil {
			zap.L().Warn("Reset error", zap.Error(errReset))
		}

		return nil, err
	}
	selpid := protocol.ID(selected)
	s.SetProtocol(selpid)

	if err = h.Peerstore().AddProtocols(p, selected); err != nil {
		zap.L().Warn("AddProtocols error", zap.Error(err))
	}

	return s, nil
}

func (h *Host) newStream(ctx context.Context, p peer.ID, pid protocol.ID) (inet.Stream, error) {
	s, err := h.Network().NewStream(ctx, p)
	if err != nil {
		return nil, err
	}

	s.SetProtocol(pid)

	lzcon := msmux.NewMSSelect(s, string(pid))
	return &streamWrapper{
		Stream: s,
		rw:     lzcon,
	}, nil
}

// @TODO: Use relay relay as preferred protocol on mobile
// preferredProtocol to use
func (h *Host) preferredProtocol(p peer.ID, pids []protocol.ID) (protocol.ID, error) {
	pidstrs := pidsToStrings(pids)
	supported, err := h.Peerstore().SupportsProtocols(p, pidstrs...)
	if err != nil {
		return "", err
	}

	var out protocol.ID
	if len(supported) > 0 {
		out = protocol.ID(supported[0])
	}
	return out, nil
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

// AllAddrs returns all the addresses of BasicHost at this moment in time.
// It's ok to not include addresses if they're not available to be used now.
func (h *Host) AllAddrs() []ma.Multiaddr {
	addrs, err := h.Network().InterfaceListenAddresses()
	if err != nil {
		zap.L().Debug("Retrieving network interface addrs error", zap.Error(err))
	}

	if h.ids != nil { // add external observed addresses
		addrs = append(addrs, h.ids.OwnObservedAddrs()...)
	}

	// if h.natmgr != nil { // natmgr is nil if we do not use nat option.
	//      nat := h.natmgr.NAT()
	//      if nat != nil { // nat is nil if not ready, or no nat is available.
	//              addrs = append(addrs, nat.ExternalAddrs()...)
	//      }
	// }

	return addrs
}

// Mux returns the Mux multiplexing incoming streams to protocol handlers
func (h *Host) Mux() *msmux.MultistreamMuxer {
	return h.mux
}

// ConnManager returns this hosts connection manager
func (h *Host) ConnManager() ifconnmgr.ConnManager {
	return h.cmgr
}

func pidsToStrings(pids []protocol.ID) []string {
	out := make([]string, len(pids))
	for i, p := range pids {
		out[i] = string(p)
	}
	return out
}

var _ io.ReadWriteCloser = (*streamWrapper)(nil)

type streamWrapper struct {
	inet.Stream
	rw io.ReadWriter
}

// Read reads data from the connection.
// Read can be made to time out and return an Error with Timeout() == true
// after a fixed time limit; see SetDeadline and SetReadDeadline.
func (s *streamWrapper) Read(b []byte) (int, error) {
	return s.rw.Read(b)
}

// Write writes data to the connection.
// Write can be made to time out and return an Error with Timeout() == true
// after a fixed time limit; see SetDeadline and SetWriteDeadline.
func (s *streamWrapper) Write(b []byte) (int, error) {
	return s.rw.Write(b)
}

// Read reads data from the connection.
// Read can be made to time out and return an Error with Timeout() == true
// after a fixed time limit; see SetDeadline and SetReadDeadline.
func (s *streamWrapper) Close() error {
	return s.Stream.Close()
}
