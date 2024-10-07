package bertymessenger

import (
	"context"
	crand "crypto/rand"
	"errors"
	"fmt"
	"io"
	"testing"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/nacl/box"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"
	"moul.io/u"

	sqlite "berty.tech/berty/v2/go/internal/gorm-sqlcipher"
	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/bertypushrelay"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	weshnet "berty.tech/weshnet/v2"
	"berty.tech/weshnet/v2/pkg/testutil"
)

func TestService_PushReceive(t *testing.T) {
	t.Skip("TODO: remove duplicate ActivateGroup before running this test")
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pushDevicePK, pushDeviceSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	// pushServerPK, pushServerSK, err := box.GenerateKey(crand.Reader)
	// require.NoError(t, err)

	devicePushToken := []byte("token_test")
	const payloadMessage = "test message"

	ts, cleanup, _ := initTestingService(ctx, t, pushDeviceSK)
	defer cleanup()

	// setup the pushrelay server
	dispatcher := pushtypes.NewPushMockedDispatcher(pushtypes.PushMockBundleID)
	dispatchers := []bertypushrelay.PushDispatcher{dispatcher}
	_, pushServerPK, pushHost, cancel := bertypushrelay.PushServerForTests(ctx, t, dispatchers, ts.Logger.Named("pushrelay"))
	defer cancel()

	// subscribe to event stream
	// create a sub context to be able to closing the GRPC stream prior to closing the service
	eventCtx, eventCancel := context.WithCancel(ctx)
	defer eventCancel()
	events, err := ts.Client.EventStream(eventCtx, &messengertypes.EventStream_Request{ShallowAmount: -1})
	require.NoError(t, err)

	// put received events in a channel
	c := make(chan *messengertypes.EventStream_Reply)
	go func() {
		defer close(c)
		for {
			event, err := events.Recv()
			if err != nil {
				if err != io.EOF && errors.Is(err, context.Canceled) {
					assert.NoError(t, err)
				}
				return
			}
			c <- event
		}
	}()

	t.Log("creating multimember group")
	_, err = ts.Client.ConversationCreate(ctx, &messengertypes.ConversationCreate_Request{DisplayName: "conv"})
	require.NoError(t, err)

	conversation := &messengertypes.Conversation{}
	// ConversationCreate sends 3 events
	for i := 0; i < 2; i++ {
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeConversationUpdated)
		require.NoError(t, err)
		conversationUpdated, ok := message.(*messengertypes.StreamEvent_ConversationUpdated)
		require.True(t, ok)

		conversation = conversationUpdated.GetConversation()
		require.NotNil(t, conversation.DisplayName)
		require.Equal(t, conversation.DisplayName, "conv")
		t.Log("conversation update event received")
	}

	t.Log("setting push server")
	_, err = ts.Client.PushSetServer(ctx, &messengertypes.PushSetServer_Request{Server: &messengertypes.PushServer{
		Key:  pushServerPK[:],
		Addr: pushHost,
	}})
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeAccountUpdated)
		require.NoError(t, err)
		accountUpdated, ok := message.(*messengertypes.StreamEvent_AccountUpdated)
		require.True(t, ok)

		account := accountUpdated.GetAccount()
		require.NotNil(t, account.PushServerRecords)
		require.Len(t, account.PushServerRecords, 1)
		localServer1 := account.PushServerRecords[0]
		require.Equal(t, localServer1.ServerAddr, pushHost)
		require.Equal(t, localServer1.ServerKey, pushServerPK[:])
		t.Log("push server event received")
	}

	t.Log("setting push device token")
	// For testing purposes, we must use a PushTokenMQTT token type (default type used in the pushrelay dispatcher)
	_, err = ts.Client.PushSetDeviceToken(ctx, &messengertypes.PushSetDeviceToken_Request{
		Receiver: &pushtypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenMQTT,
			BundleId:           pushtypes.PushMockBundleID,
			Token:              devicePushToken,
			RecipientPublicKey: pushDevicePK[:],
		},
	})
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeAccountUpdated)
		require.NoError(t, err)
		accountUpdated, ok := message.(*messengertypes.StreamEvent_AccountUpdated)
		require.True(t, ok)

		account := accountUpdated.GetAccount()
		require.NotNil(t, account.PushDeviceToken)
		require.Equal(t, account.PushDeviceToken.Token, devicePushToken)
		t.Log("push device token event received")
	}

	time.Sleep(1 * time.Second)
	t.Log("share the local member push token in the conversation")
	_, err = ts.Client.PushShareTokenForConversation(ctx, &messengertypes.PushShareTokenForConversation_Request{
		ConversationPk: conversation.PublicKey,
	})
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeConversationUpdated)
		require.NoError(t, err)
		conversationUpdated, ok := message.(*messengertypes.StreamEvent_ConversationUpdated)
		require.True(t, ok)

		conversation = conversationUpdated.GetConversation()
		require.NotNil(t, conversation.DisplayName)
		require.Equal(t, conversation.DisplayName, "conv")
		require.NotNil(t, conversation.PushMemberTokens)
		require.Len(t, conversation.PushMemberTokens, 1)
		pushToken := conversation.PushMemberTokens[0]
		require.Equal(t, pushHost, pushToken.ServerAddr)
		require.Equal(t, pushServerPK[:], pushToken.ServerKey)
		require.NotNil(t, pushToken.Token)
		t.Log("conversation update event received for PushShareToken")
	}

	t.Log("send a message and its push notification")
	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{Body: payloadMessage})
	require.NoError(t, err)

	interactReply, err := ts.Service.Interact(ctx, &messengertypes.Interact_Request{
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		Payload:               payload,
		ConversationPublicKey: conversation.PublicKey,
	})
	require.NoError(t, err)

	messageCID, err := cid.Parse(interactReply.GetCid())
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeConversationUpdated)
		require.NoError(t, err)
		conversationUpdated, ok := message.(*messengertypes.StreamEvent_ConversationUpdated)
		require.True(t, ok)

		localConversation := conversationUpdated.GetConversation()
		require.Equal(t, conversation.PublicKey, localConversation.PublicKey)
		t.Log("user message event received")
	}

	t.Log("check if we received a push notification")
	res, err := ts.Client.PushReceive(ctx, &messengertypes.PushReceive_Request{
		Payload: dispatcher.Shift([]byte(devicePushToken)),
	})

	require.NoError(t, err)
	require.NotNil(t, res)
	am := &messengertypes.AppMessage{}
	err = proto.Unmarshal(res.Data.ProtocolData.Cleartext, am)
	require.NoError(t, err)
	um := &messengertypes.AppMessage_UserMessage{}
	err = proto.Unmarshal(am.Payload, um)
	require.NoError(t, err)
	require.Equal(t, messageCID.Bytes(), res.Data.ProtocolData.Message.Cid)
}

