package bertychat

import (
	"context"
	"reflect"
	"testing"

	"berty.tech/go/internal/testutil"
	"berty.tech/go/pkg/bertyprotocol"
	"github.com/jinzhu/gorm"
)

func TestTestingClient_impl(t *testing.T) {
	client, cleanup := TestingClient(t, Opts{Logger: testutil.Logger(t)})
	defer cleanup()

	db := testingClientDB(t, client)
	if err := db.DB().Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}
	if !db.HasTable("migrations") {
		t.Fatal("Expected table 'migrations' exists.")
	}

	protocol := testingClientProtocol(t, client)
	_, _ = protocol.InstanceGetConfiguration(context.Background(), &bertyprotocol.InstanceGetConfigurationRequest{})

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

func testingClientProtocol(t *testing.T, c Client) bertyprotocol.Client {
	t.Helper()

	typed := c.(*client)
	return typed.protocol
}
