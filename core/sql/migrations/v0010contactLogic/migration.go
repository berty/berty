package v0010contactLogic

import (
	"time"

	"github.com/jinzhu/gorm"
	gormigrate "gopkg.in/gormigrate.v1"
)

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "v0010contactLogic",
		Migrate: func(tx *gorm.DB) error {
			if err := tx.AutoMigrate(Contact{}).Error; err != nil {
				return err
			}
			contacts := []*Contact{}
			if err := tx.Find(&contacts).Error; err != nil {
				return err
			}
			for _, contact := range contacts {
				switch contact.Status {
				case Contact_Unknown:
					break
				default:
					contact.MutatedAt = contact.UpdatedAt.UTC()
					contact.SeenAt = contact.UpdatedAt.UTC()
				}
				if err := tx.Save(contact).Error; err != nil {
					return err
				}
			}
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			if err := tx.Table("contact").
				DropColumn("seen_at").
				DropColumn("mutated_at").
				Error; err != nil {
				return err
			}
			return nil
		},
	}
}

type Contact_Status int32

const (
	Contact_Unknown         Contact_Status = 0
	Contact_IsFriend        Contact_Status = 1
	Contact_IsTrustedFriend Contact_Status = 2
	Contact_IsRequested     Contact_Status = 3
	Contact_RequestedMe     Contact_Status = 4
	Contact_IsBlocked       Contact_Status = 5
	Contact_BlockedMe       Contact_Status = 6
	Contact_Myself          Contact_Status = 42
)

type Contact struct {
	ID                    string         `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt             time.Time      `protobuf:"bytes,2,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt             time.Time      `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	SeenAt                time.Time      `protobuf:"bytes,4,opt,name=seen_at,json=seenAt,proto3,stdtime" json:"seen_at"`
	MutatedAt             time.Time      `protobuf:"bytes,5,opt,name=mutated_at,json=mutatedAt,proto3,stdtime" json:"mutated_at"`
	Sigchain              []byte         `protobuf:"bytes,10,opt,name=sigchain,proto3" json:"sigchain,omitempty"`
	Status                Contact_Status `protobuf:"varint,11,opt,name=status,proto3,enum=berty.entity.Contact_Status" json:"status,omitempty"`
	Devices               []*Device      `protobuf:"bytes,12,rep,name=devices,proto3" json:"devices,omitempty"`
	DisplayName           string         `protobuf:"bytes,13,opt,name=display_name,json=displayName,proto3" json:"display_name,omitempty"`
	DisplayStatus         string         `protobuf:"bytes,14,opt,name=display_status,json=displayStatus,proto3" json:"display_status,omitempty"`
	OverrideDisplayName   string         `protobuf:"bytes,15,opt,name=override_display_name,json=overrideDisplayName,proto3" json:"override_display_name,omitempty"`
	OverrideDisplayStatus string         `protobuf:"bytes,16,opt,name=override_display_status,json=overrideDisplayStatus,proto3" json:"override_display_status,omitempty"`
	XXX_NoUnkeyedLiteral  struct{}       `json:"-"`
	XXX_unrecognized      []byte         `json:"-"`
	XXX_sizecache         int32          `json:"-"`
}

type Device_Status int32

const (
	Device_Unknown      Device_Status = 0
	Device_Connected    Device_Status = 1
	Device_Disconnected Device_Status = 2
	Device_Available    Device_Status = 3
	Device_Myself       Device_Status = 42
)

type Device struct {
	ID                   string                  `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time               `protobuf:"bytes,2,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt            time.Time               `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	Name                 string                  `protobuf:"bytes,5,opt,name=name,proto3" json:"name,omitempty"`
	Status               Device_Status           `protobuf:"varint,10,opt,name=status,proto3,enum=berty.entity.Device_Status" json:"status,omitempty"`
	ApiVersion           uint32                  `protobuf:"varint,11,opt,name=api_version,json=apiVersion,proto3" json:"api_version,omitempty"`
	ContactID            string                  `protobuf:"bytes,12,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	PushIdentifiers      []*DevicePushIdentifier `protobuf:"bytes,13,rep,name=push_identifiers,json=pushIdentifiers,proto3" json:"push_identifiers,omitempty"`
	XXX_NoUnkeyedLiteral struct{}                `json:"-"`
	XXX_unrecognized     []byte                  `json:"-"`
	XXX_sizecache        int32                   `json:"-"`
}
type DevicePushIdentifier struct {
	ID                   string    `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time `protobuf:"bytes,2,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt            time.Time `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	PushInfo             []byte    `protobuf:"bytes,4,opt,name=push_info,json=pushInfo,proto3" json:"push_info,omitempty"`
	RelayPubkey          string    `protobuf:"bytes,5,opt,name=relay_pubkey,json=relayPubkey,proto3" json:"relay_pubkey,omitempty"`
	DeviceID             string    `protobuf:"bytes,6,opt,name=device_id,json=deviceId,proto3" json:"device_id,omitempty"`
	XXX_NoUnkeyedLiteral struct{}  `json:"-"`
	XXX_unrecognized     []byte    `json:"-"`
	XXX_sizecache        int32     `json:"-"`
}
