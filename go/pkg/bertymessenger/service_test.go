package bertymessenger

import (
	"archive/tar"
	"bytes"
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"strconv"
	"testing"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
)

func TestUnstableServiceStream(t *testing.T) {
	testutil.FilterStability(t, testutil.Unstable)

	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)
	node, cleanup := testingNode(ctx, t)
	defer cleanup()

	// first event is account update
	{
		event := node.NextEvent(t)
		require.Equal(t, event.Type, StreamEvent_TypeAccountUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		account := payload.(*StreamEvent_AccountUpdated).Account
		require.Equal(t, account, node.GetAccount())
		require.NotEmpty(t, account.Link)
		require.NotEmpty(t, account.PublicKey)
		require.Empty(t, account.DisplayName)
	}

	// second event is list end
	{
		event := node.NextEvent(t)
		require.Equal(t, event.Type, StreamEvent_TypeListEnded)
		require.Empty(t, event.Payload)
	}

	// no more event
	{
		event := node.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestUnstableServiceSetName(t *testing.T) {
	testutil.FilterStability(t, testutil.Unstable)

	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)
	node, cleanup := testingNode(ctx, t)
	defer cleanup()

	// set name before opening the stream
	node.SetName(t, "foo")

	// first event is account update
	{
		event := node.NextEvent(t)
		require.Equal(t, event.Type, StreamEvent_TypeAccountUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		account := payload.(*StreamEvent_AccountUpdated).Account
		require.Equal(t, account, node.GetAccount())
		require.NotEmpty(t, account.Link)
		require.NotEmpty(t, account.PublicKey)
		require.Equal(t, account.DisplayName, "foo")
	}

	// second event is list end
	{
		event := node.NextEvent(t)
		require.Equal(t, event.Type, StreamEvent_TypeListEnded)
		require.Empty(t, event.Payload)
	}

	// no more event
	{
		event := node.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestUnstableServiceSetNameAsync(t *testing.T) {
	testutil.FilterStability(t, testutil.Unstable)

	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)
	node, cleanup := testingNode(ctx, t)
	defer cleanup()

	// first event is account update
	{
		event := node.NextEvent(t)
		require.Equal(t, event.Type, StreamEvent_TypeAccountUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		account := payload.(*StreamEvent_AccountUpdated).Account
		require.Equal(t, account, node.GetAccount())
		require.NotEmpty(t, account.Link)
		require.NotEmpty(t, account.PublicKey)
		require.Empty(t, account.DisplayName)
	}

	// second event is list end
	{
		event := node.NextEvent(t)
		require.Equal(t, event.Type, StreamEvent_TypeListEnded)
		require.Empty(t, event.Payload)
	}

	// set name after opening the stream
	previousAccount := node.GetAccount()
	node.SetName(t, "foo")

	// new account update event
	{
		event := node.NextEvent(t)
		require.Equal(t, event.Type, StreamEvent_TypeAccountUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		account := payload.(*StreamEvent_AccountUpdated).Account
		require.Equal(t, account, node.GetAccount())
		require.NotEmpty(t, account.Link)
		require.NotEmpty(t, account.PublicKey)
		require.Equal(t, account.DisplayName, "foo")
		require.Equal(t, account.PublicKey, previousAccount.PublicKey)
		require.NotEqual(t, account.Link, previousAccount.Link)
	}

	// no more event
	{
		event := node.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestUnstableServiceStreamCancel(t *testing.T) {
	testutil.FilterStability(t, testutil.Unstable)

	ctx, ctxCancel := context.WithTimeout(context.Background(), 5*time.Second)
	node, cleanup := testingNode(ctx, t)
	defer cleanup()

	// first event is account update
	{
		event := node.NextEvent(t)
		require.Equal(t, event.Type, StreamEvent_TypeAccountUpdated)
	}

	// cancel
	ctxCancel()

	// second event fails
	{
		var err error
		for err == nil {
			_, err = node.GetStream(t).Recv()
		}
		require.True(t, isGRPCCanceledError(err))
	}
}

func TestUnstableServiceContactRequest(t *testing.T) {
	testutil.FilterStability(t, testutil.Unstable)

	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)
	node, cleanup := testingNode(ctx, t)
	defer cleanup()

	// drain init events
	node.DrainInitEvents(t)

	// send contact request
	{
		link := "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice"
		ownMetadata := []byte("bar")
		metadata, err := proto.Marshal(&ContactMetadata{DisplayName: "Alice"})
		require.NoError(t, err)
		deeplinkReply, err := node.GetClient().ParseDeepLink(ctx, &ParseDeepLink_Request{Link: link})
		require.NoError(t, err)
		require.NoError(t, deeplinkReply.Link.IsValid())
		req := &SendContactRequest_Request{
			BertyID:     deeplinkReply.Link.BertyID,
			Metadata:    metadata,
			OwnMetadata: ownMetadata,
		}
		_, err = node.GetClient().SendContactRequest(ctx, req)
		require.NoError(t, err)
		assert.Len(t, node.contacts, 0)
		assert.Len(t, node.conversations, 0)
	}

	// check for ContactUpdated event
	{
		event := node.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeContactUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		contact := payload.(*StreamEvent_ContactUpdated).Contact
		require.NotNil(t, contact)
		require.Equal(t, contact.GetDisplayName(), "Alice")
		require.Equal(t, contact.GetState(), Contact_OutgoingRequestEnqueued)
		assert.Len(t, node.contacts, 1)
	}

	// check for the ConversationUpdated event
	{
		event := node.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).Conversation
		require.NotNil(t, conversation)
		assert.Len(t, node.conversations, 1)
	}

	// no more event
	{
		event := node.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestUnstableServiceConversationCreateLive(t *testing.T) {
	testutil.FilterStability(t, testutil.Unstable)

	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)
	node, cleanup := testingNode(ctx, t)
	defer cleanup()

	// drain init events
	node.DrainInitEvents(t)

	// create conversation
	const conversationName = "Tasty"
	var createdConversationPK string
	{
		reply, err := node.GetClient().ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: conversationName})
		require.NoError(t, err)
		require.NotEmpty(t, reply.GetPublicKey())
		createdConversationPK = reply.GetPublicKey()
	}

	// check for the ConversationUpdated event
	{
		event := node.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).Conversation
		require.NotNil(t, conversation)
		require.Equal(t, conversation.GetType(), Conversation_MultiMemberType)
		require.Equal(t, conversation.GetPublicKey(), createdConversationPK)
		require.Equal(t, conversation.GetDisplayName(), conversationName)
		require.NotEmpty(t, conversation.GetLink())
	}

	// no more event
	{
		event := node.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestUnstableServiceConversationCreateAsync(t *testing.T) {
	testutil.FilterStability(t, testutil.Unstable)

	ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)
	node, cleanup := testingNode(ctx, t)
	defer cleanup()

	// create conversation
	const conversationName = "Tasty"
	var createdConversationPK string
	{
		reply, err := node.GetClient().ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: conversationName})
		require.NoError(t, err)
		require.NotEmpty(t, reply.GetPublicKey())
		createdConversationPK = reply.GetPublicKey()
	}

	// first event is account
	{
		event := node.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeAccountUpdated)
	}

	// second event is the conversation, with display name
	{
		event := node.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).Conversation
		require.NotNil(t, conversation)
		require.Equal(t, conversation.GetType(), Conversation_MultiMemberType)
		require.Equal(t, conversation.GetPublicKey(), createdConversationPK)
		require.Equal(t, conversation.GetDisplayName(), conversationName)
		require.NotEmpty(t, conversation.GetLink())
	}

	// then, the list end event
	{
		event := node.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeListEnded)
	}

	// no more event
	{
		event := node.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestBroken1To1AddContact(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	clients, _, cleanup := TestingInfra(ctx, t, 2, logger)
	defer cleanup()

	// Init accounts
	var (
		alice = NewTestingAccount(ctx, t, clients[0], nil, logger)
		bob   = NewTestingAccount(ctx, t, clients[1], nil, logger)
	)
	{
		defer alice.Close()
		alice.SetName(t, "Alice")
		alice.DrainInitEvents(t)
		require.NotEmpty(t, alice.GetAccount().GetLink())

		defer bob.Close()
		bob.SetName(t, "Bob")
		bob.DrainInitEvents(t)
		require.NotEmpty(t, bob.GetAccount().GetLink())
	}

	// Bob adds Alice as contact (and she accepts)
	{
		testAddContact(ctx, t, bob, alice)
		assert.Len(t, alice.contacts, 1)
		assert.Len(t, bob.contacts, 1)
		// FIXME: should have 1 conversation
		assert.Len(t, alice.conversations, 1)
		assert.Len(t, bob.conversations, 1)
	}

	// no more event
	{
		event := alice.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)

		event = bob.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestBroken1To1Exchange(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	clients, _, cleanup := TestingInfra(ctx, t, 2, logger)
	defer cleanup()

	// Init accounts
	var (
		alice = NewTestingAccount(ctx, t, clients[0], nil, logger)
		bob   = NewTestingAccount(ctx, t, clients[1], nil, logger)
	)
	{
		defer alice.Close()
		alice.SetName(t, "Alice")
		alice.DrainInitEvents(t)
		require.NotEmpty(t, alice.GetAccount().GetLink())
		assert.Len(t, alice.contacts, 0)
		assert.Len(t, alice.conversations, 0)

		defer bob.Close()
		bob.SetName(t, "Bob")
		bob.DrainInitEvents(t)
		require.NotEmpty(t, bob.GetAccount().GetLink())
		assert.Len(t, bob.contacts, 0)
		assert.Len(t, bob.conversations, 0)
	}

	// Bob adds Alice as contact (and she accepts)
	var groupPK string
	{
		aliceContact := testAddContact(ctx, t, bob, alice)
		groupPK = aliceContact.GetConversationPublicKey()
	}

	// Exchange messages
	{
		testSendGroupMessage(ctx, t, groupPK, alice, []*TestingAccount{bob}, "Hello Bob!", logger)
		testSendGroupMessage(ctx, t, groupPK, bob, []*TestingAccount{alice}, "Hello Alice!", logger)
	}

	// no more event
	{
		event := alice.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)

		event = bob.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestBrokenPeersCreateJoinConversation(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)

	ctx, cancel := context.WithTimeout(context.Background(), 80*time.Second)
	defer cancel()
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	accountsAmount := 3
	clients, _, cleanup := TestingInfra(ctx, t, accountsAmount, logger)
	defer cleanup()

	// create nodes
	var creator *TestingAccount
	{
		creator = NewTestingAccount(ctx, t, clients[0], nil, logger)
		defer creator.Close()
		creator.SetName(t, "Creator")
	}
	joiners := make([]*TestingAccount, accountsAmount-1)
	{
		for i := 0; i < accountsAmount-1; i++ {
			joiners[i] = NewTestingAccount(ctx, t, clients[i+1], nil, logger)
			defer joiners[i].Close()
			joiners[i].SetName(t, "Joiner #"+strconv.Itoa(i))
		}
	}

	// creator creates a new conversation
	convName := "Ze Conv"
	createdConv, err := creator.GetClient().ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: convName})
	require.NoError(t, err)

	// get conv link
	gpk := createdConv.GetPublicKey()
	gpkb, err := b64DecodeBytes(gpk)
	require.NoError(t, err)
	sbg, err := creator.GetClient().ShareableBertyGroup(ctx, &ShareableBertyGroup_Request{GroupPK: gpkb, GroupName: convName})
	require.NoError(t, err)

	// joiners join the conversation
	for _, joiner := range joiners {
		ret, err := joiner.GetClient().ConversationJoin(ctx, &ConversationJoin_Request{Link: sbg.GetWebURL()})
		require.NoError(t, err)
		require.Empty(t, ret)
	}

	// wait for events propagation
	time.Sleep(10 * time.Second)

	// open streams and drain lists on all nodes
	accounts := append([]*TestingAccount{creator}, joiners...)
	for _, account := range accounts {
		account.DrainInitEvents(t)
	}

	// no more event
	{
		event := creator.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
		for _, joiner := range joiners {
			event = joiner.TryNextEvent(t, 100*time.Millisecond)
			require.Nil(t, event)
		}
	}

	// verify members in each account
	for _, account := range accounts {
		accountConv := account.conversations[gpk]
		require.Equal(t, gpk, accountConv.GetPublicKey())
		require.Equal(t, convName, accountConv.GetDisplayName())
		mpk := account.conversations[gpk].GetAccountMemberPublicKey()
		require.NotEmpty(t, mpk)
		displayName := account.GetAccount().GetDisplayName()
		for _, otherAccount := range accounts {
			if otherAccount.GetAccount().GetPublicKey() == account.GetAccount().GetPublicKey() {
				continue
			}
			member, ok := otherAccount.members[mpk]
			require.True(t, ok)
			require.Equal(t, displayName, member.GetDisplayName())
			require.Equal(t, gpk, member.GetConversationPublicKey())
		}
	}
}

