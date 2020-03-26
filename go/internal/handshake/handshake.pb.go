// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: go-internal/handshake.proto

package handshake

import (
	fmt "fmt"
	io "io"
	math "math"
	math_bits "math/bits"

	_ "github.com/gogo/protobuf/gogoproto"
	proto "github.com/gogo/protobuf/proto"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.GoGoProtoPackageIsVersion3 // please upgrade the proto package

type HandshakeFrame_HandshakeStep int32

const (
	HandshakeFrame_STEP_1_KEY_AGREEMENT              HandshakeFrame_HandshakeStep = 0
	HandshakeFrame_STEP_2_KEY_AGREEMENT              HandshakeFrame_HandshakeStep = 1
	HandshakeFrame_STEP_3_DISPATCH                   HandshakeFrame_HandshakeStep = 10
	HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF      HandshakeFrame_HandshakeStep = 20
	HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE HandshakeFrame_HandshakeStep = 21
	HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE HandshakeFrame_HandshakeStep = 22
	HandshakeFrame_STEP_3B_KNOWN_DEVICE_PROOF        HandshakeFrame_HandshakeStep = 30
	HandshakeFrame_STEP_4B_KNOWN_DEVICE_DISCLOSURE   HandshakeFrame_HandshakeStep = 31
	HandshakeFrame_STEP_9_DONE                       HandshakeFrame_HandshakeStep = 999
)

var HandshakeFrame_HandshakeStep_name = map[int32]string{
	0:   "STEP_1_KEY_AGREEMENT",
	1:   "STEP_2_KEY_AGREEMENT",
	10:  "STEP_3_DISPATCH",
	20:  "STEP_3A_KNOWN_IDENTITY_PROOF",
	21:  "STEP_4A_KNOWN_IDENTITY_DISCLOSURE",
	22:  "STEP_5A_KNOWN_IDENTITY_DISCLOSURE",
	30:  "STEP_3B_KNOWN_DEVICE_PROOF",
	31:  "STEP_4B_KNOWN_DEVICE_DISCLOSURE",
	999: "STEP_9_DONE",
}

var HandshakeFrame_HandshakeStep_value = map[string]int32{
	"STEP_1_KEY_AGREEMENT":              0,
	"STEP_2_KEY_AGREEMENT":              1,
	"STEP_3_DISPATCH":                   10,
	"STEP_3A_KNOWN_IDENTITY_PROOF":      20,
	"STEP_4A_KNOWN_IDENTITY_DISCLOSURE": 21,
	"STEP_5A_KNOWN_IDENTITY_DISCLOSURE": 22,
	"STEP_3B_KNOWN_DEVICE_PROOF":        30,
	"STEP_4B_KNOWN_DEVICE_DISCLOSURE":   31,
	"STEP_9_DONE":                       999,
}

func (x HandshakeFrame_HandshakeStep) String() string {
	return proto.EnumName(HandshakeFrame_HandshakeStep_name, int32(x))
}

func (HandshakeFrame_HandshakeStep) EnumDescriptor() ([]byte, []int) {
	return fileDescriptor_7dc780342ca42053, []int{0, 0}
}

type HandshakeFrame struct {
	Step                 HandshakeFrame_HandshakeStep `protobuf:"varint,1,opt,name=step,proto3,enum=handshake.HandshakeFrame_HandshakeStep" json:"step,omitempty"`
	SignatureKey         []byte                       `protobuf:"bytes,2,opt,name=signatureKey,proto3" json:"signatureKey,omitempty"`
	EncryptionKey        []byte                       `protobuf:"bytes,3,opt,name=encryptionKey,proto3" json:"encryptionKey,omitempty"`
	EncryptedPayload     []byte                       `protobuf:"bytes,4,opt,name=encryptedPayload,proto3" json:"encryptedPayload,omitempty"`
	XXX_NoUnkeyedLiteral struct{}                     `json:"-"`
	XXX_unrecognized     []byte                       `json:"-"`
	XXX_sizecache        int32                        `json:"-"`
}

func (m *HandshakeFrame) Reset()         { *m = HandshakeFrame{} }
func (m *HandshakeFrame) String() string { return proto.CompactTextString(m) }
func (*HandshakeFrame) ProtoMessage()    {}
func (*HandshakeFrame) Descriptor() ([]byte, []int) {
	return fileDescriptor_7dc780342ca42053, []int{0}
}
func (m *HandshakeFrame) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *HandshakeFrame) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_HandshakeFrame.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *HandshakeFrame) XXX_Merge(src proto.Message) {
	xxx_messageInfo_HandshakeFrame.Merge(m, src)
}
func (m *HandshakeFrame) XXX_Size() int {
	return m.Size()
}
func (m *HandshakeFrame) XXX_DiscardUnknown() {
	xxx_messageInfo_HandshakeFrame.DiscardUnknown(m)
}

