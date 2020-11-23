package bertymessenger

import (
	"context"
	"testing"

	"berty.tech/berty/v2/go/internal/testutil"
)

func testingNode(ctx context.Context, t *testing.T) (*TestingAccount, func()) {
	t.Helper()

	logger, loggerCleanup := testutil.Logger(t)
	ctx, ctxCancel := context.WithCancel(ctx)
	clients, protocols, infraCleanup := TestingInfra(ctx, t, 1, logger)
	node := NewTestingAccount(ctx, t, clients[0], protocols[0].Client, logger)
	cleanup := func() {
		node.Close()
		infraCleanup()
		ctxCancel()
		loggerCleanup()
	}
	return node, cleanup
}
