package chatbridge

import (
	"testing"

	"berty.tech/go/pkg/bertychat"
	"github.com/gogo/protobuf/proto"
)

func TestBridge(t *testing.T) {
	var (
		err error

		bridge *Bridge
		client *Client

		req, res []byte
	)

	bridge = NewBridge()
	defer func() {
		if err = bridge.Stop(); err != nil {
			t.Fatalf("failed to stop bridge: %v", err)
		}
	}()

	if err = bridge.SetupLogger(); err != nil {
		t.Fatalf("failed to setup logger: %v", err)
	}

	if _, err = bridge.RegisterGRPCService(":0"); err != nil {
		t.Fatalf("register grpc listener failed: %v", err)
	}

	if _, err = bridge.RegisterGRPCWebService(":0"); err != nil {
		t.Fatalf("register grpc web listener failed: %v", err)
	}

	client, err = bridge.NewGRPCClient()
	if err != nil {
		t.Fatalf("failed to setup client: %v", err)
	}

	// start bridge
	bridge.Start()

	msg := &bertychat.ConversationGetRequest{
		ID: "testid",
	}

	req, err = proto.Marshal(msg)
	if err != nil {
		t.Fatalf("failed to marshal proto message")
	}

	res, err = client.UnaryRequest("/berty.chat.Account/ConversationGet", req)
	if err != nil {
		t.Fatalf("failed to send unary request: %v", err)
	}

	out := &bertychat.ConversationGetReply{}
	if err = proto.Unmarshal(res, out); err != nil {
		t.Fatalf("failed to unmarshal proto: %v", err)
	}
}
