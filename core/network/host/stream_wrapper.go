package host

import (
	"io"

	inet "github.com/libp2p/go-libp2p-net"
	protocol "github.com/libp2p/go-libp2p-protocol"
	msmux "github.com/multiformats/go-multistream"
)

type streamWrapper struct {
	inet.Stream
	rw io.ReadWriter
}

func NewStreamWrapper(s inet.Stream, pid protocol.ID) inet.Stream {
	s.SetProtocol(pid)

	lzcon := msmux.NewMSSelect(s, string(pid))
	return &streamWrapper{
		Stream: s,
		rw:     lzcon,
	}
}

func (s *streamWrapper) Read(b []byte) (int, error) {
	return s.rw.Read(b)
}

func (s *streamWrapper) Write(b []byte) (int, error) {
	return s.rw.Write(b)
}