func TestService_PushShareTokenForConversation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pushDevicePK, pushDeviceSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	pushServerPK, pushServerSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	tokenTestData := []byte("token_test_data_1")
	const nameTestPackage = "test.app"
	const serverAddr1 = "server1.test"

	ts, cleanup, dbWrapper := initTestingService(ctx, t, pushDeviceSK)
	defer cleanup()

	// subscribe to event stream
	// create a sub context to be able to closing the GRPC stream prior to closing the service
	eventCtx, eventCancel := context.WithCancel(ctx)
	defer eventCancel()
	events, err := ts.Client.EventStream(eventCtx, &messengertypes.EventStream_Request{ShallowAmount: -1})
	require.NoError(t, err)

	// put received events in a channel
	c := make(chan *messengertypes.EventStream_Reply)
	go func() {
		defer close(c)
		for {
			event, err := events.Recv()
			if err != nil {
				if err != io.EOF && errors.Is(err, context.Canceled) {
					assert.NoError(t, err)
				}
				return
			}
			c <- event
		}
	}()

	t.Log("setting push server")
	_, err = ts.Client.PushSetServer(ctx, &messengertypes.PushSetServer_Request{Server: &messengertypes.PushServer{
		Key:  pushServerPK[:],
		Addr: serverAddr1,
	}})
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeAccountUpdated)
		require.NoError(t, err)
		accountUpdated, ok := message.(*messengertypes.StreamEvent_AccountUpdated)
		require.True(t, ok)

		account := accountUpdated.GetAccount()
		require.NotNil(t, account.PushServerRecords)
		require.Len(t, account.PushServerRecords, 1)
		localServer1 := account.PushServerRecords[0]
		require.Equal(t, localServer1.ServerAddr, serverAddr1)
		require.Equal(t, localServer1.ServerKey, pushServerPK[:])
		t.Log("push server event received")
	}

	t.Log("setting push device token")
	_, err = ts.Client.PushSetDeviceToken(ctx, &messengertypes.PushSetDeviceToken_Request{
		Receiver: &pushtypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
			BundleId:           nameTestPackage,
			Token:              tokenTestData,
			RecipientPublicKey: pushDevicePK[:],
		},
	})
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeAccountUpdated)
		require.NoError(t, err)
		accountUpdated, ok := message.(*messengertypes.StreamEvent_AccountUpdated)
		require.True(t, ok)

		account := accountUpdated.GetAccount()
		require.NotNil(t, account.PushDeviceToken)
		require.Equal(t, account.PushDeviceToken.Token, tokenTestData)
		t.Log("push device token event received")
	}

	t.Log("creating multimember group")
	_, err = ts.Service.ConversationCreate(ctx, &messengertypes.ConversationCreate_Request{DisplayName: "conv"})
	require.NoError(t, err)

	conversation := &messengertypes.Conversation{}
	// ConversationCreate sends 2 events
	for i := 0; i < 2; i++ {
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeConversationUpdated)
		require.NoError(t, err)
		conversationUpdated, ok := message.(*messengertypes.StreamEvent_ConversationUpdated)
		require.True(t, ok)

		conversation = conversationUpdated.GetConversation()
		require.NotNil(t, conversation.DisplayName)
		require.Equal(t, conversation.DisplayName, "conv")
		t.Log("conversation update event received")
	}

	t.Log("check that the conversation has no member push token")
	pushTokens, err := dbWrapper.GetPushMemberTokens(conversation.PublicKey, conversation.LocalDevicePublicKey)
	require.Error(t, err)
	require.Nil(t, pushTokens)

	t.Log("share the local member push token in the conversation")
	_, err = ts.Client.PushShareTokenForConversation(ctx, &messengertypes.PushShareTokenForConversation_Request{
		ConversationPk: conversation.PublicKey,
	})
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeConversationUpdated)
		require.NoError(t, err)
		conversationUpdated, ok := message.(*messengertypes.StreamEvent_ConversationUpdated)
		require.True(t, ok)

		conversation = conversationUpdated.GetConversation()
		require.NotNil(t, conversation.DisplayName)
		require.Equal(t, conversation.DisplayName, "conv")
		require.NotNil(t, conversation.PushMemberTokens)
		require.Len(t, conversation.PushMemberTokens, 1)
		pushToken := conversation.PushMemberTokens[0]
		require.Equal(t, serverAddr1, pushToken.ServerAddr)
		require.Equal(t, pushServerPK[:], pushToken.ServerKey)
		require.NotNil(t, pushToken.Token)

		receiverBytes, ok := box.OpenAnonymous(nil, pushToken.Token, pushServerPK, pushServerSK)
		require.True(t, ok)
		pushReceiver := &pushtypes.PushServiceReceiver{}
		err = proto.Unmarshal(receiverBytes, pushReceiver)
		require.NoError(t, err)
		require.Equal(t, pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService, pushReceiver.TokenType)
		require.Equal(t, nameTestPackage, pushReceiver.BundleId)
		require.Equal(t, tokenTestData, pushReceiver.Token)
		require.Equal(t, pushDevicePK[:], pushReceiver.RecipientPublicKey)
		t.Log("conversation update event received")
	}

	t.Log("check that the conversation has the member push token")
	pushTokens, err = dbWrapper.GetPushMemberTokens(conversation.PublicKey, conversation.LocalDevicePublicKey)
	require.NoError(t, err)
	require.NotNil(t, pushTokens)
	require.Equal(t, 1, len(pushTokens))
	require.Equal(t, serverAddr1, pushTokens[0].ServerAddr)
	require.Equal(t, pushServerPK[:], pushTokens[0].ServerKey)
	require.NotNil(t, pushTokens[0].Token)

	receiverBytes, ok := box.OpenAnonymous(nil, pushTokens[0].Token, pushServerPK, pushServerSK)
	require.True(t, ok)
	pushReceiver := &pushtypes.PushServiceReceiver{}
	err = proto.Unmarshal(receiverBytes, pushReceiver)
	require.NoError(t, err)
	require.Equal(t, pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService, pushReceiver.TokenType)
	require.Equal(t, nameTestPackage, pushReceiver.BundleId)
	require.Equal(t, tokenTestData, pushReceiver.Token)
	require.Equal(t, pushDevicePK[:], pushReceiver.RecipientPublicKey)
}

