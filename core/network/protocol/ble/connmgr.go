package ble

import (
	"context"
	"sync"

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
	connCtx, cancel := context.WithCancel(ctx)
	maconn := &Conn{
		localMa:       t.listener.localMa,
		remoteMa:      rMa,
		incomingData:  make(chan []byte),
		remainingData: make([]byte, 0),
		ctx:           connCtx,
		cancel:        cancel,
	}
	logger().Debug("NEWCONN CALLED FOR CONN" + maconn.RemoteAddr().String())

	var cconn tpt.CapableConn
	var err error

	if inbound {
		cconn, err = t.upgrader.UpgradeInbound(ctx, t, maconn)
	} else {
		cconn, err = t.upgrader.UpgradeOutbound(ctx, t, maconn, rPID)
	}

	// If CapableConn creation succeeded, store it in map with remoteAddr as key
	// so native driver can read from it or close it.
	if err != nil {
		logger().Debug("ADD NEWCONN TO MAP FOR CONN" + maconn.RemoteAddr().String())
		connMap.Store(maconn.RemoteAddr().String(), cconn)
		logger().Debug("RETURN CONN FOR CONN" + maconn.RemoteAddr().String())
	}

	return cconn, err
}

// ReceiveFromDevice is called by native driver when peer's device sent data.
func ReceiveFromDevice(rAddr string, payload []byte) {
	go func() {
		c, ok := connMap.Load(rAddr)
		if ok {
			logger().Debug("RECEIVEFROMDEV CALL FOR CONN" + rAddr)
			c.(*Conn).incomingData <- payload
		} else {
			logger().Error(
				"connmgr failed to read from conn: unknown conn",
				zap.String("remote address", rAddr),
			)
		}
	}()
}

// ConnClosedWithDevice is called by native driver when peer's device closed the conn.
func ConnClosedWithDevice(rAddr string) {
	c, ok := connMap.Load(rAddr)
	if ok {
		logger().Debug("CONNCLOSED CALL FOR CONN" + rAddr)
		connMap.Delete(rAddr)
		if err := c.(tpt.CapableConn).Close(); err != nil {
			logger().Error(
				"connmgr failed to close conn",
				zap.String("remote address", rAddr),
				zap.Error(err),
			)
		}
	} else {
		logger().Error(
			"connmgr failed to close conn: unknown conn",
			zap.String("remote address", rAddr),
		)
	}
}
