package helper

import (
	"io"

	inet "github.com/libp2p/go-libp2p-net"
	protocol "github.com/libp2p/go-libp2p-protocol"
	msmux "github.com/multiformats/go-multistream"
)

type StreamWrapper struct {
	inet.Stream
	io.ReadWriter
}

func NewStreamWrapper(s inet.Stream, pid protocol.ID) *StreamWrapper {
	s.SetProtocol(pid)

	lzcon := msmux.NewMSSelect(s, string(pid))
	return &StreamWrapper{
		Stream:     s,
		ReadWriter: lzcon,
	}
}

func (s *StreamWrapper) Read(b []byte) (int, error) {
	return s.ReadWriter.Read(b)
}

func (s *StreamWrapper) Write(b []byte) (int, error) {
	return s.ReadWriter.Write(b)
}
