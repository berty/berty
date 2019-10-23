package bertychat

import (
	"context"
	"testing"

	"berty.tech/go/internal/chaterrcode"
	"berty.tech/go/internal/testutil"
)

func TestClient_ConversationGet(t *testing.T) {
	t.Log("FIXME: currently testing over fake data")

	tests := []struct {
		name        string
		input       *ConversationGetRequest
		expectedErr error
	}{
		{
			"no-input",
			nil,
			chaterrcode.ErrMissingInput,
		}, {
			"invalid-id",
			&ConversationGetRequest{ID: "invalid"},
			chaterrcode.ErrInvalidInput,
		}, {
			"valid-id",
			&ConversationGetRequest{ID: "lorem-ipsum"},
			nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			client, closer := TestingClient(t, Opts{Logger: testutil.Logger(t)})
			defer closer()
			ctx := context.Background()
			ret, err := client.ConversationGet(ctx, test.input)
			if err != test.expectedErr {
				t.Fatalf("Expected %v, got %v.", test.expectedErr, err)
			}
			if err != nil {
				return
			}
			if ret.Conversation == nil {
				t.Fatalf("ConversationGetReply.Conversation is missing")
			}
		})
	}
}
