// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: iface/datastore/models/groupmember/group_member.proto

package groupmember

import (
	fmt "fmt"
	io "io"
	math "math"
	math_bits "math/bits"
	time "time"

	_ "berty.tech/go/internal/crypto/group"
	_ "github.com/gogo/protobuf/gogoproto"
	github_com_gogo_protobuf_types "github.com/gogo/protobuf/types"
	proto "github.com/golang/protobuf/proto"
	_ "github.com/golang/protobuf/ptypes/timestamp"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf
var _ = time.Kitchen

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion2 // please upgrade the proto package

type GroupMember struct {
	PublicKeyBytes       []byte    `protobuf:"bytes,1,opt,name=public_key_bytes,json=publicKeyBytes,proto3" json:"public_key_bytes,omitempty" gorm:"primary_key"`
	GroupID              []byte    `protobuf:"bytes,2,opt,name=group_id,json=groupId,proto3" json:"group_id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time `protobuf:"bytes,3,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt            time.Time `protobuf:"bytes,4,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	GroupSecret          []byte    `protobuf:"bytes,5,opt,name=group_secret,json=groupSecret,proto3" json:"group_secret,omitempty"`
	DerivationState      []byte    `protobuf:"bytes,6,opt,name=derivation_state,json=derivationState,proto3" json:"derivation_state,omitempty"`
	DerivationCounter    []byte    `protobuf:"bytes,7,opt,name=derivation_counter,json=derivationCounter,proto3" json:"derivation_counter,omitempty"`
	XXX_NoUnkeyedLiteral struct{}  `json:"-"`
	XXX_unrecognized     []byte    `json:"-"`
	XXX_sizecache        int32     `json:"-"`
}

func (m *GroupMember) Reset()         { *m = GroupMember{} }
func (m *GroupMember) String() string { return proto.CompactTextString(m) }
func (*GroupMember) ProtoMessage()    {}
func (*GroupMember) Descriptor() ([]byte, []int) {
	return fileDescriptor_121b8c308fc1940d, []int{0}
}
func (m *GroupMember) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *GroupMember) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_GroupMember.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *GroupMember) XXX_Merge(src proto.Message) {
	xxx_messageInfo_GroupMember.Merge(m, src)
}
func (m *GroupMember) XXX_Size() int {
	return m.Size()
}
func (m *GroupMember) XXX_DiscardUnknown() {
	xxx_messageInfo_GroupMember.DiscardUnknown(m)
}

var xxx_messageInfo_GroupMember proto.InternalMessageInfo

func (m *GroupMember) GetPublicKeyBytes() []byte {
	if m != nil {
		return m.PublicKeyBytes
	}
	return nil
}

func (m *GroupMember) GetGroupID() []byte {
	if m != nil {
		return m.GroupID
	}
	return nil
}

func (m *GroupMember) GetCreatedAt() time.Time {
	if m != nil {
		return m.CreatedAt
	}
	return time.Time{}
}

func (m *GroupMember) GetUpdatedAt() time.Time {
	if m != nil {
		return m.UpdatedAt
	}
	return time.Time{}
}

func (m *GroupMember) GetGroupSecret() []byte {
	if m != nil {
		return m.GroupSecret
	}
	return nil
}

func (m *GroupMember) GetDerivationState() []byte {
	if m != nil {
		return m.DerivationState
	}
	return nil
}

func (m *GroupMember) GetDerivationCounter() []byte {
	if m != nil {
		return m.DerivationCounter
	}
	return nil
}

func init() {
	proto.RegisterType((*GroupMember)(nil), "groupmember.GroupMember")
}

func init() {
	proto.RegisterFile("iface/datastore/models/groupmember/group_member.proto", fileDescriptor_121b8c308fc1940d)
}

