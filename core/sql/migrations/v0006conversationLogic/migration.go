package v0006conversationLogic

import (
	"sort"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
	gormigrate "gopkg.in/gormigrate.v1"
)

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "0006_conversation_logic",
		Migrate: func(tx *gorm.DB) error {
			if err := tx.AutoMigrate(Conversation{}, ConversationMember{}).Error; err != nil {
				return err
			}
			var conversations []*Conversation
			if err := tx.Find(&conversations).Error; err != nil {
				return err
			}
			for _, conversation := range conversations {
				if len(conversation.Members) == 2 {
					if conversation.ID == GetOneToOneID(
						conversation.Members[0].Contact,
						conversation.Members[1].Contact,
					) {
						conversation.Kind = Conversation_OneToOne
						continue
					}
				}
				if len(conversation.Members) >= 2 {
					conversation.Kind = Conversation_Group
					continue
				}
				conversation.Kind = Conversation_Unknown
			}
			for _, conversation := range conversations {
				if err := tx.Save(conversation).Error; err != nil {
					return err
				}
			}
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			if err := tx.Table("conversation").DropColumn("kind").DropColumn("wrote_at").Error; err != nil {
				return err
			}
			return nil
		},
	}
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

type Device_Status int32

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

type Contact_Status int32

type Contact struct {
	ID                    string         `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt             time.Time      `protobuf:"bytes,2,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt             time.Time      `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
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

type Conversation_Kind int32

const (
	Conversation_Unknown  Conversation_Kind = 0
	Conversation_OneToOne Conversation_Kind = 1
	Conversation_Group    Conversation_Kind = 2
)

type ConversationMember_Status int32

const (
	ConversationMember_Unknown ConversationMember_Status = 0
	ConversationMember_Owner   ConversationMember_Status = 1
	ConversationMember_Active  ConversationMember_Status = 2
	ConversationMember_Blocked ConversationMember_Status = 3
)

type Conversation struct {
	ID                   string                `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time             `protobuf:"bytes,2,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt            time.Time             `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	ReadAt               time.Time             `protobuf:"bytes,4,opt,name=read_at,json=readAt,proto3,stdtime" json:"read_at"`
	WroteAt              time.Time             `protobuf:"bytes,5,opt,name=wrote_at,json=wroteAt,proto3,stdtime" json:"wrote_at"`
	Title                string                `protobuf:"bytes,20,opt,name=title,proto3" json:"title,omitempty"`
	Topic                string                `protobuf:"bytes,21,opt,name=topic,proto3" json:"topic,omitempty"`
	Infos                string                `protobuf:"bytes,22,opt,name=infos,proto3" json:"infos,omitempty"`
	Kind                 Conversation_Kind     `protobuf:"varint,23,opt,name=kind,proto3,enum=berty.entity.Conversation_Kind" json:"kind,omitempty"`
	Members              []*ConversationMember `protobuf:"bytes,100,rep,name=members,proto3" json:"members,omitempty" gorm:"foreignkey:ConversationID;association_foreignkey:ID;save_associations:true"`
	XXX_NoUnkeyedLiteral struct{}              `json:"-"`
	XXX_unrecognized     []byte                `json:"-"`
	XXX_sizecache        int32                 `json:"-"`
}

type ConversationMember struct {
	ID                   string                    `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time                 `protobuf:"bytes,2,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt            time.Time                 `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	ReadAt               time.Time                 `protobuf:"bytes,4,opt,name=read_at,json=readAt,proto3,stdtime" json:"read_at"`
	WroteAt              time.Time                 `protobuf:"bytes,5,opt,name=wrote_at,json=wroteAt,proto3,stdtime" json:"wrote_at"`
	Status               ConversationMember_Status `protobuf:"varint,10,opt,name=status,proto3,enum=berty.entity.ConversationMember_Status" json:"status,omitempty"`
	Contact              *Contact                  `protobuf:"bytes,100,opt,name=contact,proto3" json:"contact,omitempty" gorm:"association_autoupdate:false;association_create:true"`
	ConversationID       string                    `protobuf:"bytes,101,opt,name=conversation_id,json=conversationId,proto3" json:"conversation_id,omitempty"`
	ContactID            string                    `protobuf:"bytes,102,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	XXX_NoUnkeyedLiteral struct{}                  `json:"-"`
	XXX_unrecognized     []byte                    `json:"-"`
	XXX_sizecache        int32                     `json:"-"`
}

func GetOneToOneID(a, b *Contact) string {
	contacts := []*Contact{a, b}
	sort.SliceStable(contacts, func(i, j int) bool {
		if strings.Compare(contacts[i].ID, contacts[j].ID) > 0 {
			return false
		}
		return true
	})
	return contacts[0].ID + ":" + contacts[1].ID
}
