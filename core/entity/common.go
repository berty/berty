package entity

func AllEntities() []interface{} {
	return []interface{}{
		SenderAlias{},
		Device{},
		Contact{},
		Conversation{},
		ConversationMember{},
		Config{},
	}
}
