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

	"github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/juju/fslock"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
)

func testAddBerty(ctx context.Context, t *testing.T, node ipfsutil.CoreAPIMock, g *bertytypes.Group, pathBase string, amountToAdd, amountCurrentlyPresent int) {
	t.Helper()
	testutil.FilterSpeed(t, testutil.Slow)

	api := node.API()
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
			if err := os.MkdirAll(dirPath, 0o700); err != nil {
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

	odb, err := NewBertyOrbitDB(ctx, api, &NewOrbitDBOptions{Datastore: baseDS})
	require.NoError(t, err)

	defer odb.Close()

	gc, err := odb.openGroup(ctx, g, nil)
	require.NoError(t, err)

	defer gc.Close()

	err = ActivateGroupContext(ctx, gc, nil)
	require.NoError(t, err)

	wg := sync.WaitGroup{}
	wg.Add(amountToAdd * 2)
	wg.Add(1)

	amountCurrentlyFound := 0

	go func() {
		messages, err := gc.MessageStore().ListEvents(ctx, nil, nil, false)
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

	api, cleanup := ipfsutil.TestingCoreAPI(ctx, t)
	defer cleanup()

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
