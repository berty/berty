// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: api/p2p/event.proto

package p2p

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import _ "github.com/gogo/protobuf/gogoproto"
import _ "github.com/golang/protobuf/ptypes/timestamp"

import time "time"

import types "github.com/gogo/protobuf/types"

import io "io"

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf
var _ = time.Kitchen

//
// enums
//
type Event_Direction int32

const (
	Event_UnknownDirection Event_Direction = 0
	// Incoming is the value for events created by peers, should be set by the receiver when receiving an event.
	Event_Incoming Event_Direction = 1
	// Outgoing is the value for locally-created events, should be set by the sender when creating an event.
	Event_Outgoing Event_Direction = 2
)

var Event_Direction_name = map[int32]string{
	0: "UnknownDirection",
	1: "Incoming",
	2: "Outgoing",
}
var Event_Direction_value = map[string]int32{
	"UnknownDirection": 0,
	"Incoming":         1,
	"Outgoing":         2,
}

func (x Event_Direction) String() string {
	return proto.EnumName(Event_Direction_name, int32(x))
}
func (Event_Direction) EnumDescriptor() ([]byte, []int) { return fileDescriptorEvent, []int{0, 0} }

type Event struct {
	// ID is a unique ID generated by the event creator.
	// This field is required by gorm.
	ID string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	// Sender is the ID of the sender.
	// this field is a member of the composite primary key to avoid id collisions.
	SenderID string `protobuf:"bytes,2,opt,name=sender_id,json=senderId,proto3" json:"sender_id,omitempty" gorm:"primary_key"`
	// CreatedAt is set to current date when initializing a new Event object.
	// This field is required by gorm.
	CreatedAt time.Time `protobuf:"bytes,3,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	// UpdatedAt is set to current date each time the object is updated in database.
	// This field is required by gorm.
	UpdatedAt time.Time `protobuf:"bytes,4,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	// DeletedAt is not used but required by gorm.
	DeletedAt *time.Time `protobuf:"bytes,5,opt,name=deleted_at,json=deletedAt,stdtime" json:"deleted_at,omitempty"`
	// SentAt is set to current date just after sending the event.
	SentAt *time.Time `protobuf:"bytes,6,opt,name=sent_at,json=sentAt,stdtime" json:"sent_at,omitempty"`
	// ReceivedAt is set to current date just after receiving the event.
	ReceivedAt *time.Time `protobuf:"bytes,7,opt,name=received_at,json=receivedAt,stdtime" json:"received_at,omitempty"`
	// AckedAt is set to current date just after receiving a `Ack` event.
	AckedAt *time.Time `protobuf:"bytes,8,opt,name=acked_at,json=ackedAt,stdtime" json:"acked_at,omitempty"`
	// Direction is sent to Outgoing by the sender and to Incoming by the receiver.
	Direction Event_Direction `protobuf:"varint,9,opt,name=direction,proto3,enum=berty.p2p.Event_Direction" json:"direction,omitempty"`
	// SenderAPIVersion is set by the sender when creating the message to be sent.
	SenderAPIVersion uint32 `protobuf:"varint,10,opt,name=sender_api_version,json=senderApiVersion,proto3" json:"sender_api_version,omitempty"`
	// ReceiverAPIVersion is set by the receiver when receiving a message.
	// this field may be useful to apply local migrations when processing old events stored in db.
	ReceiverAPIVersion uint32 `protobuf:"varint,11,opt,name=receiver_api_version,json=receiverApiVersion,proto3" json:"receiver_api_version,omitempty"`
	// Receiver is the ID of the receiver.
	ReceiverID string `protobuf:"bytes,12,opt,name=receiver_id,json=receiverId,proto3" json:"receiver_id,omitempty"`
	// Kind is an enum defining the event type.
	Kind Kind `protobuf:"varint,13,opt,name=kind,proto3,enum=berty.p2p.Kind" json:"kind,omitempty"`
	// Attributes is a nested protobuf message containing per-event-type additional attributes.
	Attributes []byte `protobuf:"bytes,14,opt,name=attributes,proto3" json:"attributes,omitempty"`
	// ConversationID needs to be set if the event belongs to a conversation.
	ConversationID string `protobuf:"bytes,15,opt,name=conversation_id,json=conversationId,proto3" json:"conversation_id,omitempty"`
}

