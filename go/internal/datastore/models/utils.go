package models

import "berty.tech/go/internal/datastore/models/config"

func AllTables() []string {
	return []string{
		"config",

		// internal
		"migrations",
	}
}

func AllModels() []interface{} {
	return []interface{}{
		&config.Config{},
	}
}
