package ipfsutil

import (
	"context"
	"errors"
	"fmt"
	"io"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	ma "github.com/multiformats/go-multiaddr"
	madns "github.com/multiformats/go-multiaddr-dns"
	"go.uber.org/multierr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

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

func ParseAndResolveMaddrs(ctx context.Context, logger *zap.Logger, addrs []string) ([]*peer.AddrInfo, error) {
	// Resolve all addresses
	outPeersUnmatched := make([]*peer.AddrInfo, len(addrs))
	var (
		errs    error
		outLock sync.Mutex
		wg      sync.WaitGroup
	)
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

			addrStrings := make([]string, len(rdvpeer.Addrs))
			for i, maddr := range rdvpeer.Addrs {
				addrStrings[i] = maddr.String()
			}
			logger.Debug("rdvp peer resolved addrs",
				logutil.PrivateString("input", addr),
				// logutil.PrivateString("ID", rdvpeer.ID.Pretty()),
				logutil.PrivateStrings("addrs", addrStrings),
			)
			outPeersUnmatched[j] = rdvpeer
		}(i, v)
	}
	wg.Wait()
	if errs != nil {
		return nil, errs
	}
	// Match peers by ID
	outPeersMatched := make(map[peer.ID][]ma.Multiaddr)
	for _, v := range outPeersUnmatched {
		outPeersMatched[v.ID] = append(outPeersMatched[v.ID], v.Addrs...)
	}

	// Create the ultimate *peer.AddrInfo
	var outPeers []*peer.AddrInfo
	for id, maddrs := range outPeersMatched {
		outPeers = append(outPeers, &peer.AddrInfo{
			ID:    id,
			Addrs: maddrs,
		})
	}

	return outPeers, nil
}

var ErrExpectedEOF = errors.New("red data when expecting EOF")

const DefaultCloseTimeout = time.Second * 5

func FullClose(s network.Stream) error {
	// Start the close.
	err := s.CloseWrite()
	if err != nil {
		return err
	}

	// We don't want to wait indefinitely
	_ = s.SetDeadline(time.Now().Add(DefaultCloseTimeout))

	// Trying with a long slice to fetch `n`.
	n, err := s.Read([]byte{0})
	if n > 0 || err == nil {
		_ = s.Reset()
		return ErrExpectedEOF
	}
	if err == io.EOF {
		return nil
	}
	_ = s.Reset()
	return err
}
