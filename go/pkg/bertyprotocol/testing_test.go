package bertyprotocol

import (
	"bytes"
	"context"
	"reflect"
	"testing"

	"berty.tech/go/internal/testutil"
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

	_, _ = client.InstanceGetConfiguration(context.Background(), &InstanceGetConfiguration_Request{})

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

func checkErr(t *testing.T, err error) {
	t.Helper()

	if err != nil {
		t.Fatalf("err: %v", err)
	}
}

func checkSameBytes(t *testing.T, expected, got []byte) {
	t.Helper()

	if !bytes.Equal(expected, got) {
		t.Errorf("Expected %v, got %v.", expected, got)
	}
}

func checkSameInt64s(t *testing.T, expected, got int64) {
	t.Helper()

	if expected != got {
		t.Errorf("Expected %d, got %d.", expected, got)
	}
}

func checkSameInts(t *testing.T, expected, got int) {
	t.Helper()

	if expected != got {
		t.Errorf("Expected %d, got %d.", expected, got)
	}
}

func checkSameInt32s(t *testing.T, expected, got int32) {
	t.Helper()

	if expected != got {
		t.Errorf("Expected %d, got %d.", expected, got)
	}
}

func checkSameDeep(t *testing.T, expected, got interface{}) {
	t.Helper()

	if !reflect.DeepEqual(expected, got) {
		t.Errorf("Expected %v, got %v.", expected, got)
	}
}

func checkNotNil(t *testing.T, got interface{}) {
	t.Helper()

	if got == nil {
		t.Errorf("Expected non-nil, got nil.")
	}
}
