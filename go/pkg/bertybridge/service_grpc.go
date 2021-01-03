package bertybridge

import (
	"context"
	"fmt"
	"strconv"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

// ClientInvokeUnary invoke a unary method
func (s *service) ClientInvokeUnary(ctx context.Context, req *ClientInvokeUnary_Request) (*ClientInvokeUnary_Reply, error) {
	client, ok := s.getServiceClient(req.MethodDesc)
	if !ok {
		return nil, fmt.Errorf("unknow or unregister service: `%s", req.GetMethodDesc().GetName())
	}

	res := &ClientInvokeUnary_Reply{}
	if req.MethodDesc == nil {
		return res, fmt.Errorf("cannot invoke `ClientInvokeUnary` without a `MethodDesc``")
	}

	if req.MethodDesc.IsClientStream || req.MethodDesc.IsServerStream {
		return res, fmt.Errorf("cannot call stream method with `ClientInvokeUnary`")
	}

	// inject header into context
	uctx := newOutgoingContext(client.rootCtx, req.GetHeader())
	desc := &grpcutil.LazyMethodDesc{
		Name: req.MethodDesc.Name,
	}

	// create fake proto message
	trailer := metadata.MD{}
	in := grpcutil.NewLazyMessage().FromBytes(req.Payload)
	out, err := client.lc.InvokeUnary(uctx, desc, in, grpc.Trailer(&trailer))
	res.Error = getServiceError(err)
	res.Payload = out.Bytes()
	res.Trailer = convertMetadata(trailer)
	return res, nil
}

// CreateStream create a stream
func (s *service) CreateClientStream(ctx context.Context, req *ClientCreateStream_Request) (*ClientCreateStream_Reply, error) {
	client, ok := s.getServiceClient(req.MethodDesc)
	if !ok {
		return nil, fmt.Errorf("unknow or unregister service: `%s", req.GetMethodDesc().GetName())
	}

	res := &ClientCreateStream_Reply{}
	if req.MethodDesc == nil {
		return nil, fmt.Errorf("cannot invoke `CreateClientStream` without a `MethodDesc`")
	}

	if !req.MethodDesc.IsClientStream && !req.MethodDesc.IsServerStream {
		return nil, fmt.Errorf("cannot call a unary method with `CreateClientStream`")
	}

	desc := &grpcutil.LazyMethodDesc{
		Name:          req.MethodDesc.Name,
		ServerStreams: req.MethodDesc.IsServerStream,
		ClientStreams: req.MethodDesc.IsClientStream,
	}

	sctx := newOutgoingContext(client.rootCtx, req.Header)
	in := grpcutil.NewLazyMessage().FromBytes(req.Payload)
	cstream, err := client.lc.InvokeStream(sctx, desc, in)
	res.Error = getServiceError(err)
	if err == nil {
		res.StreamId = strconv.FormatUint(cstream.ID(), 16)
		s.registerStream(res.StreamId, cstream)
	}

	return res, nil
}

// Send Message over the given stream
func (s *service) ClientStreamSend(ctx context.Context, req *ClientStreamSend_Request) (*ClientStreamSend_Reply, error) {
	id := req.StreamId
	cstream, err := s.getSream(id)
	if err != nil {
		return nil, err
	}

	res := &ClientStreamSend_Reply{StreamId: id}

	in := grpcutil.NewLazyMessage().FromBytes(req.Payload)
	err = cstream.SendMsg(in)
	res.Error = getServiceError(err)

	if err != nil {
		res.Trailer = convertMetadata(cstream.Trailer())
		s.muStreams.Lock()
		delete(s.streams, id)
		s.muStreams.Unlock()
	}

	return res, nil
}

// Recv message over the given stream
func (s *service) ClientStreamRecv(ctx context.Context, req *ClientStreamRecv_Request) (*ClientStreamRecv_Reply, error) {
	id := req.StreamId
	cstream, err := s.getSream(id)
	if err != nil {
		return nil, err
	}

	return s.clientStreamRecv(id, cstream), nil
}

// Close the given stream
func (s *service) ClientStreamClose(ctx context.Context, req *ClientStreamClose_Request) (*ClientStreamClose_Reply, error) {
	id := req.StreamId

	cstream, err := s.getSream(id)
	if err != nil {
		return nil, err
	}

	err = cstream.Close()
	if err != nil {
		return nil, err
	}

	return &ClientStreamClose_Reply{
		Error: getServiceError(err),
	}, nil
}

// Close send on the given stream and return reply
func (s *service) ClientStreamCloseAndRecv(ctx context.Context, req *ClientStreamCloseAndRecv_Request) (*ClientStreamCloseAndRecv_Reply, error) {
	id := req.StreamId
	cstream, err := s.getSream(id)
	if err != nil {
		return nil, err
	}

	if err := cstream.CloseSend(); err != nil {
		return nil, err
	}

	reply := s.clientStreamRecv(id, cstream)

	return &ClientStreamCloseAndRecv_Reply{
		StreamId: id,
		Error:    reply.Error,
		Payload:  reply.Payload,
		Trailer:  reply.Trailer,
	}, nil
}

func (s *service) clientStreamRecv(id string, cstream *grpcutil.LazyStream) *ClientStreamRecv_Reply {
	res := &ClientStreamRecv_Reply{StreamId: id}

	out := grpcutil.NewLazyMessage()
	err := cstream.RecvMsg(out)
	if err != nil {
		s.muStreams.Lock()
		delete(s.streams, id)
		s.muStreams.Unlock()
	}

	res.Error = getServiceError(err)
	res.Trailer = convertMetadata(cstream.Trailer())
	res.Payload = out.Bytes()
	return res
}

func (s *service) getSream(id string) (*grpcutil.LazyStream, error) {
	s.muStreams.RLock()
	defer s.muStreams.RUnlock()

	if cstream, ok := s.streams[id]; ok {
		return cstream, nil
	}
	return nil, fmt.Errorf("invalid stream id")
}

func (s *service) registerStream(id string, cstream *grpcutil.LazyStream) {
	s.muStreams.Lock()
	s.streams[id] = cstream
	s.muStreams.Unlock()
}

func newOutgoingContext(ctx context.Context, md []*Metadata) context.Context {
	outmd := make(metadata.MD)
	for _, m := range md {
		outmd.Append(m.Key, m.Values...)
	}
	return metadata.NewOutgoingContext(ctx, outmd)
}

func convertMetadata(in metadata.MD) []*Metadata {
	out := make([]*Metadata, in.Len())
	i := 0
	for k, v := range in {
		out[i] = &Metadata{
			Key:    k,
			Values: v,
		}
		i++
	}

	return out
}

func getServiceError(err error) *Error {
	if err == nil {
		return &Error{}
	}

	grpcErrCode := GRPCErrCode_OK
	if s := status.Convert(err); s.Code() != codes.OK {
		grpcErrCode = GRPCErrCode(s.Code())
	}

	errCode := errcode.Undefined
	errCodes := errcode.Codes(err)
	if len(errCodes) > 0 {
		errCode = errCodes[0]
	}

	return &Error{
		GrpcErrorCode: grpcErrCode,
		ErrorCode:     errCode,
		ErrorDetails:  &errcode.ErrDetails{Codes: errCodes},
		Message:       err.Error(),
	}
}
