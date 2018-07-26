package swarm

import (
	"errors"
	"fmt"
	"sync"

	ic "github.com/libp2p/go-libp2p-crypto"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	transport "github.com/libp2p/go-libp2p-transport"
	smux "github.com/libp2p/go-stream-muxer"
	ma "github.com/multiformats/go-multiaddr"
)

// TODO: Put this elsewhere.

// ErrConnClosed is returned when operating on a closed connection.
var ErrConnClosed = errors.New("connection closed")

// Conn is the connection type used by swarm. In general, you won't use this
// type directly.
type Conn struct {
	conn  transport.Conn
	swarm *Swarm

	closeOnce sync.Once
	err       error

	notifyLk sync.Mutex

	streams struct {
		sync.Mutex
		m map[*Stream]struct{}
	}
}

// Close closes this connection.
//
// Note: This method won't wait for the close notifications to finish as that
// would create a deadlock when called from an open notification (because all
// open notifications must finish before we can fire off the close
// notifications).
func (c *Conn) Close() error {
	c.closeOnce.Do(c.doClose)
	return c.err
}

func (c *Conn) doClose() {
	c.swarm.removeConn(c)

	// Prevent new streams from opening.
	c.streams.Lock()
	streams := c.streams.m
	c.streams.m = nil
	c.streams.Unlock()

	c.err = c.conn.Close()

	// This is just for cleaning up state. The connection has already been closed.
	// We *could* optimize this but it really isn't worth it.
	for s := range streams {
		s.Reset()
	}

	// do this in a goroutine to avoid deadlocking if we call close in an open notification.
	go func() {
		// prevents us from issuing close notifications before finishing the open notifications
		c.notifyLk.Lock()
		defer c.notifyLk.Unlock()

		c.swarm.notifyAll(func(f inet.Notifiee) {
			f.Disconnected(c.swarm, c)
		})
		c.swarm.refs.Done() // taken in Swarm.addConn
	}()
}

func (c *Conn) removeStream(s *Stream) {
	c.streams.Lock()
	delete(c.streams.m, s)
	c.streams.Unlock()
}

// listens for new streams.
//
// The caller must take a swarm ref before calling. This function decrements the
// swarm ref count.
func (c *Conn) start() {
	go func() {
		defer c.swarm.refs.Done()
		defer c.Close()

		for {
			ts, err := c.conn.AcceptStream()
			if err != nil {
				return
			}
			c.swarm.refs.Add(1)
			go func() {
				s, err := c.addStream(ts)

				// Don't defer this. We don't want to block
				// swarm shutdown on the connection handler.
				c.swarm.refs.Done()

				// We only get an error here when the swarm is closed or closing.
				if err != nil {
					return
				}

				if h := c.swarm.StreamHandler(); h != nil {
					h(s)
				}
			}()
		}
	}()
}

func (c *Conn) String() string {
	return fmt.Sprintf(
		"<swarm.Conn[%s] %s (%s) <-> %s (%s)>",
		c.conn.Transport(),
		c.conn.LocalMultiaddr(),
		c.conn.LocalPeer().Pretty(),
		c.conn.RemoteMultiaddr(),
		c.conn.RemotePeer().Pretty(),
	)
}

// LocalMultiaddr is the Multiaddr on this side
func (c *Conn) LocalMultiaddr() ma.Multiaddr {
	return c.conn.LocalMultiaddr()
}

// LocalPeer is the Peer on our side of the connection
func (c *Conn) LocalPeer() peer.ID {
	return c.conn.LocalPeer()
}

// RemoteMultiaddr is the Multiaddr on the remote side
func (c *Conn) RemoteMultiaddr() ma.Multiaddr {
	return c.conn.RemoteMultiaddr()
}

// RemotePeer is the Peer on the remote side
func (c *Conn) RemotePeer() peer.ID {
	return c.conn.RemotePeer()
}

// LocalPrivateKey is the public key of the peer on this side
func (c *Conn) LocalPrivateKey() ic.PrivKey {
	return c.conn.LocalPrivateKey()
}

// RemotePublicKey is the public key of the peer on the remote side
func (c *Conn) RemotePublicKey() ic.PubKey {
	return c.conn.RemotePublicKey()
}

// NewStream returns a new Stream from this connection
func (c *Conn) NewStream() (inet.Stream, error) {
	ts, err := c.conn.OpenStream()
	if err != nil {
		return nil, err
	}
	return c.addStream(ts)
}

func (c *Conn) addStream(ts smux.Stream) (*Stream, error) {
	c.streams.Lock()
	// Are we still online?
	if c.streams.m == nil {
		c.streams.Unlock()
		ts.Reset()
		return nil, ErrConnClosed
	}

	// Wrap and register the stream.
	s := &Stream{
		stream: ts,
		conn:   c,
	}
	c.streams.m[s] = struct{}{}

	// Released once the stream disconnect notifications have finished
	// firing (in Swarm.remove).
	c.swarm.refs.Add(1)

	// Take the notification lock before releasing the streams lock to block
	// StreamClose notifications until after the StreamOpen notifications
	// done.
	s.notifyLk.Lock()
	c.streams.Unlock()

	c.swarm.notifyAll(func(f inet.Notifiee) {
		f.OpenedStream(c.swarm, s)
	})
	s.notifyLk.Unlock()

	return s, nil
}

// GetStreams returns the streams associated with this connection.
func (c *Conn) GetStreams() []inet.Stream {
	c.streams.Lock()
	defer c.streams.Unlock()
	streams := make([]inet.Stream, 0, len(c.streams.m))
	for s := range c.streams.m {
		streams = append(streams, s)
	}
	return streams
}
