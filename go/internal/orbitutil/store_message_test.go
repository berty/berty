package orbitutil_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"berty.tech/berty/go/internal/bertycrypto"
	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

func countEntries(out <-chan *bertyprotocol.GroupMessageEvent) int {
	found := 0

	for range out {
		found++
	}

	return found
}

func Test_AddMessage_ListMessages_manually_supplying_secrets(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	memberCount := 2
	deviceCount := 1
	entriesCount := 25

	testMsg1 := []byte("first message")

	peers, _ := orbitutil.CreatePeersWithGroup(ctx, t, "/tmp/message_test", memberCount, deviceCount)
	defer orbitutil.DropPeers(t, peers)

	dPK0 := peers[0].GC.DevicePubKey()
	ds0, err := bertycrypto.DeviceSecret(ctx, peers[0].GC.Group(), peers[0].MK, peers[0].Acc)
	assert.NoError(t, err)
	assert.NotNil(t, ds0)

	err = bertycrypto.RegisterChainKey(ctx, peers[1].MK, peers[0].GC.Group(), dPK0, ds0, false)
	assert.NoError(t, err)

	_, err = peers[0].GC.MessageStore().AddMessage(ctx, testMsg1)
	assert.NoError(t, err)

	<-time.After(time.Millisecond * 500)

	out, err := peers[0].GC.MessageStore().ListMessages(ctx)
	assert.NoError(t, err)

	assert.Equal(t, 1, countEntries(out))

	watcherCtx, watcherCancel := context.WithTimeout(ctx, time.Millisecond*15000)

	for i := 0; i < entriesCount; i++ {
		payload := []byte(fmt.Sprintf("test message %d", i))
		_, err = peers[0].GC.MessageStore().AddMessage(ctx, payload)
		assert.NoError(t, err)
	}

	go func() {
		for range peers[1].GC.MessageStore().Subscribe(watcherCtx) {
			c, err := peers[1].GC.MessageStore().ListMessages(watcherCtx)
			if err != nil {
				t.Fatal(err)
			}

			if countEntries(c) == entriesCount+1 {
				watcherCancel()
			}
		}
	}()

	<-watcherCtx.Done()

	out, err = peers[1].GC.MessageStore().ListMessages(ctx)
	assert.NoError(t, err)

	<-time.After(time.Second)

	assert.Equal(t, 1+entriesCount, countEntries(out))

	// TODO: check that ListMessages can be called multiple times with the same output
	// TODO: check that message are correctly ordered
	// TODO: check that message are correctly decrypted
	// TODO: check that message sender is correct
	// TODO: check that message parents IDs are valid
	// TODO: check that message IDs are valid
}
