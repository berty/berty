package bertychat

import (
	"context"
	"testing"

	"berty.tech/go/internal/testutil"
	"berty.tech/go/pkg/errcode"
)

func TestClient_ConversationCreate(t *testing.T) {
	client, closer := TestingClient(t, Opts{Logger: testutil.Logger(t)})
	defer closer()
	ctx := context.Background()

	tests := []struct {
		name            string
		input           *ConversationCreate_Request
		expectedErrcode error
	}{
		{"nil-input", nil, errcode.TODO},
		{"empty-title", &ConversationCreate_Request{Title: "", Topic: "YI", AvatarURI: "YU"}, errcode.TODO},
		{"valid", &ConversationCreate_Request{Title: "YO", Topic: "YI", AvatarURI: "YU"}, nil},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			ret, err := client.ConversationCreate(ctx, test.input)
			if errcode.Code(test.expectedErrcode) != errcode.Code(err) {
				t.Errorf("Expected %v, got %v.", test.expectedErrcode, err)
			}
			if err != nil {
				return
			}

			if ret.Conversation == nil {
				t.Fatalf("ret.Conversation should not be nil.")
			}
			if ret.Conversation.CreatedAt.IsZero() {
				t.Errorf("Conversation.CreatedAt should be set.")
			}
			if ret.Conversation.UpdatedAt.IsZero() {
				t.Errorf("Conversation.CreatedAt should be set.")
			}
			if test.input.Title != ret.Conversation.Title {
				t.Errorf("Expected %q, got %q.", test.input.Title, ret.Conversation.Title)
			}
			if test.input.Topic != ret.Conversation.Topic {
				t.Errorf("Expected %q, got %q.", test.input.Topic, ret.Conversation.Topic)
			}
			if test.input.AvatarURI != ret.Conversation.AvatarURI {
				t.Errorf("Expected %q, got %q.", test.input.AvatarURI, ret.Conversation.AvatarURI)
			}
		})
	}
}
