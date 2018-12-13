package sql

import (
	"errors"
	"strings"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"github.com/jinzhu/gorm"
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

func MergeConversations(db *gorm.DB, conversations []entity.Conversation) (*entity.Conversation, error) {
	logger().Debug("MERGE_CONVERSATION")
	// chosse the conversation to save
	merge := conversations[0]
	for i := range conversations {
		if strings.Compare(merge.ID, conversations[i].ID) > 0 {
			merge = conversations[i]
		}
	}

	// move all messages to that conversation
	for i := range conversations {
		if err := db.Model(&p2p.Event{}).Where(&p2p.Event{
			ConversationID: conversations[i].ID,
			Kind:           p2p.Kind_ConversationNewMessage,
		}).Update(&p2p.Event{
			ConversationID: merge.ID,
		}).Error; err != nil {
			return nil, err
		}
	}

	// remove other conversations
	for i := range conversations {
		if conversations[i].ID != merge.ID {
			db.Where(&entity.ConversationMember{
				ConversationID: conversations[i].ID,
			}).Delete(&entity.ConversationMember{})
			db.Delete(conversations[i])
		}
	}

	return &merge, nil
}

func CreateConversation(db *gorm.DB, conversation *entity.Conversation) (*entity.Conversation, error) {
	// save conversation
	if err := db.Set("gorm:association_autoupdate", true).Save(conversation).Error; err != nil {
		return nil, errorcodes.ErrDbCreate.Wrap(err)
	}

	// load new conversation again, to preload associations
	conversation, err := ConversationByID(db, conversation.ID)
	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	// check if that is 1-1 conversation
	// if len(conversation.Members) <= 2 {
	// 	logger().Debug("CREATE_CONVERSATION")
	// 	// check if there already a 1-1 conversation
	// 	conversations := []entity.Conversation{}

	// 	logger().Debug(fmt.Sprintf("GET_MEMBERS %+v", conversation.Members))
	// 		db.Model(&entity.Conversation{}).Find(conversations).Error; err != nil {
	// 		logger().Error(err.Error())
	// 	}
	// 	logger().Debug(fmt.Sprintf("CONVERSATIONS %+v", conversations))
	// 	if len(conversations) >= 1 {
	// 		return MergeConversations(db, conversations)
	// 	}
	// }

	return conversation, nil
}
