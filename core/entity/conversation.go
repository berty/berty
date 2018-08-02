package entity

func (c *Conversation) Validate() error {
	if c == nil {
		return ErrInvalidEntity
	}
	return nil
}

func (c *Conversation) Filtered() *Conversation {
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

func (m *ConversationMember) Filtered() *ConversationMember {
	return &ConversationMember{
		ID:      m.ID,
		Status:  m.Status,
		Contact: m.Contact.Filtered(),
	}
}
