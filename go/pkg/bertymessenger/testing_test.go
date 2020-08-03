package bertymessenger

import (
	"context"
	"net"

	"google.golang.org/grpc/test/bufconn"
)

func mkBufDialer(l *bufconn.Listener) func(context.Context, string) (net.Conn, error) {
	return func(context.Context, string) (net.Conn, error) {
		return l.Dial()
	}
}
