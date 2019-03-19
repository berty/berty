package sql

import (
	"fmt"
	"sort"
	"strings"

	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
)

const TimestampFormat = "2006-01-02 15:04:05.999999999-07:00"

func GenericError(err error) error {
	if err == nil {
		return nil
	}

	// FIXME: ignore 1 stack level in wrapped errors

	if gorm.IsRecordNotFoundError(errors.Cause(err)) {
		return errorcodes.ErrDbNothingFound.Wrap(err)
	}

	return errorcodes.ErrDbInternalError.Wrap(err)
}

func ContactByID(db *gorm.DB, id string) (*entity.Contact, error) {
	contact := entity.Contact{}
	err := db.First(&contact, "ID = ?", id).Error

	if err != nil {
		return nil, err
	}

	return &contact, nil
}

func FindContact(db *gorm.DB, input *entity.Contact) (*entity.Contact, error) {
	if input.ID != "" {
		return ContactByID(db, input.ID)
	}
	// FIXME: support looking-up by sigchain
	return nil, errors.New("not enough information to search contact")
}

func ConversationMemberByID(db *gorm.DB, id string) (*entity.ConversationMember, error) {
	var conversationMember entity.ConversationMember
	return &conversationMember, db.First(&conversationMember, "ID = ?", id).Error
}

func DeviceByID(db *gorm.DB, id string) (*entity.Device, error) {
	var device entity.Device
	return &device, db.First(&device, "ID = ?", id).Error
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

func EventByID(db *gorm.DB, id string) (*entity.Event, error) {
	var event entity.Event
	return &event, db.First(&event, "ID = ?", id).Error
}

func ConversationOneToOne(db *gorm.DB, myselfID, contactID string) (*entity.Conversation, error) {
	var err error

	c := &entity.Conversation{}

	// get 1-1 conversation with this contactID
	if err = db.
		Model(&entity.Conversation{}).
		Where(&entity.Conversation{ID: myselfID + ":" + contactID}).
		Or(&entity.Conversation{ID: contactID + ":" + myselfID}).
		First(c).Error; err != nil {
		return nil, GenericError(err)
	}

	return c, nil
}

func sortCleanDedupConversationContacts(conversation *entity.Conversation) {
	// remove members duplicates and sort them by contact id
	members := map[string]*entity.ConversationMember{}
	for _, member := range conversation.Members {
		if member.ContactID != "" && member != nil {
			members[member.ContactID] = member
		}
	}
	conversation.Members = []*entity.ConversationMember{}
	for _, member := range members {
		conversation.Members = append(conversation.Members, member)
	}
	// sort members
	sort.Slice(conversation.Members, func(i, j int) bool {
		if strings.Compare(
			conversation.Members[i].ContactID,
			conversation.Members[j].ContactID,
		) > 0 {
			return false
		}
		return true
	})

	for _, member := range conversation.Members {
		member.ID = conversation.ID + ":" + member.ContactID
	}
}

func conversationSetOneToOneMembers(conversation *entity.Conversation) {
	if len(conversation.Members) > 2 {
		return
	}

	conversation.ID = fmt.Sprintf("%s:%s",
		conversation.Members[0].ContactID,
		conversation.Members[1].ContactID,
	)

	// make the two members as owners
	conversation.Members[0].Status = entity.ConversationMember_Owner
	conversation.Members[1].Status = entity.ConversationMember_Owner
}

func conversationSetMetadata(conversation *entity.Conversation, input *entity.Conversation) {
	if len(input.Members) > 2 {
		if input.Title != "" {
			conversation.Title = input.Title
		}

		if input.Topic != "" {
			conversation.Topic = input.Topic
		}

		if input.Infos != "" {
			conversation.Infos = input.Infos
		}
	}
}

func SaveConversation(db *gorm.DB, input *entity.Conversation, createID string) (*entity.Conversation, error) {
	conversation, err := ConversationByID(db, input.ID)

	if err != nil {
		err = GenericError(err)
		if !errorcodes.ErrDbNothingFound.Is(err) {
			return nil, GenericError(err)
		} else {
			conversation = input
		}
	}

	for _, member := range input.Members {
		conversation.Members = append(conversation.Members, member)
	}

	sortCleanDedupConversationContacts(conversation)

	if len(conversation.Members) < 2 {
		return nil, errorcodes.ErrConversationNotEnoughMembers.New()
	} else if len(conversation.Members) == 2 && conversation.ID != "" {
		return conversation, nil
	}

	conversationSetOneToOneMembers(conversation)
	conversationSetMetadata(conversation, input)

	if conversation.ID == "" {
		conversation.ID = createID
		if err := db.Create(conversation).Error; err != nil {
			return nil, GenericError(err)
		}
	} else {
		if err := db.Save(conversation).Error; err != nil {
			return nil, GenericError(err)
		}
	}

	for _, member := range conversation.Members {
		existingMember := &entity.ConversationMember{}
		err = db.Find(&existingMember, &entity.ConversationMember{ID: member.ID}).Error
		if !errorcodes.ErrDbNothingFound.Is(GenericError(err)) {
			continue
		} else if err != nil {
			if err := db.Create(&member).Error; err != nil {
				return nil, GenericError(err)
			}
		}

		contact := &entity.Contact{}
		err := db.Find(&contact, &entity.Contact{ID: member.ContactID}).Error
		if errorcodes.ErrDbNothingFound.Is(GenericError(err)) {
			contact = member.Contact
			contact.ID = member.ContactID

			if err := db.Create(&contact).Error; err != nil {
				return nil, GenericError(err)
			}

			for _, device := range member.Contact.Devices {
				existingDevice := &entity.Device{}
				err := db.Find(&existingDevice, &entity.Device{ID: device.ID}).Error
				if !errorcodes.ErrDbNothingFound.Is(GenericError(err)) {
					continue
				} else if err != nil {
					return nil, GenericError(err)
				}

				if err := db.Create(&device).Error; err != nil {
					return nil, GenericError(err)
				}
			}
		} else if err != nil {
			return nil, GenericError(err)
		}
	}

	// load new conversation again, to preload associations
	if conversation, err = ConversationByID(db, conversation.ID); err != nil {
		return nil, GenericError(err)
	}

	return conversation, nil
}
