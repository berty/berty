package bertychat

import (
	"context"
	"io"
	"testing"

	"berty.tech/go/internal/testutil"
	"berty.tech/go/pkg/chatmodel"
)

func TestClient_ContactGet(t *testing.T) {
	t.Log("FIXME: currently testing over fake data")

	tests := []struct {
		name        string
		input       *ContactGet_Request
		expectedErr error
	}{
		// {"empty", &ContactGet_Request{}, ErrMissingArgument},
		{"something", &ContactGet_Request{ID: 4242}, nil},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			client, closer := TestingClient(t, Opts{Logger: testutil.Logger(t)})
			defer closer()
			ctx := context.Background()

			ret, err := client.ContactGet(ctx, test.input)
			if err != test.expectedErr {
				t.Fatalf("Expected %v, got %v.", test.expectedErr, err)
			}
			if err != nil {
				return
			}

			//fmt.Println(godev.PrettyJSON(ret))
			if ret.Contact == nil {
				t.Fatalf("ContactGetReply.Contact is missing")
			}
		})
	}
}

func TestClient_ContactList(t *testing.T) {
	t.Log("FIXME: currently testing over fake data")

	tests := []struct {
		name            string
		input           *ContactList_Request
		expectedErr     error
		expectedEntries int
	}{
		{"nofilter", &ContactList_Request{}, nil, 8},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			client, closer := TestingGRPCClient(t, Opts{Logger: testutil.Logger(t)})
			defer closer()
			ctx := context.Background()

			stream, err := client.ContactList(ctx, test.input)
			if err != test.expectedErr {
				t.Fatalf("Expected %v, got %v.", test.expectedErr, err)
			}
			if err != nil {
				return
			}

			entries := []*chatmodel.Contact{}
			for {
				entry, err := stream.Recv()
				if err == io.EOF {
					break
				}
				if err != nil {
					t.Fatalf("Error: %v", err)
				}
				entries = append(entries, entry.Contact)
			}
			if len(entries) != test.expectedEntries {
				t.Errorf("Expected %d, got %d.", test.expectedEntries, len(entries))
			}

			for _, entry := range entries {
				// fmt.Println(godev.PrettyJSON(entry))
				if entry == nil {
					t.Errorf("ContactListReply.Contact is missing")
				}
			}
		})
	}
}
