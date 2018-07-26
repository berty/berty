package multiaddr

import (
	"encoding/base32"
	"encoding/binary"
	"fmt"
	"net"
	"strconv"
	"strings"

	mh "github.com/multiformats/go-multihash"
)

type Transcoder interface {
	StringToBytes(string) ([]byte, error)
	BytesToString([]byte) (string, error)
	ValidateBytes([]byte) error
}

func NewTranscoderFromFunctions(
	s2b func(string) ([]byte, error),
	b2s func([]byte) (string, error),
	val func([]byte) error,
) Transcoder {
	return twrp{s2b, b2s, val}
}

type twrp struct {
	strtobyte func(string) ([]byte, error)
	bytetostr func([]byte) (string, error)
	validbyte func([]byte) error
}

func (t twrp) StringToBytes(s string) ([]byte, error) {
	return t.strtobyte(s)
}
func (t twrp) BytesToString(b []byte) (string, error) {
	return t.bytetostr(b)
}

func (t twrp) ValidateBytes(b []byte) error {
	if t.validbyte == nil {
		return nil
	}
	return t.validbyte(b)
}

var TranscoderIP4 = NewTranscoderFromFunctions(ip4StB, ipBtS, nil)
var TranscoderIP6 = NewTranscoderFromFunctions(ip6StB, ipBtS, nil)

func ip4StB(s string) ([]byte, error) {
	i := net.ParseIP(s).To4()
	if i == nil {
		return nil, fmt.Errorf("failed to parse ip4 addr: %s", s)
	}
	return i, nil
}

func ip6StB(s string) ([]byte, error) {
	i := net.ParseIP(s).To16()
	if i == nil {
		return nil, fmt.Errorf("failed to parse ip6 addr: %s", s)
	}
	return i, nil
}

func ipBtS(b []byte) (string, error) {
	return net.IP(b).String(), nil
}

var TranscoderPort = NewTranscoderFromFunctions(portStB, portBtS, nil)

func portStB(s string) ([]byte, error) {
	i, err := strconv.Atoi(s)
	if err != nil {
		return nil, fmt.Errorf("failed to parse port addr: %s", err)
	}
	if i >= 65536 {
		return nil, fmt.Errorf("failed to parse port addr: %s", "greater than 65536")
	}
	b := make([]byte, 2)
	binary.BigEndian.PutUint16(b, uint16(i))
	return b, nil
}

func portBtS(b []byte) (string, error) {
	i := binary.BigEndian.Uint16(b)
	return strconv.Itoa(int(i)), nil
}

var TranscoderOnion = NewTranscoderFromFunctions(onionStB, onionBtS, nil)

func onionStB(s string) ([]byte, error) {
	addr := strings.Split(s, ":")
	if len(addr) != 2 {
		return nil, fmt.Errorf("failed to parse onion addr: %s does not contain a port number.", s)
	}

	// onion address without the ".onion" substring
	if len(addr[0]) != 16 {
		return nil, fmt.Errorf("failed to parse onion addr: %s not a Tor onion address.", s)
	}
	onionHostBytes, err := base32.StdEncoding.DecodeString(strings.ToUpper(addr[0]))
	if err != nil {
		return nil, fmt.Errorf("failed to decode base32 onion addr: %s %s", s, err)
	}

	// onion port number
	i, err := strconv.Atoi(addr[1])
	if err != nil {
		return nil, fmt.Errorf("failed to parse onion addr: %s", err)
	}
	if i >= 65536 {
		return nil, fmt.Errorf("failed to parse onion addr: %s", "port greater than 65536")
	}
	if i < 1 {
		return nil, fmt.Errorf("failed to parse onion addr: %s", "port less than 1")
	}

	onionPortBytes := make([]byte, 2)
	binary.BigEndian.PutUint16(onionPortBytes, uint16(i))
	bytes := []byte{}
	bytes = append(bytes, onionHostBytes...)
	bytes = append(bytes, onionPortBytes...)
	return bytes, nil
}

func onionBtS(b []byte) (string, error) {
	addr := strings.ToLower(base32.StdEncoding.EncodeToString(b[0:10]))
	port := binary.BigEndian.Uint16(b[10:12])
	return addr + ":" + strconv.Itoa(int(port)), nil
}

var TranscoderP2P = NewTranscoderFromFunctions(p2pStB, p2pBtS, p2pVal)

func p2pStB(s string) ([]byte, error) {
	// the address is a varint prefixed multihash string representation
	m, err := mh.FromB58String(s)
	if err != nil {
		return nil, fmt.Errorf("failed to parse p2p addr: %s %s", s, err)
	}
	return m, nil
}

func p2pVal(b []byte) error {
	_, err := mh.Cast(b)
	return err
}

func p2pBtS(b []byte) (string, error) {
	m, err := mh.Cast(b)
	if err != nil {
		return "", err
	}
	return m.B58String(), nil
}

var TranscoderUnix = NewTranscoderFromFunctions(unixStB, unixBtS, nil)

func unixStB(s string) ([]byte, error) {
	return []byte(s), nil
}

func unixBtS(b []byte) (string, error) {
	return string(b), nil
}
