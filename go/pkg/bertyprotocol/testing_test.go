package bertyprotocol

import (
	"context"
	"fmt"
	"testing"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func testSameErrcodes(t *testing.T, expected, got error) {
	t.Helper()

	assert.Equalf(
		t,
		errcode.ErrCode_name[errcode.Code(expected)],
		errcode.ErrCode_name[errcode.Code(got)],
		"%v", got,
	)
}

func TestClient_impl(t *testing.T) {
	var _ Service = (*service)(nil)
	var _ ProtocolServiceServer = (*service)(nil)
}

func TestEmptyArgs(t *testing.T) {
	// initialize new client
	client, err := New(Opts{})
	require.NoError(t, err)
	err = client.Close()
	require.NoError(t, err)
}

func TestTestingProtocol(t *testing.T) {
	ctx := context.Background()
	opts := TestingOpts{}
	tp, cleanup := NewTestingProtocol(ctx, t, &opts)
	assert.NotNil(t, tp)
	cleanup()
}

func TestTestingProtocolWithMockedPeers(t *testing.T) {
	for amount := 0; amount < 5; amount++ {
		t.Run(fmt.Sprintf("%d-peers", amount), func(t *testing.T) {
			ctx := context.Background()
			opts := TestingOpts{}
			tp, cleanup := newTestingProtocolWithMockedPeers(ctx, t, &opts, amount)
			assert.NotNil(t, tp)
			cleanup()
		})
	}
}
