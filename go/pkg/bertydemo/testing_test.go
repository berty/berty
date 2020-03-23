package bertydemo

import (
	context "context"
	"testing"

	"berty.tech/berty/go/internal/ipfsutil"
	"github.com/stretchr/testify/require"
)

type cleanFunc func()

func testingInMemoryService(t *testing.T) (*Service, ipfsutil.CoreAPIMock, cleanFunc) {
	t.Helper()

	ctx := context.Background()
	ipfsmock := ipfsutil.TestingCoreAPI(ctx, t)
	opts := &Opts{
		CoreAPI:          ipfsmock,
		OrbitDBDirectory: ":memory:",
	}

	demo, err := New(opts)
	if err != nil {
		t.Fatal(err)
	}

	return demo, ipfsmock, func() {
		demo.Close()
		ipfsmock.Close()
	}
}

func testingClient(t *testing.T, svc *Service) (Client, cleanFunc) {
	t.Helper()

	client, err := NewClient(svc)
	require.NoError(t, err)

	return client, func() {
		client.Close()
	}
}
