package bertyprotocol

import (
	context "context"
	reflect "reflect"
	"testing"

	"github.com/jinzhu/gorm"
)

func TestTestingClient_impl(t *testing.T) {
	client, cleanup := TestingClient(t, Opts{})
	defer cleanup()

	db := testingClientDB(t, client)
	if err := db.DB().Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}
	if !db.HasTable("migrations") {
		t.Fatal("Expected table 'migrations' exists.")
	}

	_, _ = client.InstanceGetConfiguration(context.Background(), &InstanceGetConfigurationRequest{})

	status := client.Status()
	expected := Status{}
	if !reflect.DeepEqual(expected, status) {
		t.Fatalf("Expected %v, got %v.", expected, status)
	}
}

func testingClientDB(t *testing.T, c Client) *gorm.DB {
	t.Helper()

	typed := c.(*client)
	return typed.db
}
