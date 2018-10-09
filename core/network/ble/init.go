package ble

import (
	"fmt"
	"net"
	"time"

	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	rtpt "github.com/libp2p/go-reuseport-transport"
	smu "github.com/libp2p/go-stream-muxer"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/satori/go.uuid"
	mafmt "github.com/whyrusleeping/mafmt"
)

type BLEConn struct {
	tpt.Conn
	opened         bool
	transport      *BLETransport
	lid            peer.ID
	rid            peer.ID
	lAddr          ma.Multiaddr
	rAddr          ma.Multiaddr
	incomingStream BLEStream
	outgoingStream BLEStream
	incomingOpen   chan struct{}
	outgoingOpen   chan struct{}
	accept         chan string
}

// BLETransport is the TCP transport.
type BLETransport struct {
	MySelf host.Host

	// Explicitly disable reuseport.
	DisableReuseport bool

	//
	ID string

	lAddr ma.Multiaddr

	// TCP connect timeout
	ConnectTimeout time.Duration

	reuse rtpt.Transport
}

type BLEAddr struct {
	net.Addr
	addr string
}

type BLEStream struct {
	smu.Stream
	rAddr             ma.Multiaddr
	deadline          time.Time
	rdeadline         time.Time
	wdeadline         time.Time
	notFinishedToRead []byte
	incoming          chan []byte
}

// BLEListener implement ipfs Listener interface
type BLEListener struct {
	tpt.Listener
	transport       *BLETransport
	addr            string
	network         string
	incomingBLEUUID chan string
	incomingPeerID  chan string
	connected       map[string]*BLEConn
	lAddr           ma.Multiaddr
}

const P_BLE = 0x56

var TranscoderBLE = ma.NewTranscoderFromFunctions(bleStB, bleBtS, nil)

var BLE = mafmt.Or(mafmt.Base(P_BLE))

var protoBLE = ma.Protocol{
	Name:       "ble",
	Code:       P_BLE,
	Path:       false,
	Size:       128,
	VCode:      ma.CodeToVarint(P_BLE),
	Transcoder: TranscoderBLE,
}

func bleStB(s string) ([]byte, error) {
	id, err := uuid.FromString(s)
	if err != nil {
		return nil, err
	}
	return id.Bytes(), nil
}

func bleBtS(b []byte) (string, error) {
	id, err := uuid.FromBytes(b)
	if err != nil {
		return "", err
	}
	return id.String(), nil
}

func init() {
	fmt.Println("PROTOCOL BLE DEFINED")
	ma.AddProtocol(protoBLE)
}
