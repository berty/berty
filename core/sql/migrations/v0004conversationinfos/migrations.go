package v0004conversationinfos

import (
	"time"

	"berty.tech/core/entity"
	"github.com/jinzhu/gorm"
	gormigrate "gopkg.in/gormigrate.v1"
)

type Conversation struct {
	ID                   string                       `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time                    `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time                    `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	ReadAt               time.Time                    `protobuf:"bytes,4,opt,name=read_at,json=readAt,stdtime" json:"read_at"`
	Title                string                       `protobuf:"bytes,20,opt,name=title,proto3" json:"title,omitempty"`
	Topic                string                       `protobuf:"bytes,21,opt,name=topic,proto3" json:"topic,omitempty"`
	Infos                string                       `protobuf:"bytes,22,opt,name=infos,proto3" json:"infos,omitempty"`
	Members              []*entity.ConversationMember `protobuf:"bytes,100,rep,name=members" json:"members,omitempty"`
	XXX_NoUnkeyedLiteral struct{}                     `json:"-"`
	XXX_unrecognized     []byte                       `json:"-"`
	XXX_sizecache        int32                        `json:"-"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "0004_conversation_infos",
		Migrate: func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				Conversation{},
			).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return nil
		},
	}
}
