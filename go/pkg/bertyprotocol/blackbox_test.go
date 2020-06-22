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
	client, cleanup := bertyprotocol.TestingService(t, bertyprotocol.Opts{
		Logger:          testutil.Logger(t),
		DeviceKeystore:  bertyprotocol.NewDeviceKeystore(keystore.NewMemKeystore()),
		MessageKeystore: bertyprotocol.NewInMemMessageKeystore(),
	})
	defer cleanup()

	// test service
	_, _ = client.InstanceGetConfiguration(context.Background(), &bertytypes.InstanceGetConfiguration_Request{})
	status := client.Status()
	expected := bertyprotocol.Status{}
	assert.Equal(t, expected, status)
}

func ExampleNew_basic() {
	client, err := bertyprotocol.New(bertyprotocol.Opts{})
	if err != nil {
		panic(err)
	}

	ret, err := client.InstanceGetConfiguration(context.Background(), &bertytypes.InstanceGetConfiguration_Request{})
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
