package bertyprotocol_test

import (
	"context"
	crand "crypto/rand"
	"testing"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/bertypushrelay"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type serviceMethods interface {
	GetContextGroupForID(id []byte) (*bertyprotocol.GroupContext, error)
	GetCurrentDevicePushConfig() (*protocoltypes.PushServiceReceiver, *protocoltypes.PushServer)
}

func createVirtualOtherPeerSecretsShareSecret(t testing.TB, ctx context.Context, membersStores []*bertyprotocol.MetadataStore) (*cryptoutil.OwnMemberDevice, *protocoltypes.DeviceSecret) {
	// Manually adding another member to the group
	otherMemberSK, _, err := crypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err)

	otherDeviceSK, _, err := crypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err)

	otherMD := cryptoutil.NewOwnMemberDevice(otherMemberSK, otherDeviceSK)
	ds, err := cryptoutil.NewDeviceSecret()
	require.NoError(t, err)

	for _, store := range membersStores {
		_, err = bertyprotocol.MetadataStoreAddDeviceToGroup(ctx, store, store.Group(), otherMD)
		require.NoError(t, err)

		memPK, err := store.MemberPK()
		require.NoError(t, err)

		_, err = bertyprotocol.MetadataStoreSendSecret(ctx, store, store.Group(), otherMD, memPK, ds)
		require.NoError(t, err)
	}

	time.Sleep(time.Millisecond * 200)

	return otherMD, ds
}

func Test_sealPushMessage_decryptOutOfStoreMessageEnv(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	_, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	tp, cancel := bertyprotocol.NewTestingProtocol(ctx, t, &bertyprotocol.TestingOpts{PushSK: devicePushSK}, nil)
	defer cancel()

	g, _, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	s := tp.Service

	gPK, err := g.GetPubKey()
	require.NoError(t, err)

	_, err = s.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{Group: g})
	require.NoError(t, err)

	gPKRaw, err := gPK.Raw()
	require.NoError(t, err)

	_, err = s.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gPKRaw})
	require.NoError(t, err)

	gc, err := s.(serviceMethods).GetContextGroupForID(g.PublicKey)
	require.NoError(t, err)

	otherMD, otherDS := createVirtualOtherPeerSecretsShareSecret(t, ctx, []*bertyprotocol.MetadataStore{gc.MetadataStore()})

	testPayload := []byte("test payload")

	envBytes, err := cryptoutil.SealEnvelope(testPayload, otherDS, otherMD.PrivateDevice(), g, nil)
	require.NoError(t, err)

	env, headers, err := cryptoutil.OpenEnvelopeHeaders(envBytes, g)
	require.NoError(t, err)

	oosMsgEnv, err := bertyprotocol.SealOutOfStoreMessageEnvelope(cid.Undef, env, headers, g)
	require.NoError(t, err)

	openedOOSMessage, err := bertypush.DecryptOutOfStoreMessageEnv(ctx, tp.GroupDatastore, oosMsgEnv, gPK)
	require.NoError(t, err)

	require.Equal(t, headers.Counter, openedOOSMessage.Counter)
	require.Equal(t, headers.DevicePK, openedOOSMessage.DevicePK)
	require.Equal(t, headers.Sig, openedOOSMessage.Sig)
	require.Equal(t, env.Message, openedOOSMessage.EncryptedPayload)
}

