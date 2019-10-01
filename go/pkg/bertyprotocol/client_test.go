package bertyprotocol

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

func ExampleNew() {
	// initialize sqlite3 gorm
	db, err := gorm.Open("sqlite3", ":memory:")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// Opts is optional
	opts := Opts{}

	// initialize new client
	client := New(db, opts)
	defer client.Close()
}
