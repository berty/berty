// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: crypto/sigchain/sigchain.proto

package sigchain

import (
	fmt "fmt"
	io "io"
	math "math"
	math_bits "math/bits"
	time "time"

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

type EventExtensionVersions int32

const (
	EventExtensionVersions_UNKNOWN_VERSION EventExtensionVersions = 0
	EventExtensionVersions_VERSION_1       EventExtensionVersions = 1
)

var EventExtensionVersions_name = map[int32]string{
	0: "UNKNOWN_VERSION",
	1: "VERSION_1",
}

var EventExtensionVersions_value = map[string]int32{
	"UNKNOWN_VERSION": 0,
	"VERSION_1":       1,
}

func (x EventExtensionVersions) String() string {
	return proto.EnumName(EventExtensionVersions_name, int32(x))
}

func (EventExtensionVersions) EnumDescriptor() ([]byte, []int) {
	return fileDescriptor_d0682ab8209f76a7, []int{0}
}

type SigEvent_SigEventType int32

const (
	SigEvent_INIT_CHAIN    SigEvent_SigEventType = 0
	SigEvent_ADD_DEVICE    SigEvent_SigEventType = 1
	SigEvent_REMOVE_DEVICE SigEvent_SigEventType = 2
)

var SigEvent_SigEventType_name = map[int32]string{
	0: "INIT_CHAIN",
	1: "ADD_DEVICE",
	2: "REMOVE_DEVICE",
}

var SigEvent_SigEventType_value = map[string]int32{
	"INIT_CHAIN":    0,
	"ADD_DEVICE":    1,
	"REMOVE_DEVICE": 2,
}

func (x SigEvent_SigEventType) String() string {
	return proto.EnumName(SigEvent_SigEventType_name, int32(x))
}

func (SigEvent_SigEventType) EnumDescriptor() ([]byte, []int) {
	return fileDescriptor_d0682ab8209f76a7, []int{0, 0}
}

type SigEvent struct {
	EventType            SigEvent_SigEventType `protobuf:"varint,1,opt,name=event_type,json=eventType,proto3,enum=sigchain.SigEvent_SigEventType" json:"event_type,omitempty"`
	Hash                 []byte                `protobuf:"bytes,2,opt,name=hash,proto3" json:"hash,omitempty"`
	ParentHash           []byte                `protobuf:"bytes,3,opt,name=parent_hash,json=parentHash,proto3" json:"parent_hash,omitempty"`
	Payload              []byte                `protobuf:"bytes,4,opt,name=payload,proto3" json:"payload,omitempty"`
	PublicKey            []byte                `protobuf:"bytes,5,opt,name=public_key,json=publicKey,proto3" json:"public_key,omitempty"`
	CreatedAt            time.Time             `protobuf:"bytes,6,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	Issuer               []byte                `protobuf:"bytes,7,opt,name=issuer,proto3" json:"issuer,omitempty"`
	Subject              []byte                `protobuf:"bytes,8,opt,name=subject,proto3" json:"subject,omitempty"`
	XXX_NoUnkeyedLiteral struct{}              `json:"-"`
	XXX_unrecognized     []byte                `json:"-"`
	XXX_sizecache        int32                 `json:"-"`
}

func (m *SigEvent) Reset()         { *m = SigEvent{} }
func (m *SigEvent) String() string { return proto.CompactTextString(m) }
func (*SigEvent) ProtoMessage()    {}
func (*SigEvent) Descriptor() ([]byte, []int) {
	return fileDescriptor_d0682ab8209f76a7, []int{0}
}
func (m *SigEvent) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *SigEvent) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_SigEvent.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *SigEvent) XXX_Merge(src proto.Message) {
	xxx_messageInfo_SigEvent.Merge(m, src)
}
func (m *SigEvent) XXX_Size() int {
	return m.Size()
}
func (m *SigEvent) XXX_DiscardUnknown() {
	xxx_messageInfo_SigEvent.DiscardUnknown(m)
}

var xxx_messageInfo_SigEvent proto.InternalMessageInfo

func (m *SigEvent) GetEventType() SigEvent_SigEventType {
	if m != nil {
		return m.EventType
	}
	return SigEvent_INIT_CHAIN
}

func (m *SigEvent) GetHash() []byte {
	if m != nil {
		return m.Hash
	}
	return nil
}

func (m *SigEvent) GetParentHash() []byte {
	if m != nil {
		return m.ParentHash
	}
	return nil
}

func (m *SigEvent) GetPayload() []byte {
	if m != nil {
		return m.Payload
	}
	return nil
}

func (m *SigEvent) GetPublicKey() []byte {
	if m != nil {
		return m.PublicKey
	}
	return nil
}

func (m *SigEvent) GetCreatedAt() time.Time {
	if m != nil {
		return m.CreatedAt
	}
	return time.Time{}
}

func (m *SigEvent) GetIssuer() []byte {
	if m != nil {
		return m.Issuer
	}
	return nil
}

func (m *SigEvent) GetSubject() []byte {
	if m != nil {
		return m.Subject
	}
	return nil
}

type SigChain struct {
	UserId               []byte      `protobuf:"bytes,1,opt,name=user_id,json=userId,proto3" json:"user_id,omitempty"`
	Events               []*SigEvent `protobuf:"bytes,2,rep,name=events,proto3" json:"events,omitempty"`
	XXX_NoUnkeyedLiteral struct{}    `json:"-"`
	XXX_unrecognized     []byte      `json:"-"`
	XXX_sizecache        int32       `json:"-"`
}

func (m *SigChain) Reset()         { *m = SigChain{} }
func (m *SigChain) String() string { return proto.CompactTextString(m) }
func (*SigChain) ProtoMessage()    {}
func (*SigChain) Descriptor() ([]byte, []int) {
	return fileDescriptor_d0682ab8209f76a7, []int{1}
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

func (m *SigChain) GetUserId() []byte {
	if m != nil {
		return m.UserId
	}
	return nil
}

func (m *SigChain) GetEvents() []*SigEvent {
	if m != nil {
		return m.Events
	}
	return nil
}

type EventExtension struct {
	Version              EventExtensionVersions `protobuf:"varint,1,opt,name=version,proto3,enum=sigchain.EventExtensionVersions" json:"version,omitempty"`
	ParentEventHash      []byte                 `protobuf:"bytes,2,opt,name=parent_event_hash,json=parentEventHash,proto3" json:"parent_event_hash,omitempty"`
	XXX_NoUnkeyedLiteral struct{}               `json:"-"`
	XXX_unrecognized     []byte                 `json:"-"`
	XXX_sizecache        int32                  `json:"-"`
}

func (m *EventExtension) Reset()         { *m = EventExtension{} }
func (m *EventExtension) String() string { return proto.CompactTextString(m) }
func (*EventExtension) ProtoMessage()    {}
func (*EventExtension) Descriptor() ([]byte, []int) {
	return fileDescriptor_d0682ab8209f76a7, []int{2}
}
func (m *EventExtension) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *EventExtension) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_EventExtension.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *EventExtension) XXX_Merge(src proto.Message) {
	xxx_messageInfo_EventExtension.Merge(m, src)
}
func (m *EventExtension) XXX_Size() int {
	return m.Size()
}
func (m *EventExtension) XXX_DiscardUnknown() {
	xxx_messageInfo_EventExtension.DiscardUnknown(m)
}

var xxx_messageInfo_EventExtension proto.InternalMessageInfo

func (m *EventExtension) GetVersion() EventExtensionVersions {
	if m != nil {
		return m.Version
	}
	return EventExtensionVersions_UNKNOWN_VERSION
}

func (m *EventExtension) GetParentEventHash() []byte {
	if m != nil {
		return m.ParentEventHash
	}
	return nil
}

func init() {
	proto.RegisterEnum("sigchain.EventExtensionVersions", EventExtensionVersions_name, EventExtensionVersions_value)
	proto.RegisterEnum("sigchain.SigEvent_SigEventType", SigEvent_SigEventType_name, SigEvent_SigEventType_value)
	proto.RegisterType((*SigEvent)(nil), "sigchain.SigEvent")
	proto.RegisterType((*SigChain)(nil), "sigchain.SigChain")
	proto.RegisterType((*EventExtension)(nil), "sigchain.EventExtension")
}

func init() { proto.RegisterFile("crypto/sigchain/sigchain.proto", fileDescriptor_d0682ab8209f76a7) }

var fileDescriptor_d0682ab8209f76a7 = []byte{
	// 501 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x6c, 0x53, 0xcd, 0x6e, 0xd3, 0x40,
	0x18, 0xec, 0xa6, 0x25, 0x3f, 0x5f, 0xd2, 0x34, 0x5d, 0x50, 0xb1, 0x22, 0x61, 0x5b, 0x39, 0x45,
	0x39, 0xd8, 0x6a, 0xb8, 0x21, 0x84, 0x94, 0x26, 0x96, 0x6a, 0x55, 0x38, 0x92, 0x1b, 0x82, 0xc4,
	0xc5, 0xb2, 0x9d, 0xc5, 0x31, 0xa4, 0x59, 0xcb, 0xbb, 0xae, 0xea, 0xb7, 0xe0, 0xc8, 0x23, 0xf5,
	0xc8, 0x13, 0x00, 0x0a, 0x6f, 0xc0, 0x13, 0xa0, 0x5d, 0xdb, 0xa1, 0xfc, 0xdc, 0x66, 0xe6, 0x9b,
	0xfd, 0xbc, 0x9e, 0xb1, 0x41, 0x0d, 0xd3, 0x3c, 0xe1, 0xd4, 0x64, 0x71, 0x14, 0xae, 0xfd, 0x78,
	0xbb, 0x07, 0x46, 0x92, 0x52, 0x4e, 0x71, 0xb3, 0xe2, 0x7d, 0x2d, 0xa2, 0x34, 0xda, 0x10, 0x53,
	0xea, 0x41, 0xf6, 0xde, 0xe4, 0xf1, 0x0d, 0x61, 0xdc, 0xbf, 0x49, 0x0a, 0x6b, 0xff, 0x49, 0x44,
	0x23, 0x2a, 0xa1, 0x29, 0x50, 0xa1, 0x0e, 0x7e, 0xd6, 0xa0, 0x79, 0x1d, 0x47, 0xd6, 0x2d, 0xd9,
	0x72, 0xfc, 0x0a, 0x80, 0x08, 0xe0, 0xf1, 0x3c, 0x21, 0x0a, 0xd2, 0xd1, 0xb0, 0x3b, 0xd6, 0x8c,
	0xfd, 0x23, 0x2b, 0xdf, 0x1e, 0x2c, 0xf2, 0x84, 0xb8, 0x2d, 0x52, 0x41, 0x8c, 0xe1, 0x68, 0xed,
	0xb3, 0xb5, 0x52, 0xd3, 0xd1, 0xb0, 0xe3, 0x4a, 0x8c, 0x35, 0x68, 0x27, 0x7e, 0x2a, 0x96, 0xca,
	0xd1, 0xa1, 0x1c, 0x41, 0x21, 0x5d, 0x0a, 0x83, 0x02, 0x8d, 0xc4, 0xcf, 0x37, 0xd4, 0x5f, 0x29,
	0x47, 0x72, 0x58, 0x51, 0xfc, 0x0c, 0x20, 0xc9, 0x82, 0x4d, 0x1c, 0x7a, 0x1f, 0x49, 0xae, 0x3c,
	0x92, 0xc3, 0x56, 0xa1, 0x5c, 0x91, 0x1c, 0x4f, 0x01, 0xc2, 0x94, 0xf8, 0x9c, 0xac, 0x3c, 0x9f,
	0x2b, 0x75, 0x1d, 0x0d, 0xdb, 0xe3, 0xbe, 0x51, 0xc4, 0x60, 0x54, 0x31, 0x18, 0x8b, 0x2a, 0x86,
	0x8b, 0xe6, 0xfd, 0x57, 0xed, 0xe0, 0xd3, 0x37, 0x0d, 0xb9, 0xad, 0xf2, 0xdc, 0x84, 0xe3, 0x33,
	0xa8, 0xc7, 0x8c, 0x65, 0x24, 0x55, 0x1a, 0x72, 0x7f, 0xc9, 0xc4, 0xad, 0x58, 0x16, 0x7c, 0x20,
	0x21, 0x57, 0x9a, 0xc5, 0xad, 0x4a, 0x3a, 0x98, 0x40, 0xe7, 0xe1, 0xfb, 0xe3, 0x2e, 0x80, 0xed,
	0xd8, 0x0b, 0x6f, 0x7a, 0x39, 0xb1, 0x9d, 0xde, 0x81, 0xe0, 0x93, 0xd9, 0xcc, 0x9b, 0x59, 0x4b,
	0x7b, 0x6a, 0xf5, 0x10, 0x3e, 0x85, 0x63, 0xd7, 0x7a, 0x3d, 0x5f, 0x5a, 0x95, 0x54, 0x1b, 0xcc,
	0x65, 0xe6, 0x53, 0x11, 0x2a, 0x7e, 0x0a, 0x8d, 0x8c, 0x91, 0xd4, 0x8b, 0x57, 0x32, 0xf0, 0x8e,
	0x5b, 0x17, 0xd4, 0x5e, 0xe1, 0x11, 0xd4, 0x65, 0xb2, 0x4c, 0xa9, 0xe9, 0x87, 0xc3, 0xf6, 0x18,
	0xff, 0x5b, 0x84, 0x5b, 0x3a, 0x06, 0x77, 0xd0, 0x95, 0x82, 0x75, 0xc7, 0xc9, 0x96, 0xc5, 0x74,
	0x8b, 0x5f, 0x40, 0xe3, 0x96, 0xa4, 0x02, 0x96, 0x3d, 0xea, 0xbf, 0x8f, 0xff, 0x69, 0x5d, 0x16,
	0x36, 0xe6, 0x56, 0x07, 0xf0, 0x08, 0x4e, 0xcb, 0xca, 0x8a, 0xaf, 0xe1, 0x41, 0xa7, 0x27, 0xc5,
	0x40, 0x6e, 0x10, 0xed, 0x8d, 0x5e, 0xc2, 0xd9, 0xff, 0xd7, 0xe1, 0xc7, 0x70, 0xf2, 0xc6, 0xb9,
	0x72, 0xe6, 0x6f, 0x1d, 0x6f, 0x69, 0xb9, 0xd7, 0xf6, 0x5c, 0x84, 0x73, 0x0c, 0xad, 0x92, 0x78,
	0xe7, 0x3d, 0x74, 0x71, 0x7e, 0xbf, 0x53, 0xd1, 0x97, 0x9d, 0x8a, 0xbe, 0xef, 0x54, 0xf4, 0xf9,
	0x87, 0x7a, 0xf0, 0x4e, 0x0b, 0x48, 0xca, 0x73, 0x83, 0x93, 0x70, 0x6d, 0x86, 0x34, 0x25, 0xe6,
	0x5f, 0x3f, 0x40, 0x50, 0x97, 0xcd, 0x3e, 0xff, 0x15, 0x00, 0x00, 0xff, 0xff, 0xd0, 0x16, 0x14,
	0x7f, 0x1a, 0x03, 0x00, 0x00,
}

func (m *SigEvent) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *SigEvent) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *SigEvent) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if len(m.Subject) > 0 {
		i -= len(m.Subject)
		copy(dAtA[i:], m.Subject)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.Subject)))
		i--
		dAtA[i] = 0x42
	}
	if len(m.Issuer) > 0 {
		i -= len(m.Issuer)
		copy(dAtA[i:], m.Issuer)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.Issuer)))
		i--
		dAtA[i] = 0x3a
	}
	n1, err1 := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.CreatedAt, dAtA[i-github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt):])
	if err1 != nil {
		return 0, err1
	}
	i -= n1
	i = encodeVarintSigchain(dAtA, i, uint64(n1))
	i--
	dAtA[i] = 0x32
	if len(m.PublicKey) > 0 {
		i -= len(m.PublicKey)
		copy(dAtA[i:], m.PublicKey)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.PublicKey)))
		i--
		dAtA[i] = 0x2a
	}
	if len(m.Payload) > 0 {
		i -= len(m.Payload)
		copy(dAtA[i:], m.Payload)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.Payload)))
		i--
		dAtA[i] = 0x22
	}
	if len(m.ParentHash) > 0 {
		i -= len(m.ParentHash)
		copy(dAtA[i:], m.ParentHash)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.ParentHash)))
		i--
		dAtA[i] = 0x1a
	}
	if len(m.Hash) > 0 {
		i -= len(m.Hash)
		copy(dAtA[i:], m.Hash)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.Hash)))
		i--
		dAtA[i] = 0x12
	}
	if m.EventType != 0 {
		i = encodeVarintSigchain(dAtA, i, uint64(m.EventType))
		i--
		dAtA[i] = 0x8
	}
	return len(dAtA) - i, nil
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
	if len(m.Events) > 0 {
		for iNdEx := len(m.Events) - 1; iNdEx >= 0; iNdEx-- {
			{
				size, err := m.Events[iNdEx].MarshalToSizedBuffer(dAtA[:i])
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
	if len(m.UserId) > 0 {
		i -= len(m.UserId)
		copy(dAtA[i:], m.UserId)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.UserId)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func (m *EventExtension) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *EventExtension) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *EventExtension) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if len(m.ParentEventHash) > 0 {
		i -= len(m.ParentEventHash)
		copy(dAtA[i:], m.ParentEventHash)
		i = encodeVarintSigchain(dAtA, i, uint64(len(m.ParentEventHash)))
		i--
		dAtA[i] = 0x12
	}
	if m.Version != 0 {
		i = encodeVarintSigchain(dAtA, i, uint64(m.Version))
		i--
		dAtA[i] = 0x8
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
func (m *SigEvent) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	if m.EventType != 0 {
		n += 1 + sovSigchain(uint64(m.EventType))
	}
	l = len(m.Hash)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
	}
	l = len(m.ParentHash)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
	}
	l = len(m.Payload)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
	}
	l = len(m.PublicKey)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
	}
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt)
	n += 1 + l + sovSigchain(uint64(l))
	l = len(m.Issuer)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
	}
	l = len(m.Subject)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func (m *SigChain) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.UserId)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
	}
	if len(m.Events) > 0 {
		for _, e := range m.Events {
			l = e.Size()
			n += 1 + l + sovSigchain(uint64(l))
		}
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func (m *EventExtension) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	if m.Version != 0 {
		n += 1 + sovSigchain(uint64(m.Version))
	}
	l = len(m.ParentEventHash)
	if l > 0 {
		n += 1 + l + sovSigchain(uint64(l))
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
func (m *SigEvent) Unmarshal(dAtA []byte) error {
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
			return fmt.Errorf("proto: SigEvent: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: SigEvent: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field EventType", wireType)
			}
			m.EventType = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowSigchain
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.EventType |= SigEvent_SigEventType(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Hash", wireType)
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
			m.Hash = append(m.Hash[:0], dAtA[iNdEx:postIndex]...)
			if m.Hash == nil {
				m.Hash = []byte{}
			}
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ParentHash", wireType)
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
			m.ParentHash = append(m.ParentHash[:0], dAtA[iNdEx:postIndex]...)
			if m.ParentHash == nil {
				m.ParentHash = []byte{}
			}
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Payload", wireType)
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
			m.Payload = append(m.Payload[:0], dAtA[iNdEx:postIndex]...)
			if m.Payload == nil {
				m.Payload = []byte{}
			}
			iNdEx = postIndex
		case 5:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field PublicKey", wireType)
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
			m.PublicKey = append(m.PublicKey[:0], dAtA[iNdEx:postIndex]...)
			if m.PublicKey == nil {
				m.PublicKey = []byte{}
			}
			iNdEx = postIndex
		case 6:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CreatedAt", wireType)
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
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.CreatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 7:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Issuer", wireType)
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
			m.Issuer = append(m.Issuer[:0], dAtA[iNdEx:postIndex]...)
			if m.Issuer == nil {
				m.Issuer = []byte{}
			}
			iNdEx = postIndex
		case 8:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Subject", wireType)
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
			m.Subject = append(m.Subject[:0], dAtA[iNdEx:postIndex]...)
			if m.Subject == nil {
				m.Subject = []byte{}
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
				return fmt.Errorf("proto: wrong wireType = %d for field UserId", wireType)
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
			m.UserId = append(m.UserId[:0], dAtA[iNdEx:postIndex]...)
			if m.UserId == nil {
				m.UserId = []byte{}
			}
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Events", wireType)
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
			m.Events = append(m.Events, &SigEvent{})
			if err := m.Events[len(m.Events)-1].Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
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
func (m *EventExtension) Unmarshal(dAtA []byte) error {
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
			return fmt.Errorf("proto: EventExtension: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: EventExtension: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field Version", wireType)
			}
			m.Version = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowSigchain
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.Version |= EventExtensionVersions(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ParentEventHash", wireType)
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
			m.ParentEventHash = append(m.ParentEventHash[:0], dAtA[iNdEx:postIndex]...)
			if m.ParentEventHash == nil {
				m.ParentEventHash = []byte{}
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
