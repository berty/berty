package bertyprotocol

import (
	crand "crypto/rand"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/nacl/box"
	"golang.org/x/net/context"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

var (
	pushDefaultServerSK  = &[cryptoutil.KeySize]byte{}
	pushDefaultServerPK  = &[cryptoutil.KeySize]byte{}
	pushTestRecipient1SK = &[cryptoutil.KeySize]byte{}
	pushTestRecipient1PK = &[cryptoutil.KeySize]byte{}
)

func Test_pushDispatcherKey(t *testing.T) {
	assert.Equal(t, "2-tech.berty.debug", pushDispatcherKey(protocoltypes.PushTokenApplePushNotificationService, "tech.berty.debug"))
}

func Test_NewPushService(t *testing.T) {
	s, err := newPushService(pushDefaultServerSK, nil, nil)
	require.Nil(t, s)
	require.Error(t, err)

	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)

	s, err = newPushService(nil, []PushDispatcher{dispatcher}, nil)
	require.Nil(t, s)
	require.Error(t, err)

	s, err = newPushService(pushDefaultServerSK, []PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)
}

func Test_pushService_ServerInfo(t *testing.T) {
	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)
	s, err := newPushService(pushDefaultServerSK, []PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)

	res, err := s.ServerInfo(context.Background(), &protocoltypes.PushServiceServerInfo_Request{})
	require.NotNil(t, res)
	require.NoError(t, err)

	require.Equal(t, pushDefaultServerPK[:], res.PublicKey)
	require.Len(t, res.SupportedTokenTypes, 1)
	require.Equal(t, protocoltypes.PushTokenMQTT, res.SupportedTokenTypes[0].TokenType)
	require.Equal(t, testutil.PushMockBundleID, res.SupportedTokenTypes[0].AppBundleID)
}

func Test_decodeOpaqueReceiver(t *testing.T) {
	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)

	s, err := newPushService(pushDefaultServerSK, []PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)

	receiver := &protocoltypes.PushServiceReceiver{
		TokenType:          protocoltypes.PushTokenMQTT,
		BundleID:           testutil.PushMockBundleID,
		Token:              []byte("testtoken"),
		RecipientPublicKey: pushTestRecipient1PK[:],
	}

	opaqueToken, err := pushSealTokenForServer(receiver, &protocoltypes.PushServer{
		ServerKey: pushDefaultServerPK[:],
	})

	require.NotEmpty(t, opaqueToken)
	require.NoError(t, err)

	decryptedReceiver, err := s.decodeOpaqueReceiver(&protocoltypes.PushServiceOpaqueReceiver{OpaqueToken: opaqueToken.Token})
	require.NoError(t, err)
	require.NotNil(t, decryptedReceiver)

	require.Equal(t, receiver.TokenType, decryptedReceiver.TokenType)
	require.Equal(t, receiver.BundleID, decryptedReceiver.BundleID)
	require.Equal(t, receiver.Token, decryptedReceiver.Token)
	require.Equal(t, receiver.RecipientPublicKey, decryptedReceiver.RecipientPublicKey)

	receiver = &protocoltypes.PushServiceReceiver{
		TokenType:          protocoltypes.PushTokenUndefined, // Unsupported by server
		BundleID:           testutil.PushMockBundleID,
		Token:              []byte("testtoken"),
		RecipientPublicKey: pushTestRecipient1PK[:],
	}

	opaqueToken, err = pushSealTokenForServer(receiver, &protocoltypes.PushServer{
		ServerKey: pushDefaultServerPK[:],
	})

	require.NotEmpty(t, opaqueToken)
	require.NoError(t, err)

	decryptedReceiver, err = s.decodeOpaqueReceiver(&protocoltypes.PushServiceOpaqueReceiver{OpaqueToken: opaqueToken.Token})
	require.Error(t, err)
	require.Nil(t, decryptedReceiver)

	receiver = &protocoltypes.PushServiceReceiver{
		TokenType:          protocoltypes.PushTokenMQTT,
		BundleID:           "mismatch", // Unsupported by server
		Token:              []byte("testtoken"),
		RecipientPublicKey: pushTestRecipient1PK[:],
	}

	opaqueToken, err = pushSealTokenForServer(receiver, &protocoltypes.PushServer{
		ServerKey: pushDefaultServerPK[:],
	})

	require.NotEmpty(t, opaqueToken)
	require.NoError(t, err)

	decryptedReceiver, err = s.decodeOpaqueReceiver(&protocoltypes.PushServiceOpaqueReceiver{OpaqueToken: opaqueToken.Token})
	require.Error(t, err)
	require.Nil(t, decryptedReceiver)

	receiver = &protocoltypes.PushServiceReceiver{
		TokenType:          protocoltypes.PushTokenMQTT,
		BundleID:           testutil.PushMockBundleID,
		Token:              []byte("testtoken"),
		RecipientPublicKey: pushTestRecipient1PK[:],
	}

	opaqueToken, err = pushSealTokenForServer(receiver, &protocoltypes.PushServer{
		ServerKey: pushTestRecipient1PK[:], // encrypted for another server
	})

	require.NotEmpty(t, opaqueToken)
	require.NoError(t, err)

	decryptedReceiver, err = s.decodeOpaqueReceiver(&protocoltypes.PushServiceOpaqueReceiver{OpaqueToken: opaqueToken.Token})
	require.Error(t, err)
	require.Nil(t, decryptedReceiver)
}

func Test_encryptPushPayloadForReceiver_decryptPushDataFromServer(t *testing.T) {
	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)

	s, err := newPushService(pushDefaultServerSK, []PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)

	ref := []byte("reference1")

	encrypted1, err := s.encryptPushPayloadForReceiver(ref, pushTestRecipient1PK[:])
	require.NotEmpty(t, encrypted1)
	require.NoError(t, err)

	encrypted2, err := s.encryptPushPayloadForReceiver(ref, pushTestRecipient1PK[:])
	require.NotEmpty(t, encrypted2)
	require.NoError(t, err)

	require.NotEqual(t, encrypted1, encrypted2)

	decrypted1, err := decryptPushDataFromServer(encrypted1, pushDefaultServerPK, pushTestRecipient1SK)
	require.NoError(t, err)
	require.Equal(t, ref, decrypted1)

	decrypted1, err = decryptPushDataFromServer(encrypted1, pushTestRecipient1PK, pushTestRecipient1SK) // invalid server pk
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer(encrypted1, pushDefaultServerPK, pushDefaultServerSK) // invalid dest sk
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer(nil, pushDefaultServerPK, pushTestRecipient1SK)
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer(encrypted1, nil, pushTestRecipient1SK)
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer(encrypted1, pushDefaultServerPK, nil)
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer([]byte("invalid data"), pushDefaultServerPK, nil)
	require.Error(t, err)
}

func TestPushService_Send(t *testing.T) {
	t.Skip("TODO")
}

func init() {
	var err error
	pushDefaultServerPK, pushDefaultServerSK, err = box.GenerateKey(crand.Reader)
	if err != nil {
		panic(err)
	}

	pushTestRecipient1PK, pushTestRecipient1SK, err = box.GenerateKey(crand.Reader)
	if err != nil {
		panic(err)
	}
}
