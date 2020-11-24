package bertyaccount

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

// ClientInvokeUnary invoke a unary method
func (s *service) ClientInvokeUnary(ctx context.Context, req *ClientInvokeUnary_Request) (*ClientInvokeUnary_Reply, error) {
	serviceClient, err := s.getServiceClient()
	if err != nil {
		return nil, errors.Wrap(err, "unable to invoke unary")
	}

	res := &ClientInvokeUnary_Reply{}
	if req.MethodDesc == nil {
		return res, fmt.Errorf("cannot invoke `ClientInvokeUnary` without a `MethodDesc``")
	}

	if req.MethodDesc.IsClientStream || req.MethodDesc.IsServerStream {
		return res, fmt.Errorf("cannot call stream method with `ClientInvokeUnary`")
	}

	// inject header into context
	uctx := newOutgoingContext(s.rootCtx, req.GetHeader())
	desc := &grpcutil.LazyMethodDesc{
		Name: req.MethodDesc.Name,
	}

	// create fake proto message
	in := grpcutil.NewLazyMessage().FromBytes(req.Payload)
	out, err := serviceClient.InvokeUnary(ctx, desc, in)
	if err != nil {
		res.Error = getServiceError(err)
		return res, nil
	}

	res.Payload = out.Bytes()
	res.Trailer = getMetadataFromContext(uctx)
	return res, nil
}

// // CreateStream create a stream
func (s *service) CreateClientStream(ctx context.Context, req *ClientCreateStream_Request) (*ClientCreateStream_Reply, error) {
	serviceClient, err := s.getServiceClient()
	if err != nil {
		return nil, errors.Wrap(err, "unable to create stream")
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

	sctx := newOutgoingContext(s.rootCtx, req.Header)
	in := grpcutil.NewLazyMessage().FromBytes(req.Payload)
	cstream, err := serviceClient.InvokeStream(sctx, desc, in)
	if err != nil {
		res.Error = getServiceError(err)
		return res, nil
	}

	res.StreamId = strconv.FormatUint(cstream.ID(), 16)
	s.registerStream(res.StreamId, cstream)

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
	if err := cstream.SendMsg(in); err != nil {
		res.Error = getServiceError(err)
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
	cstream.Close()
	return &ClientStreamClose_Reply{}, nil
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

	return &ClientStreamCloseAndRecv_Reply{StreamId: id, Error: reply.Error, Payload: reply.Payload, Trailer: reply.Trailer}, nil
}

// Get GRPC listener addresses
func (s *service) GetGRPCListenerAddrs(ctx context.Context, req *GetGRPCListenerAddrs_Request) (*GetGRPCListenerAddrs_Reply, error) {
	m, err := s.getInitManager()
	if err != nil {
		return nil, err
	}

	grpcListeners := m.GetGRPCListeners()
	entries := make([]*GetGRPCListenerAddrs_Reply_Entry, len(grpcListeners))
	for i, l := range grpcListeners {
		ps := make([]string, 0)
		ma.ForEach(l.GRPCMultiaddr(), func(c ma.Component) bool {
			ps = append(ps, c.Protocol().Name)
			return true
		})

		proto := strings.Join(ps, "/")
		entries[i] = &GetGRPCListenerAddrs_Reply_Entry{
			Maddr: l.Addr().String(),
			Proto: proto,
		}
	}

	return &GetGRPCListenerAddrs_Reply{
		Entries: entries,
	}, nil
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

func getMetadataFromContext(ctx context.Context) []*Metadata {
	// get trailer
	if outmd, ok := metadata.FromIncomingContext(ctx); ok {
		return convertMetadata(outmd)
	}

	return nil
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
		return nil
	}

	var errCode errcode.ErrCode
	var grpcErrCode GRPCErrCode

	if s := status.Convert(err); s.Code() != codes.OK {
		grpcErrCode = GRPCErrCode(s.Code())
	}

	if code := errcode.Code(err); code > 0 {
		errCode = code
	} else {
		errCode = errcode.Undefined
	}

	return &Error{
		GrpcErrorCode: grpcErrCode,
		ErrorCode:     errCode,
		Message:       err.Error(),
	}
}

func (s *service) clientStreamRecv(id string, cstream *grpcutil.LazyStream) *ClientStreamRecv_Reply {
	res := &ClientStreamRecv_Reply{StreamId: id}

	out := grpcutil.NewLazyMessage()
	if err := cstream.RecvMsg(out); err != nil {
		s.muStreams.Lock()

		res.Error = getServiceError(err)
		res.Trailer = convertMetadata(cstream.Trailer())
		delete(s.streams, id)

		s.muStreams.Unlock()
		return res
	}

	res.Payload = out.Bytes()
	return res
}
