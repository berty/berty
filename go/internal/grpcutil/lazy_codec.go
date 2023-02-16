package grpcutil

import (
	"fmt"

	"google.golang.org/grpc/encoding"
)

// LazyCodec is basically a no-op grpc.Codec use to pass LazyMessage through
// grpc
type LazyCodec struct{}

func NewLazyCodec() *LazyCodec { return &LazyCodec{} }

// Codec
var _ encoding.Codec = (*LazyCodec)(nil)

func (lc *LazyCodec) Marshal(value interface{}) ([]byte, error) {
	if lm, ok := value.(*LazyMessage); ok {
		return lm.buf, nil
	}

	return nil, fmt.Errorf("lazy-codec marshal: message is not lazy")
}

func (*LazyCodec) Unmarshal(buf []byte, value interface{}) error {
	if lm, ok := value.(*LazyMessage); ok {
		lm.buf = buf
		return nil
	}

	return fmt.Errorf("lazy-codec unmarshal: message is not lazy")
}

func (lc *LazyCodec) String() string { return "lazy-codec" }
func (lc *LazyCodec) Name() string   { return lc.String() }
