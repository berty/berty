package account

import (
	"encoding/json"

	"github.com/jinzhu/gorm"
)

type StateDB struct {
	gorm *gorm.DB `gorm:"-"`
	gorm.Model

	StartCounter int
}

func OpenStateDB(path string) (*StateDB, error) {
	// open db
	db, err := gorm.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}

	// create tables and columns
	if err := db.AutoMigrate(&StateDB{}).Error; err != nil {
		return nil, err
	}

	// preload last state
	var state StateDB
	if err := db.FirstOrInit(&state).Error; err != nil {
		return nil, err
	}
	state.gorm = db

	return &state, nil
}

func (state StateDB) String() string {
	out, _ := json.Marshal(state)
	return string(out)
}

func (state *StateDB) Save() error {
	return state.gorm.Save(state).Error
}

func (state *StateDB) Close() {
	state.gorm.Close()
}
