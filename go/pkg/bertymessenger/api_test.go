package bertymessenger

import (
	"context"
	"testing"

	"berty.tech/berty/v2/go/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestServiceInstanceShareableBertyID(t *testing.T) {
	ctx := context.Background()
	service, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: testutil.Logger(t)})
	defer cleanup()
	ret1, err := service.InstanceShareableBertyID(ctx, nil)
	require.NoError(t, err)
	assert.Equal(t, ret1.DisplayName, "anonymous#1337")
	assert.NotEmpty(t, ret1.BertyID)
	assert.NotEmpty(t, ret1.DeepLink)
	assert.NotEmpty(t, ret1.HTMLURL)

	ret2, err := service.InstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{})
	require.NoError(t, err)
	assert.Equal(t, ret2.DisplayName, "anonymous#1337")
	assert.Equal(t, ret1, ret2)

	ret3, err := service.InstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{DisplayName: "Hello World! 👋"})
	require.NoError(t, err)
	assert.Equal(t, ret3.DisplayName, "Hello World! 👋")
	assert.NotEmpty(t, ret3.BertyID)
	assert.NotEmpty(t, ret3.DeepLink)
	assert.NotEmpty(t, ret3.HTMLURL)
	assert.NotEqual(t, ret2.BertyID, ret3.BertyID)

	ret4, err := service.InstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{Reset_: true})
	require.NoError(t, err)
	assert.Equal(t, ret4.DisplayName, "anonymous#1337")
	assert.NotEmpty(t, ret4.BertyID)
	assert.NotEmpty(t, ret4.DeepLink)
	assert.NotEmpty(t, ret4.HTMLURL)
	assert.NotEqual(t, ret1.BertyID, ret4.BertyID)
	assert.NotEqual(t, ret3.BertyID, ret4.BertyID)

	ret5, err := service.InstanceShareableBertyID(ctx, nil)
	require.NoError(t, err)
	assert.Equal(t, ret4, ret5)
}
