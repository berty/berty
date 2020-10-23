package ipfsutil

import (
	"bytes"
	"fmt"
	"net"
	"sort"

	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/multierr"
)

type Multiaddrs []ma.Multiaddr

func NewMultiaddrs(m []ma.Multiaddr) Multiaddrs {
	ms := Multiaddrs(m)
	sort.Sort(ms)
	return ms
}

// Len is the number of elements in the collection.
func (ms Multiaddrs) Len() int { return len(ms) }

// Less reports whether the element with
// index i should sort before the element with index j.
func (ms Multiaddrs) Less(i, j int) bool { return bytes.Compare(ms[i].Bytes(), ms[j].Bytes()) < 0 }

// Swap swaps the elements with indexes i and j.
func (ms Multiaddrs) Swap(i, j int) { ms[i], ms[j] = ms[j], ms[i] }

// MultiaddrIsEqual return true if both slice are equal
func MultiaddrIsEqual(a Multiaddrs, b Multiaddrs) bool {
	if len(a) != len(b) {
		return false
	}

	for i := range a {
		if !a[i].Equal(b[i]) {
			return false
		}
	}

	return true
}

func ParseAddr(addr string) (ma.Multiaddr, error) {
	maddr, err := ma.NewMultiaddr(addr)
	if err == nil {
		return maddr, nil
	}

	// try to get a tcp multiaddr from host:port
	host, port, err := net.SplitHostPort(addr)
	if err != nil {
		return nil, err
	}
	if host == "" {
		host = "127.0.0.1"
	}

	addr = fmt.Sprintf("/ip4/%s/tcp/%s/", host, port)
	return ma.NewMultiaddr(addr)
}

func ParseAddrs(addrs ...string) ([]ma.Multiaddr, error) {
	maddrs := make([]ma.Multiaddr, len(addrs))

	var err error
	for i, addr := range addrs {
		var thisErr error
		maddrs[i], thisErr = ParseAddr(addr)
		err = multierr.Append(err, thisErr)
	}

	return maddrs, err
}
