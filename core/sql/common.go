package sql

func AllTables() []string {
	return []string{
		// events
		"event",

		// entities
		"sender_alias",
		"device",
		"device_push_identifier",
		"device_push_config",
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
