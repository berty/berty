package bertyprotocol

import (
	"context"
	"testing"

	"berty.tech/berty/go/internal/testutil"
	"berty.tech/berty/go/pkg/errcode"
	"github.com/jinzhu/gorm"
	"github.com/stretchr/testify/assert"
)

func TestTestingClient_impl(t *testing.T) {
	client, cleanup := TestingClient(t, Opts{Logger: testutil.Logger(t)})
	defer cleanup()

	// test DB
	db := testingClientDB(t, client)
	err := db.DB().Ping()
	assert.NoError(t, err, func() {
		assert.True(t, db.HasTable("migrations"))
	})

	// test service
	_, _ = client.InstanceGetConfiguration(context.Background(), &InstanceGetConfiguration_Request{})
	status := client.Status()
	expected := Status{}
	assert.Equal(t, expected, status)
}

func testingClientDB(t *testing.T, c Client) *gorm.DB {
	t.Helper()

	typed := c.(*client)
	return typed.db
}

func testSameErrcodes(t *testing.T, expected, got error) {
	t.Helper()

	assert.Equalf(
		t,
		errcode.ErrCode_name[errcode.Code(expected)],
		errcode.ErrCode_name[errcode.Code(got)],
		"%v", got,
	)
}
