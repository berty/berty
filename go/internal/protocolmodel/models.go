package protocolmodel

// AllTables returns the full list of sqlite table names
func AllTables() []string {
	return []string{
		// internal
		"migrations",
	}
}

// AllModels returns the full list of gorm entity models
func AllModels() []interface{} {
	return []interface{}{}
}
