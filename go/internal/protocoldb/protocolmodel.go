package protocoldb

// AllTables returns the full list of tables
func AllTables() []string {
	return []string{
		// internal
		"migrations",

		// public
		"group_info",
		"group_incoming_request",
		"group_member",
		"group_member_device",
		"contact",
		"message",
		"myself_account",
		"myself_device",
	}
}

// AllModels returns the full list of models
func AllModels() []interface{} {
	return []interface{}{
		&GroupInfo{},
		&GroupIncomingRequest{},
		&GroupMember{},
		&GroupMemberDevice{},
		&Contact{},
		&Message{},
		&MyselfAccount{},
		&MyselfDevice{},
	}
}