func TestBroken3PeersExchange(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	clients, _, cleanup := TestingInfra(ctx, t, 3, logger)
	defer cleanup()

	// create nodes
	var creator *TestingAccount
	{
		creator = NewTestingAccount(ctx, t, clients[0], nil, logger)
		defer creator.Close()
		creator.DrainInitEvents(t)
		creator.SetNameAndDrainUpdate(t, "Creator")
	}
	joiners := make([]*TestingAccount, 2)
	{
		for i := 0; i < 2; i++ {
			joiners[i] = NewTestingAccount(ctx, t, clients[i+1], nil, logger)
			defer joiners[i].Close()
			joiners[i].DrainInitEvents(t)
			joiners[i].SetNameAndDrainUpdate(t, "Joiner #"+strconv.Itoa(i))
		}
	}

	// creator creates a new conversation
	createdConv := testCreateConversation(ctx, t, creator, "My Group", nil, logger)

	// joiners join the conversation
	existingDevices := []*TestingAccount{creator}
	for _, joiner := range joiners {
		testJoinConversation(ctx, t, joiner, createdConv, existingDevices, logger)
		existingDevices = append(existingDevices, joiner)
	}

	// FIXME: replace by a check
	time.Sleep(5 * time.Second)

	// interact
	{
		testSendGroupMessage(ctx, t, createdConv.GetPublicKey(), creator, []*TestingAccount{joiners[0], joiners[1]}, "Hello Group! (creator)", logger)
		testSendGroupMessage(ctx, t, createdConv.GetPublicKey(), joiners[0], []*TestingAccount{creator, joiners[1]}, "Hello Group! (joiner1)", logger)
		testSendGroupMessage(ctx, t, createdConv.GetPublicKey(), joiners[1], []*TestingAccount{creator, joiners[0]}, "Hello Group! (joiner2)", logger)
	}

	// no more event
	{
		event := creator.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
		for _, joiner := range joiners {
			event = joiner.TryNextEvent(t, 100*time.Millisecond)
			require.Nil(t, event)
		}
	}
}

