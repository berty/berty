package entity

func AllEntities() []interface{} {
	return []interface{}{
		SenderAlias{},
		Device{},
		DevicePushIdentifier{},
		Contact{},
		Conversation{},
		ConversationMember{},
		Config{},
	}
}
