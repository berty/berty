package csms

import (
	"context"
	"fmt"
	"net"

	connsec "github.com/libp2p/go-conn-security"
	peer "github.com/libp2p/go-libp2p-peer"
	mss "github.com/multiformats/go-multistream"
)

// SSMuxer is a multistream stream security transport multiplexer.
//
// SSMuxer is safe to use without initialization. However, it's not safe to move
// after use.
type SSMuxer struct {
	mux             mss.MultistreamMuxer
	tpts            map[string]connsec.Transport
	OrderPreference []string
}

var _ connsec.Transport = (*SSMuxer)(nil)

// AddTransport adds a stream security transport to this multistream muxer.
//
// This method is *not* thread-safe. It should be called only when initializing
// the SSMuxer.
func (sm *SSMuxer) AddTransport(path string, transport connsec.Transport) {
	if sm.tpts == nil {
		sm.tpts = make(map[string]connsec.Transport, 1)
	}

	sm.mux.AddHandler(path, nil)
	sm.tpts[path] = transport
	sm.OrderPreference = append(sm.OrderPreference, path)
}

// SecureInbound secures an inbound connection using this multistream
// multiplexed stream security transport.
func (sm *SSMuxer) SecureInbound(ctx context.Context, insecure net.Conn) (connsec.Conn, error) {
	tpt, err := sm.selectProto(ctx, insecure, true)
	if err != nil {
		return nil, err
	}
	return tpt.SecureInbound(ctx, insecure)
}

// SecureOutbound secures an outbound connection using this multistream
// multiplexed stream security transport.
func (sm *SSMuxer) SecureOutbound(ctx context.Context, insecure net.Conn, p peer.ID) (connsec.Conn, error) {
	tpt, err := sm.selectProto(ctx, insecure, false)
	if err != nil {
		return nil, err
	}
	return tpt.SecureOutbound(ctx, insecure, p)
}

func (sm *SSMuxer) selectProto(ctx context.Context, insecure net.Conn, server bool) (connsec.Transport, error) {
	var proto string
	var err error
	done := make(chan struct{})
	go func() {
		defer close(done)
		if server {
			proto, _, err = sm.mux.Negotiate(insecure)
		} else {
			proto, err = mss.SelectOneOf(sm.OrderPreference, insecure)
		}
	}()

	select {
	case <-done:
		if err != nil {
			return nil, err
		}
		if tpt, ok := sm.tpts[proto]; ok {
			return tpt, nil
		}
		return nil, fmt.Errorf("selected unknown security transport")
	case <-ctx.Done():
		// We *must* do this. We have outstanding work on the connection
		// and it's no longer safe to use.
		insecure.Close()
		return nil, ctx.Err()
	}
}
