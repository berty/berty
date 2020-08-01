package bertybridge

import (
	"context"
	"fmt"
	"strconv"
	"sync"
	"sync/atomic"

	pb "berty.tech/berty/v2/go/framework/bertybridge/internal/bridgepb"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// Service is BridgeServiceServer
var _ pb.BridgeServiceServer = (*Service)(nil)

type Service struct {
	cc *grpc.ClientConn

	rootCtx    context.Context
	rootCancel context.CancelFunc

	streamids uint64
	streams   map[string]*cancelStream
	muStreams sync.RWMutex
}

func NewServiceFromClientConn(cc *grpc.ClientConn) *Service {
	rootCtx, cancel := context.WithCancel(context.Background())
	return &Service{
		cc:         cc,
		rootCtx:    rootCtx,
		rootCancel: cancel,
		streams:    make(map[string]*cancelStream),
	}
}

var lazyCodec = grpcutil.NewLazyCodec()

type cancelStream struct {
	grpc.ClientStream

	// used to close the stream
	context.CancelFunc
}

// ClientInvokeUnary invoke a unary method
func (s *Service) ClientInvokeUnary(ctx context.Context, req *pb.ClientInvokeUnary_Request) (*pb.ClientInvokeUnary_Reply, error) {
	res := &pb.ClientInvokeUnary_Reply{}
	if req.MethodDesc == nil {
		return res, fmt.Errorf("cannot invoke `ClientInvokeUnary` without a `MethodDesc``")
	}

	if req.MethodDesc.IsClientStream || req.MethodDesc.IsClientStream {
		return res, fmt.Errorf("cannot call stream method with `ClientInvokeUnary`")
	}

	// inject header into context
	uctx := newOutgoingContext(s.rootCtx, req.GetHeader())

	// create fake proto message
	in := grpcutil.NewLazyMessage().FromBytes(req.Payload)
	out := grpcutil.NewLazyMessage()
	err := grpc.Invoke(uctx, req.MethodDesc.Name, in, out, s.cc, grpc.ForceCodec(lazyCodec))
	if err != nil {
		res.Error = getSerivceError(err)
		return res, nil
	}

	res.Payload = out.Bytes()
	res.Trailer = getMetadataFromContext(uctx)

	return res, nil
}

// CreateStream create a stream
func (s *Service) CreateClientStream(ctx context.Context, req *pb.ClientCreateStream_Request) (*pb.ClientCreateStream_Reply, error) {
	id := s.newStreamID()
	res := &pb.ClientCreateStream_Reply{
		StreamId: id,
	}

	if req.MethodDesc == nil {
		return nil, fmt.Errorf("cannot invoke `CreateClientStream` without a `MethodDesc`")
	}

	if !req.MethodDesc.IsClientStream && !req.MethodDesc.IsServerStream {
		return res, fmt.Errorf("cannot call a unary method with `CreateClientStream`")
	}

	desc := &grpc.StreamDesc{
		StreamName: req.MethodDesc.Name,

		ServerStreams: req.MethodDesc.IsServerStream,
		ClientStreams: req.MethodDesc.IsClientStream,
	}

	sctx := newOutgoingContext(s.rootCtx, req.Header)
	sctx, cancel := context.WithCancel(sctx)
	cstream, err := grpc.NewClientStream(sctx, desc, s.cc, req.MethodDesc.Name, grpc.ForceCodec(lazyCodec))
	if err != nil {
		cancel()
		res.Error = getSerivceError(err)
		return res, nil
	}

	if !desc.ClientStreams && desc.ServerStreams {
		in := grpcutil.NewLazyMessage().FromBytes(req.Payload)
		if err := cstream.SendMsg(in); err != nil {
			cancel()

			res.Error = getSerivceError(err)
			res.Trailer = convertMetadata(cstream.Trailer())

			return res, nil
		}

		if err := cstream.CloseSend(); err != nil {
			cancel()

			res.Error = getSerivceError(err)
			res.Trailer = convertMetadata(cstream.Trailer())

			return res, nil
		}
	}

	s.muStreams.Lock()
	defer s.muStreams.Unlock()

	s.streams[id] = &cancelStream{
		ClientStream: cstream,
		CancelFunc:   cancel,
	}

	return res, nil
}

// Send Message over the given stream
func (s *Service) ClientStreamSend(ctx context.Context, req *pb.ClientStreamSend_Request) (*pb.ClientStreamSend_Reply, error) {
	id := req.StreamId

	s.muStreams.RLock()
	cstream, ok := s.streams[id]
	s.muStreams.RUnlock()
	if !ok {

		return nil, fmt.Errorf("invalid stream id")
	}

	res := &pb.ClientStreamSend_Reply{
		StreamId: id,
	}
	in := grpcutil.NewLazyMessage().FromBytes(req.Payload)
	if err := cstream.SendMsg(in); err != nil {
		cstream.CancelFunc()
		res.Error = getSerivceError(err)
		res.Trailer = convertMetadata(cstream.Trailer())

		s.muStreams.Lock()
		delete(s.streams, id)
		s.muStreams.Unlock()
	}

	return res, nil
}

// Recv message over the given stream
func (s *Service) ClientStreamRecv(ctx context.Context, req *pb.ClientStreamRecv_Request) (*pb.ClientStreamRecv_Reply, error) {
	id := req.StreamId

	s.muStreams.RLock()
	cstream, ok := s.streams[id]
	s.muStreams.RUnlock()
	if !ok {
		return nil, fmt.Errorf("invalid stream id")
	}

	res := &pb.ClientStreamRecv_Reply{
		StreamId: id,
	}

	out := grpcutil.NewLazyMessage()
	if err := cstream.RecvMsg(out); err != nil {
		s.muStreams.Lock()

		res.Error = getSerivceError(err)
		res.Trailer = convertMetadata(cstream.Trailer())
		cstream.CancelFunc()
		delete(s.streams, id)

		s.muStreams.Unlock()
		return res, nil
	}

	res.Payload = out.Bytes()
	return res, nil
}

// Close the given stream
func (s *Service) ClientStreamClose(ctx context.Context, req *pb.ClientStreamClose_Request) (*pb.ClientStreamClose_Reply, error) {
	id := req.StreamId
	res := &pb.ClientStreamClose_Reply{
		StreamId: id,
	}

	s.muStreams.Lock()
	cstream, ok := s.streams[id]
	if ok {
		cstream.CancelFunc()
	}
	s.muStreams.Unlock()

	return res, nil
}

func (s *Service) Close() error {
	s.rootCancel()
	return nil
}

func (s *Service) newStreamID() string {
	new := atomic.AddUint64(&s.streamids, 1)
	return strconv.FormatUint(new, 16)
}

func newOutgoingContext(ctx context.Context, md []*pb.Metadata) context.Context {
	outmd := make(metadata.MD)
	for _, m := range md {
		outmd.Append(m.Key, m.Values...)
	}
	return metadata.NewOutgoingContext(ctx, outmd)
}

func getMetadataFromContext(ctx context.Context) []*pb.Metadata {
	// get trailer
	if outmd, ok := metadata.FromIncomingContext(ctx); ok {
		return convertMetadata(outmd)
	}

	return nil
}

func convertMetadata(in metadata.MD) []*pb.Metadata {
	out := make([]*pb.Metadata, in.Len())
	i := 0
	for k, v := range in {
		out[i] = &pb.Metadata{
			Key:    k,
			Values: v,
		}
		i++
	}

	return out
}

// func getTrailerFromContext(ctx context.Context) []*pb.Metadata {
// 	// get trailer
// 	var trailer []*pb.Metadata
// 	if outmd, ok := metadata.FromIncomingContext(ctx); ok {
// 		trailer = make([]*pb.Metadata, outmd.Len())
// 		i := 0
// 		for k, v := range outmd {
// 			trailer[i] = &pb.Metadata{
// 				Key:    k,
// 				Values: v,
// 			}
// 			i++
// 		}
// 	}

// 	return trailer
// }

func getSerivceError(err error) *pb.Error {
	if err == nil {
		return nil
	}

	var errCode errcode.ErrCode
	var grpcErrCode pb.GRPCErrCode

	if s := status.Convert(err); s.Code() != codes.OK {
		grpcErrCode = pb.GRPCErrCode(s.Code())
	}

	if code := errcode.Code(err); code > 0 {
		errCode = errcode.ErrCode(code)
	} else {
		errCode = errcode.Undefined
	}

	return &pb.Error{
		GrpcErrorCode: grpcErrCode,
		ErrorCode:     errCode,
		Message:       err.Error(),
	}
}
