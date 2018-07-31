// package routing defines the interface for a routing system used by ipfs.
package routing

import (
	"context"
	"errors"

	ropts "github.com/libp2p/go-libp2p-routing/options"

	cid "github.com/ipfs/go-cid"
	ci "github.com/libp2p/go-libp2p-crypto"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
)

// ErrNotFound is returned when a search fails to find anything
var ErrNotFound = errors.New("routing: not found")

// ErrNotSupported is returned when a search or put fails because the key type
// isn't supported.
var ErrNotSupported = errors.New("routing: operation or key not supported")

// ContentRouting is a value provider layer of indirection. It is used to find
// information about who has what content.
type ContentRouting interface {
	// Provide adds the given cid to the content routing system. If 'true' is
	// passed, it also announces it, otherwise it is just kept in the local
	// accounting of which objects are being provided.
	Provide(context.Context, *cid.Cid, bool) error

	// Search for peers who are able to provide a given key
	FindProvidersAsync(context.Context, *cid.Cid, int) <-chan pstore.PeerInfo
}

// PeerRouting is a way to find information about certain peers.
// This can be implemented by a simple lookup table, a tracking server,
// or even a DHT.
type PeerRouting interface {
	// Find specific Peer
	// FindPeer searches for a peer with given ID, returns a pstore.PeerInfo
	// with relevant addresses.
	FindPeer(context.Context, peer.ID) (pstore.PeerInfo, error)
}

// ValueStore is a basic Put/Get interface.
type ValueStore interface {

	// PutValue adds value corresponding to given Key.
	PutValue(context.Context, string, []byte, ...ropts.Option) error

	// GetValue searches for the value corresponding to given Key.
	GetValue(context.Context, string, ...ropts.Option) ([]byte, error)

	// TODO
	// SearchValue searches for better and better values from this value
	// store corresponding to the given Key. Implementations may halt the
	// search after a period of time or may continue searching indefinitely.
	//
	// Useful when you want a result *now* but still want to hear about
	// better/newer results.
	//SearchValue(context.Context, string, ...ropts.Option) (<-chan []byte, error)
}

// IpfsRouting is the combination of different routing types that ipfs
// uses. It can be satisfied by a single item (such as a DHT) or multiple
// different pieces that are more optimized to each task.
type IpfsRouting interface {
	ContentRouting
	PeerRouting
	ValueStore

	// Bootstrap allows callers to hint to the routing system to get into a
	// Boostrapped state
	Bootstrap(context.Context) error

	// TODO expose io.Closer or plain-old Close error
}

// PubKeyFetcher is an interfaces that should be implemented by value stores
// that can optimize retrieval of public keys.
//
// TODO(steb): Consider removing, see #22.
type PubKeyFetcher interface {
	// GetPublicKey returns the public key for the given peer.
	GetPublicKey(context.Context, peer.ID) (ci.PubKey, error)
}

// KeyForPublicKey returns the key used to retrieve public keys
// from a value store.
func KeyForPublicKey(id peer.ID) string {
	return "/pk/" + string(id)
}

// GetPublicKey retrieves the public key associated with the given peer ID from
// the value store.
//
// If the ValueStore is also a PubKeyFetcher, this method will call GetPublicKey
// (which may be better optimized) instead of GetValue.
func GetPublicKey(r ValueStore, ctx context.Context, p peer.ID) (ci.PubKey, error) {
	k, err := p.ExtractPublicKey()
	if err != nil {
		// An error means that the peer ID is invalid.
		return nil, err
	}
	if k != nil {
		return k, nil
	}

	if dht, ok := r.(PubKeyFetcher); ok {
		// If we have a DHT as our routing system, use optimized fetcher
		return dht.GetPublicKey(ctx, p)
	}
	key := KeyForPublicKey(p)
	pkval, err := r.GetValue(ctx, key)
	if err != nil {
		return nil, err
	}

	// get PublicKey from node.Data
	return ci.UnmarshalPublicKey(pkval)
}
