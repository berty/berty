package bertyprotocol

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
)

func countEntries(out <-chan *bertytypes.GroupMessageEvent) int {
	found := 0

	for range out {
		found++
	}

	return found
}

func Test_AddMessage_ListMessages_manually_supplying_secrets(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	memberCount := 2
	deviceCount := 1
	entriesCount := 25

	testMsg1 := []byte("first message")

	peers, _, cleanup := createPeersWithGroup(ctx, t, "/tmp/message_test", memberCount, deviceCount)
	defer cleanup()

	dPK0 := peers[0].GC.DevicePubKey()
	ds0, err := peers[0].MKS.GetDeviceSecret(peers[0].GC.Group(), peers[0].DevKS)
	assert.NoError(t, err)
	assert.NotNil(t, ds0)

	err = peers[1].MKS.RegisterChainKey(peers[0].GC.Group(), dPK0, ds0, false)
	assert.NoError(t, err)

	_, err = peers[0].GC.MessageStore().AddMessage(ctx, testMsg1)
	assert.NoError(t, err)

	<-time.After(time.Millisecond * 500)

	out, err := peers[0].GC.MessageStore().ListEvents(ctx, nil, nil, false)
	assert.NoError(t, err)

	assert.Equal(t, 1, countEntries(out))

	watcherCtx, watcherCancel := context.WithTimeout(ctx, time.Second*2)
	chSub := peers[1].GC.MessageStore().Subscribe(watcherCtx)
	go func() {
		for range chSub {
			c, err := peers[1].GC.MessageStore().ListEvents(watcherCtx, nil, nil, false)
			if !assert.NoError(t, err) {
				watcherCancel()
				break
			}

			if countEntries(c) == entriesCount+1 {
				watcherCancel()
				break
			}
		}
	}()

	for i := 0; i < entriesCount; i++ {
		payload := []byte(fmt.Sprintf("test message %d", i))
		_, err = peers[0].GC.MessageStore().AddMessage(ctx, payload)
		assert.NoError(t, err)
	}

	<-watcherCtx.Done()

	out, err = peers[1].GC.MessageStore().ListEvents(ctx, nil, nil, false)
	assert.NoError(t, err)

	testutil.FilterStability(t, testutil.Unstable)

	<-time.After(time.Second)

	assert.Equal(t, 1+entriesCount, countEntries(out))

	// TODO: check that ListEvents can be called multiple times with the same output
	// TODO: check that message are correctly ordered
	// TODO: check that message are correctly decrypted
	// TODO: check that message sender is correct
	// TODO: check that message parents IDs are valid
	// TODO: check that message IDs are valid
}