func TestBrokenConversationInvitation(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	clients, _, cleanup := TestingInfra(ctx, t, 3, logger)
	defer cleanup()

	// create nodes
	var alice, bob, john *TestingAccount
	{
		alice = NewTestingAccount(ctx, t, clients[0], nil, logger)
		defer alice.Close()
		alice.SetName(t, "Alice")
		alice.DrainInitEvents(t)

		bob = NewTestingAccount(ctx, t, clients[1], nil, logger)
		defer bob.Close()
		bob.SetName(t, "Bob")
		bob.DrainInitEvents(t)

		john = NewTestingAccount(ctx, t, clients[2], nil, logger)
		defer john.Close()
		john.SetName(t, "John")
		john.DrainInitEvents(t)
	}

	// contact requests
	{
		testAddContact(ctx, t, alice, bob)
		testAddContact(ctx, t, alice, john)
		testAddContact(ctx, t, bob, john)
		assert.Len(t, alice.contacts, 2)
		assert.Len(t, bob.contacts, 2)
		assert.Len(t, john.contacts, 2)
		assert.Len(t, alice.conversations, 2)
		assert.Len(t, bob.conversations, 2)
		assert.Len(t, john.conversations, 2)
	}

	// create group
	{
		testCreateConversation(ctx, t, alice, "Alice & Friends", []*TestingAccount{bob, john}, logger)
		assert.Len(t, alice.contacts, 2)
		assert.Len(t, bob.contacts, 2)
		assert.Len(t, john.contacts, 2)
		assert.Len(t, alice.conversations, 3)
		assert.Len(t, bob.conversations, 3)
		assert.Len(t, john.conversations, 3)
	}

	// no more event
	{
		event := alice.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)

		event = bob.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)

		event = john.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestBrokenConversationInvitationAndExchange(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	clients, _, cleanup := TestingInfra(ctx, t, 3, logger)
	defer cleanup()

	// create nodes
	var alice, bob, john *TestingAccount
	{
		alice = NewTestingAccount(ctx, t, clients[0], nil, logger)
		defer alice.Close()
		alice.SetName(t, "Alice")
		alice.DrainInitEvents(t)

		bob = NewTestingAccount(ctx, t, clients[1], nil, logger)
		defer bob.Close()
		bob.SetName(t, "Bob")
		bob.DrainInitEvents(t)

		john = NewTestingAccount(ctx, t, clients[2], nil, logger)
		defer john.Close()
		john.SetName(t, "John")
		john.DrainInitEvents(t)
	}

	// contact requests
	{
		testAddContact(ctx, t, alice, bob)
		testAddContact(ctx, t, alice, john)
		testAddContact(ctx, t, bob, john)
		assert.Len(t, alice.contacts, 2)
		assert.Len(t, bob.contacts, 2)
		assert.Len(t, john.contacts, 2)
		assert.Len(t, alice.conversations, 2)
		assert.Len(t, bob.conversations, 2)
		assert.Len(t, john.conversations, 2)
	}

	// create group
	var createdConv *Conversation
	{
		createdConv = testCreateConversation(ctx, t, alice, "Alice & Friends", []*TestingAccount{bob, john}, logger)
		assert.Len(t, alice.contacts, 2)
		assert.Len(t, bob.contacts, 2)
		assert.Len(t, john.contacts, 2)
		assert.Len(t, alice.conversations, 3)
		assert.Len(t, bob.conversations, 3)
		assert.Len(t, john.conversations, 3)
	}

	// interact
	{
		testSendGroupMessage(ctx, t, createdConv.GetPublicKey(), alice, []*TestingAccount{bob, john}, "Hello Group! (alice)", logger)
		testSendGroupMessage(ctx, t, createdConv.GetPublicKey(), bob, []*TestingAccount{alice, john}, "Hello Group! (bob)", logger)
		testSendGroupMessage(ctx, t, createdConv.GetPublicKey(), john, []*TestingAccount{alice, bob}, "Hello Group! (john)", logger)
	}

	// no more event
	{
		event := alice.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)

		event = bob.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)

		event = john.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func TestBrokenConversationOpenClose(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	clients, _, cleanup := TestingInfra(ctx, t, 2, logger)
	defer cleanup()

	// Init accounts
	var (
		alice = NewTestingAccount(ctx, t, clients[0], nil, logger)
		bob   = NewTestingAccount(ctx, t, clients[1], nil, logger)
	)
	{
		defer alice.Close()
		alice.DrainInitEvents(t)

		defer bob.Close()
		bob.DrainInitEvents(t)
	}

	// Bob adds Alice as contact (and she accepts)
	var groupPK string
	{
		aliceContact := testAddContact(ctx, t, bob, alice)
		groupPK = aliceContact.GetConversationPublicKey()
		require.Equal(t, alice.conversations[groupPK].UnreadCount, int32(0))
		require.Equal(t, bob.conversations[groupPK].UnreadCount, int32(0))
		require.Equal(t, alice.conversations[groupPK].LastUpdate, int64(0)) // FIXME: check if normal
		require.Equal(t, bob.conversations[groupPK].LastUpdate, int64(0))   // FIXME: check if normal
	}

	// Bob opens the conversation
	{
		_, err := bob.GetClient().ConversationOpen(ctx, &ConversationOpen_Request{GroupPK: groupPK})
		require.NoError(t, err)
	}

	// Bob has a ConversationUpdated event
	{
		event := bob.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		require.NotNil(t, event.GetPayload())
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).GetConversation()
		require.Equal(t, conversation.GetType(), Conversation_ContactType)
		require.Equal(t, conversation.GetPublicKey(), groupPK)
		require.True(t, conversation.GetIsOpen())
		require.Zero(t, conversation.GetUnreadCount())
		require.Zero(t, conversation.GetLastUpdate()) // FIXME: should be set because we already have one contact?
	}

	// Alice sends a message
	{
		aliceBefore := alice.conversations[groupPK].LastUpdate
		bobBefore := bob.conversations[groupPK].LastUpdate
		testSendGroupMessage(ctx, t, groupPK, alice, []*TestingAccount{bob}, "Hello Bob!", logger)
		assert.Equal(t, int32(0), bob.conversations[groupPK].UnreadCount)
		assert.Equal(t, int32(0), alice.conversations[groupPK].UnreadCount)
		require.Greater(t, alice.conversations[groupPK].LastUpdate, aliceBefore)
		require.Greater(t, bob.conversations[groupPK].LastUpdate, bobBefore)
	}

	// Bob sends a message
	{
		aliceBefore := alice.conversations[groupPK].LastUpdate
		bobBefore := bob.conversations[groupPK].LastUpdate
		testSendGroupMessage(ctx, t, groupPK, bob, []*TestingAccount{alice}, "Hello Alice!", logger)
		assert.Equal(t, int32(0), bob.conversations[groupPK].UnreadCount)
		assert.Equal(t, int32(1), alice.conversations[groupPK].UnreadCount)
		require.Greater(t, alice.conversations[groupPK].LastUpdate, aliceBefore)
		require.Greater(t, bob.conversations[groupPK].LastUpdate, bobBefore)
	}

	// Bob closes the conversation
	{
		_, err := bob.GetClient().ConversationClose(ctx, &ConversationClose_Request{GroupPK: groupPK})
		require.NoError(t, err)
	}

	// Bob has a ConversationUpdated event
	{
		event := bob.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		require.NotNil(t, event.GetPayload())
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).GetConversation()
		require.Equal(t, conversation.GetType(), Conversation_ContactType)
		require.Equal(t, conversation.GetPublicKey(), groupPK)
		require.False(t, conversation.GetIsOpen())
		require.Equal(t, conversation.GetUnreadCount(), int32(0))
		require.NotZero(t, conversation.GetLastUpdate())
	}

	// Alice sends a message
	{
		aliceBefore := alice.conversations[groupPK].LastUpdate
		bobBefore := bob.conversations[groupPK].LastUpdate
		testSendGroupMessage(ctx, t, groupPK, alice, []*TestingAccount{bob}, "Hello Bob!", logger)
		assert.Equal(t, int32(1), bob.conversations[groupPK].UnreadCount)
		assert.Equal(t, int32(1), alice.conversations[groupPK].UnreadCount)
		require.Greater(t, alice.conversations[groupPK].LastUpdate, aliceBefore)
		require.Greater(t, bob.conversations[groupPK].LastUpdate, bobBefore)
	}

	// Bob sends a message
	{
		aliceBefore := alice.conversations[groupPK].LastUpdate
		bobBefore := bob.conversations[groupPK].LastUpdate
		testSendGroupMessage(ctx, t, groupPK, bob, []*TestingAccount{alice}, "Hello Alice!", logger)
		assert.Equal(t, int32(1), bob.conversations[groupPK].UnreadCount)
		assert.Equal(t, int32(2), alice.conversations[groupPK].UnreadCount)
		require.Greater(t, alice.conversations[groupPK].LastUpdate, aliceBefore)
		require.Greater(t, bob.conversations[groupPK].LastUpdate, bobBefore)
	}

	// Alice opens the conversation
	{
		_, err := alice.GetClient().ConversationOpen(ctx, &ConversationOpen_Request{GroupPK: groupPK})
		require.NoError(t, err)
	}

	// Alice has a ConversationUpdated event
	{
		event := alice.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		require.NotNil(t, event.GetPayload())
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).GetConversation()
		require.Equal(t, conversation.GetType(), Conversation_ContactType)
		require.Equal(t, conversation.GetPublicKey(), groupPK)
		require.True(t, conversation.GetIsOpen())
		require.Zero(t, conversation.GetUnreadCount())
		require.NotZero(t, conversation.GetLastUpdate())
	}

	// no more event
	{
		event := alice.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)

		event = bob.TryNextEvent(t, 100*time.Millisecond)
		require.Nil(t, event)
	}
}

