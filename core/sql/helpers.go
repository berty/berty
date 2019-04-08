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
	return &conversationMember, db.Preload("Conversation").First(&conversationMember, "ID = ?", id).Error
}

func DeviceByID(db *gorm.DB, id string) (*entity.Device, error) {
	var device entity.Device
	return &device, db.First(&device, "ID = ?", id).Error
}

func ConversationByID(db *gorm.DB, id string) (*entity.Conversation, error) {
	var conversation entity.Conversation
	return &conversation, db.Preload("Members").First(&conversation, "ID = ?", id).Error
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

func ConversationSave(db *gorm.DB, c *entity.Conversation) error {
	if err := db.Save(c).Error; err != nil {
		logger().Error(fmt.Sprintf("cannot save conversation %+v, err: %+v", c, err.Error()))
		return err
	}

	var err error
	for _, member := range c.Members {
		if member.Contact != nil {
			err := db.Find(&entity.Contact{ID: member.Contact.ID}).Error
			if err != nil {
				if !errorcodes.ErrDbNothingFound.Is(GenericError(err)) {
					return err
				}
				member.Contact.Status = entity.Contact_Unknown
				if err := ContactSave(db, member.Contact); err != nil {
					return err
				}
			}
		}
		if err = db.Save(member).Error; err != nil {
			db.Delete(c)
			return err
		}
	}

	return nil
}

func ContactSave(db *gorm.DB, c *entity.Contact) error {
	if err := db.Save(c).Error; err != nil {
		logger().Error(fmt.Sprintf("cannot save contact %+v, err: %+v", c, err.Error()))
		return err
	}

	c.Devices = append(c.Devices, &entity.Device{ID: c.ID, ContactID: c.ID})
	for _, device := range c.Devices {
		if err := db.Save(device).Error; err != nil {
			logger().Error(fmt.Sprintf("cannot save devices %+v, err %+v", device, err.Error()))
			return err
		}
	}

	return nil
}
