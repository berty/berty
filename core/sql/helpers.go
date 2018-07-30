package sql

import (
	"errors"

	"github.com/jinzhu/gorm"

	"github.com/berty/berty/core/entity"
)

func ContactByID(db *gorm.DB, id string) (*entity.Contact, error) {
	var contact entity.Contact
	return &contact, db.First(&contact, "ID = ?", id).Error
}

// FindContact tries different approaches to get a full contact based on a partial one
func FindContact(db *gorm.DB, input *entity.Contact) (*entity.Contact, error) {
	if input.ID != "" {
		return ContactByID(db, input.ID)
	}
	// FIXME: support looking-up by sigchain
	return nil, errors.New("not enough information to search contact")
}
