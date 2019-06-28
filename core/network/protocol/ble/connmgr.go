package ble

import (
	"sync"
	"time"

	blema "berty.tech/core/network/protocol/ble/multiaddr"
	peer "github.com/libp2p/go-libp2p-peer"
	yamux "github.com/libp2p/go-yamux"
	ma "github.com/multiformats/go-multiaddr"
)

type reader struct {
	sync.Mutex
	funcSlice []func(*Conn)
}

var (
	conns   sync.Map
	readers sync.Map
)

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

// Returns an existing conn
func getConn(rAddr string) *Conn {
	c, ok := conns.Load(rAddr)
	if !ok {
		return nil
	}
	return c.(*Conn)
}

// Returns an existing reader or create a new one
func getOrCreateReader(rAddr string) *reader {
	c, ok := readers.Load(rAddr)
	if !ok {
		newReader := &reader{
			funcSlice: make([]func(*Conn), 0),
		}
		readers.Store(rAddr, newReader)
		return newReader
	}
	return c.(*reader)
}

// TODO: refactor this and function below
func makeFunc(tmp []byte) func(c *Conn) {
	return func(c *Conn) {
		c.incomingData <- tmp
	}
}

func ReceiveFromDevice(rAddr string, b []byte) {
	tmp := make([]byte, len(b))
	copy(tmp, b)
	r := getOrCreateReader(rAddr)
	r.funcSlice = append(r.funcSlice, makeFunc(tmp))
	go func() {
		r.Lock()
		defer r.Unlock()
		for {
			if conn := getConn(rAddr); conn != nil {
				r.funcSlice[0](conn)
				r.funcSlice = r.funcSlice[1:]
				return
			}
		}
	}()
}

func ConnClosedWithDevice(rAddr string) {
	if conn := getConn(rAddr); conn != nil {
		conns.Delete(rAddr)
		conn.sess.Close()
	}
}
