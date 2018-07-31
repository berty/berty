package p2pgrpc

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/berty/berty/core/network/netutil"
	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	protocol "github.com/libp2p/go-libp2p-protocol"
	"go.uber.org/zap"
)

const protocolIDPrefix = "/berty/grpc/"

func getGrpcProtocolID(pid protocol.ID) protocol.ID {
	return protocol.ID(fmt.Sprintf("%s/%s", protocolIDPrefix, string(pid)))
}

type P2Pgrpc struct {
	h host.Host
}

func NewP2PGrpcService(h host.Host) *P2Pgrpc {
	return &P2Pgrpc{h}
}

func (pg *P2Pgrpc) NewListener(id protocol.ID) net.Listener {
	pid := getGrpcProtocolID(id)
	l := netutil.NewListener(pid)

	pg.h.SetStreamHandler(proto.ID(), l.HandleStream)
	return l

}

type dialer func(string, time.Duration) (net.Conn, error)

func (pg *P2Pgrpc) NewDialer(id protocol.ID) dialer {
	pid := getGrpcProtocolID(id)
	return func(target string, timeout time.Duration) (net.Conn, error) {
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()

		peerID, err := peer.IDB58Decode(target)
		if err != nil {
			return nil, fmt.Errorf("Failed to parse `%s`: %s", target, err.Error())
		}

		// No stream exist, creating a new one
		zap.L().Debug("Dialing", zap.String("addr", target))

		s, err := pg.h.NewStream(ctx, peerID, pid)
		if err != nil {
			zap.L().Error("new stream failed ", zap.Error(err))
			return nil, err
		}

		c, err := netutil.NewConnFromStream(s)
		if err != nil {
			return nil, err
		}

		return c, nil
	}
}
