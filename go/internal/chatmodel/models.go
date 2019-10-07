package chatmodel

// AllTables returns the full list of tables for chat database
func AllTables() []string {
	return []string{
		// internal
		"migrations",
	}
}

// AllModels returns the full list of chat entity models
func AllModels() []interface{} {
	return []interface{}{}
}
