package bertyprotocol

import (
	"context"
	"io"
	"testing"

	"berty.tech/go/internal/protocoldb"
	"berty.tech/go/internal/testutil"
)

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

		{ // list contacts
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

		{ // list outgoing contact requests
			in := ContactRequestListOutgoing_Request{}
			stream, err := mock.GRPCClient.ContactRequestListOutgoing(ctx, &in)
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

		/* FIXME: discuss with the team if we discard/block/delete/ignore an outgoing request
		{ // delete it
			in := ContactRemove_Request{
				ContactAccountPubKey: created.AccountPubKey,
			}
			_, err := mock.GRPCClient.ContactRemove(ctx, &in)
			checkErr(t, err)
		}

		{ // list outgoing contact requests
			in := ContactRequestListOutgoing_Request{}
			stream, err := mock.GRPCClient.ContactRequestListOutgoing(ctx, &in)
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
		*/
	})
}

func (m *Mock) testingEventChan(t *testing.T) chan *EventSubscribe_Reply {
	t.Helper()

	stream, err := m.GRPCClient.EventSubscribe(m.Context, &EventSubscribe_Request{})
	checkErr(t, err)

	c := make(chan *EventSubscribe_Reply, 1000)
	go func() {
		for {
			event, err := stream.Recv()
			checkErr(t, err)
			c <- event
		}
	}()

	return c
}

func TestMock_multiple(t *testing.T) {
	// init alice
	logger := testutil.Logger(t).Named("mock")
	db := protocoldb.TestingSqliteDB(t, logger.Named("gorm"))
	defer db.Close()

	alice, err := NewMock(db, Opts{Logger: logger.Named("client")})
	checkErr(t, err)
	defer alice.Close()
	//aliceEventChan := alice.testingEventChan(t)

	// init bob & charly peers
	bobDB := protocoldb.TestingSqliteDB(t, logger.Named("gorm"))
	defer bobDB.Close()
	bob, err := alice.NewPeerMock(bobDB, Opts{})
	checkErr(t, err)
	bobEventChan := bob.testingEventChan(t)

	charlyDB := protocoldb.TestingSqliteDB(t, logger.Named("gorm"))
	defer charlyDB.Close()
	charly, err := alice.NewPeerMock(charlyDB, Opts{})
	checkErr(t, err)
	//charlyEventChan := charly.testingEventChan(t)

	// simulate some actions
	checkNotNil(t, alice)
	checkNotNil(t, bob)
	checkNotNil(t, charly)

	{ // alice request bob as contact
		in := ContactRequestSend_Request{ContactRequestLink: bob.GetContactRequestLink()}
		ret, err := alice.ContactRequestSend(alice.Context, &in)
		checkErr(t, err)
		checkSameBytes(t, bob.GetContactRequestLink().ContactAccountPubKey, ret.Contact.AccountPubKey)
		checkSameInts(t, int(Contact_Untrusted), int(ret.Contact.TrustLevel))
		checkSameInts(t, int(Contact_OutgoingRequest), int(ret.Contact.RequestStatus))
	}

	{ // bob get a new contact request event
		event := <-bobEventChan
		checkSameInts(t, int(EventSubscribe_EventContactRequest), int(event.Type))
		checkSameBytes(t, alice.GetContactRequestLink().ContactAccountPubKey, event.ContactRequestEvent.ContactAccountPubKey)
	}

	{ // bob list hist contact requests
		in := ContactRequestListIncoming_Request{}
		stream, err := bob.GRPCClient.ContactRequestListIncoming(bob.Context, &in)
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
		checkSameBytes(t, alice.GetContactRequestLink().ContactAccountPubKey, entries[0].AccountPubKey)
		checkSameInts(t, int(Contact_IncomingRequest), int(entries[0].RequestStatus))
		checkSameInts(t, int(Contact_Untrusted), int(entries[0].TrustLevel))
	}

	/*
		{ // bob accept alice's contact request
			in := ContactRequestAccept_Request{
				ContactAccountPubKey: alice.GetContactRequestLink().ContactAccountPubKey,
			}
			ret, err := bob.GRPCClient.ContactRequestAccept(bob.Context, &in)
			checkErr(t, err)
		}
	*/

	// alice is aware that bob accepted her request
	// FIXME: todo
}
