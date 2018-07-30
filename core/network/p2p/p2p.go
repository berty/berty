package p2p

import (
	"context"

	"github.com/berty/berty/core/network/host"
	crypto "github.com/libp2p/go-libp2p-crypto"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	swarm "github.com/libp2p/go-libp2p-swarm"
)

// NewHost create a new host
func NewHost(privk crypto.PrivKey) (*host.Host, error) {
	pid, err := peer.IDFromPrivateKey(privk)
	if err != nil {
		return nil, err
	}

	ps := pstore.NewPeerstore()

	ctx := context.Background()
	swrm := swarm.NewSwarm(ctx, pid, ps, nil)

	return host.NewHost(swrm), nil
}
