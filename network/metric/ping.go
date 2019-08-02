package metric

import (
	"bytes"
	"context"
	"errors"
	"io"
	"time"

	"berty.tech/network/helper"
	u "github.com/ipfs/go-ipfs-util"
	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	p2pp "github.com/libp2p/go-libp2p/p2p/protocol/ping"
)

// PingService a fork of p2pp.PingService, but a the capability to ping a
// signle conn
type PingService struct {
	host host.Host
}

// Keep the same ID as ipfs ping service, so we can ping them as well.
const ID = p2pp.ID

// PingSize is the same PingSize as ipfs ping service, so we can ping them as well.
var PingSize = p2pp.PingSize

func NewPingService(h host.Host) *PingService {
	return &PingService{h}
}

func (ps *PingService) PingConn(ctx context.Context, c inet.Conn) <-chan p2pp.Result {
	s, err := c.NewStream()
	if err != nil {
		ch := make(chan p2pp.Result, 1)
		ch <- p2pp.Result{Error: err}
		close(ch)
		return ch
	}

	ctx, cancel := context.WithCancel(ctx)
	sw := helper.NewStreamWrapper(s, ID)

	out := make(chan p2pp.Result)
	go func() {
		defer close(out)
		defer cancel()

		for ctx.Err() == nil {
			var res p2pp.Result
			res.RTT, res.Error = ping(sw)

			// canceled, ignore everything.
			if ctx.Err() != nil {
				return
			}

			select {
			case out <- res:
			case <-ctx.Done():
				return
			}
		}
	}()
	go func() {
		// forces the ping to abort.
		<-ctx.Done()
		sw.Reset()
	}()

	return out
}

func (ps *PingService) Ping(ctx context.Context, p peer.ID) <-chan p2pp.Result {
	return p2pp.Ping(ctx, ps.host, p)
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
		return 0, errors.New("ping packet was incorrect")
	}

	return time.Since(before), nil
}
