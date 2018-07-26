package stream

import (
	"context"
	"fmt"
	"sync"

	logging "github.com/ipfs/go-log"
	tec "github.com/jbenet/go-temp-err-catcher"
	transport "github.com/libp2p/go-libp2p-transport"
	manet "github.com/multiformats/go-multiaddr-net"
)

var log = logging.Logger("stream-upgrader")

type connErr struct {
	conn transport.Conn
	err  error
}

type listener struct {
	manet.Listener

	transport transport.Transport
	upgrader  *Upgrader

	incoming chan transport.Conn
	err      error

	// Used for backpressure
	threshold *threshold

	// Canceling this context isn't sufficient to tear down the listener.
	// Call close.
	ctx    context.Context
	cancel func()
}

// Close closes the listener.
func (l *listener) Close() error {
	// Do this first to try to get any relevent errors.
	err := l.Listener.Close()

	l.cancel()
	// Drain and wait.
	for c := range l.incoming {
		c.Close()
	}
	return err
}

// handles inbound connections.
//
// This function does a few interesting things that should be noted:
//
// 1. It logs and discards temporary/transient errors (errors with a Temporary()
//    function that returns true).
// 2. It stops accepting new connections once AcceptQueueLength connections have
//    been fully negotiated but not accepted. This gives us a basic backpressure
//    mechanism while still allowing us to negotiate connections in parallel.
func (l *listener) handleIncoming() {
	var wg sync.WaitGroup
	defer func() {
		// make sure we're closed
		l.Listener.Close()
		if l.err == nil {
			l.err = fmt.Errorf("listener closed")
		}

		wg.Wait()
		close(l.incoming)
	}()

	var catcher tec.TempErrCatcher
	for l.ctx.Err() == nil {
		maconn, err := l.Listener.Accept()
		if err != nil {
			// Note: function may pause the accept loop.
			if catcher.IsTemporary(err) {
				log.Infof("temporary accept error: %s", err)
				continue
			}
			l.err = err
			return
		}

		// The go routine below calls Release when the context is
		// canceled so there's no need to wait on it here.
		l.threshold.Wait()

		log.Debugf("listener %s got connection: %s <---> %s",
			l,
			maconn.LocalMultiaddr(),
			maconn.RemoteMultiaddr())

		wg.Add(1)
		go func() {
			defer wg.Done()

			ctx, cancel := context.WithTimeout(l.ctx, transport.AcceptTimeout)
			defer cancel()

			conn, err := l.upgrader.UpgradeInbound(ctx, l.transport, maconn)
			if err != nil {
				// Don't bother bubbling this up. We just failed
				// to completely negotiate the connection.
				log.Debugf("accept upgrade error: %s (%s <--> %s)",
					err,
					maconn.LocalMultiaddr(),
					maconn.RemoteMultiaddr())
				return
			}

			log.Debugf("listener %s accepted connection: %s", l, conn)

			// This records the fact that the connection has been
			// setup and is waiting to be accepted. This call
			// *never* blocks, even if we go over the threshold. It
			// simply ensures that calls to Wait block while we're
			// over the threshold.
			l.threshold.Acquire()
			defer l.threshold.Release()

			select {
			case l.incoming <- conn:
			case <-ctx.Done():
				if l.ctx.Err() == nil {
					// Listener *not* closed but the accept timeout expired.
					log.Warningf("listener dropped connection due to slow accept")
				}
				// Wait on the context with a timeout. This way,
				// if we stop accepting connections for some reason,
				// we'll eventually close all the open ones
				// instead of hanging onto them.
				conn.Close()
			}
		}()
	}
}

// Accept accepts a connection.
func (l *listener) Accept() (transport.Conn, error) {
	for c := range l.incoming {
		// Could have been sitting there for a while.
		if !c.IsClosed() {
			return c, nil
		}
	}
	return nil, l.err
}

func (l *listener) String() string {
	if s, ok := l.transport.(fmt.Stringer); ok {
		return fmt.Sprintf("<stream.Listener[%s] %s>", s, l.Multiaddr())
	}
	return fmt.Sprintf("<stream.Listener %s>", l.Multiaddr())
}

var _ transport.Listener = (*listener)(nil)
