package mc

import (
	"context"
	"io"
	"sync"
	"time"

	peer "github.com/libp2p/go-libp2p-core/peer"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"

	mcdrv "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/driver"
)

// Connmgr keeps tracks of opened conn so the native driver can read from them
// and close them.
var connMap sync.Map

// newConn returns an inbound or outbound tpt.CapableConn upgraded from a Conn.
func newConn(ctx context.Context, t *Transport, remoteMa ma.Multiaddr,
	remotePID peer.ID, inbound bool) (tpt.CapableConn, error) {
	// Creates a manet.Conn
	pr, pw := io.Pipe()
	connCtx, cancel := context.WithCancel(gListener.ctx)

	maconn := &Conn{
		readIn:   pw,
		readOut:  pr,
		localMa:  gListener.localMa,
		remoteMa: remoteMa,
		ctx:      connCtx,
		cancel:   cancel,
	}

	// Stores the conn in connMap, will be deleted during conn.Close()
	connMap.Store(maconn.RemoteAddr().String(), maconn)

	// Returns an upgraded CapableConn (muxed, addr filtered, secured, etc...)
	if inbound {
		return t.upgrader.UpgradeInbound(ctx, t, maconn)
	}
	return t.upgrader.UpgradeOutbound(ctx, t, maconn, remotePID)
}

// ReceiveFromPeer is called by native driver when peer's device sent data.
func ReceiveFromPeer(remotePID string, payload []byte) {
	// TODO: implement a cleaner way to do that
	// Checks during 100 ms if the conn is available, because remote device can
	// be ready to write while local device is still creating the new conn.
	for i := 0; i < 100; i++ {
		c, ok := connMap.Load(remotePID)
		if ok {
			_, err := c.(*Conn).readIn.Write(payload)
			if err != nil {
				logger.Error("receive from peer: write", zap.Error(err))
			}
			return
		}
		time.Sleep(1 * time.Millisecond)
	}

	logger.Error(
		"connmgr failed to read from conn: unknown conn",
		zap.String("remote address", remotePID),
	)
	mcdrv.CloseConnWithPeer(remotePID)
}
