package benchmark

import (
	"context"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	bertymessengertesting "berty.tech/berty/v2/go/pkg/bertymessenger/testing"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/v2/pkg/testutil"
)

func b64DecodeBytes(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}

func BenchmarkScenario(b *testing.B) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()
	logger, cleanup := testutil.Logger(b)
	defer cleanup()
	accountsAmount := 3
	clients, _ := bertymessengertesting.NonMockedTestingInfra(b, accountsAmount)

	// create nodes
	var creator *bertymessenger.TestingAccount
	{

		require.NotNil(b, clients[0])
		creator = bertymessenger.NewTestingAccount(ctx, b, clients[0], nil, logger)
		require.NotNil(b, creator)
		defer creator.Close()
		creator.SetName(b, "Creator")
	}
	joiners := make([]*bertymessenger.TestingAccount, accountsAmount-1)
	{
		for i := 0; i < accountsAmount-1; i++ {
			joiners[i] = bertymessenger.NewTestingAccount(ctx, b, clients[i+1], nil, logger)
			defer joiners[i].Close()
			joiners[i].SetName(b, "Joiner #"+strconv.Itoa(i))
		}
	}

	// Force delay
	time.Sleep(time.Second)

	// creator creates a new conversation
	convName := "Ze Conv"
	createdConv, err := creator.GetClient().ConversationCreate(ctx, &messengertypes.ConversationCreate_Request{DisplayName: convName})
	require.NoError(b, err)

	// get conv link
	gpk := createdConv.GetPublicKey()
	gpkb, err := b64DecodeBytes(gpk)
	require.NoError(b, err)
	sbg, err := creator.GetClient().ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{GroupPk: gpkb, GroupName: convName})
	require.NoError(b, err)

	// joiners join the conversation
	for _, joiner := range joiners {
		ret, err := joiner.GetClient().ConversationJoin(ctx, &messengertypes.ConversationJoin_Request{Link: sbg.GetWebUrl()})
		require.NoError(b, err)
		require.Empty(b, ret)
	}

	// wait for events propagation
	time.Sleep(2 * time.Second)

	// open streams and drain lists on all nodes
	accounts := append([]*bertymessenger.TestingAccount{creator}, joiners...)
	for _, account := range accounts {
		account.DrainInitEvents(b)
		account.Close()
	}

	// no more event
	{
		event := creator.TryNextEvent(b, 200*time.Millisecond)
		require.Nil(b, event)
		for _, joiner := range joiners {
			event = joiner.TryNextEvent(b, 200*time.Millisecond)
			require.Nil(b, event)
		}
	}

	// verify members in each account
	for _, account := range accounts {
		accountConv := account.GetConversation(b, gpk)
		require.Equal(b, gpk, accountConv.GetPublicKey())
		require.Equal(b, convName, accountConv.GetDisplayName())
		mpk := account.GetConversation(b, gpk).GetAccountMemberPublicKey()
		require.NotEmpty(b, mpk)
	}

	subCtx, subCancel := context.WithTimeout(ctx, time.Second*45)
	cl, err := clients[1].EventStream(subCtx, &messengertypes.EventStream_Request{
		ShallowAmount: 1,
	})
	require.NoError(b, err)

	messageCount := b.N

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
		require.NoError(b, err)

		_, err = clients[0].Interact(
			ctx,
			&messengertypes.Interact_Request{
				Type:                  messengertypes.AppMessage_TypeUserMessage,
				Payload:               payload,
				ConversationPublicKey: gpk,
			},
		)
		require.NoError(b, err, fmt.Sprintf("sent %d items", i))
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
		require.NoError(b, err)

		if interaction.Interaction.Type != messengertypes.AppMessage_TypeUserMessage {
			continue
		}

		message := &messengertypes.AppMessage_UserMessage{}
		err = proto.Unmarshal(interaction.Interaction.Payload, message)
		require.NoError(b, err)

		foundMessage := false
		for i, ref := range expectedMessages {
			if message.Body == ref {
				expectedMessages = append(expectedMessages[:i], expectedMessages[i+1:]...)
				foundMessage = true
				b.Log(fmt.Sprintf("     found message : %s", message.Body))
				break
			}
		}

		if !foundMessage {
			b.Log(fmt.Sprintf("unexpected message : %s", message.Body))
		}

		if len(expectedMessages) == 0 {
			break
		}

		b.Logf("remaining messages : %s", strings.Join(expectedMessages, ","))
	}

	assert.Empty(b, len(expectedMessages))

	require.NoError(b, err)
	require.NoError(b, subErr)
	cl.CloseSend()
}
