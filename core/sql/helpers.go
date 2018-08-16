package sql

import (
	"errors"

	"github.com/jinzhu/gorm"

	"berty.tech/core/entity"
)

func ContactByID(db *gorm.DB, id string) (*entity.Contact, error) {
	var contact entity.Contact
	return &contact, db.First(&contact, "ID = ?", id).Error
}

func FindContact(db *gorm.DB, input *entity.Contact) (*entity.Contact, error) {
	if input.ID != "" {
		return ContactByID(db, input.ID)
	}
	// FIXME: support looking-up by sigchain
	return nil, errors.New("not enough information to search contact")
}

func ConversationByID(db *gorm.DB, id string) (*entity.Conversation, error) {
	var conversation entity.Conversation
	return &conversation, db.First(&conversation, "ID = ?", id).Error
}

func MembersByConversationID(db *gorm.DB, conversationID string) ([]*entity.ConversationMember, error) {
	var members []*entity.ConversationMember
	return members, db.
		Where(entity.ConversationMember{ConversationID: conversationID}).
		Find(&members).
		Error
}
