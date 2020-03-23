package bertyprotocol

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestClient_impl(t *testing.T) {
	var _ Client = (*client)(nil)
	var _ ProtocolServiceClient = (*client)(nil)
}

func TestExampleNewClient(t *testing.T) {
	s, clean := TestingService(t, Opts{})
	defer clean()

	// initialize new client
	client, err := NewClient(s)
	assert.NoError(t, err)

	client.Close()
}
