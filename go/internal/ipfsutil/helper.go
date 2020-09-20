package ipfsutil

import (
	"context"
	"errors"
	"fmt"
	"sync"

	peer "github.com/libp2p/go-libp2p-core/peer"
	ma "github.com/multiformats/go-multiaddr"
	madns "github.com/multiformats/go-multiaddr-dns"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// parseIpfsAddr is a function that takes in addr string and return ipfsAddrs
func ParseAndResolveIpfsAddr(ctx context.Context, addr string) (*peer.AddrInfo, error) {
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

func ParseAndResolveRdvpMaddrs(ctx context.Context, log *zap.Logger, addrs []string) ([]*peer.AddrInfo, error) {
	outPeers := make([]*peer.AddrInfo, len(addrs))
	var errs error
	var outLock sync.Mutex
	var wg sync.WaitGroup
	wg.Add(len(addrs))
	for i, v := range addrs {
		go func(j int, addr string) {
			defer wg.Done()

			rdvpeer, err := ParseAndResolveIpfsAddr(ctx, addr)
			if err != nil {
				outLock.Lock()
				defer outLock.Unlock()
				errs = multierr.Append(errs, err)
				return
			}

			fds := make([]zapcore.Field, len(rdvpeer.Addrs))
			for i, maddr := range rdvpeer.Addrs {
				key := fmt.Sprintf("#%d", i)
				fds[i] = zap.String(key, maddr.String())
			}
			log.Debug("rdvp peer resolved addrs", fds...)
			outLock.Lock()
			defer outLock.Unlock()
			outPeers[j] = rdvpeer
		}(i, v)
	}
	wg.Wait()
	if errs != nil {
		return nil, errs
	}
	return outPeers, nil
}