func testJoinConversation(ctx context.Context, t *testing.T, joiner *TestingAccount, existingConv *Conversation, existingDevices []*TestingAccount, logger *zap.Logger) {
	t.Helper()

	// joiner joins the conversation
	{
		ret, err := joiner.GetClient().ConversationJoin(ctx, &ConversationJoin_Request{Link: existingConv.GetLink()})
		require.NoError(t, err)
		require.Empty(t, ret)
		logger.Debug("testJoinConversation: conversation joined")
	}

	// joiner has ConversationUpdated event
	var conv *Conversation
	{
		event := joiner.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).GetConversation()
		require.NotNil(t, conversation)
		require.Equal(t, conversation.GetType(), Conversation_MultiMemberType)
		if existingConv.GetPublicKey() != "" {
			require.Equal(t, conversation.GetPublicKey(), existingConv.GetPublicKey())
		}
		if existingConv.GetDisplayName() != "" {
			require.Equal(t, conversation.GetDisplayName(), existingConv.GetDisplayName())
		}
		require.Equal(t, conversation.GetLink(), existingConv.GetLink())
		logger.Debug("testJoinConversation: conversation joined confirmation received")
		conv = conversation
	}

	for _, existingDevice := range existingDevices {
		// joiner receives a device update for each existing device
		{
			event := joiner.NextEvent(t)
			require.Equal(t, event.GetType(), StreamEvent_TypeDeviceUpdated)
			payload, err := event.UnmarshalPayload()
			require.NoError(t, err)
			device := payload.(*StreamEvent_DeviceUpdated).GetDevice()
			// FIXME: can be better to check if public key and owner public key are unique here
			require.NotEmpty(t, device.GetPublicKey())
			require.NotEmpty(t, device.GetMemberPublicKey())
		}

		// each existing device receives a device update for the joiner
		{
			event := existingDevice.NextEvent(t)
			require.Equal(t, event.GetType(), StreamEvent_TypeDeviceUpdated)
			payload, err := event.UnmarshalPayload()
			require.NoError(t, err)
			device := payload.(*StreamEvent_DeviceUpdated).GetDevice()
			// FIXME: can be better to check if public key and owner public key are unique here
			require.NotEmpty(t, device.GetMemberPublicKey())
			require.NotEmpty(t, device.GetPublicKey())
		}

		// each existing device receives a member update for the joiner
		{
			event := existingDevice.NextEvent(t)
			require.Equal(t, event.GetType(), StreamEvent_TypeMemberUpdated)
			payload, err := event.UnmarshalPayload()
			require.NoError(t, err)
			member := payload.(*StreamEvent_MemberUpdated).GetMember()
			require.Equal(t, conv.GetPublicKey(), member.GetConversationPublicKey())
			require.Equal(t, joiner.GetAccount().GetDisplayName(), member.GetDisplayName())
			require.NotEmpty(t, member.GetPublicKey())
		}
	}
}

