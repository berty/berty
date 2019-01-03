package p2pgrpc

import (
	"context"
	"net"
	"time"

	host "github.com/libp2p/go-libp2p-host"
	protocol "github.com/libp2p/go-libp2p-protocol"
	"go.uber.org/zap"

	"berty.tech/core/network/p2p/p2putil"
	"berty.tech/core/pkg/tracing"
)

const ID = "/berty/grpc"

func GetGrpcID(proto string) string {
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

func (pg *P2Pgrpc) NewListener(ctx context.Context, proto string) net.Listener {
	tracer := tracing.EnterFunc(ctx, proto)
	defer tracer.Finish()
	// ctx = tracer.Context()

	id := GetGrpcID(proto)

	if pg.hasProtocol(id) {
		logger().Warn("protocol already registered", zap.String("pid", id))
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

func (pg *P2Pgrpc) NewDialer(ctx context.Context, proto string) func(string, time.Duration) (net.Conn, error) {
	pid := protocol.ID(GetGrpcID(proto))

	return func(target string, timeout time.Duration) (net.Conn, error) {
		tracer := tracing.EnterFunc(ctx, proto, target, timeout)
		defer tracer.Finish()
		ctx = tracer.Context()

		ctx, cancel := context.WithTimeout(ctx, timeout)
		defer cancel()

		return p2putil.NewDialer(pg.host, pid)(ctx, target)
	}
}
