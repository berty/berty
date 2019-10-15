package chatbridge

import (
	"testing"

	"berty.tech/go/pkg/bertychat"
	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"
)

func TestBridge(t *testing.T) {
	var (
		err      error
		bridge   *Bridge
		client   *Client
		req, res []byte
	)

	bridge, err = newBridge(zap.NewNop())
	if err != nil {
		t.Fatalf("create bridge: %v", err)
	}
	defer func() {
		if err = bridge.Close(); err != nil {
			t.Fatalf("stop bridge: %v", err)
		}
	}()

	if _, err = bridge.AddGRPCListener(":0"); err != nil {
		t.Fatalf("add grpc listener: %v", err)
	}

	if _, err = bridge.AddGRPCWebListener(":0"); err != nil {
		t.Fatalf("add grpc-web listener: %v", err)
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
