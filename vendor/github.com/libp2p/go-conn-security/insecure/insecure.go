package insecure

import (
	"context"
	"net"

	security "github.com/libp2p/go-conn-security"

	ci "github.com/libp2p/go-libp2p-crypto"
	peer "github.com/libp2p/go-libp2p-peer"
)

// ID is the multistream-select protocol ID that should be used when identifying
// this security transport.
const ID = "/plaintext/1.0.0"

// Transport is a no-op stream security transport. It provides no
// security and simply wraps connections in blank
type Transport struct {
	id peer.ID
}

// New constructs a new insecure transport.
func New(id peer.ID) *Transport {
	return &Transport{
		id: id,
	}
}

// LocalPeer returns the transports local peer ID.
func (t *Transport) LocalPeer() peer.ID {
	return t.id
}

// LocalPrivateKey returns nil. This transport is not secure.
func (t *Transport) LocalPrivateKey() ci.PrivKey {
	return nil
}

// SecureInbound *pretends to secure* an outbound connection to the given peer.
func (t *Transport) SecureInbound(ctx context.Context, insecure net.Conn) (security.Conn, error) {
	return &Conn{
		Conn:  insecure,
		local: t.id,
	}, nil
}

// SecureOutbound *pretends to secure* an outbound connection to the given peer.
func (t *Transport) SecureOutbound(ctx context.Context, insecure net.Conn, p peer.ID) (security.Conn, error) {
	return &Conn{
		Conn:   insecure,
		local:  t.id,
		remote: p,
	}, nil
}

// Conn is the connection type returned by the insecure transport.
type Conn struct {
	net.Conn
	local  peer.ID
	remote peer.ID
}

// LocalPeer returns the local peer ID.
func (ic *Conn) LocalPeer() peer.ID {
	return ic.local
}

// RemotePeer returns the remote peer ID if we initiated the dial. Otherwise, it
// returns "" (because this connection isn't actually secure).
func (ic *Conn) RemotePeer() peer.ID {
	return ic.remote
}

// RemotePublicKey returns nil. This connection is not secure
func (ic *Conn) RemotePublicKey() ci.PubKey {
	return nil
}

// LocalPrivateKey returns nil. This connection is not secure.
func (ic *Conn) LocalPrivateKey() ci.PrivKey {
	return nil
}

var _ security.Transport = (*Transport)(nil)
var _ security.Conn = (*Conn)(nil)