func testAddContact(ctx context.Context, t *testing.T, requester, requested *TestingAccount) *Contact {
	t.Helper()
	// Requester sends a contact request to requested
	{
		ret, err := requester.GetClient().ContactRequest(ctx, &ContactRequest_Request{Link: requested.GetAccount().GetLink()})
		require.NoError(t, err)
		require.Empty(t, ret)
	}

	// Requester has a contact updated event (outgoing request enqueued)
	{
		event := requester.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeContactUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		contact := payload.(*StreamEvent_ContactUpdated).Contact
		require.NotEmpty(t, contact.GetPublicKey())
		require.Equal(t, contact.GetPublicKey(), requested.GetAccount().GetPublicKey())
		if requested.GetAccount().GetDisplayName() != "" {
			require.Equal(t, contact.GetDisplayName(), requested.GetAccount().GetDisplayName())
		}
		require.Equal(t, contact.GetState(), Contact_OutgoingRequestEnqueued)
		require.Empty(t, contact.GetConversationPublicKey())
	}

	// Requester has a contact updated event (outgoing request sent)
	{
		event := requester.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeContactUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		contact := payload.(*StreamEvent_ContactUpdated).Contact
		require.NotEmpty(t, contact.GetPublicKey())
		require.Equal(t, contact.GetPublicKey(), requested.GetAccount().GetPublicKey())
		if requested.GetAccount().GetDisplayName() != "" {
			require.Equal(t, contact.GetDisplayName(), requested.GetAccount().GetDisplayName())
		}
		require.Equal(t, contact.GetState(), Contact_OutgoingRequestSent)
		require.Empty(t, contact.GetConversationPublicKey())
	}

	// Requested receives the contact request
	{
		event := requested.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeContactUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		contact := payload.(*StreamEvent_ContactUpdated).Contact
		require.NotEmpty(t, contact.GetPublicKey())
		require.Equal(t, contact.GetPublicKey(), requester.GetAccount().GetPublicKey())
		if requester.GetAccount().GetDisplayName() != "" {
			require.Equal(t, contact.GetDisplayName(), requester.GetAccount().GetDisplayName())
		}
		require.Equal(t, contact.GetState(), Contact_IncomingRequest)
	}

	// Requested accepts the contact request
	{
		ret, err := requested.GetClient().ContactAccept(ctx, &ContactAccept_Request{PublicKey: requester.GetAccount().GetPublicKey()})
		require.NoError(t, err)
		require.Empty(t, ret)
	}

	// Requested receives the contact update
	var groupPK string
	{
		event := requested.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeContactUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		contact := payload.(*StreamEvent_ContactUpdated).Contact
		require.NotEmpty(t, contact.GetPublicKey())
		require.Equal(t, contact.GetPublicKey(), requester.GetAccount().GetPublicKey())
		if requester.GetAccount().GetDisplayName() != "" {
			require.Equal(t, contact.GetDisplayName(), requester.GetAccount().GetDisplayName())
		}
		require.Equal(t, contact.GetState(), Contact_Accepted)
		groupPK = contact.GetConversationPublicKey()
	}

	// Requested receives the contact conversation event
	{
		event := requested.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).Conversation
		require.NotEmpty(t, conversation.GetPublicKey())
		require.Equal(t, conversation.GetPublicKey(), groupPK)
		require.Empty(t, conversation.GetDisplayName())
		require.Empty(t, conversation.GetLink())
		require.Equal(t, conversation.GetType(), Conversation_ContactType)
	}

	// Requester has a device-updated event
	{
		event := requester.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeDeviceUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		device := payload.(*StreamEvent_DeviceUpdated).Device
		require.Equal(t, requested.GetAccount().GetPublicKey(), device.GetMemberPublicKey())
		require.NotEmpty(t, device.GetPublicKey())
	}

	// Requested has a device-updated event
	{
		event := requested.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeDeviceUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		device := payload.(*StreamEvent_DeviceUpdated).Device
		require.Equal(t, requester.GetAccount().GetPublicKey(), device.GetMemberPublicKey())
		require.NotEmpty(t, device.GetPublicKey())
	}

	// Requester has a contact updated event (Established)
	var contact *Contact
	{
		event := requester.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeContactUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		contact = payload.(*StreamEvent_ContactUpdated).Contact
		require.NotEmpty(t, contact.GetPublicKey())
		require.Equal(t, contact.GetPublicKey(), requested.GetAccount().GetPublicKey())
		if requested.GetAccount().GetDisplayName() != "" {
			require.Equal(t, contact.GetDisplayName(), requested.GetAccount().GetDisplayName())
		}
		require.Equal(t, contact.GetState(), Contact_Accepted)
		require.Equal(t, contact.GetConversationPublicKey(), groupPK)
	}

	// Requester receives the contact conversation event too
	{
		event := requester.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).Conversation
		require.NotEmpty(t, conversation.GetPublicKey())
		require.Equal(t, conversation.GetPublicKey(), groupPK)
		require.Empty(t, conversation.GetDisplayName())
		require.Empty(t, conversation.GetLink())
		require.Equal(t, conversation.GetType(), Conversation_ContactType)
	}

	return contact
}

