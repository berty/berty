package bertyprotocol

import (
	"testing"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

func TestClient_impl(t *testing.T) {
	var _ Client = (*client)(nil)
	var _ InstanceServer = (*client)(nil)
}

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
	client, err := New(db, opts)
	if err != nil {
		panic(err)
	}
	defer client.Close()
}
