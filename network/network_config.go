package network

import (
	"fmt"

	"berty.tech/network/protocol/berty"
)

var DefaultBootstrap = []string{
	"/ip4/51.158.71.240/udp/4004/quic/ipfs/QmeYFvq4VV5RU1k1wBw3J5ZZLYxTE6H3AAKMzCAavuBjTp",
	"/ip4/51.158.71.240/tcp/4004/ipfs/QmeYFvq4VV5RU1k1wBw3J5ZZLYxTE6H3AAKMzCAavuBjTp",
	"/ip4/51.158.71.240/tcp/443/ipfs/QmeYFvq4VV5RU1k1wBw3J5ZZLYxTE6H3AAKMzCAavuBjTp",
	"/ip4/51.158.71.240/tcp/80/ipfs/QmeYFvq4VV5RU1k1wBw3J5ZZLYxTE6H3AAKMzCAavuBjTp",
	"/ip4/51.158.67.118/udp/4004/quic/ipfs/QmS88MDaMZUQeEvVdRAFmMfMz96b19Y79VJ6wQJnf4dwoo",
	"/ip4/51.158.67.118/tcp/4004/ipfs/QmS88MDaMZUQeEvVdRAFmMfMz96b19Y79VJ6wQJnf4dwoo",
	"/ip4/51.158.67.118/tcp/443/ipfs/QmS88MDaMZUQeEvVdRAFmMfMz96b19Y79VJ6wQJnf4dwoo",
	"/ip4/51.158.67.118/tcp/80/ipfs/QmS88MDaMZUQeEvVdRAFmMfMz96b19Y79VJ6wQJnf4dwoo",
	"/ip4/51.15.221.60/udp/4004/quic/ipfs/QmZP7oAGikmrMLAmf7ooNtnarYdDWki4Wru2sJ5H5kgCw3",
	"/ip4/51.15.221.60/tcp/4004/ipfs/QmZP7oAGikmrMLAmf7ooNtnarYdDWki4Wru2sJ5H5kgCw3",
	"/ip4/51.15.221.60/tcp/443/ipfs/QmZP7oAGikmrMLAmf7ooNtnarYdDWki4Wru2sJ5H5kgCw3",
	"/ip4/51.15.221.60/tcp/80/ipfs/QmZP7oAGikmrMLAmf7ooNtnarYdDWki4Wru2sJ5H5kgCw3",
}

var BootstrapIpfs = []string{
	"/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
	"/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
	"/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
	"/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
	"/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
}

type Config struct {
	bootstrapAddrs []string
	cache          *PeerCache
}

type Option func(net *Network) error

func (n *Network) apply(opts ...Option) error {
	for i, opt := range opts {
		if err := opt(n); err != nil {
			return fmt.Errorf("option %d failed: %s", i, err)
		}
	}

	return nil
}

// WithMessageHandler handle new berty message, this can be override afterward by
// using SetMessageHandler
func WithMessageHandler(handler func(*berty.Message, *berty.ConnMetadata)) Option {
	return func(n *Network) error {
		n.handler = handler
		return nil
	}
}

// WithPeerCache cache on peers
func WithPeerCache() Option {
	return func(n *Network) error {
		n.cache = NewPeerCache(n.host)
		return nil
	}
}

// WithLocalContactID set the current localContactID, this can be override afterward
// by using SetLocalContactID
func WithLocalContactID(lcontactID string) Option {
	return func(n *Network) error {
		n.localContactID = lcontactID
		return nil
	}
}

func WithBootstrap(addrs ...string) Option {
	return func(n *Network) error {
		n.bootstrapAddrs = addrs
		return nil
	}
}
