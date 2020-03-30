package bertyprotocol

import (
	"context"
	"fmt"
	"testing"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/stretchr/testify/require"
)

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

func ExampleNew_basic() {
	client, err := New(Opts{})
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
