package protocolmodel

// AllTables returns the full list of tables
func AllTables() []string {
	return []string{
		// internal
		"migrations",

		// public
		"contact",
	}
}

// AllModels returns the full list of models
func AllModels() []interface{} {
	return []interface{}{
		Contact{},
	}
}
