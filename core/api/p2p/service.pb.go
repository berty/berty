// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: api/p2p/service.proto

package p2p

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"

import context "golang.org/x/net/context"
import grpc "google.golang.org/grpc"

import io "io"

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

type Void struct {
}

func (m *Void) Reset()                    { *m = Void{} }
func (m *Void) String() string            { return proto.CompactTextString(m) }
func (*Void) ProtoMessage()               {}
func (*Void) Descriptor() ([]byte, []int) { return fileDescriptorService, []int{0} }

func init() {
	proto.RegisterType((*Void)(nil), "berty.p2p.Void")
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// Client API for Berty service

type BertyClient interface {
	Handle(ctx context.Context, in *Event, opts ...grpc.CallOption) (*Void, error)
}

type bertyClient struct {
	cc *grpc.ClientConn
}

func NewBertyClient(cc *grpc.ClientConn) BertyClient {
	return &bertyClient{cc}
}

func (c *bertyClient) Handle(ctx context.Context, in *Event, opts ...grpc.CallOption) (*Void, error) {
	out := new(Void)
	err := grpc.Invoke(ctx, "/berty.p2p.Berty/Handle", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for Berty service

type BertyServer interface {
	Handle(context.Context, *Event) (*Void, error)
}

func RegisterBertyServer(s *grpc.Server, srv BertyServer) {
	s.RegisterService(&_Berty_serviceDesc, srv)
}

func _Berty_Handle_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(Event)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(BertyServer).Handle(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/berty.p2p.Berty/Handle",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(BertyServer).Handle(ctx, req.(*Event))
	}
	return interceptor(ctx, in, info, handler)
}

var _Berty_serviceDesc = grpc.ServiceDesc{
	ServiceName: "berty.p2p.Berty",
	HandlerType: (*BertyServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Handle",
			Handler:    _Berty_Handle_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "api/p2p/service.proto",
}

func (m *Void) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalTo(dAtA)
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *Void) MarshalTo(dAtA []byte) (int, error) {
	var i int
	_ = i
	var l int
	_ = l
	return i, nil
}

func encodeVarintService(dAtA []byte, offset int, v uint64) int {
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return offset + 1
}
func (m *Void) Size() (n int) {
	var l int
	_ = l
	return n
}

func sovService(x uint64) (n int) {
	for {
		n++
		x >>= 7
		if x == 0 {
			break
		}
	}
	return n
}
func sozService(x uint64) (n int) {
	return sovService(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *Void) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowService
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= (uint64(b) & 0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: Void: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: Void: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		default:
			iNdEx = preIndex
			skippy, err := skipService(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthService
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func skipService(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowService
			}
			if iNdEx >= l {
				return 0, io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= (uint64(b) & 0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		wireType := int(wire & 0x7)
		switch wireType {
		case 0:
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowService
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				iNdEx++
				if dAtA[iNdEx-1] < 0x80 {
					break
				}
			}
			return iNdEx, nil
		case 1:
			iNdEx += 8
			return iNdEx, nil
		case 2:
			var length int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowService
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				length |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			iNdEx += length
			if length < 0 {
				return 0, ErrInvalidLengthService
			}
			return iNdEx, nil
		case 3:
			for {
				var innerWire uint64
				var start int = iNdEx
				for shift := uint(0); ; shift += 7 {
					if shift >= 64 {
						return 0, ErrIntOverflowService
					}
					if iNdEx >= l {
						return 0, io.ErrUnexpectedEOF
					}
					b := dAtA[iNdEx]
					iNdEx++
					innerWire |= (uint64(b) & 0x7F) << shift
					if b < 0x80 {
						break
					}
				}
				innerWireType := int(innerWire & 0x7)
				if innerWireType == 4 {
					break
				}
				next, err := skipService(dAtA[start:])
				if err != nil {
					return 0, err
				}
				iNdEx = start + next
			}
			return iNdEx, nil
		case 4:
			return iNdEx, nil
		case 5:
			iNdEx += 4
			return iNdEx, nil
		default:
			return 0, fmt.Errorf("proto: illegal wireType %d", wireType)
		}
	}
	panic("unreachable")
}

var (
	ErrInvalidLengthService = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowService   = fmt.Errorf("proto: integer overflow")
)

func init() { proto.RegisterFile("api/p2p/service.proto", fileDescriptorService) }

var fileDescriptorService = []byte{
	// 159 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe2, 0x12, 0x4d, 0x2c, 0xc8, 0xd4,
	0x2f, 0x30, 0x2a, 0xd0, 0x2f, 0x4e, 0x2d, 0x2a, 0xcb, 0x4c, 0x4e, 0xd5, 0x2b, 0x28, 0xca, 0x2f,
	0xc9, 0x17, 0xe2, 0x4c, 0x4a, 0x2d, 0x2a, 0xa9, 0xd4, 0x2b, 0x30, 0x2a, 0x90, 0x12, 0x86, 0xa9,
	0x48, 0x2d, 0x4b, 0xcd, 0x2b, 0x81, 0xc8, 0x2b, 0xb1, 0x71, 0xb1, 0x84, 0xe5, 0x67, 0xa6, 0x18,
	0x99, 0x71, 0xb1, 0x3a, 0x81, 0x54, 0x0a, 0xe9, 0x72, 0xb1, 0x79, 0x24, 0xe6, 0xa5, 0xe4, 0xa4,
	0x0a, 0x09, 0xe8, 0xc1, 0xf5, 0xea, 0xb9, 0x82, 0xb4, 0x48, 0xf1, 0x23, 0x89, 0x80, 0x74, 0x29,
	0x31, 0x38, 0x99, 0x9e, 0x78, 0x24, 0xc7, 0x78, 0xe1, 0x91, 0x1c, 0xe3, 0x83, 0x47, 0x72, 0x8c,
	0x33, 0x1e, 0xcb, 0x31, 0x44, 0x29, 0xa7, 0x67, 0x96, 0x64, 0x94, 0x26, 0xe9, 0x25, 0xe7, 0xe7,
	0xea, 0x83, 0x95, 0x43, 0xc9, 0xe4, 0xfc, 0xa2, 0x54, 0x7d, 0xa8, 0x13, 0x92, 0xd8, 0xc0, 0xb6,
	0x1b, 0x03, 0x02, 0x00, 0x00, 0xff, 0xff, 0x57, 0x98, 0x75, 0x66, 0xb6, 0x00, 0x00, 0x00,
}
