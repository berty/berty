package bertypushrelay_test

import (
	crand "crypto/rand"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/nacl/box"
	"golang.org/x/net/context"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/bertypushrelay"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

var (
	pushDefaultServerSK  = &[cryptoutil.KeySize]byte{}
	pushDefaultServerPK  = &[cryptoutil.KeySize]byte{}
	pushTestRecipient1SK = &[cryptoutil.KeySize]byte{}
	pushTestRecipient1PK = &[cryptoutil.KeySize]byte{}
)

func Test_pushDispatcherKey(t *testing.T) {
	assert.Equal(t, "2-tech.berty.debug", bertypushrelay.PushDispatcherKey(pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService, "tech.berty.debug"))
}

func Test_NewPushService(t *testing.T) {
	s, err := bertypushrelay.NewPushService(pushDefaultServerSK, nil, nil)
	require.Nil(t, s)
	require.Error(t, err)

	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)

	s, err = bertypushrelay.NewPushService(nil, []bertypushrelay.PushDispatcher{dispatcher}, nil)
	require.Nil(t, s)
	require.Error(t, err)

	s, err = bertypushrelay.NewPushService(pushDefaultServerSK, []bertypushrelay.PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)
}

func Test_pushService_ServerInfo(t *testing.T) {
	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)
	s, err := bertypushrelay.NewPushService(pushDefaultServerSK, []bertypushrelay.PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)

	res, err := s.ServerInfo(context.Background(), &pushtypes.PushServiceServerInfo_Request{})
	require.NotNil(t, res)
	require.NoError(t, err)

	require.Equal(t, pushDefaultServerPK[:], res.PublicKey)
	require.Len(t, res.SupportedTokenTypes, 1)
	require.Equal(t, pushtypes.PushServiceTokenType_PushTokenMQTT, res.SupportedTokenTypes[0].TokenType)
	require.Equal(t, testutil.PushMockBundleID, res.SupportedTokenTypes[0].AppBundleID)
}

func Test_decodeOpaqueReceiver(t *testing.T) {
	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)
	dispatchers, _, err := bertypushrelay.PushServiceGenerateDispatchers([]bertypushrelay.PushDispatcher{dispatcher})
	require.NoError(t, err)

	s, err := bertypushrelay.NewPushService(pushDefaultServerSK, []bertypushrelay.PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)

	receiver := &protocoltypes.PushServiceReceiver{
		TokenType:          pushtypes.PushServiceTokenType_PushTokenMQTT,
		BundleID:           testutil.PushMockBundleID,
		Token:              []byte("testtoken"),
		RecipientPublicKey: pushTestRecipient1PK[:],
	}

	opaqueToken, err := bertyprotocol.PushSealTokenForServer(receiver, &protocoltypes.PushServer{
		ServerKey: pushDefaultServerPK[:],
	})

	require.NotEmpty(t, opaqueToken)
	require.NoError(t, err)

	decryptedReceiver, err := bertypushrelay.InternalDecodeOpaqueReceiver(pushDefaultServerPK, pushDefaultServerSK, dispatchers, &pushtypes.PushServiceOpaqueReceiver{OpaqueToken: opaqueToken.Token})
	require.NoError(t, err)
	require.NotNil(t, decryptedReceiver)

	require.Equal(t, receiver.TokenType, decryptedReceiver.TokenType)
	require.Equal(t, receiver.BundleID, decryptedReceiver.BundleID)
	require.Equal(t, receiver.Token, decryptedReceiver.Token)
	require.Equal(t, receiver.RecipientPublicKey, decryptedReceiver.RecipientPublicKey)

	receiver = &protocoltypes.PushServiceReceiver{
		TokenType:          pushtypes.PushServiceTokenType_PushTokenUndefined, // Unsupported by server
		BundleID:           testutil.PushMockBundleID,
		Token:              []byte("testtoken"),
		RecipientPublicKey: pushTestRecipient1PK[:],
	}

	opaqueToken, err = bertyprotocol.PushSealTokenForServer(receiver, &protocoltypes.PushServer{
		ServerKey: pushDefaultServerPK[:],
	})

	require.NotEmpty(t, opaqueToken)
	require.NoError(t, err)

	decryptedReceiver, err = bertypushrelay.InternalDecodeOpaqueReceiver(pushDefaultServerPK, pushDefaultServerSK, dispatchers, &pushtypes.PushServiceOpaqueReceiver{OpaqueToken: opaqueToken.Token})
	require.Error(t, err)
	require.Nil(t, decryptedReceiver)

	receiver = &protocoltypes.PushServiceReceiver{
		TokenType:          pushtypes.PushServiceTokenType_PushTokenMQTT,
		BundleID:           "mismatch", // Unsupported by server
		Token:              []byte("testtoken"),
		RecipientPublicKey: pushTestRecipient1PK[:],
	}

	opaqueToken, err = bertyprotocol.PushSealTokenForServer(receiver, &protocoltypes.PushServer{
		ServerKey: pushDefaultServerPK[:],
	})

	require.NotEmpty(t, opaqueToken)
	require.NoError(t, err)

	decryptedReceiver, err = bertypushrelay.InternalDecodeOpaqueReceiver(pushDefaultServerPK, pushDefaultServerSK, dispatchers, &pushtypes.PushServiceOpaqueReceiver{OpaqueToken: opaqueToken.Token})
	require.Error(t, err)
	require.Nil(t, decryptedReceiver)

	receiver = &protocoltypes.PushServiceReceiver{
		TokenType:          pushtypes.PushServiceTokenType_PushTokenMQTT,
		BundleID:           testutil.PushMockBundleID,
		Token:              []byte("testtoken"),
		RecipientPublicKey: pushTestRecipient1PK[:],
	}

	opaqueToken, err = bertyprotocol.PushSealTokenForServer(receiver, &protocoltypes.PushServer{
		ServerKey: pushTestRecipient1PK[:], // encrypted for another server
	})

	require.NotEmpty(t, opaqueToken)
	require.NoError(t, err)

	decryptedReceiver, err = bertypushrelay.InternalDecodeOpaqueReceiver(pushDefaultServerPK, pushDefaultServerSK, dispatchers, &pushtypes.PushServiceOpaqueReceiver{OpaqueToken: opaqueToken.Token})
	require.Error(t, err)
	require.Nil(t, decryptedReceiver)
}

