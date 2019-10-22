package chatbridge

import (
	"testing"

	"berty.tech/go/internal/testutil"
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

	logger := testutil.Logger(t)
	bridge, err = newBridge(logger, Opts{
		GRPCListener:    ":0",
		GRPCWebListener: ":0",
	})
	if err != nil {
		t.Fatalf("create bridge: %v", err)
	}
	defer func() {
		if err = bridge.Close(); err != nil {
			t.Fatalf("stop bridge: %v", err)
		}
	}()

	logger.Info(
		"listeners",
		zap.String("gRPC", bridge.GRPCListenerAddr()),
		zap.String("gRPC web", bridge.GRPCWebListenerAddr()),
	)

	client = bridge.GRPCClient()
	if client == nil {
		t.Fatalf("expected client to be initialized, got nil.")
	}

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
