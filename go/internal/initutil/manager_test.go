package initutil_test

import (
	"context"
	"flag"
	"fmt"
	"sync"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/stretchr/testify/require"
	"go.uber.org/goleak"
	"moul.io/u"
)

func Example_flags() {
	// init manager
	ctx := context.Background()
	manager, err := initutil.New(ctx)
	if err != nil {
		panic(err)
	}
	defer manager.Close()

	// configure flags
	fmt.Println("before", u.JSON(manager.Node.GRPC))
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupRemoteNodeFlags(fs)
	manager.SetupDefaultGRPCListenersFlags(fs)
	err = fs.Parse([]string{"-store.inmem", "-p2p.min-backoff=2m10s", "-node.remote-addr=1.2.3.4:5678"})
	if err != nil {
		panic(err)
	}
	fmt.Println("after ", u.JSON(manager.Node.GRPC))

	// Output:
	// before {"RemoteAddr":"","Listeners":""}
	// after  {"RemoteAddr":"1.2.3.4:5678","Listeners":"/ip4/127.0.0.1/tcp/9091/grpc"}
}

func Example_noflags() {
	// init manager
	ctx := context.Background()
	manager, err := initutil.New(ctx)
	if err != nil {
		panic(err)
	}
	defer manager.Close()

	fs := flag.NewFlagSet("", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupRemoteNodeFlags(fs)
	fs.Parse([]string{})

	// configure manager without flags
	manager.Node.GRPC.Listeners = ""
	manager.Node.Protocol.DisableIPFSNetwork = true
	manager.Datastore.InMemory = true

	// start a local berty protocol server
	_, err = manager.GetLocalProtocolServer()
	if err != nil {
		panic(err)
	}

	// build a client for the previously created protocol server
	client, err := manager.GetProtocolClient()
	if err != nil {
		panic(err)
	}

	// retrieve config
	ret, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		panic(err)
	}

	// check that the reply is valid (cannot check hardcoded value, since it's random)
	fmt.Println(ret.AccountPK != nil)

	// Output:
	// true
}

func TestTwoConcurrentManagers(t *testing.T) {
	var man1, man2 *initutil.Manager
	var ctx1, ctx2 context.Context

	// FIXME: automatically find an available port

	// init man 1
	{
		ctx1 = context.Background()
		manager, err := initutil.New(ctx1)
		require.NoError(t, err)
		require.NotNil(t, manager)
		defer manager.Close()
		fs := flag.NewFlagSet("man1", flag.ExitOnError)
		manager.SetupLocalProtocolServerFlags(fs)
		manager.SetupEmptyGRPCListenersFlags(fs)
		err = fs.Parse([]string{"-node.listeners", "/ip4/0.0.0.0/tcp/9097", "-store.inmem"})
		require.NoError(t, err)
		man1 = manager
	}

	// init man 2
	{
		ctx2 = context.Background()
		manager, err := initutil.New(ctx2)
		require.NoError(t, err)
		require.NotNil(t, manager)
		defer manager.Close()
		fs := flag.NewFlagSet("man2", flag.ExitOnError)
		manager.SetupRemoteNodeFlags(fs)
		manager.SetupEmptyGRPCListenersFlags(fs)
		err = fs.Parse([]string{"-node.remote-addr", "127.0.0.1:9097"})
		require.NoError(t, err)
		man2 = manager
	}

	// start man1's local server
	{
		server, err := man1.GetLocalMessengerServer()
		require.NoError(t, err)
		require.NotNil(t, server)

		go man1.RunWorkers()
		time.Sleep(time.Second * 1)
	}

	// start man2's client
	{
		client, err := man2.GetProtocolClient()
		require.NoError(t, err)
		require.NotNil(t, client)

		ret, err := client.InstanceGetConfiguration(ctx2, &bertytypes.InstanceGetConfiguration_Request{})
		require.NoError(t, err)
		require.NotNil(t, ret.AccountPK)
	}
}

func TestCloseByContext(t *testing.T) {
	// FIXME: defer goleak.VerifyNone(t, goleak.IgnoreCurrent())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	fs.Parse([]string{"-store.inmem", "-node.listeners=/ip4/127.0.0.1/tcp/0/grpc"})

	server, err := manager.GetLocalProtocolServer()
	require.NoError(t, err)
	require.NotNil(t, server)
}

func TestUnstableFlagsLeak(t *testing.T) {
	// strange: this test is the most unstable one in term leak detection
	testutil.FilterStability(t, testutil.Unstable)

	defer goleak.VerifyNone(t, goleak.IgnoreCurrent(),
		// FIXME: should not have the following lines
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*closedLocalSession).run"),
		goleak.IgnoreTopFunction("internal/poll.runtime_pollWait"),
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/discovery.(*mdnsService).pollForEntries.func1"),
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-quic-transport.(*reuse).runGarbageCollector"),
	)

	ctx := context.Background()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupRemoteNodeFlags(fs)
	err = fs.Parse([]string{"-store.inmem", "-p2p.min-backoff=2m10s", "-node.remote-addr=1.2.3.4:5678"})
	require.NoError(t, err)
}

func TestLocalProtocolServerAndClient(t *testing.T) {
	ctx := context.Background()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)
	defer manager.Close()

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	err = fs.Parse([]string{"-node.listeners=/ip4/127.0.0.1/tcp/0/grpc", "-store.inmem"})
	require.NoError(t, err)

	server, err := manager.GetLocalProtocolServer()
	require.NoError(t, err)
	require.NotNil(t, server)

	client, err := manager.GetProtocolClient()
	require.NoError(t, err)
	require.NotNil(t, client)

	ret, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	require.NoError(t, err)
	require.NotNil(t, ret.AccountPK)
}

func TestLocalProtocolServerLeak(t *testing.T) {
	// FIXME: defer goleak.VerifyNone(t, goleak.IgnoreCurrent())

	ctx := context.Background()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)
	defer manager.Close()

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	err = fs.Parse([]string{"-node.listeners=/ip4/127.0.0.1/tcp/0/grpc", "-store.inmem"})

	server, err := manager.GetLocalProtocolServer()
	require.NoError(t, err)
	require.NotNil(t, server)
}

func TestCloseOnUninited(t *testing.T) {
	// FIXME: defer goleak.VerifyNone(t, goleak.IgnoreCurrent())

	ctx := context.Background()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)
	manager.Close()
}

func TestClosingTwice(t *testing.T) {
	// FIXME: defer goleak.VerifyNone(t, goleak.IgnoreCurrent())

	ctx := context.Background()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	err = fs.Parse([]string{"-node.listeners=", "-store.inmem"})
	require.NoError(t, err)

	_, err = manager.GetLocalProtocolServer()
	require.NoError(t, err)

	go manager.Close()
	go manager.Close()
	go manager.Close()
	manager.Close()
	manager.Close()
}

func TestCloseOpenClose(t *testing.T) {
	t.Skip("TODO")
}

func TestRacyClose(t *testing.T) {
	// FIXME: defer goleak.VerifyNone(t, goleak.IgnoreCurrent())

	ctx := context.Background()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	err = fs.Parse([]string{"-node.listeners=", "-store.inmem"})
	require.NoError(t, err)

	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		manager.Close()
		wg.Done()
	}()
	go func() {
		_, err := manager.GetLocalProtocolServer()
		require.True(t, err == nil || err == context.Canceled)
		wg.Done()
	}()

	wg.Wait()
}

func TestStoreOnRealFS(t *testing.T) {
	t.Skip("TODO")
}
