package bertypush_test

import (
	"context"
	"crypto/ed25519"
	crand "crypto/rand"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"
	"time"

	proto "github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyaccount"
	"berty.tech/berty/v2/go/pkg/bertyauth"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/bertypushrelay"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type MemNativeKeystore struct {
	dict map[string][]byte
}

var _ accountutils.NativeKeystore = (*MemNativeKeystore)(nil)

func (ks *MemNativeKeystore) Get(key string) ([]byte, error) {
	value, ok := ks.dict[key]
	if !ok {
		return nil, errcode.ErrNotFound
	}
	return value, nil
}

func (ks *MemNativeKeystore) Put(key string, value []byte) error {
	ks.dict[key] = value
	return nil
}

func NewMemNativeKeystore() accountutils.NativeKeystore {
	return &MemNativeKeystore{dict: make(map[string][]byte)}
}

func TestPushDecryptStandalone(t *testing.T) {
	t.Skip()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	logger = logger.Named("bty.test")

	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)
	dispatchers := []bertypushrelay.PushDispatcher{dispatcher}
	_, pushPK, pushHost, cancel := bertypushrelay.PushServerForTests(ctx, t, dispatchers, logger.Named("bty"))
	defer cancel()

	// prepare deps
	tempdir, err := ioutil.TempDir("", "berty-account")
	require.NoError(t, err)
	defer os.RemoveAll(tempdir)

	_, authServerSecret, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	// auth is not enforced
	_, authServerSK, err := ed25519.GenerateKey(crand.Reader)
	require.NoError(t, err)

	svc1RootDir := filepath.Join(tempdir, "root_1")
	svc1Token := "test_token_svc1"
	svc1Account1 := "acc_1_1"

	svc2RootDir := filepath.Join(tempdir, "root_2")
	svc2Account1 := "acc_2_1"

	// init service
	svc1Keystore := NewMemNativeKeystore()
	svc1, err := bertyaccount.NewService(&bertyaccount.Options{
		RootDirectory: svc1RootDir,
		Logger:        logger,
		Keystore:      svc1Keystore,
	})
	require.NoError(t, err)
	defer svc1.Close()

	_, err = svc1.PushPlatformTokenRegister(ctx, &accounttypes.PushPlatformTokenRegister_Request{
		Receiver: &protocoltypes.PushServiceReceiver{
			TokenType: pushtypes.PushServiceTokenType_PushTokenMQTT,
			BundleID:  testutil.PushMockBundleID,
			Token:     []byte(svc1Token),
		},
	})
	require.NoError(t, err)

	_, err = svc1.CreateAccount(ctx, &accounttypes.CreateAccount_Request{
		AccountID:   svc1Account1,
		AccountName: svc1Account1,
	})
	require.NoError(t, err)

	// init service
	svc2, err := bertyaccount.NewService(&bertyaccount.Options{
		RootDirectory: svc2RootDir,
		Logger:        logger,
		Keystore:      NewMemNativeKeystore(),
	})
	require.NoError(t, err)
	defer svc2.Close()

	_, err = svc2.CreateAccount(ctx, &accounttypes.CreateAccount_Request{
		AccountID:   svc2Account1,
		AccountName: svc2Account1,
	})
	require.NoError(t, err)

	messenger1, err := svc1.GetMessengerClient()
	require.NoError(t, err)

	protocol1, err := svc1.GetProtocolClient()
	require.NoError(t, err)

	tokenIssuer, err := bertyauth.NewAuthTokenIssuer(authServerSecret[:], authServerSK)
	require.NoError(t, err)

	services := map[string]string{authtypes.ServicePushID: pushHost}

	randomToken, err := bertyauth.IssueRandomToken(tokenIssuer, services)
	require.NoError(t, err)

	_, err = protocol1.DebugAuthServiceSetToken(ctx, &protocoltypes.DebugAuthServiceSetToken_Request{
		Token: &protocoltypes.AuthExchangeResponse{
			AccessToken: randomToken,
			Scope:       authtypes.ServicePushID,
			Services:    services,
		},
	})
	require.NoError(t, err)

	_, err = protocol1.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{
		Server: &protocoltypes.PushServer{
			ServerKey:   pushPK[:],
			ServiceAddr: pushHost,
		},
	})
	require.NoError(t, err)

	_, err = messenger1.PushSetAutoShare(ctx, &messengertypes.PushSetAutoShare_Request{Enabled: true})
	require.NoError(t, err)

	messenger2, err := svc2.GetMessengerClient()
	require.NoError(t, err)

	protocol2, err := svc2.GetProtocolClient()
	require.NoError(t, err)

	mess1Acc, err := messenger1.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	require.NoError(t, err)

	mess2Acc, err := messenger2.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	require.NoError(t, err)

	_, err = messenger1.ContactRequest(ctx, &messengertypes.ContactRequest_Request{
		Link: mess2Acc.Account.Link,
	})
	require.NoError(t, err)

	deadline := time.Now().Add(time.Second * 10)
	acc2PKBytes, err := messengerutil.B64DecodeBytes(mess2Acc.Account.PublicKey)
	require.NoError(t, err)

	for {
		if time.Now().After(deadline) {
			require.Fail(t, "unable to receive contact request")
			break
		}

		subMetaList, err := protocol2.GroupMetadataList(ctx, &protocoltypes.GroupMetadataList_Request{GroupPK: acc2PKBytes, UntilNow: true})
		require.NoError(t, err)

		requestFound := false
		for {
			meta, err := subMetaList.Recv()
			if subMetaList.Context().Err() != nil {
				break
			}

			require.NoError(t, err)

			if meta.Metadata.EventType == protocoltypes.EventTypeAccountContactRequestIncomingReceived {
				requestFound = true
				break
			}
		}

		if requestFound {
			break
		}
	}

	for i := 0; i < 10; i++ {
		_, err = messenger2.ContactAccept(ctx, &messengertypes.ContactAccept_Request{
			PublicKey: mess1Acc.Account.PublicKey,
		})

		if err == nil {
			break
		}

		if err != nil {
			if i == 3 {
				require.NoError(t, err)
			}
		}

		time.Sleep(time.Millisecond * 100)
	}

	mess1PK, err := base64.RawURLEncoding.DecodeString(mess1Acc.Account.PublicKey)
	require.NoError(t, err)

	mess2PK, err := base64.RawURLEncoding.DecodeString(mess2Acc.Account.PublicKey)
	require.NoError(t, err)

	grpInf1, err := protocol1.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{ContactPK: mess2PK})
	require.NoError(t, err)

	grpInf2, err := protocol2.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{ContactPK: mess1PK})
	require.NoError(t, err)

	require.Equal(t, grpInf1.Group.PublicKey, grpInf2.Group.PublicKey)

	logger.Error("conversation for contacts", logutil.PrivateString("conversation-pk", messengerutil.B64EncodeBytes(grpInf1.Group.PublicKey)))

	_, err = protocol1.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: grpInf1.Group.PublicKey})
	require.NoError(t, err)

	_, err = protocol2.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: grpInf2.Group.PublicKey})
	require.NoError(t, err)

	deadline = time.Now().Add(time.Second * 10)
	for {
		if time.Now().After(deadline) {
			require.Fail(t, "unable to receive other contact push token")
			break
		}

		subMetaList, err := protocol2.GroupMetadataList(ctx, &protocoltypes.GroupMetadataList_Request{GroupPK: grpInf1.Group.PublicKey, UntilNow: true})
		require.NoError(t, err)

		tokenUpdateFound := false
		for {
			meta, err := subMetaList.Recv()
			if subMetaList.Context().Err() != nil {
				break
			}

			require.NoError(t, err)

			if meta.Metadata.EventType == protocoltypes.EventTypePushMemberTokenUpdate {
				tokenUpdateFound = true
				break
			}
		}

		if tokenUpdateFound {
			break
		}

		time.Sleep(time.Millisecond * 100)
	}

	_, err = svc1.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
	require.NoError(t, err)

	um1 := &messengertypes.AppMessage_UserMessage{Body: "hey1"}
	um1B, err := proto.Marshal(um1)
	require.NoError(t, err)

	_, err = messenger2.Interact(ctx, &messengertypes.Interact_Request{
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		Payload:               um1B,
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(grpInf1.Group.PublicKey),
	})
	require.NoError(t, err)

	deadline = time.Now().Add(time.Second * 10)
	for {
		if time.Now().After(deadline) {
			require.Fail(t, "expected push dispatcher to have a message for other peer")
			break
		}

		if dispatcher.Len([]byte(svc1Token)) == 1 {
			break
		}

		time.Sleep(time.Millisecond * 100)
	}

	pushContents := base64.StdEncoding.EncodeToString(dispatcher.Shift([]byte(svc1Token)))

	decrypted, err := bertypush.PushDecryptStandalone(logger, svc1RootDir, pushContents, svc1Keystore)
	require.NoError(t, err)

	require.Equal(t, pushtypes.DecryptedPush_Message.String(), decrypted.PushType.String())
	require.Equal(t, svc1Account1, decrypted.AccountID)
	require.Equal(t, base64.RawURLEncoding.EncodeToString(grpInf1.Group.PublicKey), decrypted.ConversationPublicKey)
	require.Equal(t, fmt.Sprintf("{\"message\":\"hey1\"}"), decrypted.PayloadAttrsJSON)
	require.False(t, decrypted.AlreadyReceived)
	// TODO:
	// require.Equal(t, svc1Account1, decrypted.MemberDisplayName)

	// Decode twice
	decrypted, err = bertypush.PushDecryptStandalone(logger, svc1RootDir, pushContents, svc1Keystore)
	require.NoError(t, err)

	require.Equal(t, pushtypes.DecryptedPush_Message.String(), decrypted.PushType.String())
	require.Equal(t, svc1Account1, decrypted.AccountID)
	require.Equal(t, base64.RawURLEncoding.EncodeToString(grpInf1.Group.PublicKey), decrypted.ConversationPublicKey)
	require.Equal(t, fmt.Sprintf("{\"message\":\"hey1\"}"), decrypted.PayloadAttrsJSON)
	require.True(t, decrypted.AlreadyReceived)

	// Account service with no account opened
	decryptedUsingAccountSvc, err := svc1.PushReceive(ctx, &accounttypes.PushReceive_Request{Payload: pushContents})
	require.NoError(t, err)

	require.Equal(t, pushtypes.DecryptedPush_Message.String(), decryptedUsingAccountSvc.PushData.PushType.String())
	require.Equal(t, svc1Account1, decryptedUsingAccountSvc.PushData.AccountID)
	require.Equal(t, base64.RawURLEncoding.EncodeToString(grpInf1.Group.PublicKey), decryptedUsingAccountSvc.PushData.ConversationPublicKey)
	require.Equal(t, fmt.Sprintf("{\"message\":\"hey1\"}"), decryptedUsingAccountSvc.PushData.PayloadAttrsJSON)
	require.True(t, decryptedUsingAccountSvc.PushData.AlreadyReceived)
	// TODO:
	// require.Equal(t, svc1Account1, decrypted.MemberDisplayName)

	_, err = svc1.OpenAccount(ctx, &accounttypes.OpenAccount_Request{AccountID: svc1Account1})
	require.NoError(t, err)

	// Account service with current account
	decryptedUsingAccountSvc, err = svc1.PushReceive(ctx, &accounttypes.PushReceive_Request{Payload: pushContents})
	require.NoError(t, err)

	require.Equal(t, pushtypes.DecryptedPush_Message.String(), decryptedUsingAccountSvc.PushData.PushType.String())
	require.Equal(t, svc1Account1, decryptedUsingAccountSvc.PushData.AccountID)
	require.Equal(t, base64.RawURLEncoding.EncodeToString(grpInf1.Group.PublicKey), decryptedUsingAccountSvc.PushData.ConversationPublicKey)
	require.Equal(t, fmt.Sprintf("{\"message\":\"hey1\"}"), decryptedUsingAccountSvc.PushData.PayloadAttrsJSON)
	require.True(t, decryptedUsingAccountSvc.PushData.AlreadyReceived)
	// TODO:
	// require.Equal(t, svc1Account1, decrypted.MemberDisplayName)

	_, err = svc1.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
	require.NoError(t, err)
}
