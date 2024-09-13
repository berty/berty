package grpcutil

import (
	"encoding/base64"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
)

// LazyMessage is basically a no-op `proto.Message` used to pass
// serialized message through grpc
type LazyMessage struct {
	buf []byte
}

func NewLazyMessage() *LazyMessage { return &LazyMessage{} }

func (m *LazyMessage) Base64() string {
	return base64.StdEncoding.EncodeToString(m.buf)
}

func (m *LazyMessage) FromBase64(b64 string) (lm *LazyMessage, err error) {
	m.buf, err = base64.StdEncoding.DecodeString(b64)
	lm = m
	return
}

func (m *LazyMessage) Bytes() []byte {
	return m.buf
}

func (m *LazyMessage) FromBytes(buf []byte) *LazyMessage {
	if buf == nil {
		buf = []byte{}
	}

	m.buf = buf
	return m
}

// Message
var _ proto.Message = (*LazyMessage)(nil)

func (m *LazyMessage) Reset()                             { *m = LazyMessage{} }
func (m *LazyMessage) String() string                     { return string(m.buf) }
func (m *LazyMessage) ProtoMessage()                      {}
func (m *LazyMessage) ProtoReflect() protoreflect.Message { return nil }
