package sql

func AllTables() []string {
	return []string{
		// events
		"event",

		// entities
		"sender_alias",
		"device",
		"contact",
		"conversation",
		"conversation_member",
		"config",

		// association tables
		// FIXME: add m2m

		// internal
		"migrations",
	}
}
