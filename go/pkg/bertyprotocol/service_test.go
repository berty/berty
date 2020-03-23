package bertyprotocol

import (
	"testing"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

func TestService_impl(t *testing.T) {
	var _ Service = (*service)(nil)
	var _ ProtocolServiceServer = (*service)(nil)
}

func ExampleNew() {
	// initialize sqlite3 gorm
	db, err := gorm.Open("sqlite3", ":memory:")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// initialize new client
	service, err := New(db, Opts{})
	if err != nil {
		panic(err)
	}
	defer service.Close()
}