func testSendGroupMessage(ctx context.Context, t *testing.T, groupPK string, sender *TestingAccount, receivers []*TestingAccount, msg string, logger *zap.Logger) {
	t.Helper()

	// sender interacts
	var beforeSend, afterSend int64
	{
		beforeSend = timestampMs(time.Now())
		userMessage, err := proto.Marshal(&AppMessage_UserMessage{Body: msg})
		require.NoError(t, err)
		interactionRequest := Interact_Request{Type: AppMessage_TypeUserMessage, Payload: userMessage, ConversationPublicKey: groupPK}
		_, err = sender.GetClient().Interact(ctx, &interactionRequest)
		require.NoError(t, err)
		afterSend = timestampMs(time.Now())
		logger.Debug("testSendGroupMessage: message sent")
	}

	// sender has own interact event
	var messageCid string
	{
		event := sender.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeInteractionUpdated)
		eventPayload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		interaction := eventPayload.(*StreamEvent_InteractionUpdated).Interaction
		require.NotEmpty(t, interaction.GetCID())
		messageCid = interaction.GetCID()
		require.Equal(t, interaction.GetType(), AppMessage_TypeUserMessage)
		require.Equal(t, interaction.GetConversationPublicKey(), groupPK)
		require.True(t, interaction.GetIsMe())
		require.Equal(t, interaction.GetCID(), messageCid)
		interactionPayload, err := interaction.UnmarshalPayload()
		require.NoError(t, err)
		userMessage := interactionPayload.(*AppMessage_UserMessage)
		require.Equal(t, userMessage.GetBody(), msg)
		require.LessOrEqual(t, beforeSend, interaction.GetSentDate())
		require.LessOrEqual(t, interaction.GetSentDate(), afterSend)
		logger.Debug("testSendGroupMessage: message received by creator")
	}

	// sender has a conversation update event
	{
		before := sender.conversations[groupPK]
		event := sender.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		eventPayload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := eventPayload.(*StreamEvent_ConversationUpdated).Conversation
		require.NotEmpty(t, conversation)
		require.Equal(t, conversation.GetPublicKey(), groupPK)
		require.NotZero(t, conversation.GetType()) // this helper can be called in various contexts (account, contact, multi-member)
		require.NotZero(t, conversation.GetLastUpdate())
		require.LessOrEqual(t, beforeSend, conversation.GetLastUpdate())
		// require.LessOrEqual(t, conversation.GetLastUpdate(), afterSend) // -> cannot be sure

		// even if the conversation is closed, the unread cound should not increment if the interaction is from myself
		require.Equal(t, conversation.GetUnreadCount(), before.GetUnreadCount())
	}

	for _, receiver := range receivers {
		gotOwnAck := false
		gotOthersAcks := 0
		gotMsg := false
		gotConversationUpdate := false

		// we should receive one message + one ack + one conversation update per receiver
		for i := 0; i < len(receivers)+2; i++ {
			before := receiver.conversations[groupPK]
			event := receiver.NextEvent(t)
			switch event.GetType() {
			case StreamEvent_TypeConversationUpdated:
				eventPayload, err := event.UnmarshalPayload()
				require.NoError(t, err)
				conversation := eventPayload.(*StreamEvent_ConversationUpdated).Conversation
				require.Equal(t, conversation.PublicKey, groupPK)
				require.Equal(t, conversation.GetPublicKey(), groupPK)
				require.NotZero(t, conversation.GetType()) // this helper can be called in various contexts (account, contact, multi-member)
				require.NotZero(t, conversation.GetLastUpdate())
				require.LessOrEqual(t, beforeSend, conversation.GetLastUpdate())
				// require.LessOrEqual(t, conversation.GetLastUpdate(), afterSend) // -> cannot be sure
				require.True(t, gotMsg) // should have the message before the conversation
				if !before.IsOpen {
					require.NotZero(t, conversation.GetUnreadCount())
					require.Equal(t, conversation.GetUnreadCount(), before.GetUnreadCount()+1)
				}
				gotConversationUpdate = true
			case StreamEvent_TypeInteractionUpdated:
				eventPayload, err := event.UnmarshalPayload()
				require.NoError(t, err)
				interaction := eventPayload.(*StreamEvent_InteractionUpdated).Interaction
				require.NotEmpty(t, interaction.GetCID())
				require.Equal(t, interaction.GetConversationPublicKey(), groupPK)
				interactionPayload, err := interaction.UnmarshalPayload()
				require.NoError(t, err)
				switch {
				case interaction.GetType() == AppMessage_TypeAcknowledge && interaction.GetIsMe():
					require.False(t, gotOwnAck)
					gotOwnAck = true
					ack := interactionPayload.(*AppMessage_Acknowledge)
					require.Equal(t, ack.GetTarget(), messageCid)
				case interaction.GetType() == AppMessage_TypeAcknowledge && !interaction.GetIsMe():
					ack := interactionPayload.(*AppMessage_Acknowledge)
					require.Equal(t, ack.GetTarget(), messageCid)
					gotOthersAcks++
				case interaction.GetType() == AppMessage_TypeUserMessage:
					require.False(t, gotMsg)
					gotMsg = true
					require.Equal(t, interaction.GetCID(), messageCid)
					userMessage := interactionPayload.(*AppMessage_UserMessage)
					require.Equal(t, userMessage.GetBody(), msg)
					require.LessOrEqual(t, beforeSend, interaction.GetSentDate())
					require.LessOrEqual(t, interaction.GetSentDate(), afterSend)
				default:
					require.True(t, false) // maybe there is a better assert func for this :)
				}
			}
		}
		require.True(t, gotOwnAck)
		require.True(t, gotMsg)
		require.True(t, gotConversationUpdate)
		require.Equal(t, gotOthersAcks, len(receivers)-1)
	}

	// sender has the ack event too
	for i := 0; i < len(receivers); i++ {
		event := sender.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeInteractionUpdated)
		eventPayload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		interaction := eventPayload.(*StreamEvent_InteractionUpdated).Interaction
		require.NotEmpty(t, interaction.GetCID())
		require.Equal(t, interaction.GetType(), AppMessage_TypeAcknowledge)
		require.Equal(t, interaction.GetConversationPublicKey(), groupPK)
		require.False(t, interaction.GetIsMe())
		interactionPayload, err := interaction.UnmarshalPayload()
		require.NoError(t, err)
		ack := interactionPayload.(*AppMessage_Acknowledge)
		require.Equal(t, ack.GetTarget(), messageCid)
		logger.Debug("testSendGroupMessage: message ack received by creator")
		// FIXME: check if the ack is from the good receiver, or useless?
	}
}

