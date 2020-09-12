package initutil_test

import (
	"context"
	"flag"
	"fmt"
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
	err = fs.Parse([]string{"-store.inmem", "-p2p.min-backoff=2m10s", "-node.remote-addr=1.2.3.4:5678"})
	if err != nil {
		panic(err)
	}
	fmt.Println("after ", u.JSON(manager.Node.GRPC))

	// Output:
	// before {"RemoteAddr":""}
	// after  {"RemoteAddr":"1.2.3.4:5678"}
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
	fs.Parse([]string{"-node.listeners", ""})

	// configure manager without flags
	manager.Node.Protocol.DisableIPFSNetwork = true

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
	// API server listening on /ip4/127.0.0.1/tcp/5001
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
		err = fs.Parse([]string{"-node.listeners", "/ip4/0.0.0.0/tcp/9097"})
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
	testutil.FilterStability(t, testutil.Broken)

	defer goleak.VerifyNone(t, goleak.IgnoreCurrent())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)

	server, err := manager.GetLocalProtocolServer()
	require.NoError(t, err)
	require.NotNil(t, server)
}

func TestFlagsLeak(t *testing.T) {
	defer goleak.VerifyNone(t, goleak.IgnoreCurrent())

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
	err = fs.Parse([]string{"-node.listeners", ""})
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
	testutil.FilterStability(t, testutil.Broken)

	defer goleak.VerifyNone(t, goleak.IgnoreCurrent())

	ctx := context.Background()
	manager, err := initutil.New(ctx)
	require.NoError(t, err)
	require.NotNil(t, manager)
	defer manager.Close()

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLocalProtocolServerFlags(fs)

	server, err := manager.GetLocalProtocolServer()
	require.NoError(t, err)
	require.NotNil(t, server)
}
