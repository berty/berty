package bertyprotocol

import (
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestClient_impl(t *testing.T) {
	var _ Service = (*service)(nil)
	var _ protocoltypes.ProtocolServiceServer = (*service)(nil)
}

func TestEmptyArgs(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// initialize new client
	client, err := New(ctx, Opts{})
	require.NoError(t, err)
	err = client.Close()
	require.NoError(t, err)
}

func TestTestingProtocol(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	opts := TestingOpts{}
	tp, cleanup := NewTestingProtocol(ctx, t, &opts, nil)
	assert.NotNil(t, tp)
	cleanup()
	cancel()
}

func TestTestingProtocolWithMockedPeers(t *testing.T) {
	for amount := 0; amount < 5; amount++ {
		t.Run(fmt.Sprintf("%d-peers", amount), func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			opts := TestingOpts{}
			tp, cleanup := NewTestingProtocolWithMockedPeers(ctx, t, &opts, nil, amount)
			assert.NotNil(t, tp)
			cleanup()
			cancel()
		})
	}
}