func Test_encryptPushPayloadForReceiver_decryptPushDataFromServer(t *testing.T) {
	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)

	s, err := bertypushrelay.NewPushService(pushDefaultServerSK, []bertypushrelay.PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)

	ref := []byte("reference1")

	encrypted1, err := bertypushrelay.InternalEncryptPushPayloadForReceiver(pushDefaultServerSK, ref, pushTestRecipient1PK[:])
	require.NotEmpty(t, encrypted1)
	require.NoError(t, err)

	encrypted2, err := bertypushrelay.InternalEncryptPushPayloadForReceiver(pushDefaultServerSK, ref, pushTestRecipient1PK[:])
	require.NotEmpty(t, encrypted2)
	require.NoError(t, err)

	require.NotEqual(t, encrypted1, encrypted2)

	decrypted1, err := bertypush.DecryptPushDataFromServer(encrypted1, pushDefaultServerPK, pushTestRecipient1SK)
	require.NoError(t, err)
	require.Equal(t, ref, decrypted1)

	decrypted1, err = bertypush.DecryptPushDataFromServer(encrypted1, pushTestRecipient1PK, pushTestRecipient1SK) // invalid server pk
	require.Error(t, err)

	decrypted1, err = bertypush.DecryptPushDataFromServer(encrypted1, pushDefaultServerPK, pushDefaultServerSK) // invalid dest sk
	require.Error(t, err)

	decrypted1, err = bertypush.DecryptPushDataFromServer(nil, pushDefaultServerPK, pushTestRecipient1SK)
	require.Error(t, err)

	decrypted1, err = bertypush.DecryptPushDataFromServer(encrypted1, nil, pushTestRecipient1SK)
	require.Error(t, err)

	decrypted1, err = bertypush.DecryptPushDataFromServer(encrypted1, pushDefaultServerPK, nil)
	require.Error(t, err)

	decrypted1, err = bertypush.DecryptPushDataFromServer([]byte("invalid data"), pushDefaultServerPK, nil)
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
