package bertymessenger_test

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func NonMockedTestingInfra(ctx context.Context, t *testing.T, accountAmount int) ([]messengertypes.MessengerServiceClient, []*bertyprotocol.TestingProtocol, func()) {
	messengers := make([]messengertypes.MessengerServiceClient, accountAmount)
	tps := make([]*bertyprotocol.TestingProtocol, accountAmount)
	closeFuncs := ([]func())(nil)

	for i := 0; i < accountAmount; i++ {
		tempDir, err := ioutil.TempDir("", fmt.Sprintf("berty-main-%d", i))
		assert.NoError(t, err)

		closeFuncs = append(closeFuncs, func() {
			_ = os.RemoveAll(tempDir)
		})

		man, err := initutil.New(ctx, nil)
		assert.NoError(t, err)

		fs := flag.NewFlagSet("man1", flag.ExitOnError)
		man.SetupLoggingFlags(fs)              // also available at root level
		man.SetupMetricsFlags(fs)              // add flags to enable metrics
		man.SetupLocalMessengerServerFlags(fs) // add flags to allow creating a full node in the same process
		man.SetupEmptyGRPCListenersFlags(fs)   // by default, we don't want to expose gRPC server for mini
		man.SetupRemoteNodeFlags(fs)           // mini can be run against an already running server
		man.SetupInitTimeout(fs)

		err = fs.Parse([]string{"-store.dir", tempDir})

		ipfs, _, err := man.GetLocalIPFS()
		assert.NoError(t, err)
		closeFuncs = append(closeFuncs, func() { _ = ipfs.Close() })

		protocolClient, err := man.GetProtocolClient()
		assert.NoError(t, err)

		messengers[i], err = man.GetMessengerClient()
		assert.NoError(t, err)

		tps[i] = &bertyprotocol.TestingProtocol{
			Client: &WrappedMessengerClient{protocolClient},
		}
	}

	return messengers, tps, func() {
		for i := len(closeFuncs) - 1; i >= 0; i-- {
			closeFuncs[i]()
		}
	}
}

type WrappedMessengerClient struct {
	protocoltypes.ProtocolServiceClient
}

func (*WrappedMessengerClient) Close() error {
	return nil
}