func TestService_PushSetDeviceToken(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	devicePushPK, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	tokenTestData1 := []byte("token_test_data_1")
	tokenTestData2 := []byte("token_test_data_2")
	const nameTestPackage = "test.app"

	ts, cleanup, dbWrapper := initTestingService(ctx, t, devicePushSK)
	defer cleanup()

	t.Log("get service account")
	account, err := ts.Client.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	require.NoError(t, err)
	require.NotNil(t, account)
	accountPK := account.Account.PublicKey
	require.NoError(t, err)
	t.Logf("account pk: %s", accountPK)

	// subscribe to event stream
	// create a sub context to be able to closing the GRPC stream prior to closing the service
	eventCtx, eventCancel := context.WithCancel(ctx)
	defer eventCancel()
	events, err := ts.Client.EventStream(eventCtx, &messengertypes.EventStream_Request{ShallowAmount: -1})
	require.NoError(t, err)

	// put received events in a channel
	c := make(chan *messengertypes.EventStream_Reply)
	go func() {
		defer close(c)

		for {
			event, err := events.Recv()
			if err != nil {
				if err != io.EOF && errors.Is(err, context.Canceled) {
					assert.NoError(t, err)
				}
				return
			}
			c <- event
		}
	}()

	t.Log("check if no device token is set")
	currentPush, err := dbWrapper.GetPushDeviceToken(accountPK)
	require.Nil(t, currentPush)

	t.Log("set device token")
	_, err = ts.Client.PushSetDeviceToken(ctx, &messengertypes.PushSetDeviceToken_Request{
		Receiver: &pushtypes.PushServiceReceiver{
			TokenType: pushtypes.PushServiceTokenType_PushTokenMQTT,
			BundleId:  nameTestPackage,
			Token:     tokenTestData1,
		},
	})
	require.NoError(t, err)
	t.Log("device token set")

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeAccountUpdated)
		require.NoError(t, err)
		accountUpdated, ok := message.(*messengertypes.StreamEvent_AccountUpdated)
		require.True(t, ok)

		account := accountUpdated.GetAccount()
		require.NotNil(t, account.PushDeviceToken)
		require.Equal(t, tokenTestData1, account.PushDeviceToken.Token)
		t.Log("push device token event received")
	}

	t.Log("check if device token is set")
	currentPush, err = dbWrapper.GetPushDeviceToken(accountPK)
	require.NoError(t, err)
	require.NotNil(t, currentPush)
	require.Equal(t, tokenTestData1, currentPush.Token)
	require.Equal(t, nameTestPackage, currentPush.BundleId)
	require.Equal(t, pushtypes.PushServiceTokenType_PushTokenMQTT, currentPush.TokenType)
	require.Equal(t, devicePushPK[:], currentPush.PublicKey)
	t.Log("device token is set")

	t.Log("try to update device token")
	_, err = ts.Client.PushSetDeviceToken(ctx, &messengertypes.PushSetDeviceToken_Request{
		Receiver: &pushtypes.PushServiceReceiver{
			TokenType: pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
			BundleId:  nameTestPackage,
			Token:     tokenTestData2,
		},
	})
	require.NoError(t, err)
	t.Log("device token updated")

	t.Log("check if device token is not updated")
	currentPush, err = dbWrapper.GetPushDeviceToken(accountPK)
	require.NoError(t, err)
	require.NotNil(t, currentPush)
	require.Equal(t, tokenTestData1, currentPush.Token)
	require.Equal(t, nameTestPackage, currentPush.BundleId)
	require.Equal(t, pushtypes.PushServiceTokenType_PushTokenMQTT, currentPush.TokenType)
	require.Equal(t, devicePushPK[:], currentPush.PublicKey)
}

