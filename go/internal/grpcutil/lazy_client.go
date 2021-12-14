package grpcutil

import (
	"context"
	"sync/atomic"

	"github.com/gogo/protobuf/proto"
	"google.golang.org/grpc"
)

var (
	lazyCodec = NewLazyCodec()
	streamids uint64
)

type LazyClient struct {
	cc *grpc.ClientConn
}

type LazyMethodDesc struct {
	Name          string
	ClientStreams bool
	ServerStreams bool
}

func NewLazyClient(cc *grpc.ClientConn) *LazyClient {
	return &LazyClient{cc: cc}
}

func (lc *LazyClient) InvokeUnary(ctx context.Context, desc *LazyMethodDesc, in *LazyMessage, copts ...grpc.CallOption) (out *LazyMessage, err error) {
	out = NewLazyMessage()
	err = grpc.Invoke(ctx, desc.Name, in, out, lc.cc, append(copts, grpc.ForceCodec(lazyCodec))...)
	return
}

func (lc *LazyClient) InvokeStream(ctx context.Context, desc *LazyMethodDesc, in *LazyMessage, copts ...grpc.CallOption) (*LazyStream, error) {
	sdesc := &grpc.StreamDesc{
		StreamName:    desc.Name,
		ServerStreams: desc.ServerStreams,
		ClientStreams: desc.ClientStreams,
	}

	sctx, cancel := context.WithCancel(ctx)
	cstream, err := grpc.NewClientStream(sctx, sdesc, lc.cc, desc.Name, append(copts, grpc.ForceCodec(lazyCodec))...)
	if err != nil {
		cancel()
		return nil, err
	}

	if !desc.ClientStreams && desc.ServerStreams {
		if err := cstream.SendMsg(in); err != nil {
			cancel()
			return nil, err
		}

		if err := cstream.CloseSend(); err != nil {
			cancel()
			return nil, err
		}
	}

	return &LazyStream{
		id:           atomic.AddUint64(&streamids, 1),
		ClientStream: cstream,
		CancelFunc:   cancel,
	}, nil
}

type LazyStream struct {
	// used to close the stream
	context.CancelFunc
	grpc.ClientStream

	id uint64
}

func (s *LazyStream) SendMsg(in proto.Message) (err error) {
	if err = s.ClientStream.SendMsg(in); err != nil {
		s.CancelFunc()
	}

	return
}

func (s *LazyStream) RecvMsg(out proto.Message) (err error) {
	if err = s.ClientStream.RecvMsg(out); err != nil {
		s.CancelFunc()
	}

	return
}

func (s *LazyStream) Close() (err error) {
	err = s.CloseSend()
	s.CancelFunc()
	return
}

func (s *LazyStream) ID() uint64 {
	return s.id
}
