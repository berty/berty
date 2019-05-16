package v0008eventdispatcherror

import (
	"time"

	"github.com/jinzhu/gorm"
	gormigrate "gopkg.in/gormigrate.v1"
)

type EventDispatch_Medium int32

type EventDispatch struct {
	EventID              string               `protobuf:"bytes,1,opt,name=event_id,json=eventId,proto3" json:"event_id,omitempty" gorm:"primary_key"`
	DeviceID             string               `protobuf:"bytes,2,opt,name=device_id,json=deviceId,proto3" json:"device_id,omitempty" gorm:"primary_key"`
	ContactID            string               `protobuf:"bytes,3,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	SentAt               *time.Time           `protobuf:"bytes,4,opt,name=sent_at,json=sentAt,proto3,stdtime" json:"sent_at,omitempty"`
	AckedAt              *time.Time           `protobuf:"bytes,5,opt,name=acked_at,json=ackedAt,proto3,stdtime" json:"acked_at,omitempty"`
	SeenAt               *time.Time           `protobuf:"bytes,6,opt,name=seen_at,json=seenAt,proto3,stdtime" json:"seen_at,omitempty"`
	AckMedium            EventDispatch_Medium `protobuf:"varint,7,opt,name=ack_medium,json=ackMedium,proto3,enum=berty.entity.EventDispatch_Medium" json:"ack_medium,omitempty"`
	SeenMedium           EventDispatch_Medium `protobuf:"varint,8,opt,name=seen_medium,json=seenMedium,proto3,enum=berty.entity.EventDispatch_Medium" json:"seen_medium,omitempty"`
	RetryBackoff         int64                `protobuf:"varint,9,opt,name=retry_backoff,json=retryBackoff,proto3" json:"retry_backoff,omitempty"`
	SendErrorMessage     string               `protobuf:"bytes,10,opt,name=send_error_message,json=sendErrorMessage,proto3" json:"send_error_message,omitempty" gorm:"type:TEXT"`
	SendErrorDetail      string               `protobuf:"bytes,11,opt,name=send_error_detail,json=sendErrorDetail,proto3" json:"send_error_detail,omitempty" gorm:"type:TEXT"`
	XXX_NoUnkeyedLiteral struct{}             `json:"-"`
	XXX_unrecognized     []byte               `json:"-"`
	XXX_sizecache        int32                `json:"-"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "0008_event_dispatch_error",
		Migrate: func(tx *gorm.DB) error {
			return tx.AutoMigrate(&EventDispatch{}).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Table("event_dispatch").DropColumn("send_error_message").DropColumn("send_error_detail").Error
		},
	}
}