func TestService_PushSetServer(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	const serverAddr1 = "server1.test"
	const serverAddr2 = "server2.test"

	pushServer1PK, _, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	pushServer2PK, _, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	ts, cleanup, dbWrapper := initTestingService(ctx, t, nil)
	defer cleanup()

	t.Log("get service account")
	account, err := ts.Client.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	require.NoError(t, err)
	require.NotNil(t, account)
	accountPK := account.Account.PublicKey
	require.NoError(t, err)
	t.Logf("account pk: %s", accountPK)

	// subscribe to event stream
	// create a sub context to be able to closing the GRPC stream prior to closing the service
	eventCtx, eventCancel := context.WithCancel(ctx)
	defer eventCancel()
	events, err := ts.Client.EventStream(eventCtx, &messengertypes.EventStream_Request{ShallowAmount: -1})
	require.NoError(t, err)

	// put received events in a channel
	c := make(chan *messengertypes.EventStream_Reply)

	go func() {
		defer close(c)
		for {
			event, err := events.Recv()
			if err != nil {
				if err != io.EOF && errors.Is(err, context.Canceled) {
					assert.NoError(t, err)
				}
				return
			}
			c <- event
		}
	}()

	t.Log("check if no push server is set")
	currentServers, err := dbWrapper.GetPushServerRecords(accountPK)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrNotFound))
	require.Nil(t, currentServers)

	t.Log("set push server")
	_, err = ts.Client.PushSetServer(ctx, &messengertypes.PushSetServer_Request{
		Server: &messengertypes.PushServer{
			Addr: serverAddr1,
			Key:  pushServer1PK[:],
		},
	})
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeAccountUpdated)
		require.NoError(t, err)
		accountUpdated, ok := message.(*messengertypes.StreamEvent_AccountUpdated)
		require.True(t, ok)

		account := accountUpdated.GetAccount()
		require.NotNil(t, account.PushServerRecords)
		require.Len(t, account.PushServerRecords, 1)
		localServer1 := account.PushServerRecords[0]
		require.Equal(t, localServer1.ServerAddr, serverAddr1)
		require.Equal(t, localServer1.ServerKey, pushServer1PK[:])
		t.Log("push server event received")
	}

	{
		t.Log("check if the push server is set")
		currentPushServer, err := dbWrapper.GetPushServerRecord(accountPK, serverAddr1)
		require.NoError(t, err)
		require.NotNil(t, currentPushServer)
		require.Equal(t, pushServer1PK[:], currentPushServer.ServerKey)
	}

	t.Log("try update push server")
	_, err = ts.Client.PushSetServer(ctx, &messengertypes.PushSetServer_Request{
		Server: &messengertypes.PushServer{
			Addr: serverAddr1,
			Key:  pushServer2PK[:],
		},
	})
	require.NoError(t, err)

	{
		t.Log("check if push server is not updated")
		currentPushServer, err := dbWrapper.GetPushServerRecord(accountPK, serverAddr1)
		require.NoError(t, err)
		require.NotNil(t, currentPushServer)
		require.Equal(t, pushServer1PK[:], currentPushServer.ServerKey)
	}

	t.Log("set new push server")
	_, err = ts.Client.PushSetServer(ctx, &messengertypes.PushSetServer_Request{
		Server: &messengertypes.PushServer{
			Addr: serverAddr2,
			Key:  pushServer2PK[:],
		},
	})
	require.NoError(t, err)

	{
		// waiting for the local propagation
		message, err := blockUntilEventOfType(t, c, messengertypes.StreamEvent_TypeAccountUpdated)
		require.NoError(t, err)
		accountUpdated, ok := message.(*messengertypes.StreamEvent_AccountUpdated)
		require.True(t, ok)

		account := accountUpdated.GetAccount()
		require.NotNil(t, account.PushServerRecords)
		require.Len(t, account.PushServerRecords, 2)
		localServer1 := account.PushServerRecords[1]
		require.Equal(t, localServer1.ServerAddr, serverAddr2)
		require.Equal(t, localServer1.ServerKey, pushServer2PK[:])
		t.Log("push server event received")
	}

	{
		t.Log("check if device the new push server is created")
		currentPushServer, err := dbWrapper.GetPushServerRecord(accountPK, serverAddr2)
		require.NoError(t, err)
		require.NotNil(t, currentPushServer)
		require.Equal(t, pushServer2PK[:], currentPushServer.ServerKey)
	}
}

