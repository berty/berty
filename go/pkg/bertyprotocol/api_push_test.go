package bertyprotocol

import (
	"context"
	crand "crypto/rand"
	"testing"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func createVirtualOtherPeerSecretsShareSecret(t testing.TB, ctx context.Context, membersStores []*metadataStore) (*ownMemberDevice, *protocoltypes.DeviceSecret) {
	// Manually adding another member to the group
	otherMemberSK, _, err := crypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err)

	otherDeviceSK, _, err := crypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err)

	otherMD := &ownMemberDevice{
		member: otherMemberSK,
		device: otherDeviceSK,
	}

	ds, err := newDeviceSecret()
	require.NoError(t, err)

	for _, store := range membersStores {
		_, err = metadataStoreAddDeviceToGroup(ctx, store, store.g, otherMD)
		require.NoError(t, err)

		memDev, err := store.devKS.MemberDeviceForGroup(store.g)
		require.NoError(t, err)

		_, err = metadataStoreSendSecret(ctx, store, store.g, otherMD, memDev.member.GetPublic(), ds)
		require.NoError(t, err)
	}

	time.Sleep(time.Millisecond * 20)

	return otherMD, ds
}

func Test_sealPushMessage_decryptOutOfStoreMessageEnv(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	_, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	tp, cancel := NewTestingProtocol(ctx, t, nil, nil)
	defer cancel()

	g, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	s, ok := tp.Service.(*service)
	require.True(t, ok)

	s.pushHandler.pushKey = devicePushSK

	gPK, err := g.GetPubKey()
	require.NoError(t, err)

	_, err = s.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{Group: g})
	require.NoError(t, err)

	err = s.activateGroup(gPK, false)
	require.NoError(t, err)

	gc, err := s.getContextGroupForID(g.PublicKey)
	require.NoError(t, err)

	otherMD, otherDS := createVirtualOtherPeerSecretsShareSecret(t, ctx, []*metadataStore{gc.metadataStore})

	testPayload := []byte("test payload")

	envBytes, err := sealEnvelopeInternal(ctx, testPayload, otherDS, otherMD.device, g, nil)
	require.NoError(t, err)

	env, headers, err := openEnvelopeHeaders(envBytes, g)
	require.NoError(t, err)

	oosMsgEnv, err := sealOutOfStoreMessageEnveloppe(cid.Undef, env, headers, g)
	require.NoError(t, err)

	openedOOSMessage, err := decryptOutOfStoreMessageEnv(s.groupDatastore, oosMsgEnv, gPK)
	require.NoError(t, err)

	require.Equal(t, headers.Counter, openedOOSMessage.Counter)
	require.Equal(t, headers.DevicePK, openedOOSMessage.DevicePK)
	require.Equal(t, headers.Sig, openedOOSMessage.Sig)
	require.Equal(t, env.Message, openedOOSMessage.EncryptedPayload)
}