func testCreateConversation(ctx context.Context, t *testing.T, creator *TestingAccount, convName string, invitees []*TestingAccount, logger *zap.Logger) *Conversation {
	t.Helper()

	// creator creates a conversation
	var convPK string
	{
		contactsToInvite := make([]string, len(invitees))
		for idx, invitee := range invitees {
			contactsToInvite[idx] = invitee.GetAccount().GetPublicKey()
		}
		createdConv, err := creator.GetClient().ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: convName, ContactsToInvite: contactsToInvite})
		require.NoError(t, err)
		require.NotEmpty(t, createdConv.GetPublicKey())
		convPK = createdConv.GetPublicKey()
	}

	// creator has a ConversationUpdated event for the display name
	var createdConv *Conversation
	{
		event := creator.NextEvent(t)
		require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).GetConversation()
		require.NotNil(t, conversation)
		require.Equal(t, Conversation_MultiMemberType, conversation.GetType())
		require.Equal(t, convPK, conversation.GetPublicKey())
		require.Equal(t, convName, conversation.GetDisplayName())
		createdConv = conversation
	}

	invitationLinks := map[string]string{}

	for _, invitee := range invitees {
		// creator see the invitation in 1-1 conv
		{
			event := creator.NextEvent(t)
			require.Equal(t, event.GetType(), StreamEvent_TypeInteractionUpdated)
			eventPayload, err := event.UnmarshalPayload()
			require.NoError(t, err)
			interaction := eventPayload.(*StreamEvent_InteractionUpdated).GetInteraction()
			require.Equal(t, interaction.GetType(), AppMessage_TypeGroupInvitation)
			require.NotEmpty(t, interaction.GetCID())
			require.NotEqual(t, convPK, interaction.GetConversationPublicKey())
			require.True(t, interaction.GetIsMe())
			// FIXME: require.Equal, 1to1conv.pk
			interactionPayload, err := interaction.UnmarshalPayload()
			require.NoError(t, err)
			inviteLink := interactionPayload.(*AppMessage_GroupInvitation).GetLink()
			require.NotEmpty(t, inviteLink)
		}

		// creator get a conversation update event
		{
			event := creator.NextEvent(t)
			require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
			eventPayload, err := event.UnmarshalPayload()
			require.NoError(t, err)
			conversation := eventPayload.(*StreamEvent_ConversationUpdated).Conversation
			require.NotEmpty(t, conversation)
			// require.Equal(t, conversation.GetPublicKey(), 1to1conv.pk)
			require.NotZero(t, conversation.GetType()) // this helper can be called in various contexts (account, contact, multi-member)
			require.NotZero(t, conversation.GetLastUpdate())
			// require.LessOrEqual(t, beforeSend, conversation.GetLastUpdate())
			// require.LessOrEqual(t, conversation.GetLastUpdate(), afterSend) // -> cannot be sure
		}

		// invitee receive the invitation
		var inviteLink string
		{
			event := invitee.NextEvent(t)
			require.Equal(t, event.GetType(), StreamEvent_TypeInteractionUpdated)
			eventPayload, err := event.UnmarshalPayload()
			require.NoError(t, err)
			interaction := eventPayload.(*StreamEvent_InteractionUpdated).GetInteraction()
			require.Equal(t, interaction.GetType(), AppMessage_TypeGroupInvitation)
			require.NotEmpty(t, interaction.GetCID())
			require.NotEqual(t, convPK, interaction.GetConversationPublicKey())
			require.False(t, interaction.GetIsMe())
			// FIXME: require.Equal, 1to1conv.pk
			interactionPayload, err := interaction.UnmarshalPayload()
			require.NoError(t, err)
			inviteLink = interactionPayload.(*AppMessage_GroupInvitation).GetLink()
			require.NotEmpty(t, inviteLink)
			invitationLinks[invitee.GetAccount().GetPublicKey()] = inviteLink
		}

		// invitee get a conversation update event
		{
			event := invitee.NextEvent(t)
			require.Equal(t, event.GetType(), StreamEvent_TypeConversationUpdated)
			eventPayload, err := event.UnmarshalPayload()
			require.NoError(t, err)
			conversation := eventPayload.(*StreamEvent_ConversationUpdated).Conversation
			require.NotEmpty(t, conversation)
			// require.Equal(t, conversation.GetPublicKey(), 1to1conv.pk)
			require.NotZero(t, conversation.GetType()) // this helper can be called in various contexts (account, contact, multi-member)
			require.NotZero(t, conversation.GetLastUpdate())
			// require.LessOrEqual(t, beforeSend, conversation.GetLastUpdate())
			// require.LessOrEqual(t, conversation.GetLastUpdate(), afterSend) // -> cannot be sure
		}
	}

	existingDevices := []*TestingAccount{creator}
	for _, invitee := range invitees {
		// invitee accepts the invitation
		{
			conversation := &Conversation{
				Link: invitationLinks[invitee.GetAccount().GetPublicKey()],
				// bonus: parse the link to get the name and public key (bonus)
			}
			testJoinConversation(ctx, t, invitee, conversation, existingDevices, logger)
			existingDevices = append(existingDevices, invitee)
		}
	}

	return createdConv
}

func TestAccountUpdate(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Stable, testutil.Slow)

	// PREPARE
	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	const l = 3

	clients, protocols, cleanup := TestingInfra(ctx, t, l, logger)
	defer cleanup()

	nodes := make([]*TestingAccount, l)
	for i := range nodes {
		nodes[i] = NewTestingAccount(ctx, t, clients[i], protocols[i].Client, logger)
		nodes[i].SetName(t, fmt.Sprintf("node-%d", i))
		close := nodes[i].ProcessWholeStream(t)
		defer close()
	}

	logger.Info("Started nodes")
	time.Sleep(4 * time.Second)

	user := nodes[0]
	userPK := user.account.GetPublicKey()
	friends := nodes[1:]
	for _, friend := range friends {
		_, err := user.client.ContactRequest(ctx, &ContactRequest_Request{Link: friend.account.GetLink()})
		require.NoError(t, err)
		time.Sleep(1 * time.Second)
		_, err = friend.client.ContactAccept(ctx, &ContactAccept_Request{PublicKey: userPK})
		require.NoError(t, err)
	}

	logger.Info("waiting for requests propagation")
	time.Sleep(4 * time.Second)

	// REAL TEST

	logger.Info("Starting test")

	testBlock := []byte("hello world!")

	stream, err := user.protocolClient.AttachmentPrepare(ctx)
	require.NoError(t, err)
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{})) // send header
	const split = 5
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{Block: testBlock[0:split]})) // send block
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{Block: testBlock[split:]}))  // send block
	reply, err := stream.CloseAndRecv()
	require.NoError(t, err)

	userAvatarCID := b64EncodeBytes(reply.GetAttachmentCID())

	logger.Info("starting update")
	const testName = "user"
	_, err = user.client.AccountUpdate(ctx, &AccountUpdate_Request{DisplayName: testName, AvatarCID: userAvatarCID})
	require.NoError(t, err)
	logger.Info("waiting for propagation")
	time.Sleep(4 * time.Second)
	logger.Info("done waiting for propagation")

	logger.Info("checking friends")
	cids := []string(nil)
	for _, friend := range friends {
		logger.Info("checking node", zap.String("name", friend.account.GetDisplayName()))
		userInFriend, ok := friend.contacts[userPK]
		require.True(t, ok)
		require.Equal(t, testName, userInFriend.GetDisplayName())
		avatarCIDInFriend := userInFriend.GetAvatarCID()
		require.NotEqual(t, userAvatarCID, avatarCIDInFriend)
		for _, existingCID := range cids {
			require.NotEqual(t, existingCID, avatarCIDInFriend)
		}
		cids = append(cids, userInFriend.GetAvatarCID())

		// check attachment
		cidBytes, err := b64DecodeBytes(avatarCIDInFriend)
		require.NoError(t, err)
		stream, err := friend.protocolClient.AttachmentRetrieve(ctx, &bertytypes.AttachmentRetrieve_Request{AttachmentCID: cidBytes})
		require.NoError(t, err)
		data := []byte(nil)
		for {
			rsp, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			data = append(data, rsp.GetBlock()...)
		}
		require.Equal(t, testBlock, data)
	}

	logger.Error("test done")
}

