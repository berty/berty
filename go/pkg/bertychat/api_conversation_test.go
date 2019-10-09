package bertychat

import (
	"context"
	"fmt"
	"testing"
)

func TestClient_ConversationGet(t *testing.T) {
	client, closer := TestingClient(t, Opts{})
	defer closer()

	t.Log("FIXME: currently testing over fake data")

	ctx := context.Background()
	tests := []struct {
		input       *ConversationGetRequest
		expectedErr error
	}{
		{
			nil,
			ErrMissingInput,
		}, {
			&ConversationGetRequest{ID: "invalid"},
			ErrInvalidInput,
		}, {
			&ConversationGetRequest{ID: "lorem-ipsum"},
			nil,
		},
	}

	for _, test := range tests {
		name := fmt.Sprintf("%v", test.input)
		t.Run(name, func(t *testing.T) {
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
