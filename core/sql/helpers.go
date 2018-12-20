package sql

import (
	"errors"
	"fmt"
	"sort"
	"strings"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"github.com/jinzhu/gorm"
)

const TimestampFormat = "2006-01-02 15:04:05.999999999-07:00"

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

func ConversationMemberByID(db *gorm.DB, id string) (*entity.ConversationMember, error) {
	var contact entity.ConversationMember
	return &contact, db.First(&contact, "ID = ?", id).Error
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

func EventByID(db *gorm.DB, id string) (*p2p.Event, error) {
	var contact p2p.Event
	return &contact, db.First(&contact, "ID = ?", id).Error
}

func CreateConversation(db *gorm.DB, conversation *entity.Conversation) (*entity.Conversation, error) {

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

	// don't create 0-0 or 1-0 conversation
	if len(conversation.Members) <= 1 {
		return nil, errorcodes.ErrConversationNotEnoughMembers.New()
	}

	// generate id for conversation 1-1
	if len(conversation.Members) == 2 {
		conversation.ID = fmt.Sprintf("%s:%s",
			conversation.Members[0].ContactID,
			conversation.Members[1].ContactID,
		)

		// check if conversation already exists
		tmp := &entity.Conversation{}
		db.Where(&entity.Conversation{ID: conversation.ID}).First(&tmp)
		if tmp.ID != "" {
			return tmp, nil
		}

		// make the two members as owners
		conversation.Members[0].Status = entity.ConversationMember_Owner
		conversation.Members[1].Status = entity.ConversationMember_Owner
	}

	// save conversation
	if err := db.Set("gorm:association_autoupdate", true).Create(conversation).Error; err != nil {
		return nil, errorcodes.ErrDbCreate.Wrap(err)
	}

	// load new conversation again, to preload associations
	conversation, err := ConversationByID(db, conversation.ID)
	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return conversation, nil
}
