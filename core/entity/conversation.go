package entity

import "berty.tech/core/pkg/errorcodes"

func (c Conversation) Validate() error {
	if c.ID == "" {
		return errorcodes.ErrEntityData.New()
	}
	return nil
}

func (c Conversation) Filtered() *Conversation {
	filteredMembers := []*ConversationMember{}
	for _, member := range c.Members {
		filteredMembers = append(filteredMembers, member.Filtered())
	}
	return &Conversation{
		ID:      c.ID,
		Title:   c.Title,
		Topic:   c.Topic,
		Members: filteredMembers,
	}
}

func (m ConversationMember) Validate() error {
	if m.ID == "" || m.Contact == nil {
		return errorcodes.ErrEntityData.New()
	}
	return m.Contact.Validate()
}

func (m ConversationMember) Filtered() *ConversationMember {
	member := ConversationMember{
		ID:     m.ID,
		Status: m.Status,
	}
	if m.Contact != nil {
		member.Contact = m.Contact.Filtered()
	}
	return &member
}

func (c Conversation) IsNode() {} // required by gqlgen

func (m ConversationMember) IsNode() {} // required by gqlgen