func TestPeersCreateJoinConversationNonMocked(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)
	// FIXME: fails due to initutil.ReplaceGRPCLogger data ra	ce

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	accountsAmount := 3
	clients, _, cleanup := NonMockedTestingInfra(ctx, t, accountsAmount)
	defer cleanup()

	// create nodes
	var creator *bertymessenger.TestingAccount
	{
		creator = bertymessenger.NewTestingAccount(ctx, t, clients[0], nil, logger)
		defer creator.Close()
		creator.SetName(t, "Creator")
	}
	joiners := make([]*bertymessenger.TestingAccount, accountsAmount-1)
	{
		for i := 0; i < accountsAmount-1; i++ {
			joiners[i] = bertymessenger.NewTestingAccount(ctx, t, clients[i+1], nil, logger)
			defer joiners[i].Close()
			joiners[i].SetName(t, "Joiner #"+strconv.Itoa(i))
		}
	}

	// Force delay
	time.Sleep(time.Second)

	// creator creates a new conversation
	convName := "Ze Conv"
	createdConv, err := creator.GetClient().ConversationCreate(ctx, &messengertypes.ConversationCreate_Request{DisplayName: convName})
	require.NoError(t, err)

	// get conv link
	gpk := createdConv.GetPublicKey()
	gpkb, err := b64DecodeBytes(gpk)
	require.NoError(t, err)
	sbg, err := creator.GetClient().ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{GroupPK: gpkb, GroupName: convName})
	require.NoError(t, err)

	// joiners join the conversation
	for _, joiner := range joiners {
		ret, err := joiner.GetClient().ConversationJoin(ctx, &messengertypes.ConversationJoin_Request{Link: sbg.GetWebURL()})
		require.NoError(t, err)
		require.Empty(t, ret)
	}

	// wait for events propagation
	time.Sleep(2 * time.Second)

	// open streams and drain lists on all nodes
	accounts := append([]*bertymessenger.TestingAccount{creator}, joiners...)
	for _, account := range accounts {
		account.DrainInitEvents(t)
		account.Close()
	}

	// no more event
	{
		event := creator.TryNextEvent(t, 200*time.Millisecond)
		require.Nil(t, event)
		for _, joiner := range joiners {
			event = joiner.TryNextEvent(t, 200*time.Millisecond)
			require.Nil(t, event)
		}
	}

	// verify members in each account
	for _, account := range accounts {
		accountConv := account.GetConversation(t, gpk)
		require.Equal(t, gpk, accountConv.GetPublicKey())
		require.Equal(t, convName, accountConv.GetDisplayName())
		mpk := account.GetConversation(t, gpk).GetAccountMemberPublicKey()
		require.NotEmpty(t, mpk)
		//displayName := account.GetAccount().GetDisplayName()
		//for _, otherAccount := range accounts {
		//	if otherAccount.GetAccount().GetPublicKey() == account.GetAccount().GetPublicKey() {
		//		continue
		//	}
		//	member := otherAccount.GetMember(t, mpk)
		//	require.Equal(t, displayName, member.GetDisplayName())
		//	require.Equal(t, gpk, member.GetConversationPublicKey())
		//}
	}

	subCtx, subCancel := context.WithTimeout(ctx, time.Second*45)
	cl, err := clients[1].EventStream(subCtx, &messengertypes.EventStream_Request{
		ShallowAmount: 1,
	})
	require.NoError(t, err)

	const messageCount = 20

	ce := make(chan *messengertypes.EventStream_Reply, messageCount)
	var subErr error
	go func() {
		defer close(ce)
		defer subCancel()

		var evt *messengertypes.EventStream_Reply
		for {
			evt, subErr = cl.Recv()
			if subErr != nil {
				return
			}

			ce <- evt
		}
	}()

	for i := 0; i < messageCount; i++ {
		payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{
			Body: fmt.Sprintf("message %d", i),
		})
		require.NoError(t, err)

		_, err = clients[0].Interact(
			ctx,
			&messengertypes.Interact_Request{
				Type:                  messengertypes.AppMessage_TypeUserMessage,
				Payload:               payload,
				ConversationPublicKey: gpk,
			},
		)
		require.NoError(t, err, fmt.Sprintf("sent %d items", i))
	}

	expectedMessages := make([]string, messageCount)
	for i := 0; i < messageCount; i++ {
		expectedMessages[i] = fmt.Sprintf("message %d", i)
	}

	for evt := range ce {
		if evt.Event.Type != messengertypes.StreamEvent_TypeInteractionUpdated {
			continue
		}

		interaction := &messengertypes.StreamEvent_InteractionUpdated{}
		err := proto.Unmarshal(evt.Event.Payload, interaction)
		require.NoError(t, err)

		if interaction.Interaction.Type != messengertypes.AppMessage_TypeUserMessage {
			continue
		}

		message := &messengertypes.AppMessage_UserMessage{}
		err = proto.Unmarshal(interaction.Interaction.Payload, message)
		require.NoError(t, err)

		foundMessage := false
		for i, ref := range expectedMessages {
			if message.Body == ref {
				expectedMessages = append(expectedMessages[:i], expectedMessages[i+1:]...)
				foundMessage = true
				t.Log(fmt.Sprintf("     found message : %s", message.Body))
				break
			}
		}

		if !foundMessage {
			t.Log(fmt.Sprintf("unexpected message : %s", message.Body))
		}

		if len(expectedMessages) == 0 {
			break
		}

		t.Logf("remaining messages : %s", strings.Join(expectedMessages, ","))
	}

	assert.Empty(t, len(expectedMessages))

	require.NoError(t, err)
	require.NoError(t, subErr)
	cl.CloseSend()
}

func b64DecodeBytes(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}
