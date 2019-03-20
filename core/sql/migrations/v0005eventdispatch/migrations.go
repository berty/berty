package v0005eventdispatch

import (
	"time"

	"github.com/jinzhu/gorm"
	gormigrate "gopkg.in/gormigrate.v1"
)

type Event_Direction int32
type Event_TargetType int32
type Kind int32
type Event_AckStatus int32
type EventDispatch_Medium int32

type Event struct {
	ID              string           `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	SourceDeviceID  string           `protobuf:"bytes,2,opt,name=source_device_id,json=sourceDeviceId,proto3" json:"source_device_id,omitempty" gorm:"primary_key"`
	CreatedAt       time.Time        `protobuf:"bytes,3,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt       time.Time        `protobuf:"bytes,4,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	SentAt          *time.Time       `protobuf:"bytes,6,opt,name=sent_at,json=sentAt,proto3,stdtime" json:"sent_at,omitempty"`
	ReceivedAt      *time.Time       `protobuf:"bytes,7,opt,name=received_at,json=receivedAt,proto3,stdtime" json:"received_at,omitempty"`
	AckedAt         *time.Time       `protobuf:"bytes,8,opt,name=acked_at,json=ackedAt,proto3,stdtime" json:"acked_at,omitempty"`
	Direction       Event_Direction  `protobuf:"varint,9,opt,name=direction,proto3,enum=berty.entity.Event_Direction" json:"direction,omitempty"`
	APIVersion      uint32           `protobuf:"varint,10,opt,name=api_version,json=apiVersion,proto3" json:"api_version,omitempty"`
	Kind            Kind             `protobuf:"varint,13,opt,name=kind,proto3,enum=berty.entity.Kind" json:"kind,omitempty"`
	Attributes      []byte           `protobuf:"bytes,14,opt,name=attributes,proto3" json:"attributes,omitempty"`
	SeenAt          *time.Time       `protobuf:"bytes,16,opt,name=seen_at,json=seenAt,proto3,stdtime" json:"seen_at,omitempty"`
	AckStatus       Event_AckStatus  `protobuf:"varint,17,opt,name=ack_status,json=ackStatus,proto3,enum=berty.entity.Event_AckStatus" json:"ack_status,omitempty"`
	Dispatches      []*EventDispatch `protobuf:"bytes,18,rep,name=dispatches,proto3" json:"dispatches,omitempty"`
	SourceContactID string           `protobuf:"bytes,19,opt,name=source_contact_id,json=sourceContactId,proto3" json:"source_contact_id,omitempty"`
	TargetType      Event_TargetType `protobuf:"varint,20,opt,name=target_type,json=targetType,proto3,enum=berty.entity.Event_TargetType" json:"target_type,omitempty"`
	TargetAddr      string           `protobuf:"bytes,21,opt,name=target_addr,json=targetAddr,proto3" json:"target_addr,omitempty"`
}

type EventDispatch struct {
	EventID    string               `protobuf:"bytes,1,opt,name=event_id,json=eventId,proto3" json:"event_id,omitempty" gorm:"primary_key"`
	DeviceID   string               `protobuf:"bytes,2,opt,name=device_id,json=deviceId,proto3" json:"device_id,omitempty" gorm:"primary_key"`
	ContactID  string               `protobuf:"bytes,3,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	SentAt     *time.Time           `protobuf:"bytes,4,opt,name=sent_at,json=sentAt,proto3,stdtime" json:"sent_at,omitempty"`
	AckedAt    *time.Time           `protobuf:"bytes,5,opt,name=acked_at,json=ackedAt,proto3,stdtime" json:"acked_at,omitempty"`
	SeenAt     *time.Time           `protobuf:"bytes,6,opt,name=seen_at,json=seenAt,proto3,stdtime" json:"seen_at,omitempty"`
	AckMedium  EventDispatch_Medium `protobuf:"varint,7,opt,name=ack_medium,json=ackMedium,proto3,enum=berty.entity.EventDispatch_Medium" json:"ack_medium,omitempty"`
	SeenMedium EventDispatch_Medium `protobuf:"varint,8,opt,name=seen_medium,json=seenMedium,proto3,enum=berty.entity.EventDispatch_Medium" json:"seen_medium,omitempty"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "0005_event_dispatch",
		Migrate: func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				Event{},
				EventDispatch{},
			).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return nil
		},
	}
}
