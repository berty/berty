package bertyprotocol

import (
	"context"
	"fmt"
	"io"
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
	checkErr(t, err)
	defer mock.Close()
	ctx := context.Background()

	t.Run("internal endpoints", func(t *testing.T) {
		{ // get status
			expected := Status{}
			actual := mock.Status()
			checkSameDeep(t, expected, actual)
		}
	})

	t.Run("first-run flow", func(t *testing.T) {
		{ // list empty contact list
			stream, err := mock.GRPCClient.ContactList(ctx, &ContactList_Request{})
			checkErr(t, err)
			entries := []*Contact{}
			for {
				entry, err := stream.Recv()
				if err == io.EOF {
					break
				}
				checkErr(t, err)
				entries = append(entries, entry.Contact)
			}
			checkSameInts(t, 0, len(entries))
		}
	})

	t.Run("basic flow with no peer", func(t *testing.T) {
		var created *Contact

		{ // send request
			in := ContactRequestSend_Request{
				ContactRequestLink: &ContactRequestLink{
					RendezvousPointSeed:  []byte("foo"),
					ContactAccountPubKey: []byte("bar"),
					Metadata:             []byte("baz"),
				},
			}
			ret, err := mock.GRPCClient.ContactRequestSend(ctx, &in)
			checkErr(t, err)
			created = ret.Contact
			checkSameBytes(t, in.ContactRequestLink.ContactAccountPubKey, created.AccountPubKey)
			checkSameBytes(t, in.ContactRequestLink.Metadata, created.Metadata)
			checkSameInts(t, int(protocoldb.Contact_Untrusted), int(created.TrustLevel))
		}

		{ // list it
			in := ContactList_Request{}
			stream, err := mock.GRPCClient.ContactList(ctx, &in)
			checkErr(t, err)
			entries := []*Contact{}
			for {
				entry, err := stream.Recv()
				if err == io.EOF {
					break
				}
				checkErr(t, err)
				entries = append(entries, entry.Contact)
			}
			checkSameInts(t, 1, len(entries))
			checkSameDeep(t, created, entries[0])
		}

		{ // get it specifically
			in := ContactGet_Request{
				ContactAccountPubKey: created.AccountPubKey,
			}
			ret, err := mock.GRPCClient.ContactGet(ctx, &in)
			checkErr(t, err)
			checkSameDeep(t, created, ret.Contact)
		}

		{ // delete it
			in := ContactRemove_Request{
				ContactAccountPubKey: created.AccountPubKey,
			}
			_, err := mock.GRPCClient.ContactRemove(ctx, &in)
			checkErr(t, err)
		}

		{ // list contact list again
			in := ContactList_Request{}
			stream, err := mock.GRPCClient.ContactList(ctx, &in)
			checkErr(t, err)
			entries := []*Contact{}
			for {
				entry, err := stream.Recv()
				if err == io.EOF {
					break
				}
				checkErr(t, err)
				entries = append(entries, entry.Contact)
			}
			checkSameInts(t, 0, len(entries))
		}
	})
}

func TestMock_multiple(t *testing.T) {
	// init alice
	logger := testutil.Logger(t).Named("mock")
	db := protocoldb.TestingSqliteDB(t, logger.Named("gorm"))
	defer db.Close()

	alice, err := NewMock(db, Opts{Logger: logger.Named("client")})
	checkErr(t, err)
	defer alice.Close()

	// init bob & charly peers
	bob, err := alice.NewPeerMock()
	checkErr(t, err)
	charly, err := alice.NewPeerMock()
	checkErr(t, err)

	// simulate some actions
	checkNotNil(t, alice)
	checkNotNil(t, bob)
	checkNotNil(t, charly)

	// alice adds bob as contact
	//in := ContactRequestSend_Request{}
	//ret, err := alice.ContactRequestSend(alice.Context, &in)
	//checkErr(t, err)
	//fmt.Println(godev.PrettyJSON(ret))
}
