package chatmodel

// AllTables returns the full list of tables
func AllTables() []string {
	return []string{
		// internal
		"migrations",

		// public
		"conversation",
		"conversation_message",
	}
}

// AllModels returns the full list of models
func AllModels() []interface{} {
	return []interface{}{
		Conversation{},
		ConversationMessage{},
	}
}
