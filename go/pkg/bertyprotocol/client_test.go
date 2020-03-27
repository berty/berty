package bertyprotocol

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestClient_impl(t *testing.T) {
	var _ Client = (*client)(nil)
	var _ ProtocolServiceServer = (*client)(nil)
}

func TestEmptyArgs(t *testing.T) {
	// initialize new client
	client, err := New(Opts{})
	if err != nil {
		require.NoError(t, err)
	}
	defer client.Close()
}
