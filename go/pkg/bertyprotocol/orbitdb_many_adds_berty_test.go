package bertyprotocol

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"sync"
	"testing"
	"time"

	sync_ds "github.com/ipfs/go-datastore/sync"
	"github.com/juju/fslock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-orbit-db/iface"
)

func testAddBerty(ctx context.Context, t *testing.T, node ipfsutil.CoreAPIMock, g *protocoltypes.Group, pathBase string, storageKey []byte, storageSalt []byte, amountToAdd, amountCurrentlyPresent int) {
	t.Helper()
	testutil.FilterSpeed(t, testutil.Fast)
	t.Logf("TestAddBerty: amountToAdd: %d, amountCurrentlyPresent: %d\n", amountToAdd, amountCurrentlyPresent)

	api := node.API()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	lock := fslock.New(path.Join(pathBase, "lock"))
	err := lock.TryLock()
	require.NoError(t, err)

	defer lock.Unlock()

	baseDS, err := accountutils.GetRootDatastoreForPath(pathBase, storageKey, storageSalt, zap.NewNop())
	require.NoError(t, err)

	baseDS = sync_ds.MutexWrap(baseDS)

	defer testutil.Close(t, baseDS)

	odb, err := NewBertyOrbitDB(ctx, api, &NewOrbitDBOptions{
		Datastore: baseDS,
	})
	require.NoError(t, err)

	defer testutil.Close(t, odb)

	replicate := false
	gc, err := odb.OpenGroup(ctx, g, &iface.CreateDBOptions{
		Replicate: &replicate,
	})
	require.NoError(t, err)

	defer testutil.Close(t, gc)

	err = ActivateGroupContext(ctx, gc, nil)
	require.NoError(t, err)

	wg := sync.WaitGroup{}
	wg.Add(amountToAdd * 2)

	amountCurrentlyFound := 0

	messages, err := gc.MessageStore().ListEvents(ctx, nil, nil, false)
	require.NoError(t, err)

	for range messages {
		amountCurrentlyFound++
	}

	sub, err := gc.MessageStore().EventBus().Subscribe(new(protocoltypes.GroupMessageEvent))
	require.NoError(t, err)
	defer sub.Close()

	// Watch for incoming new messages
	go func() {
		for range sub.Out() {
			wg.Done()
		}
	}()

	_, err = gc.MetadataStore().AddDeviceToGroup(ctx)
	require.NoError(t, err)

	for i := 0; i < amountToAdd; i++ {
		_, err := gc.MessageStore().AddMessage(ctx, []byte(fmt.Sprintf("%d", i)), nil)
		require.NoError(t, err)
		wg.Done()
	}

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(30 * time.Second):
	}

	require.Equal(t, amountCurrentlyPresent, amountCurrentlyFound)
}

func TestAddBerty(t *testing.T) {
	// var rLimit syscall.Rlimit
	//
	// if err := syscall.Getrlimit(syscall.RLIMIT_NOFILE, &rLimit); err != nil {
	// 	t.Fatalf("Error getting rlimit %v", err)
	// }
	//
	// rLimit.Max = 100
	// rLimit.Cur = 100
	//
	// if err := syscall.Setrlimit(syscall.RLIMIT_NOFILE, &rLimit); err != nil {
	// 	t.Fatalf("Error setting rlimit %v", err)
	// }
	//
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	api, cleanup := ipfsutil.TestingCoreAPI(ctx, t)
	defer cleanup()

	pathBase, err := ioutil.TempDir("", "manyaddstest")
	if err != nil {
		t.Fatal(err)
	}

	defer os.RemoveAll(pathBase)

	g, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	storageKey := []byte("42424242424242424242424242424242")
	storageSalt := []byte("2121212121212121")

	testAddBerty(ctx, t, api, g, pathBase, storageKey, storageSalt, 20, 0)
	testAddBerty(ctx, t, api, g, pathBase, storageKey, storageSalt, 0, 20)
	testAddBerty(ctx, t, api, g, pathBase, storageKey, storageSalt, 20, 20)
	testAddBerty(ctx, t, api, g, pathBase, storageKey, storageSalt, 0, 40)

	// FIXME: use github.com/stretchr/testify/suite
}
