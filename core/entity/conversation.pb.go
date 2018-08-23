// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: entity/conversation.proto

package entity // import "berty.tech/core/entity"

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import _ "github.com/gogo/protobuf/gogoproto"
import _ "github.com/golang/protobuf/ptypes/timestamp"

import time "time"

import github_com_gogo_protobuf_types "github.com/gogo/protobuf/types"

import io "io"

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

type ConversationMember_Status int32

const (
	ConversationMember_Unknown ConversationMember_Status = 0
	ConversationMember_Owner   ConversationMember_Status = 1
	ConversationMember_Active  ConversationMember_Status = 2
	ConversationMember_Blocked ConversationMember_Status = 3
)

var ConversationMember_Status_name = map[int32]string{
	0: "Unknown",
	1: "Owner",
	2: "Active",
	3: "Blocked",
}
var ConversationMember_Status_value = map[string]int32{
	"Unknown": 0,
	"Owner":   1,
	"Active":  2,
	"Blocked": 3,
}

func (x ConversationMember_Status) String() string {
	return proto.EnumName(ConversationMember_Status_name, int32(x))
}
func (ConversationMember_Status) EnumDescriptor() ([]byte, []int) {
	return fileDescriptor_conversation_008f0571fff8b9fc, []int{1, 0}
}

