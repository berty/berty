package bertychat

import "testing"

func TestClient_impl(t *testing.T) {
	var _ Client = (*client)(nil)
	var _ ChatServiceServer = (*client)(nil)
}