var fileDescriptor_121b8c308fc1940d = []byte{
	// 395 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x94, 0x92, 0xc1, 0xee, 0xd2, 0x40,
	0x10, 0xc6, 0xa9, 0x28, 0xe0, 0x42, 0x14, 0x37, 0xc6, 0x34, 0x3d, 0xb4, 0xc0, 0xc1, 0xe0, 0xc1,
	0x36, 0xc1, 0x78, 0x31, 0x1e, 0xa4, 0x90, 0x18, 0x62, 0xbc, 0x80, 0x27, 0x2f, 0xcd, 0x76, 0x3b,
	0xd4, 0x46, 0xca, 0x36, 0xdb, 0xa9, 0x49, 0xdf, 0xc2, 0x83, 0x07, 0x1f, 0x89, 0xa3, 0x4f, 0x80,
	0xa6, 0xbe, 0x81, 0x4f, 0x60, 0x76, 0x17, 0x02, 0x07, 0xcd, 0x3f, 0xff, 0xdb, 0x74, 0xbe, 0xdf,
	0xf7, 0x4d, 0x66, 0xba, 0xe4, 0x65, 0xb6, 0x65, 0x1c, 0x82, 0x84, 0x21, 0x2b, 0x51, 0x48, 0x08,
	0x72, 0x91, 0xc0, 0xae, 0x0c, 0x52, 0x29, 0xaa, 0x22, 0x87, 0x3c, 0x06, 0x69, 0xea, 0xc8, 0x7c,
	0xf8, 0x85, 0x14, 0x28, 0x68, 0xff, 0x4a, 0x77, 0xbc, 0x54, 0x88, 0x74, 0x07, 0x81, 0x96, 0xe2,
	0x6a, 0x1b, 0x60, 0x96, 0x43, 0x89, 0x2c, 0x2f, 0x0c, 0xed, 0x3c, 0x35, 0x43, 0xb8, 0xac, 0x0b,
	0x14, 0x26, 0xae, 0xfc, 0x47, 0xaa, 0xf3, 0x38, 0x15, 0xa9, 0xd0, 0x65, 0xa0, 0x2a, 0xd3, 0x9d,
	0x7c, 0x6b, 0x93, 0xfe, 0x5b, 0x05, 0xbf, 0xd7, 0x2c, 0x7d, 0x43, 0x86, 0x45, 0x15, 0xef, 0x32,
	0x1e, 0x7d, 0x86, 0x3a, 0x8a, 0x6b, 0x84, 0xd2, 0xb6, 0x46, 0xd6, 0x74, 0x10, 0x3e, 0xf9, 0x73,
	0xf4, 0x68, 0x2a, 0x64, 0xfe, 0x6a, 0x52, 0xc8, 0x2c, 0x67, 0xb2, 0x56, 0xc8, 0x64, 0xfd, 0xc0,
	0xf0, 0xef, 0xa0, 0x0e, 0x15, 0x4d, 0x5f, 0x93, 0x9e, 0x99, 0x9e, 0x25, 0xf6, 0x1d, 0xed, 0x1c,
	0x37, 0x47, 0xaf, 0xab, 0x87, 0xac, 0x96, 0xff, 0x09, 0xe9, 0x6a, 0xcb, 0x2a, 0xa1, 0x0b, 0x42,
	0xb8, 0x04, 0x86, 0x90, 0x44, 0x0c, 0xed, 0xf6, 0xc8, 0x9a, 0xf6, 0x67, 0x8e, 0x6f, 0x6e, 0xe0,
	0x9f, 0x6f, 0xe0, 0x7f, 0x38, 0xdf, 0x20, 0xec, 0x1d, 0x8e, 0x5e, 0xeb, 0xeb, 0x4f, 0xcf, 0x5a,
	0xdf, 0x3f, 0xf9, 0xe6, 0xa8, 0x42, 0xaa, 0x22, 0x39, 0x87, 0xdc, 0xbd, 0x4d, 0xc8, 0xc9, 0x37,
	0x47, 0x3a, 0x26, 0x03, 0xb3, 0x47, 0x09, 0x5c, 0x02, 0xda, 0xf7, 0xd4, 0x2e, 0x6b, 0xf3, 0x6f,
	0x36, 0xba, 0x45, 0x9f, 0x91, 0x61, 0x02, 0x32, 0xfb, 0xc2, 0x30, 0x13, 0xfb, 0xa8, 0x44, 0x86,
	0x60, 0x77, 0x34, 0xf6, 0xf0, 0xd2, 0xdf, 0xa8, 0x36, 0x7d, 0x4e, 0xe8, 0x15, 0xca, 0x45, 0xb5,
	0x47, 0x90, 0x76, 0x57, 0xc3, 0x8f, 0x2e, 0xca, 0xc2, 0x08, 0xe1, 0xf2, 0xd0, 0xb8, 0xd6, 0x8f,
	0xc6, 0xb5, 0x7e, 0x35, 0xae, 0xf5, 0xfd, 0xb7, 0xdb, 0xfa, 0x38, 0x8b, 0x41, 0x62, 0xed, 0x23,
	0xf0, 0x4f, 0x01, 0x57, 0x6f, 0xe9, 0xe6, 0xb7, 0x15, 0x77, 0xf4, 0xae, 0x2f, 0xfe, 0x06, 0x00,
	0x00, 0xff, 0xff, 0xa5, 0x29, 0xc8, 0xbd, 0x88, 0x02, 0x00, 0x00,
}