func TestService_PushReceive(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	const serverAddr = "server.test"

	devicePushPK, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	serverPushPK, serverPushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	dispatcher := &pushMockedDispatcher{
		bundleID: pushMockBundleID,
		queue:    map[string][][]byte{},
	}

	pushServer, err := NewPushService(serverPushSK, []PushDispatcher{dispatcher}, nil)
	require.NoError(t, err)

	tp, cancel := NewTestingProtocol(ctx, t, nil, nil)
	defer cancel()

	g, gSK, err := NewGroupMultiMember()
	require.NoError(t, err)

	s, ok := tp.Service.(*service)
	require.True(t, ok)

	s.pushHandler.pushKey = devicePushSK

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK[:],
		ServiceAddr: serverAddr,
	}})
	require.NoError(t, err)

	_, err = s.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{Group: g})
	require.NoError(t, err)

	err = s.activateGroup(gSK.GetPublic(), false)
	require.NoError(t, err)

	gc, err := s.getContextGroupForID(g.PublicKey)
	require.NoError(t, err)

	otherMD, otherDS := createVirtualOtherPeerSecretsShareSecret(t, ctx, []*metadataStore{gc.metadataStore})

	testPayload := []byte("test payload")
	devicePushToken := "token_test"

	envBytes, err := sealEnvelopeInternal(ctx, testPayload, otherDS, otherMD.device, g, nil)
	require.NoError(t, err)

	env, headers, err := openEnvelopeHeaders(envBytes, g)
	require.NoError(t, err)

	dummyCID, err := cid.Parse("QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u")
	require.NoError(t, err)

	oosMsgEnv, err := sealOutOfStoreMessageEnveloppe(dummyCID, env, headers, g)
	require.NoError(t, err)

	opaqueToken, err := pushSealTokenForServer(&protocoltypes.PushServiceReceiver{
		TokenType:          dispatcher.TokenType(),
		BundleID:           pushMockBundleID,
		Token:              []byte(devicePushToken),
		RecipientPublicKey: devicePushPK[:],
	}, &protocoltypes.PushServer{
		ServerKey:   serverPushPK[:],
		ServiceAddr: serverAddr,
	})
	require.NoError(t, err)

	_, err = pushServer.Send(ctx, &protocoltypes.PushServiceSend_Request{
		Envelope: oosMsgEnv,
		Receivers: []*protocoltypes.PushServiceOpaqueReceiver{
			{
				OpaqueToken: opaqueToken.Token,
				ServiceAddr: opaqueToken.Server.ServiceAddr,
			},
		},
	})
	require.NoError(t, err)
	require.Len(t, dispatcher.queue, 1)
	require.Len(t, dispatcher.queue[devicePushToken], 1)

	res, err := s.PushReceive(ctx, &protocoltypes.PushReceive_Request{
		Payload: dispatcher.queue[devicePushToken][0],
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

	tp, cancel := NewTestingProtocol(ctx, t, nil, nil)
	defer cancel()

	s, ok := tp.Service.(*service)
	require.True(t, ok)

	s.pushHandler.pushKey = devicePushSK

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK[:],
		ServiceAddr: serverAddr1,
	}})
	require.NoError(t, err)

	_, err = s.PushSetDeviceToken(ctx, &protocoltypes.PushSetDeviceToken_Request{
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType:          protocoltypes.PushTokenApplePushNotificationService,
			BundleID:           nameTestPackage,
			Token:              tokenTestData,
			RecipientPublicKey: devicePushPK[:],
		},
	})
	require.NoError(t, err)

	g, gSK, err := NewGroupMultiMember()
	require.NoError(t, err)

	_, err = s.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{Group: g})
	require.NoError(t, err)

	err = s.activateGroup(gSK.GetPublic(), false)
	require.NoError(t, err)

	gc, err := s.getContextGroupForID(g.PublicKey)
	require.NoError(t, err)

	pushToken, err := gc.metadataStore.getPushTokenForDevice(gc.DevicePubKey())
	require.Error(t, err)
	require.Nil(t, pushToken)

	_, err = s.PushShareToken(ctx, &protocoltypes.PushShareToken_Request{
		GroupPK: g.PublicKey,
		Server: &protocoltypes.PushServer{
			ServerKey:   serverPushPK[:],
			ServiceAddr: serverAddr1,
		},
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType:          protocoltypes.PushTokenApplePushNotificationService,
			BundleID:           nameTestPackage,
			Token:              tokenTestData,
			RecipientPublicKey: devicePushPK[:],
		},
	})
	require.NoError(t, err)

	pushToken, err = gc.metadataStore.getPushTokenForDevice(gc.DevicePubKey())
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

	tp, cancel := NewTestingProtocol(ctx, t, nil, nil)
	defer cancel()

	s, ok := tp.Service.(*service)
	require.True(t, ok)

	s.pushHandler.pushKey = devicePushSK

	currentPush := s.accountGroup.metadataStore.getCurrentDevicePushToken()
	require.Nil(t, currentPush)

	_, err = s.PushSetDeviceToken(ctx, &protocoltypes.PushSetDeviceToken_Request{
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType:          protocoltypes.PushTokenMQTT,
			BundleID:           nameTestPackage,
			Token:              tokenTestData1,
			RecipientPublicKey: devicePushPK[:],
		},
	})
	require.NoError(t, err)

	currentPush = s.accountGroup.metadataStore.getCurrentDevicePushToken()
	require.NotNil(t, currentPush)
	require.Equal(t, tokenTestData1, currentPush.Token)
	require.Equal(t, nameTestPackage, currentPush.BundleID)
	require.Equal(t, protocoltypes.PushTokenMQTT, currentPush.TokenType)
	require.Equal(t, devicePushPK[:], currentPush.RecipientPublicKey)

	_, err = s.PushSetDeviceToken(ctx, &protocoltypes.PushSetDeviceToken_Request{
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType:          protocoltypes.PushTokenApplePushNotificationService,
			BundleID:           nameTestPackage,
			Token:              tokenTestData2,
			RecipientPublicKey: devicePushPK[:],
		},
	})
	require.NoError(t, err)

	currentPush = s.accountGroup.metadataStore.getCurrentDevicePushToken()
	require.NotNil(t, currentPush)
	require.Equal(t, tokenTestData2, currentPush.Token)
	require.Equal(t, nameTestPackage, currentPush.BundleID)
	require.Equal(t, protocoltypes.PushTokenApplePushNotificationService, currentPush.TokenType)
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

	tp, cancel := NewTestingProtocol(ctx, t, nil, nil)
	defer cancel()

	s, ok := tp.Service.(*service)
	require.True(t, ok)

	s.pushHandler.pushKey = devicePushSK

	currentPush := s.accountGroup.metadataStore.getCurrentDevicePushServer()
	require.Nil(t, currentPush)

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK1[:],
		ServiceAddr: serverAddr1,
	}})
	require.NoError(t, err)

	currentPush = s.accountGroup.metadataStore.getCurrentDevicePushServer()
	require.NotNil(t, currentPush)
	require.Equal(t, serverPushPK1[:], currentPush.ServerKey)
	require.Equal(t, serverAddr1, currentPush.ServiceAddr)

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK2[:],
		ServiceAddr: serverAddr2,
	}})
	require.NoError(t, err)

	currentPush = s.accountGroup.metadataStore.getCurrentDevicePushServer()
	require.NotNil(t, currentPush)
	require.Equal(t, serverPushPK2[:], currentPush.ServerKey)
	require.Equal(t, serverAddr2, currentPush.ServiceAddr)

	// FIXME: Should we add a way to clear the push server used with the current device?
}
