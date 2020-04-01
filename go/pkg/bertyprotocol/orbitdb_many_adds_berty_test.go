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

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	orbitdb "berty.tech/go-orbit-db"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/juju/fslock"
	"github.com/stretchr/testify/require"
)

func testAddBerty(ctx context.Context, t *testing.T, api ipfsutil.CoreAPIMock, g *bertytypes.Group, pathBase string, amountToAdd, amountCurrentlyPresent int) {
	t.Helper()
	testutil.SkipSlow(t)

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	lock := fslock.New(path.Join(pathBase, "lock"))
	err := lock.TryLock()
	require.NoError(t, err)

	defer lock.Unlock()

	dsPathBase := path.Join(pathBase, "badger")

	for _, dirPath := range []string{dsPathBase} {
		_, err := os.Stat(dirPath)
		if err != nil {
			if !os.IsNotExist(err) {
				panic(err)
			}
			if err := os.MkdirAll(dirPath, 0700); err != nil {
				panic(err)
			}
		}
	}

	var baseDS datastore.Batching
	baseDS, err = badger.NewDatastore(dsPathBase, nil)
	require.NoError(t, err)

	defer baseDS.Close()

	baseDS = sync_ds.MutexWrap(baseDS)

	defer baseDS.Close()

	accountDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("deviceKeystore"))
	messagesDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("messages"))
	orbitdbDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("orbitdb"))

	accountKS := ipfsutil.NewDatastoreKeystore(accountDS)
	orbitdbCache := NewOrbitDatastoreCache(orbitdbDS)
	mk := NewMessageKeystore(messagesDS)

	odb, err := newBertyOrbitDB(ctx, api, NewDeviceKeystore(accountKS), mk, nil, &orbitdb.NewOrbitDBOptions{Cache: orbitdbCache})
	require.NoError(t, err)

	defer odb.Close()

	gc, err := odb.OpenGroup(ctx, g, nil)
	require.NoError(t, err)

	defer gc.Close()

	err = ActivateGroupContext(ctx, gc)
	require.NoError(t, err)

	wg := sync.WaitGroup{}
	wg.Add(amountToAdd * 2)
	wg.Add(1)

	amountCurrentlyFound := 0

	go func() {
		messages, err := gc.MessageStore().ListMessages(ctx)
		require.NoError(t, err)

		for range messages {
			amountCurrentlyFound++
		}
		wg.Done()
	}()

	// Watch for incoming new messages
	go func() {
		for e := range gc.MessageStore().Subscribe(ctx) {
			_, ok := e.(*bertytypes.GroupMessageEvent)
			if !ok {
				continue
			}

			wg.Done()
		}
	}()

	_, err = gc.MetadataStore().AddDeviceToGroup(ctx)
	require.NoError(t, err)

	<-time.After(time.Millisecond * 2000)

	for i := 0; i < amountToAdd; i++ {
		_, err := gc.MessageStore().AddMessage(ctx, []byte(fmt.Sprintf("%d", i)))
		require.NoError(t, err)
		wg.Done()
	}

	wg.Wait()

	require.Equal(t, amountCurrentlyFound, amountCurrentlyPresent)
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

	api := ipfsutil.TestingCoreAPI(ctx, t)
	defer api.Close()

	pathBase, err := ioutil.TempDir("", "manyaddstest")
	if err != nil {
		t.Fatal(err)
	}

	defer os.RemoveAll(pathBase)

	g, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	testAddBerty(ctx, t, api, g, pathBase, 20, 0)
	testAddBerty(ctx, t, api, g, pathBase, 0, 20)
	testAddBerty(ctx, t, api, g, pathBase, 20, 20)
	testAddBerty(ctx, t, api, g, pathBase, 0, 40)

	// FIXME: use github.com/stretchr/testify/suite
}
