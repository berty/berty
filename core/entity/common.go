package entity

func AllEntities() []interface{} {
	return []interface{}{
		SenderAlias{},
		Device{},
		DevicePushIdentifier{},
		DevicePushConfig{},
		Contact{},
		Conversation{},
		ConversationMember{},
		Config{},
	}
}