func (m *Event) Reset()                    { *m = Event{} }
func (m *Event) String() string            { return proto.CompactTextString(m) }
func (*Event) ProtoMessage()               {}
func (*Event) Descriptor() ([]byte, []int) { return fileDescriptorEvent, []int{0} }

func (m *Event) GetID() string {
	if m != nil {
		return m.ID
	}
	return ""
}

func (m *Event) GetSenderID() string {
	if m != nil {
		return m.SenderID
	}
	return ""
}

func (m *Event) GetCreatedAt() time.Time {
	if m != nil {
		return m.CreatedAt
	}
	return time.Time{}
}

func (m *Event) GetUpdatedAt() time.Time {
	if m != nil {
		return m.UpdatedAt
	}
	return time.Time{}
}

func (m *Event) GetDeletedAt() *time.Time {
	if m != nil {
		return m.DeletedAt
	}
	return nil
}

func (m *Event) GetSentAt() *time.Time {
	if m != nil {
		return m.SentAt
	}
	return nil
}

func (m *Event) GetReceivedAt() *time.Time {
	if m != nil {
		return m.ReceivedAt
	}
	return nil
}

func (m *Event) GetAckedAt() *time.Time {
	if m != nil {
		return m.AckedAt
	}
	return nil
}

func (m *Event) GetDirection() Event_Direction {
	if m != nil {
		return m.Direction
	}
	return Event_UnknownDirection
}

func (m *Event) GetSenderAPIVersion() uint32 {
	if m != nil {
		return m.SenderAPIVersion
	}
	return 0
}

func (m *Event) GetReceiverAPIVersion() uint32 {
	if m != nil {
		return m.ReceiverAPIVersion
	}
	return 0
}

func (m *Event) GetReceiverID() string {
	if m != nil {
		return m.ReceiverID
	}
	return ""
}

func (m *Event) GetKind() Kind {
	if m != nil {
		return m.Kind
	}
	return Kind_Unknown
}

func (m *Event) GetAttributes() []byte {
	if m != nil {
		return m.Attributes
	}
	return nil
}

func (m *Event) GetConversationID() string {
	if m != nil {
		return m.ConversationID
	}
	return ""
}

