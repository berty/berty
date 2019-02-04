package sql

import (
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
)

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

		// internal
		"migrations",
	}
}

func AllModels() []interface{} {
	return append(
		entity.AllEntities(),
		p2p.Event{},
	)
}
