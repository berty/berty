package bertyprotocol

import (
	"context"
	"fmt"
	io "io"
	"testing"

	"berty.tech/go/internal/protocoldb"
	"berty.tech/go/internal/testutil"
	"github.com/jinzhu/gorm"
)

func ExampleMock_simple() {
	// init
	db, _ := gorm.Open("sqlite3", ":memory:")
	defer db.Close()
	mock, _ := NewMock(db, Opts{})
	defer mock.Close()

	// consume
	fmt.Println(mock.Status())

	// Output:
	// {<nil> <nil>}
}

func ExampleMock_complex() {
	// init
	db, _ := gorm.Open("sqlite3", ":memory:")
	defer db.Close()
	alice, _ := NewMock(db, Opts{})
	defer alice.Close()

	// add peers
	bob, _ := alice.NewPeerMock()
	charly, _ := alice.NewPeerMock()

	// consume
	fmt.Println(alice.Status())
	fmt.Println(bob.Status())
	fmt.Println(charly.Status())

	// Output:
	// {<nil> <nil>}
	// {<nil> <nil>}
	// {<nil> <nil>}
}

func TestMock_single(t *testing.T) {
	logger := testutil.Logger(t).Named("mock")
	db := protocoldb.TestingSqliteDB(t, logger.Named("gorm"))
	defer db.Close()
	mock, err := NewMock(db, Opts{Logger: logger.Named("client")})
	if err != nil {
		t.Fatalf("NewMock failed: %v", err)
	}
	defer mock.Close()
	ctx := context.Background()

	t.Run("direct Status call", func(t *testing.T) {
		expected := Status{}
		actual := mock.Status()
		if expected != actual {
			t.Errorf("Expected %v, got %v.", expected, actual)
		}
	})

	t.Run("call ContactList", func(t *testing.T) {
		stream, err := mock.GRPCClient.ContactList(ctx, &ContactListRequest{})
		if err != nil {
			t.Fatalf("Expected nil, got %v.", err)
		}

		entries := []*protocoldb.Contact{}
		for {
			entry, err := stream.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				t.Fatalf("Expected nil, got %v.", err)
			}
			entries = append(entries, entry.Contact)
		}
		if len(entries) != 2 {
			t.Errorf("Expected len(entries)=2, got %d.", len(entries))
		}
	})
}

func TestMock_multiple(t *testing.T) {
	// init alice
	logger := testutil.Logger(t).Named("mock")
	db := protocoldb.TestingSqliteDB(t, logger.Named("gorm"))
	defer db.Close()
	alice, err := NewMock(db, Opts{Logger: logger.Named("client")})
	if err != nil {
		t.Fatalf("NewMock failed: %v", err)
	}
	defer alice.Close()

	// init bob & charly peers
	bob, err := alice.NewPeerMock()
	if err != nil {
		t.Fatalf("NewPeerMock failed: %v.", err)
	}
	charly, err := alice.NewPeerMock()
	if err != nil {
		t.Fatalf("NewPeerMock failed: %v.", err)
	}

	// simulate some actions
	if alice == nil || bob == nil || charly == nil {
		t.Fatal("Expected: alice, bob and charly to be not nil.")
	}
}
