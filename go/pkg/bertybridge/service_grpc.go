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

// errStreamClosed is returned in-band to a ClientStreamRecv that arrives after
// its stream was closed or had already finished. It carries the same Canceled
// code the caller got before ClientStreamClose started releasing streams
// eagerly (a closed stream's context is cancelled), so the frontend recv loop
// still ends cleanly instead of failing with a bridge-level error.
var errStreamClosed = status.Error(codes.Canceled, "stream closed")

// ClientInvokeUnary invoke a unary method
func (s *service) ClientInvokeUnary(_ context.Context, req *ClientInvokeUnary_Request) (*ClientInvokeUnary_Reply, error) {
	if req.GetMethodDesc() == nil {
		return nil, fmt.Errorf("cannot invoke `ClientInvokeUnary` without a `MethodDesc`")
	}

	client, ok := s.getServiceClient(req.MethodDesc)
	if !ok {
		return nil, fmt.Errorf("unknown or unregistered service: `%s`", req.MethodDesc.GetName())
	}

	res := &ClientInvokeUnary_Reply{}
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

// CreateClientStream create a stream
func (s *service) CreateClientStream(_ context.Context, req *ClientCreateStream_Request) (*ClientCreateStream_Reply, error) {
	if req.GetMethodDesc() == nil {
		return nil, fmt.Errorf("cannot invoke `CreateClientStream` without a `MethodDesc`")
	}

	client, ok := s.getServiceClient(req.MethodDesc)
	if !ok {
		return nil, fmt.Errorf("unknown or unregistered service: `%s`", req.MethodDesc.GetName())
	}

	res := &ClientCreateStream_Reply{}
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
func (s *service) ClientStreamSend(_ context.Context, req *ClientStreamSend_Request) (*ClientStreamSend_Reply, error) {
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
		s.unregisterStream(id)
	}

	return res, nil
}

// Recv message over the given stream
func (s *service) ClientStreamRecv(_ context.Context, req *ClientStreamRecv_Request) (*ClientStreamRecv_Reply, error) {
	id := req.StreamId
	cstream, err := s.getSream(id)
	if err != nil {
		// The frontend keeps a recv loop running and can issue one more recv
		// after ClientStreamClose has released the stream; report it like any
		// other closed stream rather than as a bridge failure.
		return &ClientStreamRecv_Reply{
			StreamId: id,
			Error:    getServiceError(errStreamClosed),
		}, nil
	}

	return s.clientStreamRecv(id, cstream), nil
}

// Close the given stream
func (s *service) ClientStreamClose(_ context.Context, req *ClientStreamClose_Request) (*ClientStreamClose_Reply, error) {
	// Take the stream out of the registry first: Close always cancels the
	// stream context, even when CloseSend fails, so the entry must not outlive
	// this call either way.
	cstream, ok := s.unregisterStream(req.StreamId)
	if !ok {
		// The stream already finished (EOF or error during send/recv) and was
		// released then; closing it again is a no-op.
		return &ClientStreamClose_Reply{Error: getServiceError(nil)}, nil
	}

	if err := cstream.Close(); err != nil {
		return nil, err
	}

	return &ClientStreamClose_Reply{Error: getServiceError(nil)}, nil
}

// Close send on the given stream and return reply
func (s *service) ClientStreamCloseAndRecv(_ context.Context, req *ClientStreamCloseAndRecv_Request) (*ClientStreamCloseAndRecv_Reply, error) {
	id := req.StreamId
	cstream, err := s.getSream(id)
	if err != nil {
		return nil, err
	}

	// CloseAndRecv ends the call: one reply once the client is done sending.
	// Release the stream however it ends, including on success, where neither
	// the registry entry nor the stream context was released before.
	defer func() {
		s.unregisterStream(id)
		cstream.CancelFunc()
	}()

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
		s.unregisterStream(id)
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

// unregisterStream removes the stream from the registry and returns it, so
// that only one caller ever gets to close a given stream.
func (s *service) unregisterStream(id string) (*grpcutil.LazyStream, bool) {
	s.muStreams.Lock()
	defer s.muStreams.Unlock()

	cstream, ok := s.streams[id]
	if ok {
		delete(s.streams, id)
	}
	return cstream, ok
}

func newOutgoingContext(ctx context.Context, md []*Metadata) context.Context {
	outmd := make(metadata.MD)
	for _, m := range md {
		outmd.Append(m.Key, m.Values...)
	}
	return metadata.NewOutgoingContext(ctx, outmd)
}

func convertMetadata(in metadata.MD) []*Metadata {
	out := make([]*Metadata, 0, in.Len())
	for k, v := range in {
		if k == "grpc-status-details-bin" {
			// ignore grpc-status-details-bin
			continue
		}
		out = append(out, &Metadata{
			Key:    k,
			Values: v,
		})
	}

	return out
}

func getServiceError(err error) *Error {
	if err == nil {
		return &Error{}
	}

	grpcErrCode := GRPCErrCode_OK
	if s := status.Convert(err); s.Code() != codes.OK {
		grpcErrCode = GRPCErrCode(s.Code()) //nolint:gosec
	}

	errCode := errcode.ErrCode_Undefined
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
