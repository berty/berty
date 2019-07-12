package v0009conversationseenat

import (
	"time"

	"berty.tech/core/entity"
	"github.com/jinzhu/gorm"
	gormigrate "gopkg.in/gormigrate.v1"
)

type Conversation_Kind int32

type Conversation struct {
	ID                   string                `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time             `protobuf:"bytes,2,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt            time.Time             `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	ReadAt               time.Time             `protobuf:"bytes,4,opt,name=read_at,json=readAt,proto3,stdtime" json:"read_at"`
	WroteAt              time.Time             `protobuf:"bytes,5,opt,name=wrote_at,json=wroteAt,proto3,stdtime" json:"wrote_at"`
	SeenAt               time.Time             `protobuf:"bytes,6,opt,name=seen_at,json=seenAt,proto3,stdtime" json:"seen_at"`
	Title                string                `protobuf:"bytes,20,opt,name=title,proto3" json:"title,omitempty"`
	Topic                string                `protobuf:"bytes,21,opt,name=topic,proto3" json:"topic,omitempty"`
	Infos                string                `protobuf:"bytes,22,opt,name=infos,proto3" json:"infos,omitempty"`
	Kind                 Conversation_Kind     `protobuf:"varint,23,opt,name=kind,proto3,enum=berty.entity.Conversation_Kind" json:"kind,omitempty"`
	Members              []*ConversationMember `protobuf:"bytes,100,rep,name=members,proto3" json:"members,omitempty" gorm:"foreignkey:ConversationID;association_foreignkey:ID;save_associations:true"`
	XXX_NoUnkeyedLiteral struct{}              `json:"-"`
	XXX_unrecognized     []byte                `json:"-"`
	XXX_sizecache        int32                 `json:"-"`
}

type ConversationMember_Status int32

type ConversationMember struct {
	ID                   string                    `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time                 `protobuf:"bytes,2,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt            time.Time                 `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	ReadAt               time.Time                 `protobuf:"bytes,4,opt,name=read_at,json=readAt,proto3,stdtime" json:"read_at"`
	WroteAt              time.Time                 `protobuf:"bytes,5,opt,name=wrote_at,json=wroteAt,proto3,stdtime" json:"wrote_at"`
	SeenAt               time.Time                 `protobuf:"bytes,6,opt,name=seen_at,json=seenAt,proto3,stdtime" json:"seen_at"`
	Status               ConversationMember_Status `protobuf:"varint,10,opt,name=status,proto3,enum=berty.entity.ConversationMember_Status" json:"status,omitempty"`
	Contact              *entity.Contact           `protobuf:"bytes,100,opt,name=contact,proto3" json:"contact,omitempty" gorm:"association_autoupdate:false;association_create:true"`
	ConversationID       string                    `protobuf:"bytes,101,opt,name=conversation_id,json=conversationId,proto3" json:"conversation_id,omitempty"`
	ContactID            string                    `protobuf:"bytes,102,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	XXX_NoUnkeyedLiteral struct{}                  `json:"-"`
	XXX_unrecognized     []byte                    `json:"-"`
	XXX_sizecache        int32                     `json:"-"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "v0009conversation_seen_at",
		Migrate: func(tx *gorm.DB) error {
			if err := tx.AutoMigrate(Conversation{}, ConversationMember{}).Error; err != nil {
				return err
			}
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			if err := tx.Table("conversation").DropColumn("seen_at").Error; err != nil {
				return err
			}
			if err := tx.Table("conversation_member").DropColumn("seen_at").Error; err != nil {
				return err
			}
			return nil
		},
	}
}
