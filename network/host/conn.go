package host

import (
	"fmt"
	"sort"

	state "berty.tech/network/state"
	mable "berty.tech/network/transport/ble/multiaddr"
	mamc "berty.tech/network/transport/mc/multiaddr"
	circuit "github.com/libp2p/go-libp2p-circuit"
	inet "github.com/libp2p/go-libp2p-net"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
)

type BestAddr func(i, j ma.Multiaddr) bool

func NoopBestConn(_, _ inet.Conn) bool { return true }

type sortedBestConns struct {
	conns   []inet.Conn
	bestcmp BestAddr
}

func SortBestConns(conns []inet.Conn, bestcmp BestAddr) {
	sort.Sort(&sortedBestConns{conns, bestcmp})
}

// Less reports whether the element with
// index i should sort before the element with index j.
func (sc sortedBestConns) Less(i, j int) bool {
	return !sc.bestcmp(sc.conns[i].RemoteMultiaddr(), sc.conns[j].RemoteMultiaddr())
}

// Swap swaps the elements with indexes i and j.
func (sc sortedBestConns) Swap(i, j int) { sc.conns[i], sc.conns[j] = sc.conns[j], sc.conns[i] }

// Len is the number of elements in the collection.
func (sc sortedBestConns) Len() int { return len(sc.conns) }

func SortBestAddrs(maddrs []ma.Multiaddr, bestcmp BestAddr) {
	sort.Sort(&sortedBestAddrs{maddrs, bestcmp})
}

type sortedBestAddrs struct {
	maddrs  []ma.Multiaddr
	bestcmp BestAddr
}

// Less reports whether the element with
// index i should sort before the element with index j.
func (sm sortedBestAddrs) Less(i, j int) bool {
	return !sm.bestcmp(sm.maddrs[i], sm.maddrs[j])
}

// Swap swaps the elements with indexes i and j.
func (sm sortedBestAddrs) Swap(i, j int) { sm.maddrs[i], sm.maddrs[j] = sm.maddrs[j], sm.maddrs[i] }

// Len is the number of elements in the collection.
func (sm sortedBestAddrs) Len() int { return len(sm.maddrs) }

// EvalAddrMobile, score an addr, higher is better
func EvalAddrMobile(m ma.Multiaddr) (score int) {
	s := state.Global().GetState()
	if s.Network == state.Cellular && manet.IsPrivateAddr(m) {
		score = -1
		return
	}

	ma.ForEach(m, func(c ma.Component) bool {
		if score != 0 {
			return true
		}

		switch c.Protocol().Code {
		case ma.P_QUIC:
			score = 5
		case ma.P_TCP:
			score = 4
		// @TODO: is this usefull?
		case circuit.P_CIRCUIT:
			score = 3
		case mamc.P_MC:
			score = 2
		case mable.P_BLE:
			score = 1
		}
		return true
	})

	// add 10 on a private addr
	if manet.IsPrivateAddr(m) {
		score += 10
	}

	return
}

// EvalAddr, score an addr, higher is better
func EvalAddr(m ma.Multiaddr) (score int) {
	ma.ForEach(m, func(c ma.Component) bool {
		if score != 0 {
			return true
		}

		switch c.Protocol().Code {
		case ma.P_TCP:
			score = 5
		case ma.P_QUIC:
			score = 4
		// @TODO: is this usefull?
		case circuit.P_CIRCUIT:
			score = 3
		case mamc.P_MC:
			score = 2
		case mable.P_BLE:
			score = 1
		}
		return true
	})

	// add 10 on a private addr
	if manet.IsPrivateAddr(m) {
		score += 10
	}

	return
}

func NewBestAddrHandler(mobile bool) BestAddr {
	var eval func(ma.Multiaddr) int
	if mobile {
		eval = EvalAddrMobile
	} else {
		eval = EvalAddr
	}

	return func(i, j ma.Multiaddr) bool {
		si := eval(i)
		sj := eval(j)
		return si > sj
	}
}

func DescribeMultiaddr(m ma.Multiaddr) string {
	c, nextm := ma.SplitFirst(m)
	ret := c.Protocol().Name
	if nextm != nil {
		return fmt.Sprintf("%s/%s", ret, DescribeMultiaddr(nextm))
	}

	return ret
}
