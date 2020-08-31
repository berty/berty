package bertymessenger

import "gorm.io/gorm"

func initDB(db *gorm.DB) error {
	models := []interface{}{
		&Conversation{},
		&Account{},
		&Contact{},
		&Interaction{},
		&Member{},
		&Device{},
	}
	if err := db.AutoMigrate(models...); err != nil {
		return err
	}
	return nil
}