func Test_getPushTargetsByServer(t *testing.T) {
	convPK := "conv_pk"
	member1PK := "member1_pk"
	device1PK := "device1_pk"
	device11PK := "device11_pk"
	member2PK := "member2_pk"
	device2PK := "device2_pk"
	device21PK := "device21_pk"
	pushServer1Addr := "push_server1_addr"
	pushServer1PK := []byte("push_server1_pk")
	pushServer2Addr := "push_server2_addr"
	pushServer2PK := []byte("push_server2_pk")
	pushDevice1Token := []byte("push_device1_token")
	pushDevice2Token := []byte("push_device2_token")
	tokenID11 := messengerutil.MakeSharedPushIdentifier(pushServer1PK, pushDevice1Token)
	tokenID21 := messengerutil.MakeSharedPushIdentifier(pushServer2PK, pushDevice1Token)
	tokenID22 := messengerutil.MakeSharedPushIdentifier(pushServer2PK, pushDevice2Token)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	db, _, dispose := messengerdb.GetInMemoryTestDB(t, messengerdb.GetInMemoryTestDBOptsStdOutLogger)
	defer dispose()

	s := &service{
		logger: logger,
		db:     db,
	}

	// create a new conversation
	conv := &messengertypes.Conversation{
		PublicKey: convPK,
		Type:      messengertypes.Conversation_MultiMemberType,
		Members: []*messengertypes.Member{
			{
				PublicKey:             member1PK,
				ConversationPublicKey: convPK,
				Devices: []*messengertypes.Device{
					{
						PublicKey:       device1PK,
						MemberPublicKey: member1PK,
					},
					{
						PublicKey:       device11PK,
						MemberPublicKey: member1PK,
					},
				},
			},
			{
				PublicKey:             member2PK,
				ConversationPublicKey: convPK,
				Devices: []*messengertypes.Device{
					{
						PublicKey:       device2PK,
						MemberPublicKey: member2PK,
					},
					{
						PublicKey:       device21PK,
						MemberPublicKey: member2PK,
					},
				},
			},
		},
	}

	// Update database
	_, err := s.db.UpdateConversation(conv)
	require.NoError(t, err)

	// Share member1 device1 token on server1
	err = s.db.SavePushMemberToken(tokenID11, convPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: device1PK,
			Server: &messengertypes.PushServer{
				Addr: pushServer1Addr,
				Key:  pushServer1PK,
			},
			Token: pushDevice1Token,
		},
	})
	require.NoError(t, err)

	// Share member2 device1 token on server1
	err = s.db.SavePushMemberToken(tokenID21, convPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: device2PK,
			Server: &messengertypes.PushServer{
				Addr: pushServer1Addr,
				Key:  pushServer1PK,
			},
			Token: pushDevice2Token,
		},
	})
	require.NoError(t, err)

	// Share member2 device1 token on server2
	err = s.db.SavePushMemberToken(tokenID22, convPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: device2PK,
			Server: &messengertypes.PushServer{
				Addr: pushServer2Addr,
				Key:  pushServer2PK,
			},
			Token: pushDevice2Token,
		},
	})
	require.NoError(t, err)

	// get push member token by asking for member1 device1
	targets, memberDevices, err := s.getPushTargetsByServer(convPK, []*messengertypes.MemberWithDevices{
		{
			MemberPk: member1PK,
			DevicesPks: []string{
				device1PK,
			},
		},
	})
	require.NoError(t, err)
	require.Len(t, targets, 1)
	require.Len(t, targets[pushServer1Addr], 1)
	require.Equal(t, pushDevice1Token, targets[pushServer1Addr][0].OpaqueToken)
	require.Len(t, memberDevices, 1)
	require.Equal(t, member1PK, memberDevices[0].MemberPk)
	require.Len(t, memberDevices[0].DevicesPks, 1)
	require.Equal(t, device1PK, memberDevices[0].DevicesPks[0])

	// get push member token by asking for member1 devices
	targets, memberDevices, err = s.getPushTargetsByServer(convPK, []*messengertypes.MemberWithDevices{
		{
			MemberPk: member1PK,
		},
	})
	require.NoError(t, err)
	require.Len(t, targets, 1)
	require.Len(t, targets[pushServer1Addr], 1)
	require.Equal(t, pushDevice1Token, targets[pushServer1Addr][0].OpaqueToken)
	require.Len(t, memberDevices, 1)
	require.Equal(t, member1PK, memberDevices[0].MemberPk)
	require.Len(t, memberDevices[0].DevicesPks, 2)
	require.Equal(t, device1PK, memberDevices[0].DevicesPks[0])
	require.Equal(t, device11PK, memberDevices[0].DevicesPks[1])

	// get push member token by asking for all devices of the conversation
	targets, memberDevices, err = s.getPushTargetsByServer(convPK, []*messengertypes.MemberWithDevices{})
	require.NoError(t, err)
	require.Len(t, targets, 2)
	require.Len(t, targets[pushServer1Addr], 2)
	require.Equal(t, pushDevice1Token, targets[pushServer1Addr][0].OpaqueToken)
	require.Equal(t, pushDevice2Token, targets[pushServer1Addr][1].OpaqueToken)
	require.Len(t, targets[pushServer2Addr], 1)
	require.Equal(t, pushDevice2Token, targets[pushServer2Addr][0].OpaqueToken)
	require.Len(t, memberDevices, 2)
	require.Equal(t, member1PK, memberDevices[0].MemberPk)
	require.Equal(t, member2PK, memberDevices[1].MemberPk)
	require.Len(t, memberDevices[0].DevicesPks, 2)
	require.Equal(t, device1PK, memberDevices[0].DevicesPks[0])
	require.Equal(t, device11PK, memberDevices[0].DevicesPks[1])
	require.Len(t, memberDevices[1].DevicesPks, 2)
	require.Equal(t, device2PK, memberDevices[1].DevicesPks[0])
	require.Equal(t, device21PK, memberDevices[1].DevicesPks[1])
}

