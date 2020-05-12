package ipfsutil

import (
	"context"
	"errors"
	"fmt"

	"berty.tech/berty/v2/go/internal/tracer"
	peer "github.com/libp2p/go-libp2p-core/peer"
	madns "github.com/multiformats/go-multiaddr-dns"

	ma "github.com/multiformats/go-multiaddr"
)

// parseIpfsAddr is a function that takes in addr string and return ipfsAddrs
func ParseAndResolveIpfsAddr(ctx context.Context, addr string) (*peer.AddrInfo, error) {
	ctx, span := tracer.NewSpan(ctx)
	defer span.End()

	maddr, err := ma.NewMultiaddr(addr)
	if err != nil {
		return nil, err
	}

	if !madns.Matches(maddr) {
		return peer.AddrInfoFromP2pAddr(maddr)
	}

	addrs, err := madns.Resolve(ctx, maddr)
	if err != nil {
		return nil, err
	}
	if len(addrs) == 0 {
		return nil, errors.New("fail to resolve the multiaddr:" + maddr.String())
	}

	var info peer.AddrInfo
	for _, addr := range addrs {
		taddr, id := peer.SplitAddr(addr)
		if id == "" {
			// not an ipfs addr, skipping.
			continue
		}
		switch info.ID {
		case "":
			info.ID = id
		case id:
		default:
			return nil, fmt.Errorf(
				"ambiguous maddr %s could refer to %s or %s",
				maddr,
				info.ID,
				id,
			)
		}
		info.Addrs = append(info.Addrs, taddr)
	}
	return &info, nil
}
