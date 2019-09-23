// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: iface/crypto/sigchain/sigchain.proto

package sigchain

import (
	fmt "fmt"
	io "io"
	math "math"
	math_bits "math/bits"

	_ "github.com/gogo/protobuf/gogoproto"
	proto "github.com/golang/protobuf/proto"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion2 // please upgrade the proto package

type SigChain struct {
	ID                   []byte           `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	Entries              []*SigChainEntry `protobuf:"bytes,2,rep,name=entries,proto3" json:"entries,omitempty"`
	XXX_NoUnkeyedLiteral struct{}         `json:"-"`
	XXX_unrecognized     []byte           `json:"-"`
	XXX_sizecache        int32            `json:"-"`
}

func (m *SigChain) Reset()         { *m = SigChain{} }
func (m *SigChain) String() string { return proto.CompactTextString(m) }
func (*SigChain) ProtoMessage()    {}
func (*SigChain) Descriptor() ([]byte, []int) {
	return fileDescriptor_fa32f8681fbf25f7, []int{0}
}
func (m *SigChain) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *SigChain) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_SigChain.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *SigChain) XXX_Merge(src proto.Message) {
	xxx_messageInfo_SigChain.Merge(m, src)
}
func (m *SigChain) XXX_Size() int {
	return m.Size()
}
func (m *SigChain) XXX_DiscardUnknown() {
	xxx_messageInfo_SigChain.DiscardUnknown(m)
}

var xxx_messageInfo_SigChain proto.InternalMessageInfo

func (m *SigChain) GetID() []byte {
	if m != nil {
		return m.ID
	}
	return nil
}

func (m *SigChain) GetEntries() []*SigChainEntry {
	if m != nil {
		return m.Entries
	}
	return nil
}

func init() {
	proto.RegisterType((*SigChain)(nil), "sigchain.SigChain")
}

func init() {
	proto.RegisterFile("iface/crypto/sigchain/sigchain.proto", fileDescriptor_fa32f8681fbf25f7)
}

var fileDescriptor_fa32f8681fbf25f7 = []byte{
	// 213 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe2, 0x52, 0xc9, 0x4c, 0x4b, 0x4c,
	0x4e, 0xd5, 0x4f, 0x2e, 0xaa, 0x2c, 0x28, 0xc9, 0xd7, 0x2f, 0xce, 0x4c, 0x4f, 0xce, 0x48, 0xcc,
	0xcc, 0x83, 0x33, 0xf4, 0x0a, 0x8a, 0xf2, 0x4b, 0xf2, 0x85, 0x38, 0x60, 0x7c, 0x29, 0x2d, 0xfc,
	0xea, 0xe3, 0x53, 0xf3, 0x4a, 0x8a, 0x2a, 0x21, 0xba, 0xa4, 0x44, 0xd2, 0xf3, 0xd3, 0xf3, 0xc1,
	0x4c, 0x7d, 0x10, 0x0b, 0x22, 0xaa, 0x94, 0xcd, 0xc5, 0x11, 0x9c, 0x99, 0xee, 0x0c, 0x52, 0x2d,
	0xa4, 0xc3, 0xc5, 0x94, 0x99, 0x22, 0xc1, 0xa8, 0xc0, 0xa8, 0xc1, 0xe3, 0x24, 0xf3, 0xe8, 0x9e,
	0x3c, 0x93, 0xa7, 0xcb, 0xa7, 0x7b, 0xf2, 0x42, 0xe9, 0xf9, 0x45, 0xb9, 0x56, 0x4a, 0x05, 0x45,
	0x99, 0xb9, 0x89, 0x45, 0x95, 0xf1, 0xd9, 0xa9, 0x95, 0x4a, 0x41, 0x4c, 0x99, 0x29, 0x42, 0x86,
	0x5c, 0xec, 0x20, 0xe3, 0x33, 0x53, 0x8b, 0x25, 0x98, 0x14, 0x98, 0x35, 0xb8, 0x8d, 0xc4, 0xf5,
	0xe0, 0xee, 0x84, 0x19, 0xe9, 0x0a, 0xb2, 0x3f, 0x08, 0xa6, 0xce, 0xc9, 0xfc, 0xc4, 0x23, 0x39,
	0xc6, 0x0b, 0x8f, 0xe4, 0x18, 0x1f, 0x3c, 0x92, 0x63, 0x9c, 0xf1, 0x58, 0x8e, 0x21, 0x4a, 0x35,
	0x29, 0xb5, 0xa8, 0xa4, 0x52, 0xaf, 0x24, 0x35, 0x39, 0x43, 0x3f, 0x39, 0xbf, 0x28, 0x55, 0x1f,
	0xab, 0x87, 0x92, 0xd8, 0xc0, 0x8e, 0x35, 0x06, 0x04, 0x00, 0x00, 0xff, 0xff, 0x2c, 0x88, 0xd0,
	0xdd, 0x20, 0x01, 0x00, 0x00,
}

func (m *SigChain) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *SigChain) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *SigChain) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if len(m.Entries) > 0 {
		for iNdEx := len(m.Entries) - 1; iNdEx >= 0; iNdEx-- {
			{
				size, err := m.Entries[iNdEx].MarshalToSizedBuffer(dAtA[:i])
				if err != nil {
					return 0, err
				}
				i -= size
				i = encodeVarintSigchain(dAtA, i, uint64(size))
			}
			i--
			dAtA[i] = 0x12
		}
	}
	if len(m.ID) > 0 {
		i -= len(m.ID)
		copy(dAtA[i:], m.ID)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.ID)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func encodeVarintSigchain(dAtA []byte, offset int, v uint64) int {
	offset -= sovSigchain(v)
	base := offset
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return base
}
func (m *SigChain) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.ID)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
	}
	if len(m.Entries) > 0 {
		for _, e := range m.Entries {
			l = e.Size()
			n += 1 + l + sovSigchain(uint64(l))
		}
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func sovSigchain(x uint64) (n int) {
	return (math_bits.Len64(x|1) + 6) / 7
}
func sozSigchain(x uint64) (n int) {
	return sovSigchain(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *SigChain) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowSigchain
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: SigChain: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: SigChain: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ID", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowSigchain
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				byteLen |= int(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if byteLen < 0 {
				return ErrInvalidLengthSigchain
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthSigchain
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ID = append(m.ID[:0], dAtA[iNdEx:postIndex]...)
			if m.ID == nil {
				m.ID = []byte{}
			}
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Entries", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowSigchain
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= int(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthSigchain
			}
			postIndex := iNdEx + msglen
			if postIndex < 0 {
				return ErrInvalidLengthSigchain
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Entries = append(m.Entries, &SigChainEntry{})
			if err := m.Entries[len(m.Entries)-1].Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipSigchain(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthSigchain
			}
			if (iNdEx + skippy) < 0 {
				return ErrInvalidLengthSigchain
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
func skipSigchain(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowSigchain
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
					return 0, ErrIntOverflowSigchain
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
					return 0, ErrIntOverflowSigchain
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
			if length < 0 {
				return 0, ErrInvalidLengthSigchain
			}
			iNdEx += length
			if iNdEx < 0 {
				return 0, ErrInvalidLengthSigchain
			}
			return iNdEx, nil
		case 3:
			for {
				var innerWire uint64
				var start int = iNdEx
				for shift := uint(0); ; shift += 7 {
					if shift >= 64 {
						return 0, ErrIntOverflowSigchain
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
				next, err := skipSigchain(dAtA[start:])
				if err != nil {
					return 0, err
				}
				iNdEx = start + next
				if iNdEx < 0 {
					return 0, ErrInvalidLengthSigchain
				}
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
	ErrInvalidLengthSigchain = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowSigchain   = fmt.Errorf("proto: integer overflow")
)
