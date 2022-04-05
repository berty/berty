package bertyprotocol

import (
	"container/ring"
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/libp2p/go-eventbus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	ipfslog "berty.tech/go-ipfs-log"
)

func countEntries(out <-chan *protocoltypes.GroupMessageEvent) int {
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

	peers, _, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/message_test", memberCount, deviceCount)
	defer cleanup()

	dPK0 := peers[0].GC.DevicePubKey()
	ds0, err := peers[0].MKS.GetDeviceSecret(ctx, peers[0].GC.Group(), peers[0].DevKS)
	require.NoError(t, err)
	require.NotNil(t, ds0)

	err = peers[1].MKS.RegisterChainKey(ctx, peers[0].GC.Group(), dPK0, ds0, false)
	require.NoError(t, err)

	_, err = peers[0].GC.MessageStore().AddMessage(ctx, testMsg1, nil)
	require.NoError(t, err)

	<-time.After(time.Millisecond * 500)

	out, err := peers[0].GC.MessageStore().ListEvents(ctx, nil, nil, false)
	require.NoError(t, err)

	require.Equal(t, 1, countEntries(out))

	watcherCtx, watcherCancel := context.WithTimeout(ctx, time.Second*2)
	chSub, err := peers[1].GC.MessageStore().EventBus().Subscribe(new(protocoltypes.GroupMessageEvent))
	require.NoError(t, err)
	defer chSub.Close()

	go func() {
		for {
			select {
			case <-chSub.Out():
			case <-watcherCtx.Done():
				return
			}
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
		_, err = peers[0].GC.MessageStore().AddMessage(ctx, payload, nil)
		require.NoError(t, err)
	}

	<-watcherCtx.Done()

	out, err = peers[1].GC.MessageStore().ListEvents(ctx, nil, nil, false)
	require.NoError(t, err)

	testutil.FilterStability(t, testutil.Flappy)

	<-time.After(time.Second)

	require.Equal(t, 1+entriesCount, countEntries(out))

	// TODO: check that ListEvents can be called multiple times with the same output
	// TODO: check that message are correctly ordered
	// TODO: check that message are correctly decrypted
	// TODO: check that message sender is correct
	// TODO: check that message parents IDs are valid
	// TODO: check that message IDs are valid
}

func bufferCount(buffer *ring.Ring) int {
	count := 0
	buffer.Do(func(f interface{}) {
		if _, ok := f.(ipfslog.Entry); ok {
			count++
		}
	})
	return count
}

func Test_Add_Messages_To_Cache(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Fast)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	memberCount := 2
	deviceCount := 1
	entriesCount := 50

	testMsg1 := []byte("last message")

	peers, _, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/message_test", memberCount, deviceCount)
	defer cleanup()

	dPK0 := peers[0].GC.DevicePubKey()
	dPK0Raw, err := dPK0.Raw()
	require.NoError(t, err)
	ds0, err := peers[0].MKS.GetDeviceSecret(ctx, peers[0].GC.Group(), peers[0].DevKS)
	require.NoError(t, err)
	require.NotNil(t, ds0)

	cevent, err := peers[0].GC.MessageStore().EventBus().Subscribe(
		new(protocoltypes.GroupMessageEvent), eventbus.BufSize(entriesCount))
	require.NoError(t, err)

	cadded, err := peers[1].GC.MessageStore().EventBus().Subscribe(
		new(messageItem), eventbus.BufSize(entriesCount))
	require.NoError(t, err)

	for i := 0; i < entriesCount; i++ {
		payload := []byte(fmt.Sprintf("test message %d", i))
		_, err = peers[0].GC.MessageStore().AddMessage(ctx, payload, nil)
		require.NoError(t, err)
	}

	// check that all events has been received on peer 1
	for i := 0; i < entriesCount; i++ {
		select {
		case <-cevent.Out():
		case <-time.After(time.Second):
			require.FailNow(t, "timeout while waiting for group message event")
			return
		}
	}
	cevent.Close()

	clist, err := peers[0].GC.MessageStore().ListEvents(ctx, nil, nil, false)
	require.NoError(t, err)
	count := countEntries(clist)
	require.Equal(t, entriesCount, count)

	// check that messages has been replicated on peer 2
	for i := 0; i < entriesCount; i++ {
		select {
		case <-cadded.Out():
		case <-time.After(time.Second * 5):
			require.FailNow(t, "timeout while waiting for replicated event")
			return
		}
	}
	cadded.Close()

	// time.Sleep(time.Millisecond * 500)

	size, ok := peers[1].GC.MessageStore().CacheSizeForDevicePK(dPK0Raw)
	require.True(t, ok)
	require.Equal(t, entriesCount, size)

	err = peers[1].MKS.RegisterChainKey(ctx, peers[0].GC.Group(), dPK0, ds0, false)
	require.NoError(t, err)

	cevent, err = peers[1].GC.MessageStore().EventBus().Subscribe(
		new(protocoltypes.GroupMessageEvent), eventbus.BufSize(entriesCount))
	require.NoError(t, err)

	peers[1].GC.MessageStore().ProcessMessageQueueForDevicePK(ctx, dPK0Raw)

	// check that all events has been received on peer 2
	for i := 0; i < entriesCount; i++ {
		select {
		case <-cevent.Out():
		case <-time.After(time.Second):
			require.FailNow(t, "timeout while waiting for group message event")
			return
		}
	}
	cevent.Close()

	size, ok = peers[1].GC.MessageStore().CacheSizeForDevicePK(dPK0Raw)
	require.True(t, ok)
	require.Equal(t, 0, size)

	_, err = peers[0].GC.MessageStore().AddMessage(ctx, testMsg1, nil)
	require.NoError(t, err)

	size, ok = peers[1].GC.MessageStore().CacheSizeForDevicePK(dPK0Raw)
	require.True(t, ok)
	require.Equal(t, 0, size)
}
