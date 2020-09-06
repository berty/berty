package bertyprotocol_test

import (
	"context"
	"fmt"
	"testing"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/stretchr/testify/assert"
)

func TestTestingClient_impl(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mks, cleanup := bertyprotocol.NewInMemMessageKeystore()
	defer cleanup()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	client, cleanup := bertyprotocol.TestingService(ctx, t, bertyprotocol.Opts{
		Logger:          logger,
		DeviceKeystore:  bertyprotocol.NewDeviceKeystore(keystore.NewMemKeystore()),
		MessageKeystore: mks,
	})
	defer cleanup()

	// test service
	_, _ = client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	status := client.Status()
	expected := bertyprotocol.Status{}
	assert.Equal(t, expected, status)
}

func ExampleNew_basic() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	client, err := bertyprotocol.New(ctx, bertyprotocol.Opts{})
	if err != nil {
		panic(err)
	}

	ret, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		panic(err)
	}

	for _, listener := range ret.Listeners {
		if listener == "/p2p-circuit" {
			fmt.Println(listener)
		}
	}

	// Output:
	// /p2p-circuit
}

// FIXME: create examples that actually use groups and contacts
