package bertydemo

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestClient_impl(t *testing.T) {
	var _ Client = (*client)(nil)
	var _ DemoServiceClient = (*client)(nil)
}

func TestExampleNewClient(t *testing.T) {
	s, _, clean := testingInMemoryService(t)
	defer clean()

	// initialize new client
	client, err := NewClient(s)
	assert.NoError(t, err)

	defer client.Close()
}
