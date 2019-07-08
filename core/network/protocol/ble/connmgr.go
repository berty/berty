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

	connMap.Store(maconn.RemoteAddr().String(), maconn)

	if inbound {
		return t.upgrader.UpgradeInbound(ctx, t, maconn)
	} else {
		return t.upgrader.UpgradeOutbound(ctx, t, maconn, rPID)
	}
}

// ReceiveFromDevice is called by native driver when peer's device sent data.
func ReceiveFromDevice(rAddr string, payload []byte) {
	// Checks during 100 ms if the conn is available, because remote device can
	// be ready to write while local device is still creating the new conn.
	for i := 0; i < 100; i++ {
		c, ok := connMap.Load(rAddr)
		if ok {
			logger().Debug("RECEIVEFROMDEV CALL FOR CONN " + rAddr)
			c.(*Conn).readIn.Write(payload)
			return
		}
		time.Sleep(1 * time.Millisecond)
		logger().Debug("WAIT RECEIVE FOR CONN " + rAddr)
	}

	logger().Error(
		"connmgr failed to read from conn: unknown conn",
		zap.String("remote address", rAddr),
	)
	bledrv.CloseConnWithDevice(rAddr)
}