func init() {
	proto.RegisterType((*Event)(nil), "berty.p2p.Event")
	proto.RegisterEnum("berty.p2p.Event_Direction", Event_Direction_name, Event_Direction_value)
}
func (m *Event) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalTo(dAtA)
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *Event) MarshalTo(dAtA []byte) (int, error) {
	var i int
	_ = i
	var l int
	_ = l
	if len(m.ID) > 0 {
		dAtA[i] = 0xa
		i++
		i = encodeVarintEvent(dAtA, i, uint64(len(m.ID)))
		i += copy(dAtA[i:], m.ID)
	}
	if len(m.SenderID) > 0 {
		dAtA[i] = 0x12
		i++
		i = encodeVarintEvent(dAtA, i, uint64(len(m.SenderID)))
		i += copy(dAtA[i:], m.SenderID)
	}
	dAtA[i] = 0x1a
	i++
	i = encodeVarintEvent(dAtA, i, uint64(types.SizeOfStdTime(m.CreatedAt)))
	n1, err := types.StdTimeMarshalTo(m.CreatedAt, dAtA[i:])
	if err != nil {
		return 0, err
	}
	i += n1
	dAtA[i] = 0x22
	i++
	i = encodeVarintEvent(dAtA, i, uint64(types.SizeOfStdTime(m.UpdatedAt)))
	n2, err := types.StdTimeMarshalTo(m.UpdatedAt, dAtA[i:])
	if err != nil {
		return 0, err
	}
	i += n2
	if m.DeletedAt != nil {
		dAtA[i] = 0x2a
		i++
		i = encodeVarintEvent(dAtA, i, uint64(types.SizeOfStdTime(*m.DeletedAt)))
		n3, err := types.StdTimeMarshalTo(*m.DeletedAt, dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n3
	}
	if m.SentAt != nil {
		dAtA[i] = 0x32
		i++
		i = encodeVarintEvent(dAtA, i, uint64(types.SizeOfStdTime(*m.SentAt)))
		n4, err := types.StdTimeMarshalTo(*m.SentAt, dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n4
	}
	if m.ReceivedAt != nil {
		dAtA[i] = 0x3a
		i++
		i = encodeVarintEvent(dAtA, i, uint64(types.SizeOfStdTime(*m.ReceivedAt)))
		n5, err := types.StdTimeMarshalTo(*m.ReceivedAt, dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n5
	}
	if m.AckedAt != nil {
		dAtA[i] = 0x42
		i++
		i = encodeVarintEvent(dAtA, i, uint64(types.SizeOfStdTime(*m.AckedAt)))
		n6, err := types.StdTimeMarshalTo(*m.AckedAt, dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n6
	}
	if m.Direction != 0 {
		dAtA[i] = 0x48
		i++
		i = encodeVarintEvent(dAtA, i, uint64(m.Direction))
	}
	if m.SenderAPIVersion != 0 {
		dAtA[i] = 0x50
		i++
		i = encodeVarintEvent(dAtA, i, uint64(m.SenderAPIVersion))
	}
	if m.ReceiverAPIVersion != 0 {
		dAtA[i] = 0x58
		i++
		i = encodeVarintEvent(dAtA, i, uint64(m.ReceiverAPIVersion))
	}
	if len(m.ReceiverID) > 0 {
		dAtA[i] = 0x62
		i++
		i = encodeVarintEvent(dAtA, i, uint64(len(m.ReceiverID)))
		i += copy(dAtA[i:], m.ReceiverID)
	}
	if m.Kind != 0 {
		dAtA[i] = 0x68
		i++
		i = encodeVarintEvent(dAtA, i, uint64(m.Kind))
	}
	if len(m.Attributes) > 0 {
		dAtA[i] = 0x72
		i++
		i = encodeVarintEvent(dAtA, i, uint64(len(m.Attributes)))
		i += copy(dAtA[i:], m.Attributes)
	}
	if len(m.ConversationID) > 0 {
		dAtA[i] = 0x7a
		i++
		i = encodeVarintEvent(dAtA, i, uint64(len(m.ConversationID)))
		i += copy(dAtA[i:], m.ConversationID)
	}
	return i, nil
}

func encodeVarintEvent(dAtA []byte, offset int, v uint64) int {
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return offset + 1
}
func (m *Event) Size() (n int) {
	var l int
	_ = l
	l = len(m.ID)
	if l > 0 {
		n += 1 + l + sovEvent(uint64(l))
	}
	l = len(m.SenderID)
	if l > 0 {
		n += 1 + l + sovEvent(uint64(l))
	}
	l = types.SizeOfStdTime(m.CreatedAt)
	n += 1 + l + sovEvent(uint64(l))
	l = types.SizeOfStdTime(m.UpdatedAt)
	n += 1 + l + sovEvent(uint64(l))
	if m.DeletedAt != nil {
		l = types.SizeOfStdTime(*m.DeletedAt)
		n += 1 + l + sovEvent(uint64(l))
	}
	if m.SentAt != nil {
		l = types.SizeOfStdTime(*m.SentAt)
		n += 1 + l + sovEvent(uint64(l))
	}
	if m.ReceivedAt != nil {
		l = types.SizeOfStdTime(*m.ReceivedAt)
		n += 1 + l + sovEvent(uint64(l))
	}
	if m.AckedAt != nil {
		l = types.SizeOfStdTime(*m.AckedAt)
		n += 1 + l + sovEvent(uint64(l))
	}
	if m.Direction != 0 {
		n += 1 + sovEvent(uint64(m.Direction))
	}
	if m.SenderAPIVersion != 0 {
		n += 1 + sovEvent(uint64(m.SenderAPIVersion))
	}
	if m.ReceiverAPIVersion != 0 {
		n += 1 + sovEvent(uint64(m.ReceiverAPIVersion))
	}
	l = len(m.ReceiverID)
	if l > 0 {
		n += 1 + l + sovEvent(uint64(l))
	}
	if m.Kind != 0 {
		n += 1 + sovEvent(uint64(m.Kind))
	}
	l = len(m.Attributes)
	if l > 0 {
		n += 1 + l + sovEvent(uint64(l))
	}
	l = len(m.ConversationID)
	if l > 0 {
		n += 1 + l + sovEvent(uint64(l))
	}
	return n
}

func sovEvent(x uint64) (n int) {
	for {
		n++
		x >>= 7
		if x == 0 {
			break
		}
	}
	return n
}
func sozEvent(x uint64) (n int) {
	return sovEvent(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *Event) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowEvent
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
			return fmt.Errorf("proto: Event: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: Event: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field SenderID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.SenderID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CreatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := types.StdTimeUnmarshal(&m.CreatedAt, dAtA[iNdEx:postIndex]); err != nil {
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
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := types.StdTimeUnmarshal(&m.UpdatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 5:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field DeletedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.DeletedAt == nil {
				m.DeletedAt = new(time.Time)
			}
			if err := types.StdTimeUnmarshal(m.DeletedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 6:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field SentAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.SentAt == nil {
				m.SentAt = new(time.Time)
			}
			if err := types.StdTimeUnmarshal(m.SentAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 7:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ReceivedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.ReceivedAt == nil {
				m.ReceivedAt = new(time.Time)
			}
			if err := types.StdTimeUnmarshal(m.ReceivedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 8:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field AckedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.AckedAt == nil {
				m.AckedAt = new(time.Time)
			}
			if err := types.StdTimeUnmarshal(m.AckedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 9:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field Direction", wireType)
			}
			m.Direction = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.Direction |= (Event_Direction(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 10:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field SenderAPIVersion", wireType)
			}
			m.SenderAPIVersion = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.SenderAPIVersion |= (uint32(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 11:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field ReceiverAPIVersion", wireType)
			}
			m.ReceiverAPIVersion = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.ReceiverAPIVersion |= (uint32(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 12:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ReceiverID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ReceiverID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 13:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field Kind", wireType)
			}
			m.Kind = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.Kind |= (Kind(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 14:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Attributes", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				byteLen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if byteLen < 0 {
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + byteLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Attributes = append(m.Attributes[:0], dAtA[iNdEx:postIndex]...)
			if m.Attributes == nil {
				m.Attributes = []byte{}
			}
			iNdEx = postIndex
		case 15:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ConversationID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowEvent
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
				return ErrInvalidLengthEvent
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ConversationID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipEvent(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthEvent
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
func skipEvent(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowEvent
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
					return 0, ErrIntOverflowEvent
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
					return 0, ErrIntOverflowEvent
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
				return 0, ErrInvalidLengthEvent
			}
			return iNdEx, nil
		case 3:
			for {
				var innerWire uint64
				var start int = iNdEx
				for shift := uint(0); ; shift += 7 {
					if shift >= 64 {
						return 0, ErrIntOverflowEvent
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
				next, err := skipEvent(dAtA[start:])
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
	ErrInvalidLengthEvent = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowEvent   = fmt.Errorf("proto: integer overflow")
)

func init() { proto.RegisterFile("api/p2p/event.proto", fileDescriptorEvent) }

var fileDescriptorEvent = []byte{
	// 586 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x94, 0x94, 0xcf, 0x6e, 0xd3, 0x40,
	0x10, 0xc6, 0xeb, 0xd0, 0x36, 0xf6, 0xb4, 0x4d, 0xa3, 0x25, 0x42, 0x56, 0x84, 0xe2, 0x28, 0xbd,
	0xe4, 0x80, 0x6c, 0x29, 0x08, 0x09, 0xa8, 0x50, 0xe5, 0x34, 0x48, 0x58, 0x1c, 0x40, 0xe6, 0xcf,
	0x81, 0x4b, 0xe4, 0x78, 0x17, 0xb3, 0x4a, 0xbd, 0x6b, 0x6d, 0x36, 0x45, 0x79, 0x0b, 0x8e, 0x3c,
	0x09, 0xcf, 0xd0, 0x23, 0x4f, 0x60, 0x90, 0x79, 0x03, 0x9e, 0x00, 0xed, 0xda, 0x0e, 0xe6, 0x80,
	0x08, 0x97, 0x68, 0x77, 0x66, 0x7e, 0xdf, 0xce, 0x8c, 0xbe, 0x18, 0x6e, 0x47, 0x19, 0xf5, 0xb2,
	0x49, 0xe6, 0x91, 0x6b, 0xc2, 0xa4, 0x9b, 0x09, 0x2e, 0x39, 0xb2, 0x16, 0x44, 0xc8, 0x8d, 0x9b,
	0x4d, 0xb2, 0x3e, 0xaa, 0xf3, 0x4b, 0xca, 0x70, 0x99, 0xee, 0xf7, 0x12, 0x9e, 0x70, 0x7d, 0xf4,
	0xd4, 0xa9, 0x8a, 0x3a, 0x09, 0xe7, 0xc9, 0x15, 0xf1, 0xf4, 0x6d, 0xb1, 0x7e, 0xef, 0x49, 0x9a,
	0x92, 0x95, 0x8c, 0xd2, 0xac, 0x2c, 0x18, 0x7d, 0x69, 0xc3, 0xc1, 0x53, 0xf5, 0x0a, 0xba, 0x07,
	0x2d, 0x8a, 0x6d, 0x63, 0x68, 0x8c, 0xad, 0xe9, 0xdd, 0x22, 0x77, 0x5a, 0xc1, 0xec, 0x67, 0xee,
	0xa0, 0x84, 0x8b, 0xf4, 0xf1, 0x28, 0x13, 0x34, 0x8d, 0xc4, 0x66, 0xbe, 0x24, 0x9b, 0x51, 0xd8,
	0xa2, 0x18, 0x5d, 0x80, 0xb5, 0x22, 0x0c, 0x13, 0x31, 0xa7, 0xd8, 0x6e, 0x69, 0x68, 0x54, 0xe4,
	0x8e, 0xf9, 0x4a, 0x07, 0xff, 0x8a, 0x9a, 0x25, 0x14, 0x60, 0x74, 0x09, 0x10, 0x0b, 0x12, 0x49,
	0x82, 0xe7, 0x91, 0xb4, 0x6f, 0x0d, 0x8d, 0xf1, 0xd1, 0xa4, 0xef, 0x96, 0xed, 0xba, 0x75, 0xbb,
	0xee, 0xeb, 0xba, 0xdd, 0xa9, 0x79, 0x93, 0x3b, 0x7b, 0x9f, 0xbe, 0x39, 0x46, 0x68, 0x55, 0x9c,
	0x2f, 0x95, 0xc8, 0x3a, 0xc3, 0xb5, 0xc8, 0xfe, 0xff, 0x88, 0x54, 0x9c, 0x2f, 0xd1, 0x05, 0x00,
	0x26, 0x57, 0xa4, 0x12, 0x39, 0xf8, 0xa7, 0xc8, 0x7e, 0x29, 0x50, 0x31, 0xbe, 0x44, 0x8f, 0xa0,
	0xbd, 0x22, 0x4c, 0x2a, 0xfa, 0x70, 0x47, 0xfa, 0x50, 0x01, 0xbe, 0x44, 0x3e, 0x1c, 0x09, 0x12,
	0x13, 0x7a, 0x5d, 0x3e, 0xde, 0xde, 0x11, 0x87, 0x1a, 0xf2, 0x25, 0x3a, 0x07, 0x33, 0x8a, 0x97,
	0x25, 0x6f, 0xee, 0xc8, 0xb7, 0x35, 0xe1, 0x4b, 0xf4, 0x10, 0x2c, 0x4c, 0x05, 0x89, 0x25, 0xe5,
	0xcc, 0xb6, 0x86, 0xc6, 0xb8, 0x33, 0xe9, 0xbb, 0x5b, 0xa3, 0xb9, 0xda, 0x19, 0xee, 0xac, 0xae,
	0x08, 0x7f, 0x17, 0xa3, 0x29, 0xa0, 0xca, 0x00, 0x51, 0x46, 0xe7, 0xd7, 0x44, 0xac, 0x94, 0x04,
	0x0c, 0x8d, 0xf1, 0xc9, 0xb4, 0x57, 0xe4, 0x4e, 0xb7, 0x74, 0x82, 0xff, 0x32, 0x78, 0x5b, 0xe6,
	0xc2, 0x6e, 0x59, 0xef, 0x67, 0xb4, 0x8a, 0xa0, 0x67, 0xd0, 0xab, 0x06, 0xf9, 0x53, 0xe5, 0x48,
	0xab, 0xdc, 0x29, 0x72, 0x07, 0x85, 0x55, 0xbe, 0xa1, 0x83, 0x6a, 0xa6, 0xa1, 0xe4, 0x6d, 0xf7,
	0xa8, 0x0d, 0x79, 0xac, 0x0d, 0xd9, 0x29, 0x72, 0x07, 0x6a, 0x81, 0x60, 0xb6, 0xdd, 0x9a, 0xb2,
	0xdf, 0x19, 0xec, 0xab, 0x3f, 0x8f, 0x7d, 0xa2, 0x67, 0x3e, 0x6d, 0xcc, 0xfc, 0x9c, 0x32, 0x1c,
	0xea, 0x24, 0x1a, 0x00, 0x44, 0x52, 0x0a, 0xba, 0x58, 0x4b, 0xb2, 0xb2, 0x3b, 0x43, 0x63, 0x7c,
	0x1c, 0x36, 0x22, 0xe8, 0x1c, 0x4e, 0x63, 0xce, 0x54, 0xd7, 0x91, 0xda, 0x89, 0x7a, 0xf9, 0x54,
	0xbf, 0x8c, 0x8a, 0xdc, 0xe9, 0x5c, 0x36, 0x52, 0xc1, 0x2c, 0xec, 0x34, 0x4b, 0x03, 0x3c, 0x7a,
	0x02, 0xd6, 0x76, 0xb1, 0xa8, 0x07, 0xdd, 0x37, 0x6c, 0xc9, 0xf8, 0x47, 0xb6, 0x8d, 0x75, 0xf7,
	0xd0, 0x31, 0x98, 0x01, 0x8b, 0x79, 0x4a, 0x59, 0xd2, 0x35, 0xd4, 0xed, 0xc5, 0x5a, 0x26, 0x5c,
	0xdd, 0x5a, 0xd3, 0x07, 0x37, 0xc5, 0xc0, 0xf8, 0x5a, 0x0c, 0x8c, 0xef, 0xc5, 0xc0, 0xf8, 0xfc,
	0x63, 0xb0, 0xf7, 0xee, 0x2c, 0xa1, 0xf2, 0xc3, 0x7a, 0xe1, 0xc6, 0x3c, 0xf5, 0xf4, 0x38, 0xd5,
	0x6f, 0xcc, 0x05, 0xf1, 0xaa, 0x2f, 0xc6, 0xe2, 0x50, 0x7b, 0xe2, 0xfe, 0xaf, 0x00, 0x00, 0x00,
	0xff, 0xff, 0x4b, 0x71, 0x94, 0xf9, 0x63, 0x04, 0x00, 0x00,
}