func TestAccountUpdateGroup(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Stable, testutil.Slow)

	// PREPARE
	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	const l = 3

	clients, protocols, cleanup := TestingInfra(ctx, t, l, logger)
	defer cleanup()

	nodes := make([]*TestingAccount, l)
	for i := range nodes {
		nodes[i] = NewTestingAccount(ctx, t, clients[i], protocols[i].Client, logger)
		nodes[i].SetName(t, fmt.Sprintf("node-%d", i))
		close := nodes[i].ProcessWholeStream(t)
		defer close()
	}

	logger.Info("Started nodes")
	time.Sleep(4 * time.Second)

	user := nodes[0]
	friends := nodes[1:]

	ccReply, err := user.client.ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: "test conv"})
	require.NoError(t, err)
	require.NotEmpty(t, ccReply.GetPublicKey())

	logger.Info("waiting for creation settlement")
	time.Sleep(4 * time.Second)

	conv := user.GetConversation(t, ccReply.GetPublicKey())
	require.NotEmpty(t, conv.GetLink())

	for _, friend := range friends {
		_, err = friend.client.ConversationJoin(ctx, &ConversationJoin_Request{Link: conv.GetLink()})
		require.NoError(t, err)
	}

	logger.Info("waiting for requests propagation")
	time.Sleep(4 * time.Second)

	// REAL TEST

	logger.Info("Starting test")

	testBlock := []byte("hello world!")

	stream, err := user.protocolClient.AttachmentPrepare(ctx)
	require.NoError(t, err)
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{})) // send header
	const split = 5
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{Block: testBlock[0:split]})) // send block
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{Block: testBlock[split:]}))  // send block
	reply, err := stream.CloseAndRecv()
	require.NoError(t, err)

	userAvatarCID := b64EncodeBytes(reply.GetAttachmentCID())

	logger.Info("starting update")
	const testName = "user"
	_, err = user.client.AccountUpdate(ctx, &AccountUpdate_Request{DisplayName: testName, AvatarCID: userAvatarCID})
	require.NoError(t, err)
	logger.Info("waiting for propagation")

	time.Sleep(4 * time.Second)
	logger.Info("done waiting for propagation")

	logger.Info("checking friends")
	cids := []string(nil)
	for _, friend := range friends {
		logger.Info("checking node", zap.String("name", friend.account.GetDisplayName()))
		userInFriend, ok := friend.members[conv.GetAccountMemberPublicKey()]
		require.True(t, ok)
		require.Equal(t, testName, userInFriend.GetDisplayName())
		avatarCIDInFriend := userInFriend.GetAvatarCID()
		require.NotEqual(t, userAvatarCID, avatarCIDInFriend)
		for _, existingCID := range cids {
			require.Equal(t, existingCID, avatarCIDInFriend)
		}
		cids = append(cids, userInFriend.GetAvatarCID())

		// check attachment
		cidBytes, err := b64DecodeBytes(avatarCIDInFriend)
		require.NoError(t, err)
		stream, err := friend.protocolClient.AttachmentRetrieve(ctx, &bertytypes.AttachmentRetrieve_Request{AttachmentCID: cidBytes})
		require.NoError(t, err)
		data := []byte(nil)
		for {
			rsp, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			data = append(data, rsp.GetBlock()...)
		}
		require.Equal(t, testBlock, data)
	}

	logger.Error("test done")
}

func TestSendAttachment(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Stable, testutil.Slow)

	// PREPARE
	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	const l = 2

	clients, protocols, cleanup := TestingInfra(ctx, t, l, logger)
	defer cleanup()

	nodes := make([]*TestingAccount, l)
	for i := range nodes {
		nodes[i] = NewTestingAccount(ctx, t, clients[i], protocols[i].Client, logger)
		nodes[i].SetName(t, fmt.Sprintf("node-%d", i))
		close := nodes[i].ProcessWholeStream(t)
		defer close()
	}

	logger.Info("Started nodes")
	time.Sleep(4 * time.Second)

	user := nodes[0]
	friend := nodes[1]
	userPK := user.account.GetPublicKey()

	_, err := user.client.ContactRequest(ctx, &ContactRequest_Request{Link: friend.GetLink()})
	require.NoError(t, err)
	time.Sleep(1 * time.Second)
	_, err = friend.client.ContactAccept(ctx, &ContactAccept_Request{PublicKey: userPK})
	require.NoError(t, err)

	logger.Info("waiting for requests propagation")
	time.Sleep(4 * time.Second)

	// REAL TEST

	logger.Info("Starting test")

	testBlock := []byte("hello world!")

	stream, err := user.protocolClient.AttachmentPrepare(ctx)
	require.NoError(t, err)
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{})) // send header
	const split = 5
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{Block: testBlock[0:split]})) // send block
	require.NoError(t, stream.Send(&bertytypes.AttachmentPrepare_Request{Block: testBlock[split:]}))  // send block
	reply, err := stream.CloseAndRecv()
	require.NoError(t, err)

	// attachmentCID := b64EncodeBytes(reply.GetAttachmentCID())

	logger.Info("starting update")
	const testName = "user"

	friendAsContact, ok := user.contacts[friend.account.GetPublicKey()]
	require.True(t, ok)

	gpkb, err := b64DecodeBytes(friendAsContact.GetConversationPublicKey())
	require.NoError(t, err)

	_, err = user.protocolClient.AppMessageSend(ctx,
		&bertytypes.AppMessageSend_Request{GroupPK: gpkb, AttachmentCIDs: [][]byte{reply.GetAttachmentCID()}},
	)
	require.NoError(t, err)
	logger.Info("waiting for propagation")
	time.Sleep(4 * time.Second)
	logger.Info("done waiting for propagation")

	logger.Info("checking friends")

	logger.Info("checking node", zap.String("name", friend.account.GetDisplayName()))
	_, ok = friend.contacts[userPK]
	require.True(t, ok)

	// FIXME: check that we recive an interaction with the correct attachment
}

func Test_exportMessengerData(t *testing.T) {
	db, cleanup := getInMemoryTestDB(t)
	defer cleanup()

	db.db.Create(&Account{PublicKey: "pk_account_1", DisplayName: "display_name", ReplicateNewGroupsAutomatically: true})
	db.db.Create(&Conversation{PublicKey: "pk_conv_1", UnreadCount: 1000, IsOpen: false})
	db.db.Create(&Conversation{PublicKey: "pk_conv_2", UnreadCount: 2000, IsOpen: true})
	db.db.Create(&Conversation{PublicKey: "pk_conv_3", UnreadCount: 3000, IsOpen: false})

	tmpFile, err := ioutil.TempFile(os.TempDir(), "messenger-export-")
	require.NoError(t, err)

	err = exportMessengerData(tmpFile, db.db, zap.NewNop())
	require.NoError(t, err)

	_, err = tmpFile.Seek(0, io.SeekStart)
	require.NoError(t, err)

	reader := tar.NewReader(tmpFile)
	header, err := reader.Next()
	require.NoError(t, err)

	require.Equal(t, exportLocalDBState, header.Name)
	require.NotEmpty(t, header.Size)

	stateBuffer := new(bytes.Buffer)
	size, err := io.Copy(stateBuffer, reader)
	require.Equal(t, size, header.Size)
	require.NoError(t, err)

	state := &LocalDatabaseState{}
	err = proto.Unmarshal(stateBuffer.Bytes(), state)
	require.NoError(t, err)

	require.Equal(t, "pk_account_1", state.PublicKey)
	require.Equal(t, "display_name", state.DisplayName)
	require.Equal(t, true, state.ReplicateFlag)
}
