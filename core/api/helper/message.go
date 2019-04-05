package helper

import (
	"encoding/base64"
	fmt "fmt"

	grpc "google.golang.org/grpc"
)

type LazyMessage struct {
	buf []byte
}

func NewLazyMessage() *LazyMessage {
	return &LazyMessage{}
}

// Reset ...
func (m *LazyMessage) Reset() {
	*m = LazyMessage{}
}

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
	m.buf = buf
	return m
}

// String ...
func (m *LazyMessage) String() string {
	return string(m.buf[:])
}

// ProtoMessage ...
func (m *LazyMessage) ProtoMessage() {}

type LazyCodec struct{}

// Marshal ...
func (lc *LazyCodec) Marshal(value interface{}) ([]byte, error) {
	if lm, ok := value.(*LazyMessage); ok {
		return lm.buf, nil
	}

	return nil, fmt.Errorf("lazy-codec: message is not a lazy")
}

// Unmarshal ...
func (*LazyCodec) Unmarshal(buf []byte, value interface{}) error {
	if lm, ok := value.(*LazyMessage); ok {
		lm.buf = buf
		return nil
	}

	return fmt.Errorf("lazy-codec: message is not a lazy")
}

func (lc *LazyCodec) String() string {
	return "lazy-codec"
}

func (lc *LazyCodec) Name() string {
	return lc.String()
}

func GrpcDialWithLazyCodec() grpc.DialOption {
	return grpc.WithCodec(&LazyCodec{})
}

func GrpcCallWithLazyCodec() grpc.CallOption {
	return grpc.ForceCodec(&LazyCodec{})
}
