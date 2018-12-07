// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: pkg/errors/error.proto

package errors // import "berty.tech/core/pkg/errors"

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import _ "berty.tech/core/api/protobuf/graphql"
import _ "github.com/gogo/protobuf/gogoproto"
import _ "github.com/golang/protobuf/ptypes/timestamp"

import google_golang_org_grpc_codes "google.golang.org/grpc/codes"

import io "io"

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion2 // please upgrade the proto package

type Error struct {
	// ID should:
	// * always be unique
	// * never change once set
	// * not necessarily follow a suite number
	// * errors should be sorted by categoryID in this file
	ID int32 `protobuf:"varint,1,opt,name=id,proto3" json:"id,omitempty"`
	// See:
	// * https://www.restapitutorial.com/httpstatuscodes.html
	GRPCCode google_golang_org_grpc_codes.Code `protobuf:"varint,2,opt,name=grpc_code,json=grpcCode,proto3,customtype=google.golang.org/grpc/codes.Code" json:"grpc_code"`
	// See:
	// * https://github.com/grpc/grpc/blob/master/doc/statuscodes.md
	// * https://godoc.org/google.golang.org/grpc/codes
	HTTPStatus           int32    `protobuf:"varint,3,opt,name=http_status,json=httpStatus,proto3" json:"http_status,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Error) Reset()         { *m = Error{} }
func (m *Error) String() string { return proto.CompactTextString(m) }
func (*Error) ProtoMessage()    {}
func (*Error) Descriptor() ([]byte, []int) {
	return fileDescriptor_error_c70b00d8a194f0a9, []int{0}
}
func (m *Error) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *Error) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_Error.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalTo(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (dst *Error) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Error.Merge(dst, src)
}
func (m *Error) XXX_Size() int {
	return m.Size()
}
func (m *Error) XXX_DiscardUnknown() {
	xxx_messageInfo_Error.DiscardUnknown(m)
}

var xxx_messageInfo_Error proto.InternalMessageInfo

func (m *Error) GetID() int32 {
	if m != nil {
		return m.ID
	}
	return 0
}

func (m *Error) GetHTTPStatus() int32 {
	if m != nil {
		return m.HTTPStatus
	}
	return 0
}

func init() {
	proto.RegisterType((*Error)(nil), "berty.pkg.errors.Error")
}
func (m *Error) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalTo(dAtA)
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *Error) MarshalTo(dAtA []byte) (int, error) {
	var i int
	_ = i
	var l int
	_ = l
	if m.ID != 0 {
		dAtA[i] = 0x8
		i++
		i = encodeVarintError(dAtA, i, uint64(m.ID))
	}
	if m.GRPCCode != 0 {
		dAtA[i] = 0x10
		i++
		i = encodeVarintError(dAtA, i, uint64(m.GRPCCode))
	}
	if m.HTTPStatus != 0 {
		dAtA[i] = 0x18
		i++
		i = encodeVarintError(dAtA, i, uint64(m.HTTPStatus))
	}
	if m.XXX_unrecognized != nil {
		i += copy(dAtA[i:], m.XXX_unrecognized)
	}
	return i, nil
}

func encodeVarintError(dAtA []byte, offset int, v uint64) int {
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return offset + 1
}
func (m *Error) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	if m.ID != 0 {
		n += 1 + sovError(uint64(m.ID))
	}
	if m.GRPCCode != 0 {
		n += 1 + sovError(uint64(m.GRPCCode))
	}
	if m.HTTPStatus != 0 {
		n += 1 + sovError(uint64(m.HTTPStatus))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func sovError(x uint64) (n int) {
	for {
		n++
		x >>= 7
		if x == 0 {
			break
		}
	}
	return n
}
func sozError(x uint64) (n int) {
	return sovError(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *Error) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowError
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
			return fmt.Errorf("proto: Error: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: Error: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field ID", wireType)
			}
			m.ID = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowError
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.ID |= (int32(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 2:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field GRPCCode", wireType)
			}
			m.GRPCCode = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowError
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.GRPCCode |= (google_golang_org_grpc_codes.Code(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 3:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field HTTPStatus", wireType)
			}
			m.HTTPStatus = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowError
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.HTTPStatus |= (int32(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		default:
			iNdEx = preIndex
			skippy, err := skipError(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthError
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			m.XXX_unrecognized = append(m.XXX_unrecognized, dAtA[iNdEx:iNdEx+skippy]...)
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func skipError(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowError
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
					return 0, ErrIntOverflowError
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
					return 0, ErrIntOverflowError
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
				return 0, ErrInvalidLengthError
			}
			return iNdEx, nil
		case 3:
			for {
				var innerWire uint64
				var start int = iNdEx
				for shift := uint(0); ; shift += 7 {
					if shift >= 64 {
						return 0, ErrIntOverflowError
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
				next, err := skipError(dAtA[start:])
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
	ErrInvalidLengthError = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowError   = fmt.Errorf("proto: integer overflow")
)

func init() { proto.RegisterFile("pkg/errors/error.proto", fileDescriptor_error_c70b00d8a194f0a9) }

var fileDescriptor_error_c70b00d8a194f0a9 = []byte{
	// 284 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x44, 0x90, 0xcf, 0x4a, 0x03, 0x31,
	0x10, 0x87, 0x9b, 0x95, 0x96, 0x1a, 0x41, 0x64, 0x91, 0x52, 0x7a, 0xd8, 0x68, 0x4f, 0x1e, 0x24,
	0x39, 0x88, 0x2f, 0xd0, 0x2a, 0xea, 0xad, 0xac, 0x3d, 0x79, 0x29, 0xfb, 0x27, 0xce, 0x2e, 0xdd,
	0x3a, 0x31, 0x9b, 0x1e, 0x7c, 0x13, 0x1f, 0xc0, 0x87, 0xe9, 0xd1, 0xb3, 0x87, 0x45, 0xe2, 0x8b,
	0x48, 0x12, 0xa5, 0xa7, 0xf9, 0x98, 0xdf, 0x37, 0x13, 0x32, 0x74, 0xa4, 0xd6, 0x20, 0xa4, 0xd6,
	0xa8, 0xdb, 0x50, 0xb8, 0xd2, 0x68, 0x30, 0x3e, 0xc9, 0xa5, 0x36, 0x6f, 0x5c, 0xad, 0x81, 0x87,
	0x74, 0x32, 0xcd, 0x54, 0x2d, 0x7c, 0x98, 0x6f, 0x9f, 0x05, 0xe8, 0x4c, 0x55, 0xaf, 0xcd, 0x7f,
	0x0d, 0x53, 0x93, 0x53, 0x40, 0x40, 0x8f, 0xc2, 0xd1, 0x5f, 0x97, 0x01, 0x22, 0x34, 0x72, 0x3f,
	0x6c, 0xea, 0x8d, 0x6c, 0x4d, 0xb6, 0x51, 0x41, 0x98, 0x7e, 0x10, 0xda, 0xbf, 0x75, 0xaf, 0xc4,
	0x23, 0x1a, 0xd5, 0xe5, 0x98, 0x9c, 0x91, 0x8b, 0xfe, 0x6c, 0x60, 0x3b, 0x16, 0x3d, 0xdc, 0xa4,
	0x51, 0x5d, 0xc6, 0x29, 0x3d, 0x04, 0xad, 0x8a, 0x55, 0x81, 0xa5, 0x1c, 0x47, 0x3e, 0xbe, 0xde,
	0x75, 0xac, 0xf7, 0xd5, 0xb1, 0xf3, 0xb0, 0x9d, 0x03, 0x36, 0xd9, 0x0b, 0x70, 0xd4, 0x20, 0x9c,
	0x2a, 0x9c, 0xda, 0xf2, 0x39, 0x96, 0xd2, 0x76, 0x6c, 0x78, 0x97, 0x2e, 0xe6, 0x8e, 0xd3, 0xa1,
	0x0b, 0x1d, 0xc5, 0x82, 0x1e, 0x55, 0xc6, 0xa8, 0x55, 0x6b, 0x32, 0xb3, 0x6d, 0xc7, 0x07, 0x7e,
	0xeb, 0xb1, 0xed, 0x18, 0xbd, 0x5f, 0x2e, 0x17, 0x8f, 0xbe, 0x9b, 0x52, 0xa7, 0x04, 0x9e, 0x5d,
	0xee, 0x6c, 0x42, 0x3e, 0x6d, 0x42, 0xbe, 0x6d, 0x42, 0xde, 0x7f, 0x92, 0xde, 0xd3, 0x24, 0x5c,
	0xc9, 0xc8, 0xa2, 0x12, 0x05, 0x6a, 0x29, 0xf6, 0xd7, 0xcc, 0x07, 0xfe, 0x6f, 0x57, 0xbf, 0x01,
	0x00, 0x00, 0xff, 0xff, 0xba, 0xde, 0xce, 0x47, 0x62, 0x01, 0x00, 0x00,
}
