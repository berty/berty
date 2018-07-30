package multiaddr

import (
	"encoding/binary"
	"fmt"
	"math/bits"
	"strings"
)

// Protocol is a Multiaddr protocol description structure.
type Protocol struct {
	Code       int
	Size       int // a size of -1 indicates a length-prefixed variable size
	Name       string
	VCode      []byte
	Path       bool // indicates a path protocol (eg unix, http)
	Transcoder Transcoder
}

// You **MUST** register your multicodecs with
// https://github.com/multiformats/multicodec before adding them here.
//
// TODO: Use a single source of truth for all multicodecs instead of
// distributing them like this...
const (
	P_IP4   = 0x0004
	P_TCP   = 0x0006
	P_UDP   = 0x0111
	P_DCCP  = 0x0021
	P_IP6   = 0x0029
	P_QUIC  = 0x01CC
	P_SCTP  = 0x0084
	P_UDT   = 0x012D
	P_UTP   = 0x012E
	P_UNIX  = 0x0190
	P_P2P   = 0x01A5
	P_IPFS  = 0x01A5 // alias for backwards compatability
	P_HTTP  = 0x01E0
	P_HTTPS = 0x01BB
	P_ONION = 0x01BC
)

// These are special sizes
const (
	LengthPrefixedVarSize = -1
)

// Protocols is the list of multiaddr protocols supported by this module.
var Protocols = []Protocol{
	protoIP4,
	protoTCP,
	protoUDP,
	protoDCCP,
	protoIP6,
	protoSCTP,
	protoONION,
	protoUTP,
	protoUDT,
	protoQUIC,
	protoHTTP,
	protoHTTPS,
	protoP2P,
	protoUNIX,
}

var (
	protoIP4  = Protocol{P_IP4, 32, "ip4", CodeToVarint(P_IP4), false, TranscoderIP4}
	protoTCP  = Protocol{P_TCP, 16, "tcp", CodeToVarint(P_TCP), false, TranscoderPort}
	protoUDP  = Protocol{P_UDP, 16, "udp", CodeToVarint(P_UDP), false, TranscoderPort}
	protoDCCP = Protocol{P_DCCP, 16, "dccp", CodeToVarint(P_DCCP), false, TranscoderPort}
	protoIP6  = Protocol{P_IP6, 128, "ip6", CodeToVarint(P_IP6), false, TranscoderIP6}
	// these require varint
	protoSCTP  = Protocol{P_SCTP, 16, "sctp", CodeToVarint(P_SCTP), false, TranscoderPort}
	protoONION = Protocol{P_ONION, 96, "onion", CodeToVarint(P_ONION), false, TranscoderOnion}
	protoUTP   = Protocol{P_UTP, 0, "utp", CodeToVarint(P_UTP), false, nil}
	protoUDT   = Protocol{P_UDT, 0, "udt", CodeToVarint(P_UDT), false, nil}
	protoQUIC  = Protocol{P_QUIC, 0, "quic", CodeToVarint(P_QUIC), false, nil}
	protoHTTP  = Protocol{P_HTTP, 0, "http", CodeToVarint(P_HTTP), false, nil}
	protoHTTPS = Protocol{P_HTTPS, 0, "https", CodeToVarint(P_HTTPS), false, nil}
	protoP2P   = Protocol{P_P2P, LengthPrefixedVarSize, "ipfs", CodeToVarint(P_P2P), false, TranscoderP2P}
	protoUNIX  = Protocol{P_UNIX, LengthPrefixedVarSize, "unix", CodeToVarint(P_UNIX), true, TranscoderUnix}
)

var ProtocolsByName = map[string]Protocol{}

func init() {
	for _, p := range Protocols {
		ProtocolsByName[p.Name] = p
	}

	// explicitly set both of these
	ProtocolsByName["p2p"] = protoP2P
	ProtocolsByName["ipfs"] = protoP2P
}

// SwapToP2pMultiaddrs is a function to make the transition from /ipfs/...
// multiaddrs to /p2p/... multiaddrs easier
// The first stage of the rollout is to ship this package to all users so
// that all users of multiaddr can parse both /ipfs/ and /p2p/ multiaddrs
// as the same code (P_P2P). During this stage of the rollout, all addresses
// with P_P2P will continue printing as /ipfs/, so that older clients without
// the new parsing code won't break.
// Once the network has adopted the new parsing code broadly enough, users of
// multiaddr can add a call to this method to an init function in their codebase.
// This will cause any P_P2P multiaddr to print out as /p2p/ instead of /ipfs/.
// Note that the binary serialization of this multiaddr does not change at any
// point. This means that this code is not a breaking network change at any point
func SwapToP2pMultiaddrs() {
	for i := range Protocols {
		if Protocols[i].Code == P_P2P {
			Protocols[i].Name = "p2p"
			break
		}
	}

	protoP2P.Name = "p2p"

	ProtocolsByName["ipfs"] = protoP2P
	ProtocolsByName["p2p"] = protoP2P
}

func AddProtocol(p Protocol) error {
	for _, pt := range Protocols {
		if pt.Code == p.Code {
			return fmt.Errorf("protocol code %d already taken by %q", p.Code, pt.Name)
		}
		if pt.Name == p.Name {
			return fmt.Errorf("protocol by the name %q already exists", p.Name)
		}
	}

	Protocols = append(Protocols, p)
	ProtocolsByName[p.Name] = p
	return nil
}

// ProtocolWithName returns the Protocol description with given string name.
func ProtocolWithName(s string) Protocol {
	return ProtocolsByName[s]
}

// ProtocolWithCode returns the Protocol description with given protocol code.
func ProtocolWithCode(c int) Protocol {
	for _, p := range Protocols {
		if p.Code == c {
			return p
		}
	}
	return Protocol{}
}

// ProtocolsWithString returns a slice of protocols matching given string.
func ProtocolsWithString(s string) ([]Protocol, error) {
	s = strings.Trim(s, "/")
	sp := strings.Split(s, "/")
	if len(sp) == 0 {
		return nil, nil
	}

	t := make([]Protocol, len(sp))
	for i, name := range sp {
		p := ProtocolWithName(name)
		if p.Code == 0 {
			return nil, fmt.Errorf("no protocol with name: %s", name)
		}
		t[i] = p
	}
	return t, nil
}

// CodeToVarint converts an integer to a varint-encoded []byte
func CodeToVarint(num int) []byte {
	buf := make([]byte, bits.Len(uint(num))/7+1)
	n := binary.PutUvarint(buf, uint64(num))
	return buf[:n]
}

// VarintToCode converts a varint-encoded []byte to an integer protocol code
func VarintToCode(buf []byte) int {
	num, _, err := ReadVarintCode(buf)
	if err != nil {
		panic(err)
	}
	return num
}

// ReadVarintCode reads a varint code from the beginning of buf.
// returns the code, and the number of bytes read.
func ReadVarintCode(buf []byte) (int, int, error) {
	num, n := binary.Uvarint(buf)
	if n < 0 {
		return 0, 0, fmt.Errorf("varints larger than uint64 not yet supported")
	}
	return int(num), n, nil
}
