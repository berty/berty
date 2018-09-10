package ble

import (
	"net"
	"time"

	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	rtpt "github.com/libp2p/go-reuseport-transport"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/satori/go.uuid"
	mafmt "github.com/whyrusleeping/mafmt"
	yamux "github.com/whyrusleeping/yamux"
)

type BLEConn struct {
	tpt.Conn
	opened            bool
	transport         *BLETransport
	lID               peer.ID
	rID               peer.ID
	lAddr             ma.Multiaddr
	rAddr             ma.Multiaddr
	notFinishedToRead []byte
	incoming          chan []byte
	sess              *yamux.Session
	accept            chan string
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
	Address string
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
	ma.AddProtocol(protoBLE)
}