func TestService_PushReceive(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	devicePushPK, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	serverPushPK, serverPushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)

	pushServer, err := bertypushrelay.NewPushService(serverPushSK, []bertypushrelay.PushDispatcher{dispatcher}, nil)
	require.NoError(t, err)
	require.NotNil(t, pushServer)

	tp, cancel := bertyprotocol.NewTestingProtocol(ctx, t, &bertyprotocol.TestingOpts{PushSK: devicePushSK}, nil)
	defer cancel()

	g, gSK, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	s := tp.Service

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK[:],
		ServiceAddr: testutil.DummyPushServerAddr,
	}})
	require.NoError(t, err)

	_, err = s.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{Group: g})
	require.NoError(t, err)

	gPK, _ := gSK.GetPublic().Raw()
	require.NoError(t, err)

	_, err = s.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gPK})
	require.NoError(t, err)

	gc, err := s.(serviceMethods).GetContextGroupForID(g.PublicKey)
	require.NoError(t, err)

	otherMD, otherDS := createVirtualOtherPeerSecretsShareSecret(t, ctx, []*bertyprotocol.MetadataStore{gc.MetadataStore()})

	testPayload := []byte("test payload")
	devicePushToken := "token_test"

	envBytes, err := cryptoutil.SealEnvelope(testPayload, otherDS, otherMD.PrivateDevice(), g, nil)
	require.NoError(t, err)

	env, headers, err := cryptoutil.OpenEnvelopeHeaders(envBytes, g)
	require.NoError(t, err)

	dummyCID, err := cid.Parse("QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u")
	require.NoError(t, err)

	oosMsgEnv, err := bertyprotocol.SealOutOfStoreMessageEnvelope(dummyCID, env, headers, g)
	require.NoError(t, err)

	opaqueToken, err := bertyprotocol.PushSealTokenForServer(&protocoltypes.PushServiceReceiver{
		TokenType:          dispatcher.TokenType(),
		BundleID:           testutil.PushMockBundleID,
		Token:              []byte(devicePushToken),
		RecipientPublicKey: devicePushPK[:],
	}, &protocoltypes.PushServer{
		ServerKey:   serverPushPK[:],
		ServiceAddr: testutil.DummyPushServerAddr,
	})
	require.NoError(t, err)

	_, err = pushServer.Send(ctx, &pushtypes.PushServiceSend_Request{
		Envelope: oosMsgEnv,
		Receivers: []*pushtypes.PushServiceOpaqueReceiver{
			{
				OpaqueToken: opaqueToken.Token,
				ServiceAddr: opaqueToken.Server.ServiceAddr,
			},
		},
	})
	require.NoError(t, err)
	require.Equal(t, 1, dispatcher.Len([]byte(devicePushToken)))

	res, err := s.PushReceive(ctx, &protocoltypes.PushReceive_Request{
		Payload: dispatcher.Shift([]byte(devicePushToken)),
	})

	require.NoError(t, err)
	require.NotNil(t, res)
	require.Equal(t, testPayload, res.Cleartext)
	require.Equal(t, dummyCID.Bytes(), res.Message.CID)

	// TODO: check failure
}

func TestService_PushShareToken(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	devicePushPK, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	serverPushPK, _, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	tokenTestData := []byte("token_test_data_1")
	const nameTestPackage = "test.app"
	const serverAddr1 = "server1.test"

	tp, cancel := bertyprotocol.NewTestingProtocol(ctx, t, &bertyprotocol.TestingOpts{PushSK: devicePushSK}, nil)
	defer cancel()

	s := tp.Service

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK[:],
		ServiceAddr: serverAddr1,
	}})
	require.NoError(t, err)

	_, err = s.PushSetDeviceToken(ctx, &protocoltypes.PushSetDeviceToken_Request{
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
			BundleID:           nameTestPackage,
			Token:              tokenTestData,
			RecipientPublicKey: devicePushPK[:],
		},
	})
	require.NoError(t, err)

	g, gSK, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	_, err = s.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{Group: g})
	require.NoError(t, err)

	gPK, _ := gSK.GetPublic().Raw()
	require.NoError(t, err)

	_, err = s.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gPK})
	require.NoError(t, err)

	gc, err := s.(serviceMethods).GetContextGroupForID(g.PublicKey)
	require.NoError(t, err)

	pushToken, err := gc.MetadataStore().GetPushTokenForDevice(gc.DevicePubKey())
	require.Error(t, err)
	require.Nil(t, pushToken)

	_, err = s.PushShareToken(ctx, &protocoltypes.PushShareToken_Request{
		GroupPK: g.PublicKey,
		Server: &protocoltypes.PushServer{
			ServerKey:   serverPushPK[:],
			ServiceAddr: serverAddr1,
		},
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
			BundleID:           nameTestPackage,
			Token:              tokenTestData,
			RecipientPublicKey: devicePushPK[:],
		},
	})
	require.NoError(t, err)

	pushToken, err = gc.MetadataStore().GetPushTokenForDevice(gc.DevicePubKey())
	require.NoError(t, err)
	require.NotNil(t, pushToken)
	require.Equal(t, serverAddr1, pushToken.Server.ServiceAddr)
	require.Equal(t, serverPushPK[:], pushToken.Server.ServerKey)
}

