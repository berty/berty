package bertyprotocol

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/curve25519"
	"golang.org/x/net/context"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const pushMockBundleID = "tech.berty.mock"

var (
	pushDefaultServerSK = [cryptoutil.KeySize]byte{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31}
	pushDefaultServerPK = [cryptoutil.KeySize]byte{}
)

var (
	pushTestRecipient1SK = [cryptoutil.KeySize]byte{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
	pushTestRecipient1PK = [cryptoutil.KeySize]byte{}
)

type pushMockedDispatcher struct {
	bundleID string
	queue    map[string][][]byte
}

func (d *pushMockedDispatcher) TokenType() protocoltypes.PushServiceTokenType {
	return protocoltypes.PushTokenMQTT
}

func (d *pushMockedDispatcher) Dispatch(data []byte, receiver *protocoltypes.PushServiceReceiver) error {
	d.queue[string(receiver.Token)] = append(d.queue[string(receiver.Token)], data)

	return nil
}

func (d *pushMockedDispatcher) BundleID() string {
	return d.bundleID
}

func Test_pushDispatcherKey(t *testing.T) {
	assert.Equal(t, "2-tech.berty.debug", pushDispatcherKey(protocoltypes.PushTokenApplePushNotificationService, "tech.berty.debug"))
}

func Test_NewPushService(t *testing.T) {
	s, err := newPushService(&pushDefaultServerSK, nil, nil)
	require.Nil(t, s)
	require.Error(t, err)

	dispatcher := &pushMockedDispatcher{
		bundleID: pushMockBundleID,
		queue:    map[string][][]byte{},
	}

	s, err = newPushService(nil, []PushDispatcher{dispatcher}, nil)
	require.Nil(t, s)
	require.Error(t, err)

	s, err = newPushService(&pushDefaultServerSK, []PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)
}

func Test_pushService_ServerInfo(t *testing.T) {
	dispatcher := &pushMockedDispatcher{
		bundleID: pushMockBundleID,
		queue:    map[string][][]byte{},
	}

	s, err := newPushService(&pushDefaultServerSK, []PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)

	res, err := s.ServerInfo(context.Background(), &protocoltypes.PushServiceServerInfo_Request{})
	require.NotNil(t, res)
	require.NoError(t, err)

	require.Equal(t, pushDefaultServerPK[:], res.PublicKey)
	require.Len(t, res.SupportedTokenTypes, 1)
	require.Equal(t, protocoltypes.PushTokenMQTT, res.SupportedTokenTypes[0].TokenType)
	require.Equal(t, pushMockBundleID, res.SupportedTokenTypes[0].AppBundleID)
}

func Test_decodeOpaqueReceiver(t *testing.T) {
	dispatcher := &pushMockedDispatcher{
		bundleID: pushMockBundleID,
		queue:    map[string][][]byte{},
	}

	s, err := newPushService(&pushDefaultServerSK, []PushDispatcher{dispatcher}, nil)
	require.NotNil(t, s)
	require.NoError(t, err)

	receiver := &protocoltypes.PushServiceReceiver{
		TokenType:          protocoltypes.PushTokenMQTT,
		BundleID:           pushMockBundleID,
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
		BundleID:           pushMockBundleID,
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
		BundleID:           pushMockBundleID,
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
	dispatcher := &pushMockedDispatcher{
		bundleID: pushMockBundleID,
		queue:    map[string][][]byte{},
	}

	s, err := newPushService(&pushDefaultServerSK, []PushDispatcher{dispatcher}, nil)
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

	decrypted1, err := decryptPushDataFromServer(encrypted1, &pushDefaultServerPK, &pushTestRecipient1SK)
	require.NoError(t, err)
	require.Equal(t, ref, decrypted1)

	decrypted1, err = decryptPushDataFromServer(encrypted1, &pushTestRecipient1PK, &pushTestRecipient1SK) // invalid server pk
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer(encrypted1, &pushDefaultServerPK, &pushDefaultServerSK) // invalid dest sk
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer(nil, &pushDefaultServerPK, &pushTestRecipient1SK)
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer(encrypted1, nil, &pushTestRecipient1SK)
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer(encrypted1, &pushDefaultServerPK, nil)
	require.Error(t, err)

	decrypted1, err = decryptPushDataFromServer([]byte("invalid data"), &pushDefaultServerPK, nil)
	require.Error(t, err)
}

func TestPushService_Send(t *testing.T) {
	t.Skip("TODO")
}

func init() {
	curve25519.ScalarBaseMult(&pushDefaultServerPK, &pushDefaultServerSK)
	curve25519.ScalarBaseMult(&pushTestRecipient1PK, &pushTestRecipient1SK)
}
