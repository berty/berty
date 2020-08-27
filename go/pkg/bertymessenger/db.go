package bertymessenger

import (
	"errors"

	"berty.tech/berty/v2/go/pkg/errcode"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func initDB(db *gorm.DB) error {
	models := []interface{}{
		&Conversation{},
		&Account{},
		&Contact{},
		&Interaction{},
		&Member{},
		&Device{},
	}
	if err := db.AutoMigrate(models...); err != nil {
		return err
	}
	return nil
}

func dropAllTables(db *gorm.DB) error {
	tables := []string{}
	if err := db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error; err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	for _, table := range tables {
		if err := db.Migrator().DropTable(table); err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}
	}

	return nil
}

func addConversation(db *gorm.DB, groupPK string) (*Conversation, error) {
	var conversation Conversation

	err := db.
		Where(Conversation{PublicKey: groupPK}).
		First(&conversation).
		Error
	switch err {
	case gorm.ErrRecordNotFound: // not found, create a new one
		conversation.PublicKey = groupPK
		conversation.Type = Conversation_MultiMemberType
		err := db.
			Clauses(clause.OnConflict{DoNothing: true}).
			Create(&conversation).
			Error
		if err != nil {
			return nil, errcode.ErrDBWrite.Wrap(err)
		}

		return &conversation, nil

	case nil: // contact already exists
		return nil, errcode.ErrDBEntryAlreadyExists

	default: // other error
		return nil, errcode.ErrDBRead.Wrap(err)
	}
}

func addContactRequestOutgoingEnqueued(db *gorm.DB, contactPK, displayName string) (*Contact, error) {
	var contact Contact

	err := db.
		Where(Contact{PublicKey: contactPK}).
		Take(&contact).
		Error
	switch err {
	case gorm.ErrRecordNotFound:
		contact = Contact{
			DisplayName: displayName,
			PublicKey:   contactPK,
			State:       Contact_OutgoingRequestEnqueued,
		}
		err = db.
			Clauses(clause.OnConflict{DoNothing: true}).
			Create(&contact).
			Error
		if err != nil {
			return nil, errcode.ErrDBRead.Wrap(err)
		}

		return &contact, nil
	case nil: // contact already exists
		// Maybe update DisplayName in some cases?
		// TODO: better handle case where the state is "IncomingRequest", should end up as in "Established" state in this case IMO
		return nil, errcode.ErrDBEntryAlreadyExists
	default: // any other error
		return nil, errcode.ErrDBRead.Wrap(err)
	}
}

func addContactRequestOutgoingSent(db *gorm.DB, contactPK string) (*Contact, error) {
	var contact Contact

	err := db.
		Where(Contact{PublicKey: contactPK}).
		Take(&contact).
		Error
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	switch contact.State {
	case Contact_OutgoingRequestEnqueued:
		contact.State = Contact_OutgoingRequestSent

		if err := db.Save(&contact).Error; err != nil {
			return nil, errcode.ErrDBWrite.Wrap(err)
		}

		return &contact, nil
	default:
		return nil, errcode.ErrInvalidInput.Wrap(errors.New("request not enqueud"))
	}
}

func addContactRequestIncomingReceived(db *gorm.DB, contactPK, displayName string) (*Contact, error) {
	contact := Contact{
		DisplayName: displayName,
		PublicKey:   contactPK,
		State:       Contact_IncomingRequest,
	}

	err := db.
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(&contact).
		Error
	if err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return &contact, nil
}

func addContactRequestIncomingAccepted(db *gorm.DB, contactPK, groupPK string) (*Contact, *Conversation, error) {
	var contact Contact

	err := db.
		Where(Contact{PublicKey: contactPK}).
		First(&contact).
		Error
	if err != nil {
		return nil, nil, errcode.ErrDBRead.Wrap(err)
	}

	if contact.State != Contact_IncomingRequest {
		return nil, nil, errcode.ErrInvalidInput.Wrap(errors.New("no incoming request"))
	}

	contact.State = Contact_Established
	contact.ConversationPublicKey = groupPK

	// create new contact conversation
	var conversation Conversation
	{
		conversation = Conversation{
			PublicKey:        contact.ConversationPublicKey,
			Type:             Conversation_ContactType,
			ContactPublicKey: contactPK,
			DisplayName:      "", // empty on account conversations
			Link:             "", // empty on account conversations
		}
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		// update existing contact
		if err := tx.Save(&contact).Error; err != nil {
			return err
		}

		// create new conversation
		err := tx.
			Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "public_key"}},
				DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
			}).
			Create(&conversation).
			Error
		return err
	})
	if err != nil {
		return nil, nil, errcode.ErrDBWrite.Wrap(err)
	}

	return &contact, &conversation, nil
}
