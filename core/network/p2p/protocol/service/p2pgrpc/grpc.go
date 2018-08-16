package p2pgrpc

import (
	"context"
	"fmt"
	"net"
	"time"

	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	protocol "github.com/libp2p/go-libp2p-protocol"
	"go.uber.org/zap"

	"berty.tech/core/network/p2p/p2putil"
)

const ID = "/berty/grpc"

func getGrpcID(proto string) string {
	return ID + "/" + proto
}

type P2Pgrpc struct {
	host host.Host
}

func NewP2PGrpcService(host host.Host) *P2Pgrpc {
	return &P2Pgrpc{host}
}

func (pg *P2Pgrpc) hasProtocol(proto string) bool {
	for _, p := range pg.host.Mux().Protocols() {
		if proto == p {
			return true
		}
	}

	return false
}

func (pg *P2Pgrpc) NewListener(proto string) net.Listener {
	id := getGrpcID(proto)

	if pg.hasProtocol(id) {
		zap.L().Warn("Proto already registered", zap.String("pid", id))
		return nil
	}

	pid := protocol.ID(id)
	fclose := func() error {
		pg.host.RemoveStreamHandler(pid)
		return nil
	}

	l, handler := p2putil.NewListener(fclose, pid)
	pg.host.SetStreamHandler(pid, handler)

	return l
}

func (pg *P2Pgrpc) NewDialer(proto string) func(string, time.Duration) (net.Conn, error) {
	pid := protocol.ID(getGrpcID(proto))
	return func(target string, timeout time.Duration) (net.Conn, error) {
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()

		peerID, err := peer.IDB58Decode(target)
		if err != nil {
			return nil, fmt.Errorf("Failed to parse `%s`: %s", target, err.Error())
		}

		// No stream exist, creating a new one
		zap.L().Debug("Dialing", zap.String("addr", target))

		s, err := pg.host.NewStream(ctx, peerID, pid)
		if err != nil {
			zap.L().Error("new stream failed ", zap.Error(err))
			return nil, err
		}

		c, err := p2putil.NewConnFromStream(s)
		if err != nil {
			return nil, err
		}

		return c, nil
	}
}