var xxx_messageInfo_HandshakeFrame proto.InternalMessageInfo

func (m *HandshakeFrame) GetStep() HandshakeFrame_HandshakeStep {
	if m != nil {
		return m.Step
	}
	return HandshakeFrame_STEP_1_KEY_AGREEMENT
}

func (m *HandshakeFrame) GetSignatureKey() []byte {
	if m != nil {
		return m.SignatureKey
	}
	return nil
}

func (m *HandshakeFrame) GetEncryptionKey() []byte {
	if m != nil {
		return m.EncryptionKey
	}
	return nil
}

func (m *HandshakeFrame) GetEncryptedPayload() []byte {
	if m != nil {
		return m.EncryptedPayload
	}
	return nil
}

type HandshakePayload struct {
	Signature            []byte   `protobuf:"bytes,1,opt,name=signature,proto3" json:"signature,omitempty"`
	AccountKey           []byte   `protobuf:"bytes,2,opt,name=accountKey,proto3" json:"accountKey,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *HandshakePayload) Reset()         { *m = HandshakePayload{} }
func (m *HandshakePayload) String() string { return proto.CompactTextString(m) }
func (*HandshakePayload) ProtoMessage()    {}
func (*HandshakePayload) Descriptor() ([]byte, []int) {
	return fileDescriptor_7dc780342ca42053, []int{1}
}
func (m *HandshakePayload) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *HandshakePayload) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_HandshakePayload.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *HandshakePayload) XXX_Merge(src proto.Message) {
	xxx_messageInfo_HandshakePayload.Merge(m, src)
}
func (m *HandshakePayload) XXX_Size() int {
	return m.Size()
}
func (m *HandshakePayload) XXX_DiscardUnknown() {
	xxx_messageInfo_HandshakePayload.DiscardUnknown(m)
}

var xxx_messageInfo_HandshakePayload proto.InternalMessageInfo

func (m *HandshakePayload) GetSignature() []byte {
	if m != nil {
		return m.Signature
	}
	return nil
}

func (m *HandshakePayload) GetAccountKey() []byte {
	if m != nil {
		return m.AccountKey
	}
	return nil
}

func init() {
	proto.RegisterEnum("handshake.HandshakeFrame_HandshakeStep", HandshakeFrame_HandshakeStep_name, HandshakeFrame_HandshakeStep_value)
	proto.RegisterType((*HandshakeFrame)(nil), "handshake.HandshakeFrame")
	proto.RegisterType((*HandshakePayload)(nil), "handshake.HandshakePayload")
}

func init() { proto.RegisterFile("go-internal/handshake.proto", fileDescriptor_7dc780342ca42053) }

var fileDescriptor_7dc780342ca42053 = []byte{
	// 429 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x7c, 0x92, 0xd1, 0x6a, 0xd4, 0x40,
	0x14, 0x86, 0x4d, 0x5b, 0x94, 0x1e, 0xb7, 0x75, 0x18, 0xab, 0x2c, 0xb5, 0xa4, 0xeb, 0xaa, 0x58,
	0x85, 0x6e, 0x70, 0xab, 0x88, 0x78, 0xb5, 0xdd, 0x4c, 0x6d, 0x58, 0x4d, 0x42, 0x12, 0x95, 0x7a,
	0x33, 0xcc, 0x66, 0xc7, 0x6c, 0xb0, 0xcd, 0x84, 0xec, 0x44, 0xc8, 0xd3, 0xf8, 0x3a, 0x5e, 0xfa,
	0x08, 0xb2, 0x20, 0xbe, 0x86, 0x38, 0x89, 0x49, 0xd3, 0x05, 0xef, 0xe6, 0x7c, 0xe7, 0x3b, 0xf9,
	0xc3, 0x9c, 0x81, 0x7b, 0x91, 0x38, 0x8c, 0x13, 0xc9, 0xb3, 0x84, 0x9d, 0x1b, 0x73, 0x96, 0xcc,
	0x16, 0x73, 0xf6, 0x85, 0x0f, 0xd2, 0x4c, 0x48, 0x81, 0x37, 0x6b, 0xb0, 0x7b, 0x18, 0xc5, 0x72,
	0x9e, 0x4f, 0x07, 0xa1, 0xb8, 0x30, 0x22, 0x11, 0x09, 0x43, 0x19, 0xd3, 0xfc, 0xb3, 0xaa, 0x54,
	0xa1, 0x4e, 0xe5, 0x64, 0xff, 0xd7, 0x3a, 0x6c, 0x9f, 0xfe, 0x1b, 0x3e, 0xc9, 0xd8, 0x05, 0xc7,
	0xaf, 0x61, 0x63, 0x21, 0x79, 0xda, 0xd5, 0x7a, 0xda, 0xc1, 0xf6, 0xf0, 0xf1, 0xa0, 0x09, 0x6b,
	0x8b, 0x4d, 0xe9, 0x4b, 0x9e, 0x7a, 0x6a, 0x08, 0xf7, 0xa1, 0xb3, 0x88, 0xa3, 0x84, 0xc9, 0x3c,
	0xe3, 0x13, 0x5e, 0x74, 0xd7, 0x7a, 0xda, 0x41, 0xc7, 0x6b, 0x31, 0xfc, 0x10, 0xb6, 0x78, 0x12,
	0x66, 0x45, 0x2a, 0x63, 0x91, 0xfc, 0x95, 0xd6, 0x95, 0xd4, 0x86, 0xf8, 0x29, 0xa0, 0x0a, 0xf0,
	0x99, 0xcb, 0x8a, 0x73, 0xc1, 0x66, 0xdd, 0x0d, 0x25, 0xae, 0xf0, 0xfe, 0xb7, 0x35, 0xd8, 0x6a,
	0xfd, 0x0d, 0xee, 0xc2, 0x8e, 0x1f, 0x10, 0x97, 0x3e, 0xa3, 0x13, 0x72, 0x46, 0x47, 0x6f, 0x3c,
	0x42, 0xde, 0x11, 0x3b, 0x40, 0xd7, 0xea, 0xce, 0xf0, 0x4a, 0x47, 0xc3, 0xb7, 0xe1, 0x96, 0xea,
	0x1c, 0x51, 0xd3, 0xf2, 0xdd, 0x51, 0x30, 0x3e, 0x45, 0x80, 0x7b, 0xb0, 0x57, 0xc2, 0x11, 0x9d,
	0xd8, 0xce, 0x47, 0x9b, 0x5a, 0x26, 0xb1, 0x03, 0x2b, 0x38, 0xa3, 0xae, 0xe7, 0x38, 0x27, 0x68,
	0x07, 0x3f, 0x82, 0xfb, 0xca, 0x78, 0xbe, 0x62, 0x98, 0x96, 0x3f, 0x7e, 0xeb, 0xf8, 0xef, 0x3d,
	0x82, 0xee, 0xd4, 0xda, 0x8b, 0xff, 0x69, 0x77, 0xb1, 0x0e, 0xbb, 0x65, 0xde, 0x71, 0xa5, 0x99,
	0xe4, 0x83, 0x35, 0x26, 0x55, 0x9a, 0x8e, 0x1f, 0xc0, 0x7e, 0x99, 0x76, 0xa5, 0x7f, 0xe9, 0x23,
	0xfb, 0x18, 0xc1, 0x4d, 0x25, 0xbd, 0xa2, 0xa6, 0x63, 0x13, 0xf4, 0xfb, 0x46, 0xdf, 0x05, 0x54,
	0x5f, 0x50, 0x75, 0x6b, 0x78, 0x0f, 0x36, 0xeb, 0xbd, 0xa8, 0x6d, 0x77, 0xbc, 0x06, 0x60, 0x1d,
	0x80, 0x85, 0xa1, 0xc8, 0x13, 0xd9, 0xec, 0xf1, 0x12, 0x39, 0x7e, 0xf9, 0x7d, 0xa9, 0x6b, 0x3f,
	0x96, 0xba, 0xf6, 0x73, 0xa9, 0x6b, 0x9f, 0x9e, 0x4c, 0x79, 0x26, 0x8b, 0x81, 0xe4, 0xe1, 0xdc,
	0x50, 0x47, 0xe3, 0xeb, 0xd0, 0x88, 0x84, 0xb1, 0xfa, 0x64, 0xa7, 0xd7, 0xd5, 0xcb, 0x3b, 0xfa,
	0x13, 0x00, 0x00, 0xff, 0xff, 0x99, 0xab, 0x71, 0xbd, 0xd2, 0x02, 0x00, 0x00,
}

func (m *HandshakeFrame) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *HandshakeFrame) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *HandshakeFrame) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if len(m.EncryptedPayload) > 0 {
		i -= len(m.EncryptedPayload)
		copy(dAtA[i:], m.EncryptedPayload)
		i = encodeVarintHandshake(dAtA, i, uint64(len(m.EncryptedPayload)))
		i--
		dAtA[i] = 0x22
	}
	if len(m.EncryptionKey) > 0 {
		i -= len(m.EncryptionKey)
		copy(dAtA[i:], m.EncryptionKey)
		i = encodeVarintHandshake(dAtA, i, uint64(len(m.EncryptionKey)))
		i--
		dAtA[i] = 0x1a
	}
	if len(m.SignatureKey) > 0 {
		i -= len(m.SignatureKey)
		copy(dAtA[i:], m.SignatureKey)
		i = encodeVarintHandshake(dAtA, i, uint64(len(m.SignatureKey)))
		i--
		dAtA[i] = 0x12
	}
	if m.Step != 0 {
		i = encodeVarintHandshake(dAtA, i, uint64(m.Step))
		i--
		dAtA[i] = 0x8
	}
	return len(dAtA) - i, nil
}

func (m *HandshakePayload) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *HandshakePayload) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *HandshakePayload) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if len(m.AccountKey) > 0 {
		i -= len(m.AccountKey)
		copy(dAtA[i:], m.AccountKey)
		i = encodeVarintHandshake(dAtA, i, uint64(len(m.AccountKey)))
		i--
		dAtA[i] = 0x12
	}
	if len(m.Signature) > 0 {
		i -= len(m.Signature)
		copy(dAtA[i:], m.Signature)
		i = encodeVarintHandshake(dAtA, i, uint64(len(m.Signature)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func encodeVarintHandshake(dAtA []byte, offset int, v uint64) int {
	offset -= sovHandshake(v)
	base := offset
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return base
}
func (m *HandshakeFrame) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	if m.Step != 0 {
		n += 1 + sovHandshake(uint64(m.Step))
	}
	l = len(m.SignatureKey)
	if l > 0 {
		n += 1 + l + sovHandshake(uint64(l))
	}
	l = len(m.EncryptionKey)
	if l > 0 {
		n += 1 + l + sovHandshake(uint64(l))
	}
	l = len(m.EncryptedPayload)
	if l > 0 {
		n += 1 + l + sovHandshake(uint64(l))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func (m *HandshakePayload) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.Signature)
	if l > 0 {
		n += 1 + l + sovHandshake(uint64(l))
	}
	l = len(m.AccountKey)
	if l > 0 {
		n += 1 + l + sovHandshake(uint64(l))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func sovHandshake(x uint64) (n int) {
	return (math_bits.Len64(x|1) + 6) / 7
}
func sozHandshake(x uint64) (n int) {
	return sovHandshake(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *HandshakeFrame) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowHandshake
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
			return fmt.Errorf("proto: HandshakeFrame: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: HandshakeFrame: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field Step", wireType)
			}
			m.Step = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowHandshake
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.Step |= HandshakeFrame_HandshakeStep(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field SignatureKey", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowHandshake
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
				return ErrInvalidLengthHandshake
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthHandshake
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.SignatureKey = append(m.SignatureKey[:0], dAtA[iNdEx:postIndex]...)
			if m.SignatureKey == nil {
				m.SignatureKey = []byte{}
			}
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field EncryptionKey", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowHandshake
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
				return ErrInvalidLengthHandshake
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthHandshake
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.EncryptionKey = append(m.EncryptionKey[:0], dAtA[iNdEx:postIndex]...)
			if m.EncryptionKey == nil {
				m.EncryptionKey = []byte{}
			}
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field EncryptedPayload", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowHandshake
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
				return ErrInvalidLengthHandshake
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthHandshake
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.EncryptedPayload = append(m.EncryptedPayload[:0], dAtA[iNdEx:postIndex]...)
			if m.EncryptedPayload == nil {
				m.EncryptedPayload = []byte{}
			}
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipHandshake(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthHandshake
			}
			if (iNdEx + skippy) < 0 {
				return ErrInvalidLengthHandshake
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
func (m *HandshakePayload) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowHandshake
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
			return fmt.Errorf("proto: HandshakePayload: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: HandshakePayload: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Signature", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowHandshake
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
				return ErrInvalidLengthHandshake
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthHandshake
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Signature = append(m.Signature[:0], dAtA[iNdEx:postIndex]...)
			if m.Signature == nil {
				m.Signature = []byte{}
			}
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field AccountKey", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowHandshake
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
				return ErrInvalidLengthHandshake
			}
			postIndex := iNdEx + byteLen
			if postIndex < 0 {
				return ErrInvalidLengthHandshake
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.AccountKey = append(m.AccountKey[:0], dAtA[iNdEx:postIndex]...)
			if m.AccountKey == nil {
				m.AccountKey = []byte{}
			}
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipHandshake(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthHandshake
			}
			if (iNdEx + skippy) < 0 {
				return ErrInvalidLengthHandshake
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
func skipHandshake(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	depth := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowHandshake
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
					return 0, ErrIntOverflowHandshake
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				iNdEx++
				if dAtA[iNdEx-1] < 0x80 {
					break
				}
			}
		case 1:
			iNdEx += 8
		case 2:
			var length int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowHandshake
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
				return 0, ErrInvalidLengthHandshake
			}
			iNdEx += length
		case 3:
			depth++
		case 4:
			if depth == 0 {
				return 0, ErrUnexpectedEndOfGroupHandshake
			}
			depth--
		case 5:
			iNdEx += 4
		default:
			return 0, fmt.Errorf("proto: illegal wireType %d", wireType)
		}
		if iNdEx < 0 {
			return 0, ErrInvalidLengthHandshake
		}
		if depth == 0 {
			return iNdEx, nil
		}
	}
	return 0, io.ErrUnexpectedEOF
}

var (
	ErrInvalidLengthHandshake        = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowHandshake          = fmt.Errorf("proto: integer overflow")
	ErrUnexpectedEndOfGroupHandshake = fmt.Errorf("proto: unexpected end of group")
)
