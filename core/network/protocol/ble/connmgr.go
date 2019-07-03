package ble

import (
	"sync"
	"time"

	blema "berty.tech/core/network/protocol/ble/multiaddr"
	peer "github.com/libp2p/go-libp2p-peer"
	yamux "github.com/libp2p/go-yamux"
	ma "github.com/multiformats/go-multiaddr"
)

var conns sync.Map

type side int

const (
	client side = 0
	server side = 1
)

func newConn(transport *Transport, lID, rID peer.ID, lMa, rMa ma.Multiaddr, s side) *Conn {
	conn := Conn{
		incomingData:  make(chan []byte),
		remainingData: make([]byte, 0),
		transport:     transport,
		localID:       lID,
		remoteID:      rID,
		localMa:       lMa,
		remoteMa:      rMa,
		closed:        false,
		closer:        make(chan struct{}),
	}

	configDefault := yamux.DefaultConfig()
	configDefault.EnableKeepAlive = false            // No need for keepAlive
	configDefault.ConnectionWriteTimeout = time.Hour // Timeout is handled by BLE driver
	configDefault.LogOutput = getYamuxLogger()       // Output logs on Berty's logger

	var err error
	if s == server {
		conn.sess, err = yamux.Server(&conn, configDefault)
	} else {
		conn.sess, err = yamux.Client(&conn, configDefault)
	}
	if err != nil {
		panic(err)
	}

	st, _ := rMa.ValueForProtocol(blema.P_BLE)
	conns.Store(st, &conn)

	return &conn
}

// Returns an existing Conn or returns nil
func getConn(rAddr string) *Conn {
	c, ok := conns.Load(rAddr)
	if !ok {
		return nil
	}
	return c.(*Conn)
}

// Called by native driver when peer's device sent data
func ReceiveFromDevice(rAddr string, b []byte) {
	go func() {
		if conn := getConn(rAddr); conn != nil {
			conn.incomingData <- b
		}
	}()
}

// Called by native driver when peer's device closed the conn
func ConnClosedWithDevice(rAddr string) {
	if conn := getConn(rAddr); conn != nil {
		conns.Delete(rAddr)
		conn.sess.Close()
	}
}
