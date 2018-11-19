package account

import (
	"encoding/json"

	"github.com/jinzhu/gorm"
)

type StateDB struct {
	gorm *gorm.DB `gorm:"-"`
	gorm.Model

	StartCounter int

	JSONNetConf string
	BotMode     bool
	LocalGRPC   bool
}

func OpenStateDB(path string, initialState StateDB) (*StateDB, error) {
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

	// if no previous state found, set initial state
	if state.StartCounter == 0 {
		state = initialState
		state.gorm = db
		state.Save()
	} else {
		state.gorm = db
	}

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
