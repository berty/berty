package chatmodel

// AllTables returns the full list of tables
func AllTables() []string {
	return []string{
		// internal
		"migrations",

		// public
		"device",
		"contact",
		"conversation",
		"member",
		"message",
		"attachment",
		"reaction",
	}
}

// AllModels returns the full list of models
func AllModels() []interface{} {
	return []interface{}{
		&Device{},
		&Contact{},
		&Conversation{},
		&Member{},
		&Message{},
		&Attachment{},
		&Reaction{},
	}
}
