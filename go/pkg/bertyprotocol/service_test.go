package bertyprotocol

import (
	"testing"
)

func TestClient_impl(t *testing.T) {
	var _ Service = (*service)(nil)
	var _ ProtocolServiceServer = (*service)(nil)
}

func ExampleNew() {
	// initialize new service
	service, err := New(Opts{})
	if err != nil {
		panic(err)
	}
	defer service.Close()
}