func initTestingService(ctx context.Context, t *testing.T, devicePushSK *[32]byte) (*TestingService, func(), *messengerdb.DBWrapper) {
	cleanup := func() {}

	// init messenger and weshnet
	logger, cleanup := testutil.Logger(t)

	tp, cancel := weshnet.NewTestingProtocol(ctx, t, &weshnet.TestingOpts{Logger: logger}, nil)
	cleanup = u.CombineFuncs(func() {
		cancel()
	}, cleanup)

	db, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:memdb%d?mode=memory&cache=shared", time.Now().UnixNano())), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	require.NoError(t, err)
	cleanup = u.CombineFuncs(func() {
		sqlDB, err := db.DB()
		require.NoError(t, err)
		sqlDB.Close()
	}, cleanup)
	dbWrapper := messengerdb.NewDBWrapper(db, logger)

	ts, cleanupService := NewTestingService(ctx, t, &TestingServiceOpts{
		Logger: logger,
		Client: tp.Client,
		DB:     db,
		PushSK: devicePushSK,
	})
	cleanup = u.CombineFuncs(func() {
		cleanupService()
	}, cleanup)

	// FIXME(d4ryl00): need to wait because GroupMetadataList sends two times the same event if the underlying method ListEvents has not finished
	time.Sleep(500 * time.Millisecond)

	return ts, cleanup, dbWrapper
}

func blockUntilEventOfType(t *testing.T, c chan *messengertypes.EventStream_Reply, eventType messengertypes.StreamEvent_Type) (proto.Message, error) {
	t.Log("waiting for receiving event")

	// wait for the event or timeout
	for {
		select {
		case event := <-c:
			require.NotNil(t, event)

			if eventType != event.GetEvent().GetType() {
				continue
			}

			t.Log("received event")

			e := event.GetEvent()
			payload, err := e.UnmarshalPayload()
			require.NoError(t, err)

			return payload, nil
		case <-time.After(3 * time.Second):
			return nil, errors.New("timeout waiting for event")
		}
	}
}