func TestService_PushSetDeviceToken(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	devicePushPK, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	tokenTestData1 := []byte("token_test_data_1")
	tokenTestData2 := []byte("token_test_data_2")
	const nameTestPackage = "test.app"

	tp, cancel := bertyprotocol.NewTestingProtocol(ctx, t, &bertyprotocol.TestingOpts{PushSK: devicePushSK}, nil)
	defer cancel()

	s := tp.Service

	currentPush, _ := s.(serviceMethods).GetCurrentDevicePushConfig()
	require.Nil(t, currentPush)

	_, err = s.PushSetDeviceToken(ctx, &protocoltypes.PushSetDeviceToken_Request{
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType: pushtypes.PushServiceTokenType_PushTokenMQTT,
			BundleID:  nameTestPackage,
			Token:     tokenTestData1,
		},
	})
	require.NoError(t, err)

	currentPush, _ = s.(serviceMethods).GetCurrentDevicePushConfig()
	require.NotNil(t, currentPush)
	require.Equal(t, tokenTestData1, currentPush.Token)
	require.Equal(t, nameTestPackage, currentPush.BundleID)
	require.Equal(t, pushtypes.PushServiceTokenType_PushTokenMQTT, currentPush.TokenType)
	require.Equal(t, devicePushPK[:], currentPush.RecipientPublicKey)

	_, err = s.PushSetDeviceToken(ctx, &protocoltypes.PushSetDeviceToken_Request{
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType: pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
			BundleID:  nameTestPackage,
			Token:     tokenTestData2,
		},
	})
	require.NoError(t, err)

	currentPush, _ = s.(serviceMethods).GetCurrentDevicePushConfig()
	require.NotNil(t, currentPush)
	require.Equal(t, tokenTestData2, currentPush.Token)
	require.Equal(t, nameTestPackage, currentPush.BundleID)
	require.Equal(t, pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService, currentPush.TokenType)
	require.Equal(t, devicePushPK[:], currentPush.RecipientPublicKey)
}

func TestService_PushSetServer(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	const serverAddr1 = "server1.test"
	const serverAddr2 = "server2.test"

	_, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	serverPushPK1, _, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	serverPushPK2, _, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	tp, cancel := bertyprotocol.NewTestingProtocol(ctx, t, &bertyprotocol.TestingOpts{PushSK: devicePushSK}, nil)
	defer cancel()

	s := tp.Service

	_, currentPush := s.(serviceMethods).GetCurrentDevicePushConfig()
	require.Nil(t, currentPush)

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK1[:],
		ServiceAddr: serverAddr1,
	}})
	require.NoError(t, err)

	_, currentPush = s.(serviceMethods).GetCurrentDevicePushConfig()
	require.NotNil(t, currentPush)
	require.Equal(t, serverPushPK1[:], currentPush.ServerKey)
	require.Equal(t, serverAddr1, currentPush.ServiceAddr)

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK2[:],
		ServiceAddr: serverAddr2,
	}})
	require.NoError(t, err)

	_, currentPush = s.(serviceMethods).GetCurrentDevicePushConfig()
	require.NotNil(t, currentPush)
	require.Equal(t, serverPushPK2[:], currentPush.ServerKey)
	require.Equal(t, serverAddr2, currentPush.ServiceAddr)

	// FIXME: Should we add a way to clear the push server used with the current device?
}