func (m *GroupMember) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *GroupMember) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *GroupMember) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if len(m.DerivationCounter) > 0 {
		i -= len(m.DerivationCounter)
		copy(dAtA[i:], m.DerivationCounter)
		i = encodeVarintGroupMember(dAtA, i, uint64(len(m.DerivationCounter)))
		i--
		dAtA[i] = 0x3a
	}
	if len(m.DerivationState) > 0 {
		i -= len(m.DerivationState)
		copy(dAtA[i:], m.DerivationState)
		i = encodeVarintGroupMember(dAtA, i, uint64(len(m.DerivationState)))
		i--
		dAtA[i] = 0x32
	}
	if len(m.GroupSecret) > 0 {
		i -= len(m.GroupSecret)
		copy(dAtA[i:], m.GroupSecret)
		i = encodeVarintGroupMember(dAtA, i, uint64(len(m.GroupSecret)))
		i--
		dAtA[i] = 0x2a
	}
	n1, err1 := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.UpdatedAt, dAtA[i-github_com_gogo_protobuf_types.SizeOfStdTime(m.UpdatedAt):])
	if err1 != nil {
		return 0, err1
	}
	i -= n1
	i = encodeVarintGroupMember(dAtA, i, uint64(n1))
	i--
	dAtA[i] = 0x22
	n2, err2 := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.CreatedAt, dAtA[i-github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt):])
	if err2 != nil {
		return 0, err2
	}
	i -= n2
	i = encodeVarintGroupMember(dAtA, i, uint64(n2))
	i--
	dAtA[i] = 0x1a
	if len(m.GroupID) > 0 {
		i -= len(m.GroupID)
		copy(dAtA[i:], m.GroupID)
		i = encodeVarintGroupMember(dAtA, i, uint64(len(m.GroupID)))
		i--
		dAtA[i] = 0x12
	}
	if len(m.PublicKeyBytes) > 0 {
		i -= len(m.PublicKeyBytes)
		copy(dAtA[i:], m.PublicKeyBytes)
		i = encodeVarintGroupMember(dAtA, i, uint64(len(m.PublicKeyBytes)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func encodeVarintGroupMember(dAtA []byte, offset int, v uint64) int {
	offset -= sovGroupMember(v)
	base := offset
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return base
}
func (m *GroupMember) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.PublicKeyBytes)
	if l > 0 {
		n += 1 + l + sovGroupMember(uint64(l))
	}
	l = len(m.GroupID)
	if l > 0 {
		n += 1 + l + sovGroupMember(uint64(l))
	}
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt)
	n += 1 + l + sovGroupMember(uint64(l))
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.UpdatedAt)
	n += 1 + l + sovGroupMember(uint64(l))
	l = len(m.GroupSecret)
	if l > 0 {
		n += 1 + l + sovGroupMember(uint64(l))
	}
	l = len(m.DerivationState)
	if l > 0 {
		n += 1 + l + sovGroupMember(uint64(l))
	}
	l = len(m.DerivationCounter)
	if l > 0 {
		n += 1 + l + sovGroupMember(uint64(l))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func sovGroupMember(x uint64) (n int) {
	return (math_bits.Len64(x|1) + 6) / 7
}
func sozGroupMember(x uint64) (n int) {
	return sovGroupMember(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *GroupMember) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowGroupMember
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
			return fmt.Errorf("proto: GroupMember: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: GroupMember: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field PublicKeyBytes", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowGroupMember
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
				return ErrInvalidLengthGroupMember
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthGroupMember
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.PublicKeyBytes = append(m.PublicKeyBytes[:0], dAtA[iNdEx:postIndex]...)
			if m.PublicKeyBytes == nil {
				m.PublicKeyBytes = []byte{}
			}
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field GroupID", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowGroupMember
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
				return ErrInvalidLengthGroupMember
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthGroupMember
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.GroupID = append(m.GroupID[:0], dAtA[iNdEx:postIndex]...)
			if m.GroupID == nil {
				m.GroupID = []byte{}
			}
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CreatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowGroupMember
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
				return ErrInvalidLengthGroupMember
			}
			postIndex := iNdEx + msglen
			if postIndex < 0 {
				return ErrInvalidLengthGroupMember
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.CreatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field UpdatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowGroupMember
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
				return ErrInvalidLengthGroupMember
			}
			postIndex := iNdEx + msglen
			if postIndex < 0 {
				return ErrInvalidLengthGroupMember
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.UpdatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 5:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field GroupSecret", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowGroupMember
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
				return ErrInvalidLengthGroupMember
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthGroupMember
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.GroupSecret = append(m.GroupSecret[:0], dAtA[iNdEx:postIndex]...)
			if m.GroupSecret == nil {
				m.GroupSecret = []byte{}
			}
			iNdEx = postIndex
		case 6:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field DerivationState", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowGroupMember
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
				return ErrInvalidLengthGroupMember
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthGroupMember
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.DerivationState = append(m.DerivationState[:0], dAtA[iNdEx:postIndex]...)
			if m.DerivationState == nil {
				m.DerivationState = []byte{}
			}
			iNdEx = postIndex
		case 7:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field DerivationCounter", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowGroupMember
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
				return ErrInvalidLengthGroupMember
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthGroupMember
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.DerivationCounter = append(m.DerivationCounter[:0], dAtA[iNdEx:postIndex]...)
			if m.DerivationCounter == nil {
				m.DerivationCounter = []byte{}
			}
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipGroupMember(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthGroupMember
			}
			if (iNdEx + skippy) < 0 {
				return ErrInvalidLengthGroupMember
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
func skipGroupMember(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowGroupMember
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
					return 0, ErrIntOverflowGroupMember
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
					return 0, ErrIntOverflowGroupMember
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
				return 0, ErrInvalidLengthGroupMember
			}
			iNdEx += length
			if iNdEx < 0 {
				return 0, ErrInvalidLengthGroupMember
			}
			return iNdEx, nil
		case 3:
			for {
				var innerWire uint64
				var start int = iNdEx
				for shift := uint(0); ; shift += 7 {
					if shift >= 64 {
						return 0, ErrIntOverflowGroupMember
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
				next, err := skipGroupMember(dAtA[start:])
				if err != nil {
					return 0, err
				}
				iNdEx = start + next
				if iNdEx < 0 {
					return 0, ErrInvalidLengthGroupMember
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
	ErrInvalidLengthGroupMember = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowGroupMember   = fmt.Errorf("proto: integer overflow")
)
