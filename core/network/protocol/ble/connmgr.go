package ble

import (
	"context"
	"io"
	"sync"
	"time"

	bledrv "berty.tech/core/network/protocol/ble/driver"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	peer "github.com/libp2p/go-libp2p-peer"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// Connmgr keeps tracks of opened conn so the native driver can read from them
// and close them.
var connMap sync.Map

// newConn returns an inbound or outbound tpt.CapableConn upgraded from a Conn.
func newConn(ctx context.Context, t *Transport, rMa ma.Multiaddr, rPID peer.ID, inbound bool) (tpt.CapableConn, error) {
	// Creates a BLE manet.Conn
	pr, pw := io.Pipe()
	connCtx, cancel := context.WithCancel(gListener.ctx)

	maconn := &Conn{
		readIn:   pw,
		readOut:  pr,
		localMa:  gListener.localMa,
		remoteMa: rMa,
		ctx:      connCtx,
		cancel:   cancel,
	}

	// Unlock gListener locked from discovery.go (HandlePeerFound)
	gListener.inUse.Done()

	// Stores the conn in connMap, will be deleted during conn.Close()
	connMap.Store(maconn.RemoteAddr().String(), maconn)

	// Returns an upgraded CapableConn (muxed, addr filtered, secured, etc...)
	if inbound {
		return t.upgrader.UpgradeInbound(ctx, t, maconn)
	} else {
		return t.upgrader.UpgradeOutbound(ctx, t, maconn, rPID)
	}
}

// ReceiveFromDevice is called by native driver when peer's device sent data.
func ReceiveFromDevice(rAddr string, payload []byte) {
	// TODO: implement a cleaner way to do that
	// Checks during 100 ms if the conn is available, because remote device can
	// be ready to write while local device is still creating the new conn.
	for i := 0; i < 100; i++ {
		c, ok := connMap.Load(rAddr)
		if ok {
			c.(*Conn).readIn.Write(payload)
			return
		}
		time.Sleep(1 * time.Millisecond)
	}

	logger().Error(
		"connmgr failed to read from conn: unknown conn",
		zap.String("remote address", rAddr),
	)
	bledrv.CloseConnWithDevice(rAddr)
}
