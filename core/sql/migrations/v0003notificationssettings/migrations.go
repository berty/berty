package v0003notificationssettings

import (
	"time"

	gormigrate "gopkg.in/gormigrate.v1"
	"github.com/jinzhu/gorm"
)

type DebugVerbosity int32

type Contact struct {
	ID string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
}

type Device struct {
	ID string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
}

type Config struct {
	ID                         string         `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt                  time.Time      `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt                  time.Time      `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	Myself                     *Contact       `protobuf:"bytes,5,opt,name=myself" json:"myself,omitempty"`
	MyselfID                   string         `protobuf:"bytes,6,opt,name=myself_id,json=myselfId,proto3" json:"myself_id,omitempty"`
	CurrentDevice              *Device        `protobuf:"bytes,7,opt,name=current_device,json=currentDevice" json:"current_device,omitempty"`
	CurrentDeviceID            string         `protobuf:"bytes,8,opt,name=current_device_id,json=currentDeviceId,proto3" json:"current_device_id,omitempty"`
	CryptoParams               []byte         `protobuf:"bytes,9,opt,name=crypto_params,json=cryptoParams,proto3" json:"crypto_params,omitempty"`
	PushRelayPubkeyAPNS        string         `protobuf:"bytes,10,opt,name=push_relay_pubkey_apns,json=pushRelayPubkeyApns,proto3" json:"push_relay_pubkey_apns,omitempty"`
	PushRelayPubkeyFCM         string         `protobuf:"bytes,11,opt,name=push_relay_pubkey_fcm,json=pushRelayPubkeyFcm,proto3" json:"push_relay_pubkey_fcm,omitempty"`
	NotificationsEnabled       bool           `protobuf:"varint,12,opt,name=notifications_enabled,json=notificationsEnabled,proto3" json:"notifications_enabled,omitempty"`
	NotificationsPreviews      bool           `protobuf:"varint,13,opt,name=notifications_previews,json=notificationsPreviews,proto3" json:"notifications_previews,omitempty"`
	DebugNotificationVerbosity DebugVerbosity `protobuf:"varint,14,opt,name=debug_notification_verbosity,json=debugNotificationVerbosity,proto3,enum=berty.entity.DebugVerbosity" json:"debug_notification_verbosity,omitempty"`
	XXX_NoUnkeyedLiteral       struct{}       `json:"-"`
	XXX_unrecognized           []byte         `json:"-"`
	XXX_sizecache              int32          `json:"-"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "0003_notifications_settings",
		Migrate: func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				Config{},
			).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return nil
		},
	}
}
