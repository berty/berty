package grpcutil

import (
	"fmt"

	"google.golang.org/grpc/encoding"
	"google.golang.org/protobuf/proto"
)

const LazySubtype = "lazy-codec"

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

	if pm, ok := value.(proto.Message); ok {
		return proto.Marshal(pm)
	}
	return nil, fmt.Errorf("lazy-codec marshal: unsupported %T", value)
}

func (*LazyCodec) Unmarshal(buf []byte, value interface{}) error {
	if lm, ok := value.(*LazyMessage); ok {
		lm.buf = buf
		return nil
	}

	if pm, ok := value.(proto.Message); ok {
		return proto.Unmarshal(buf, pm)
	}
	return fmt.Errorf("lazy-codec unmarshal: unsupported %T", value)
}

func (lc *LazyCodec) String() string { return LazySubtype }
func (lc *LazyCodec) Name() string   { return lc.String() }

func init() {
	encoding.RegisterCodec(NewLazyCodec())
}
