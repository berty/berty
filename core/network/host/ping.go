package host

import (
	"bytes"
	"context"
	"errors"
	"io"
	"time"

	u "github.com/ipfs/go-ipfs-util"
	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"

	p2pp "github.com/libp2p/go-libp2p/p2p/protocol/ping"
	"go.uber.org/zap"
)

// PingService a fork of p2pp.PingService, but a the capability to ping a
// signle conn
type PingService struct {
	ping *p2pp.PingService
}

// Keep the same ID as ipfs ping service, so we can ping them as well.
const ID = p2pp.ID

// Keep the same PingSize as ipfs ping service, so we can ping them as well.
var PingSize = p2pp.PingSize

func NewPingService(h host.Host) *PingService {
	ping := p2pp.NewPingService(h)
	return &PingService{ping}
}

func (ps *PingService) PingConn(ctx context.Context, c inet.Conn) (<-chan time.Duration, error) {
	s, err := c.NewStream()
	if err != nil {
		return nil, err
	}

	sw := NewStreamWrapper(s, ID)
	out := make(chan time.Duration)
	go func() {
		defer close(out)
		defer sw.Reset()
		for {
			select {
			case <-ctx.Done():
				return
			default:
				t, err := ping(sw)
				if err != nil {
					logger().Warn("ping error", zap.Error(err))
					return
				}

				select {
				case out <- t:
				case <-ctx.Done():
					return
				}
			}
		}
	}()

	return out, nil
}

func (ps *PingService) Ping(ctx context.Context, p peer.ID) (<-chan time.Duration, error) {
	return ps.ping.Ping(ctx, p)
}

// p2pp.ping is not exposed, so we need to duplicate this here
func ping(s inet.Stream) (time.Duration, error) {
	buf := make([]byte, PingSize)
	u.NewTimeSeededRand().Read(buf)

	before := time.Now()
	_, err := s.Write(buf)
	if err != nil {
		return 0, err
	}

	rbuf := make([]byte, PingSize)
	_, err = io.ReadFull(s, rbuf)
	if err != nil {
		return 0, err
	}

	if !bytes.Equal(buf, rbuf) {
		return 0, errors.New("ping packet was incorrect!")
	}

	return time.Since(before), nil
}
