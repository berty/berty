package swarm

import (
	"fmt"
	"io"
	"sync"
	"sync/atomic"
	"time"

	inet "github.com/libp2p/go-libp2p-net"
	protocol "github.com/libp2p/go-libp2p-protocol"
	smux "github.com/libp2p/go-stream-muxer"
)

type streamState int

const (
	streamOpen streamState = iota
	streamCloseRead
	streamCloseWrite
	streamCloseBoth
	streamReset
)

// Stream is the stream type used by swarm. In general, you won't use this type
// directly.
type Stream struct {
	stream smux.Stream
	conn   *Conn

	state struct {
		sync.Mutex
		v streamState
	}

	notifyLk sync.Mutex

	protocol atomic.Value
}

func (s *Stream) String() string {
	return fmt.Sprintf(
		"<swarm.Stream[%s] %s (%s) <-> %s (%s)>",
		s.conn.conn.Transport(),
		s.conn.LocalMultiaddr(),
		s.conn.LocalPeer(),
		s.conn.RemoteMultiaddr(),
		s.conn.RemotePeer(),
	)
}

// Conn returns the Conn associated with this stream, as an inet.Conn
func (s *Stream) Conn() inet.Conn {
	return s.conn
}

// Read reads bytes from a stream.
func (s *Stream) Read(p []byte) (int, error) {
	n, err := s.stream.Read(p)
	// TODO: push this down to a lower level for better accuracy.
	if s.conn.swarm.bwc != nil {
		s.conn.swarm.bwc.LogRecvMessage(int64(n))
		s.conn.swarm.bwc.LogRecvMessageStream(int64(n), s.Protocol(), s.Conn().RemotePeer())
	}
	// If we observe an EOF, this stream is now closed for reading.
	// If we're already closed for writing, this stream is now fully closed.
	if err == io.EOF {
		s.state.Lock()
		switch s.state.v {
		case streamCloseWrite:
			s.state.v = streamCloseBoth
			s.remove()
		case streamOpen:
			s.state.v = streamCloseRead
		}
		s.state.Unlock()
	}
	return n, err
}

// Write writes bytes to a stream, flushing for each call.
func (s *Stream) Write(p []byte) (int, error) {
	n, err := s.stream.Write(p)
	// TODO: push this down to a lower level for better accuracy.
	if s.conn.swarm.bwc != nil {
		s.conn.swarm.bwc.LogSentMessage(int64(n))
		s.conn.swarm.bwc.LogSentMessageStream(int64(n), s.Protocol(), s.Conn().RemotePeer())
	}
	return n, err
}

// Close closes the stream, indicating this side is finished
// with the stream.
func (s *Stream) Close() error {
	err := s.stream.Close()

	s.state.Lock()
	switch s.state.v {
	case streamCloseRead:
		s.state.v = streamCloseBoth
		s.remove()
	case streamOpen:
		s.state.v = streamCloseWrite
	}
	s.state.Unlock()
	return err
}

// Reset resets the stream, closing both ends.
func (s *Stream) Reset() error {
	err := s.stream.Reset()
	s.state.Lock()
	switch s.state.v {
	case streamOpen, streamCloseRead, streamCloseWrite:
		s.state.v = streamReset
		s.remove()
	}
	s.state.Unlock()
	return err
}

func (s *Stream) remove() {
	s.conn.removeStream(s)

	// We *must* do this in a goroutine. This can be called during a
	// an open notification and will block until that notification is done.
	go func() {
		s.notifyLk.Lock()
		defer s.notifyLk.Unlock()

		s.conn.swarm.notifyAll(func(f inet.Notifiee) {
			f.ClosedStream(s.conn.swarm, s)
		})
		s.conn.swarm.refs.Done()
	}()
}

// Protocol returns the protocol negotiated on this stream (if set).
func (s *Stream) Protocol() protocol.ID {
	// Ignore type error. It means that the protocol is unset.
	p, _ := s.protocol.Load().(protocol.ID)
	return p
}

// SetProtocol sets the protocol for this stream.
//
// This doesn't actually *do* anything other than record the fact that we're
// speaking the given protocol over this stream. It's still up to the user to
// negotiate the protocol. This is usually done by the Host.
func (s *Stream) SetProtocol(p protocol.ID) {
	s.protocol.Store(p)
}

// SetDeadline sets the read and write deadlines for this stream.
func (s *Stream) SetDeadline(t time.Time) error {
	return s.stream.SetDeadline(t)
}

// SetReadDeadline sets the read deadline for this stream.
func (s *Stream) SetReadDeadline(t time.Time) error {
	return s.stream.SetReadDeadline(t)
}

// SetWriteDeadline sets the write deadline for this stream.
func (s *Stream) SetWriteDeadline(t time.Time) error {
	return s.stream.SetWriteDeadline(t)
}
