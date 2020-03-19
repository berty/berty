package bertyprotocol

import (
	"testing"
)

func TestClient_impl(t *testing.T) {
	var _ Client = (*client)(nil)
	var _ ProtocolServiceServer = (*client)(nil)
}

func ExampleNew() {
	// initialize new client
	client, err := New(Opts{})
	if err != nil {
		panic(err)
	}
	defer client.Close()
}
