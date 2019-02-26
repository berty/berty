package v0002pushtokens

import (
	"time"

	"berty.tech/core/push"
	gormigrate "gopkg.in/gormigrate.v1"
	"github.com/jinzhu/gorm"
)

type Device_Status int32

type DevicePushIdentifier struct {
	ID                   string    `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	PushInfo             []byte    `protobuf:"bytes,4,opt,name=push_info,json=pushInfo,proto3" json:"push_info,omitempty"`
	RelayPubkey          string    `protobuf:"bytes,5,opt,name=relay_pubkey,json=relayPubkey,proto3" json:"relay_pubkey,omitempty"`
	DeviceID             string    `protobuf:"bytes,6,opt,name=device_id,json=deviceId,proto3" json:"device_id,omitempty"`
	XXX_NoUnkeyedLiteral struct{}  `json:"-"`
	XXX_unrecognized     []byte    `json:"-"`
	XXX_sizecache        int32     `json:"-"`
}

type Device struct {
	ID                   string                  `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time               `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time               `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	Name                 string                  `protobuf:"bytes,5,opt,name=name,proto3" json:"name,omitempty"`
	Status               Device_Status           `protobuf:"varint,10,opt,name=status,proto3,enum=berty.entity.Device_Status" json:"status,omitempty"`
	ApiVersion           uint32                  `protobuf:"varint,11,opt,name=api_version,json=apiVersion,proto3" json:"api_version,omitempty"`
	ContactID            string                  `protobuf:"bytes,12,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	PushIdentifiers      []*DevicePushIdentifier `protobuf:"bytes,13,rep,name=push_identifiers,json=pushIdentifiers" json:"push_identifiers,omitempty"`
	XXX_NoUnkeyedLiteral struct{}                `json:"-"`
	XXX_unrecognized     []byte                  `json:"-"`
	XXX_sizecache        int32                   `json:"-"`
}

type DevicePushConfig struct {
	ID                   string              `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time           `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time           `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	DeviceID             string              `protobuf:"bytes,4,opt,name=device_id,json=deviceId,proto3" json:"device_id,omitempty"`
	PushType             push.DevicePushType `protobuf:"varint,5,opt,name=push_type,json=pushType,proto3,enum=berty.push.DevicePushType" json:"push_type,omitempty"`
	PushID               []byte              `protobuf:"bytes,6,opt,name=push_id,json=pushId,proto3" json:"push_id,omitempty"`
	RelayPubkey          string              `protobuf:"bytes,7,opt,name=relay_pubkey,json=relayPubkey,proto3" json:"relay_pubkey,omitempty"`
	XXX_NoUnkeyedLiteral struct{}            `json:"-"`
	XXX_unrecognized     []byte              `json:"-"`
	XXX_sizecache        int32               `json:"-"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "0002_push_tokens",
		Migrate: func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				Device{},
				DevicePushConfig{},
				DevicePushIdentifier{},
			).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.DropTableIfExists(
				"device_push_identifier",
				"device_push_config",
			).Error
		},
	}
}