type Conversation struct {
	ID                   string                `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time             `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time             `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	DeletedAt            *time.Time            `protobuf:"bytes,4,opt,name=deleted_at,json=deletedAt,stdtime" json:"deleted_at,omitempty"`
	Title                string                `protobuf:"bytes,20,opt,name=title,proto3" json:"title,omitempty"`
	Topic                string                `protobuf:"bytes,21,opt,name=topic,proto3" json:"topic,omitempty"`
	Members              []*ConversationMember `protobuf:"bytes,100,rep,name=members" json:"members,omitempty"`
	XXX_NoUnkeyedLiteral struct{}              `json:"-"`
	XXX_unrecognized     []byte                `json:"-"`
	XXX_sizecache        int32                 `json:"-"`
}

func (m *Conversation) Reset()         { *m = Conversation{} }
func (m *Conversation) String() string { return proto.CompactTextString(m) }
func (*Conversation) ProtoMessage()    {}
func (*Conversation) Descriptor() ([]byte, []int) {
	return fileDescriptor_conversation_008f0571fff8b9fc, []int{0}
}
func (m *Conversation) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *Conversation) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_Conversation.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalTo(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (dst *Conversation) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Conversation.Merge(dst, src)
}
func (m *Conversation) XXX_Size() int {
	return m.Size()
}
func (m *Conversation) XXX_DiscardUnknown() {
	xxx_messageInfo_Conversation.DiscardUnknown(m)
}

var xxx_messageInfo_Conversation proto.InternalMessageInfo

func (m *Conversation) GetID() string {
	if m != nil {
		return m.ID
	}
	return ""
}

func (m *Conversation) GetCreatedAt() time.Time {
	if m != nil {
		return m.CreatedAt
	}
	return time.Time{}
}

func (m *Conversation) GetUpdatedAt() time.Time {
	if m != nil {
		return m.UpdatedAt
	}
	return time.Time{}
}

func (m *Conversation) GetDeletedAt() *time.Time {
	if m != nil {
		return m.DeletedAt
	}
	return nil
}

func (m *Conversation) GetTitle() string {
	if m != nil {
		return m.Title
	}
	return ""
}

func (m *Conversation) GetTopic() string {
	if m != nil {
		return m.Topic
	}
	return ""
}

func (m *Conversation) GetMembers() []*ConversationMember {
	if m != nil {
		return m.Members
	}
	return nil
}

type ConversationMember struct {
	ID                   string                    `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time                 `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time                 `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	DeletedAt            *time.Time                `protobuf:"bytes,4,opt,name=deleted_at,json=deletedAt,stdtime" json:"deleted_at,omitempty"`
	Status               ConversationMember_Status `protobuf:"varint,10,opt,name=status,proto3,enum=berty.entity.ConversationMember_Status" json:"status,omitempty"`
	Contact              *Contact                  `protobuf:"bytes,100,opt,name=contact" json:"contact,omitempty"`
	ConversationID       string                    `protobuf:"bytes,101,opt,name=conversation_id,json=conversationId,proto3" json:"conversation_id,omitempty"`
	ContactID            string                    `protobuf:"bytes,102,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	XXX_NoUnkeyedLiteral struct{}                  `json:"-"`
	XXX_unrecognized     []byte                    `json:"-"`
	XXX_sizecache        int32                     `json:"-"`
}

func (m *ConversationMember) Reset()         { *m = ConversationMember{} }
func (m *ConversationMember) String() string { return proto.CompactTextString(m) }
func (*ConversationMember) ProtoMessage()    {}
func (*ConversationMember) Descriptor() ([]byte, []int) {
	return fileDescriptor_conversation_008f0571fff8b9fc, []int{1}
}
func (m *ConversationMember) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *ConversationMember) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_ConversationMember.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalTo(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (dst *ConversationMember) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ConversationMember.Merge(dst, src)
}
func (m *ConversationMember) XXX_Size() int {
	return m.Size()
}
func (m *ConversationMember) XXX_DiscardUnknown() {
	xxx_messageInfo_ConversationMember.DiscardUnknown(m)
}

var xxx_messageInfo_ConversationMember proto.InternalMessageInfo

func (m *ConversationMember) GetID() string {
	if m != nil {
		return m.ID
	}
	return ""
}

func (m *ConversationMember) GetCreatedAt() time.Time {
	if m != nil {
		return m.CreatedAt
	}
	return time.Time{}
}

func (m *ConversationMember) GetUpdatedAt() time.Time {
	if m != nil {
		return m.UpdatedAt
	}
	return time.Time{}
}

func (m *ConversationMember) GetDeletedAt() *time.Time {
	if m != nil {
		return m.DeletedAt
	}
	return nil
}

func (m *ConversationMember) GetStatus() ConversationMember_Status {
	if m != nil {
		return m.Status
	}
	return ConversationMember_Unknown
}

func (m *ConversationMember) GetContact() *Contact {
	if m != nil {
		return m.Contact
	}
	return nil
}

func (m *ConversationMember) GetConversationID() string {
	if m != nil {
		return m.ConversationID
	}
	return ""
}

func (m *ConversationMember) GetContactID() string {
	if m != nil {
		return m.ContactID
	}
	return ""
}

func init() {
	proto.RegisterType((*Conversation)(nil), "berty.entity.Conversation")
	proto.RegisterType((*ConversationMember)(nil), "berty.entity.ConversationMember")
	proto.RegisterEnum("berty.entity.ConversationMember_Status", ConversationMember_Status_name, ConversationMember_Status_value)
}
func (m *Conversation) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalTo(dAtA)
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *Conversation) MarshalTo(dAtA []byte) (int, error) {
	var i int
	_ = i
	var l int
	_ = l
	if len(m.ID) > 0 {
		dAtA[i] = 0xa
		i++
		i = encodeVarintConversation(dAtA, i, uint64(len(m.ID)))
		i += copy(dAtA[i:], m.ID)
	}
	dAtA[i] = 0x12
	i++
	i = encodeVarintConversation(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt)))
	n1, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.CreatedAt, dAtA[i:])
	if err != nil {
		return 0, err
	}
	i += n1
	dAtA[i] = 0x1a
	i++
	i = encodeVarintConversation(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(m.UpdatedAt)))
	n2, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.UpdatedAt, dAtA[i:])
	if err != nil {
		return 0, err
	}
	i += n2
	if m.DeletedAt != nil {
		dAtA[i] = 0x22
		i++
		i = encodeVarintConversation(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(*m.DeletedAt)))
		n3, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(*m.DeletedAt, dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n3
	}
	if len(m.Title) > 0 {
		dAtA[i] = 0xa2
		i++
		dAtA[i] = 0x1
		i++
		i = encodeVarintConversation(dAtA, i, uint64(len(m.Title)))
		i += copy(dAtA[i:], m.Title)
	}
	if len(m.Topic) > 0 {
		dAtA[i] = 0xaa
		i++
		dAtA[i] = 0x1
		i++
		i = encodeVarintConversation(dAtA, i, uint64(len(m.Topic)))
		i += copy(dAtA[i:], m.Topic)
	}
	if len(m.Members) > 0 {
		for _, msg := range m.Members {
			dAtA[i] = 0xa2
			i++
			dAtA[i] = 0x6
			i++
			i = encodeVarintConversation(dAtA, i, uint64(msg.Size()))
			n, err := msg.MarshalTo(dAtA[i:])
			if err != nil {
				return 0, err
			}
			i += n
		}
	}
	if m.XXX_unrecognized != nil {
		i += copy(dAtA[i:], m.XXX_unrecognized)
	}
	return i, nil
}

func (m *ConversationMember) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalTo(dAtA)
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *ConversationMember) MarshalTo(dAtA []byte) (int, error) {
	var i int
	_ = i
	var l int
	_ = l
	if len(m.ID) > 0 {
		dAtA[i] = 0xa
		i++
		i = encodeVarintConversation(dAtA, i, uint64(len(m.ID)))
		i += copy(dAtA[i:], m.ID)
	}
	dAtA[i] = 0x12
	i++
	i = encodeVarintConversation(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt)))
	n4, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.CreatedAt, dAtA[i:])
	if err != nil {
		return 0, err
	}
	i += n4
	dAtA[i] = 0x1a
	i++
	i = encodeVarintConversation(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(m.UpdatedAt)))
	n5, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.UpdatedAt, dAtA[i:])
	if err != nil {
		return 0, err
	}
	i += n5
	if m.DeletedAt != nil {
		dAtA[i] = 0x22
		i++
		i = encodeVarintConversation(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(*m.DeletedAt)))
		n6, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(*m.DeletedAt, dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n6
	}
	if m.Status != 0 {
		dAtA[i] = 0x50
		i++
		i = encodeVarintConversation(dAtA, i, uint64(m.Status))
	}
	if m.Contact != nil {
		dAtA[i] = 0xa2
		i++
		dAtA[i] = 0x6
		i++
		i = encodeVarintConversation(dAtA, i, uint64(m.Contact.Size()))
		n7, err := m.Contact.MarshalTo(dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n7
	}
	if len(m.ConversationID) > 0 {
		dAtA[i] = 0xaa
		i++
		dAtA[i] = 0x6
		i++
		i = encodeVarintConversation(dAtA, i, uint64(len(m.ConversationID)))
		i += copy(dAtA[i:], m.ConversationID)
	}
	if len(m.ContactID) > 0 {
		dAtA[i] = 0xb2
		i++
		dAtA[i] = 0x6
		i++
		i = encodeVarintConversation(dAtA, i, uint64(len(m.ContactID)))
		i += copy(dAtA[i:], m.ContactID)
	}
	if m.XXX_unrecognized != nil {
		i += copy(dAtA[i:], m.XXX_unrecognized)
	}
	return i, nil
}

func encodeVarintConversation(dAtA []byte, offset int, v uint64) int {
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return offset + 1
}
func (m *Conversation) Size() (n int) {
	var l int
	_ = l
	l = len(m.ID)
	if l > 0 {
		n += 1 + l + sovConversation(uint64(l))
	}
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt)
	n += 1 + l + sovConversation(uint64(l))
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.UpdatedAt)
	n += 1 + l + sovConversation(uint64(l))
	if m.DeletedAt != nil {
		l = github_com_gogo_protobuf_types.SizeOfStdTime(*m.DeletedAt)
		n += 1 + l + sovConversation(uint64(l))
	}
	l = len(m.Title)
	if l > 0 {
		n += 2 + l + sovConversation(uint64(l))
	}
	l = len(m.Topic)
	if l > 0 {
		n += 2 + l + sovConversation(uint64(l))
	}
	if len(m.Members) > 0 {
		for _, e := range m.Members {
			l = e.Size()
			n += 2 + l + sovConversation(uint64(l))
		}
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func (m *ConversationMember) Size() (n int) {
	var l int
	_ = l
	l = len(m.ID)
	if l > 0 {
		n += 1 + l + sovConversation(uint64(l))
	}
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt)
	n += 1 + l + sovConversation(uint64(l))
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.UpdatedAt)
	n += 1 + l + sovConversation(uint64(l))
	if m.DeletedAt != nil {
		l = github_com_gogo_protobuf_types.SizeOfStdTime(*m.DeletedAt)
		n += 1 + l + sovConversation(uint64(l))
	}
	if m.Status != 0 {
		n += 1 + sovConversation(uint64(m.Status))
	}
	if m.Contact != nil {
		l = m.Contact.Size()
		n += 2 + l + sovConversation(uint64(l))
	}
	l = len(m.ConversationID)
	if l > 0 {
		n += 2 + l + sovConversation(uint64(l))
	}
	l = len(m.ContactID)
	if l > 0 {
		n += 2 + l + sovConversation(uint64(l))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func sovConversation(x uint64) (n int) {
	for {
		n++
		x >>= 7
		if x == 0 {
			break
		}
	}
	return n
}
func sozConversation(x uint64) (n int) {
	return sovConversation(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *Conversation) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowConversation
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
			return fmt.Errorf("proto: Conversation: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: Conversation: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CreatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.CreatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field UpdatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.UpdatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field DeletedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.DeletedAt == nil {
				m.DeletedAt = new(time.Time)
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(m.DeletedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 20:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Title", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Title = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 21:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Topic", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Topic = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 100:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Members", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Members = append(m.Members, &ConversationMember{})
			if err := m.Members[len(m.Members)-1].Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipConversation(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthConversation
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
func (m *ConversationMember) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowConversation
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
			return fmt.Errorf("proto: ConversationMember: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: ConversationMember: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CreatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.CreatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field UpdatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.UpdatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field DeletedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.DeletedAt == nil {
				m.DeletedAt = new(time.Time)
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(m.DeletedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 10:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field Status", wireType)
			}
			m.Status = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.Status |= (ConversationMember_Status(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 100:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Contact", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.Contact == nil {
				m.Contact = &Contact{}
			}
			if err := m.Contact.Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 101:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ConversationID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ConversationID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 102:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ContactID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConversation
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConversation
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ContactID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipConversation(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthConversation
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
func skipConversation(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowConversation
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
					return 0, ErrIntOverflowConversation
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
					return 0, ErrIntOverflowConversation
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
				return 0, ErrInvalidLengthConversation
			}
			return iNdEx, nil
		case 3:
			for {
				var innerWire uint64
				var start int = iNdEx
				for shift := uint(0); ; shift += 7 {
					if shift >= 64 {
						return 0, ErrIntOverflowConversation
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
				next, err := skipConversation(dAtA[start:])
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
	ErrInvalidLengthConversation = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowConversation   = fmt.Errorf("proto: integer overflow")
)

func init() {
	proto.RegisterFile("entity/conversation.proto", fileDescriptor_conversation_008f0571fff8b9fc)
}

var fileDescriptor_conversation_008f0571fff8b9fc = []byte{
	// 487 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe4, 0x93, 0xcf, 0x8e, 0x93, 0x50,
	0x14, 0xc6, 0x0b, 0xed, 0xb4, 0xf6, 0x74, 0xac, 0xcd, 0x4d, 0xc7, 0x60, 0x63, 0x4a, 0xd3, 0x8d,
	0x2c, 0x26, 0x90, 0xd4, 0x95, 0xe3, 0x62, 0xd2, 0x4e, 0x37, 0x2c, 0x8c, 0x09, 0xea, 0xc6, 0x4d,
	0x43, 0xb9, 0x77, 0xf0, 0xa6, 0x85, 0x4b, 0x2e, 0xa7, 0x33, 0xe9, 0x5b, 0xb8, 0xf4, 0x05, 0x7c,
	0x97, 0x59, 0xfa, 0x04, 0x68, 0xf0, 0x01, 0x4c, 0x7c, 0x02, 0x03, 0x5c, 0x22, 0xc9, 0x2c, 0x26,
	0xae, 0xdd, 0x71, 0xce, 0xf9, 0xbe, 0xdf, 0xf9, 0x03, 0xc0, 0x33, 0x16, 0x23, 0xc7, 0xa3, 0x13,
	0x88, 0xf8, 0x86, 0xc9, 0xd4, 0x47, 0x2e, 0x62, 0x3b, 0x91, 0x02, 0x05, 0x39, 0xdd, 0x32, 0x89,
	0x47, 0xbb, 0x12, 0x4c, 0xc6, 0xa1, 0x08, 0x45, 0x59, 0x70, 0x8a, 0xa7, 0x4a, 0x33, 0x31, 0x43,
	0x21, 0xc2, 0x3d, 0x73, 0xca, 0x68, 0x7b, 0xb8, 0x76, 0x90, 0x47, 0x2c, 0x45, 0x3f, 0x4a, 0x94,
	0x60, 0xfc, 0x97, 0x8f, 0x7e, 0x80, 0x55, 0x76, 0xfe, 0x4b, 0x87, 0xd3, 0xab, 0x46, 0x47, 0x72,
	0x0e, 0x3a, 0xa7, 0x86, 0x36, 0xd3, 0xac, 0xfe, 0xea, 0x79, 0x9e, 0x99, 0xba, 0xbb, 0xfe, 0x9d,
	0x99, 0x24, 0x14, 0x32, 0xba, 0x98, 0x27, 0x92, 0x47, 0xbe, 0x3c, 0x6e, 0x76, 0xec, 0x38, 0xf7,
	0x74, 0x4e, 0xc9, 0x15, 0x40, 0x20, 0x99, 0x8f, 0x8c, 0x6e, 0x7c, 0x34, 0xf4, 0x99, 0x66, 0x0d,
	0x16, 0x13, 0xbb, 0x1a, 0xc5, 0xae, 0x47, 0xb1, 0xdf, 0xd7, 0xa3, 0xac, 0x1e, 0xdd, 0x65, 0x66,
	0xeb, 0xf3, 0x77, 0x53, 0xf3, 0xfa, 0xca, 0xb7, 0xc4, 0x02, 0x72, 0x48, 0x68, 0x0d, 0x69, 0xff,
	0x0b, 0x44, 0xf9, 0x96, 0x48, 0x2e, 0x01, 0x28, 0xdb, 0x33, 0x05, 0xe9, 0x3c, 0x08, 0xe9, 0x54,
	0x00, 0xe5, 0x59, 0x22, 0x19, 0xc3, 0x09, 0x72, 0xdc, 0x33, 0x63, 0x5c, 0xec, 0xee, 0x55, 0x41,
	0x99, 0x15, 0x09, 0x0f, 0x8c, 0x33, 0x95, 0x2d, 0x02, 0x72, 0x01, 0xbd, 0x88, 0x45, 0x5b, 0x26,
	0x53, 0x83, 0xce, 0xda, 0xd6, 0x60, 0x31, 0xb3, 0x9b, 0xaf, 0xc8, 0x6e, 0x5e, 0xf4, 0x4d, 0x29,
	0xf4, 0x6a, 0xc3, 0xfc, 0x6b, 0x07, 0xc8, 0xfd, 0xfa, 0xff, 0x7b, 0xf7, 0x4b, 0xe8, 0xa6, 0xe8,
	0xe3, 0x21, 0x35, 0x60, 0xa6, 0x59, 0xc3, 0xc5, 0x8b, 0x87, 0x4e, 0x69, 0xbf, 0x2b, 0xe5, 0x9e,
	0xb2, 0x11, 0x07, 0x7a, 0xea, 0x9b, 0x36, 0x68, 0xd9, 0xfe, 0xec, 0x1e, 0xa1, 0x28, 0x7a, 0xb5,
	0x8a, 0xbc, 0x86, 0x27, 0xcd, 0x9f, 0x6c, 0xc3, 0xa9, 0xc1, 0xca, 0xbb, 0x93, 0x3c, 0x33, 0x87,
	0xcd, 0x86, 0xee, 0xda, 0x1b, 0x36, 0xa5, 0x2e, 0x25, 0xe7, 0x00, 0x8a, 0x53, 0xf8, 0xae, 0x4b,
	0xdf, 0xe3, 0x3c, 0x33, 0xfb, 0xaa, 0x8d, 0xbb, 0xf6, 0xfa, 0x4a, 0xe0, 0xd2, 0xf9, 0x2b, 0xe8,
	0x56, 0xd3, 0x92, 0x01, 0xf4, 0x3e, 0xc4, 0xbb, 0x58, 0xdc, 0xc6, 0xa3, 0x16, 0xe9, 0xc3, 0xc9,
	0xdb, 0xdb, 0x98, 0xc9, 0x91, 0x46, 0x00, 0xba, 0xcb, 0x00, 0xf9, 0x0d, 0x1b, 0xe9, 0x85, 0x66,
	0xb5, 0x17, 0xc1, 0x8e, 0xd1, 0x51, 0x7b, 0x65, 0xdd, 0xe5, 0x53, 0xed, 0x5b, 0x3e, 0xd5, 0x7e,
	0xe4, 0x53, 0xed, 0xcb, 0xcf, 0x69, 0xeb, 0xe3, 0xd3, 0x6a, 0x2d, 0x64, 0xc1, 0x27, 0x27, 0x10,
	0x92, 0x39, 0xd5, 0x82, 0xdb, 0x6e, 0x79, 0xe6, 0x97, 0x7f, 0x02, 0x00, 0x00, 0xff, 0xff, 0x23,
	0xc0, 0xdc, 0x19, 0x42, 0x04, 0x00, 0x00,
}
