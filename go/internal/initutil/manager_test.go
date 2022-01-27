// @FIXME(gfanton): auto relay can occasionally rise data race in some tests,
// disabling race for now
//go:build !race
// +build !race

package initutil_test

import (
	"context"
	"flag"
	"fmt"
	"runtime"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.uber.org/goleak"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func verifySetupLeakDetection(t *testing.T) {
	if runtime.GOOS == "windows" {
		// leak is not consistent on windows, skipping
		return
	}

	goleak.VerifyNone(t,
		goleak.IgnoreTopFunction("github.com/ipfs/go-log/writer.(*MirrorWriter).logRoutine"), // global writer created at github.com/ipfs/go-log@v1.0.4/writer/option.go, refer by github.com/ipfs/, like go-bitswap
		goleak.IgnoreTopFunction("go.opencensus.io/stats/view.(*worker).start"),              // called by init() in berty/go/internal/grpcutil/server.go
		goleak.IgnoreTopFunction("github.com/desertbit/timer.timerRoutine"),                  // called by init() in github.com/desertbit/timer/timers.go, refer in grpc-web
	)
}

func verifyRunningLeakDetection(t *testing.T) {
	if runtime.GOOS == "windows" {
		// leak is not consistent on windows, skipping
		return
	}

	// waiting for some go routines finished
	// sometimes if timeout is quite short - not enough for below functions to finished
	time.Sleep(5 * time.Second)
	goleak.VerifyNone(t,
		goleak.IgnoreTopFunction("github.com/desertbit/timer.timerRoutine"),                                                  // called by init() in github.com/desertbit/timer/timers.go, refer in grpc-web
		goleak.IgnoreTopFunction("github.com/ipfs/go-log/writer.(*MirrorWriter).logRoutine"),                                 // global writer created at github.com/ipfs/go-log@v1.0.4/writer/option.go, refer by github.com/ipfs/, like go-bitswap
		goleak.IgnoreTopFunction("github.com/jbenet/goprocess.(*process).doClose"),                                           // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/jbenet/goprocess/context.CloseAfterContext.func1"),                              // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/jbenet/goprocess/periodic.callOnTicker.func1"),                                  // FIXME - upstream code - is used in many code of libp2p + go-ipfs
		goleak.IgnoreTopFunction("github.com/libp2p/go-flow-metrics.(*sweeper).run"),                                         // this goroutine has run always without stop
		goleak.IgnoreTopFunction("github.com/libp2p/go-flow-metrics.(*sweeper).runActive"),                                   // this goroutine has run always without stop
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-autonat.(*AmbientAutoNAT).background"),                         // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-autonat.(*autoNATService).background"),                         // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-circuit.(*RelayListener).Accept"),                              // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-connmgr.(*BasicConnMgr).background"),                           // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-connmgr.(*decayer).process"),                                   // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-noise.newSecureSession"),                                       // upstream issue
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-peerstore/pstoremem.(*memoryAddrBook).background"),             // upstream issue, no store close in upstream code
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-quic-transport.(*reuse).runGarbageCollector"),                  // upstream issue of mdns, go wakeup periodiclly to do action before check exist, timeout about 30 seconds
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-quic-transport.(*transport).Dial.func1"),                       // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-swarm.(*DialBackoff).background"),                              // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-swarm.(*Swarm).dialAddrs"),                                     // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-swarm.(*activeDial).wait"),                                     // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-transport-upgrader.(*Upgrader).setupMuxer"),                    // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-transport-upgrader.(*listener).Accept"),                        // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("berty.tech/berty/v2/go/internal/ipfsutil.(*mdnsService).startResolver.func1"),              // upstream issue of mdns, go wakeup periodiclly to do action before check exist, timeout about 10 seconds
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/host/basic.(*BasicHost).background"),                       // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/host/basic.(*BasicHost).dialPeer"),                         // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/host/relay.(*AutoRelay).background"),                       // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/host/relay.(*AutoRelay).findRelays"),                       // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/protocol/identify.(*IDService).loop"),                      // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/protocol/identify.(*IDService).loop.func1"),                // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/protocol/identify.(*ObservedAddrManager).worker"),          // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/protocol/identify.(*peerHandler).loop"),                    // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-mplex.(*Multiplex).Accept"),                                           // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-mplex.(*Multiplex).handleOutgoing"),                                   // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-mplex.(*Stream).waitForData"),                                         // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/libp2p/go-nat.DiscoverGateway"),                                                 // upstream code - DiscoverGateway() using context.Background() with timeout is 10s
		goleak.IgnoreTopFunction("github.com/libp2p/go-nat.DiscoverNATs.func1"),                                              // upstream code - DiscoverGateway() using context.Background() with timeout is 10s
		goleak.IgnoreTopFunction("github.com/libp2p/go-nat.discoverNATPMP.func1"),                                            // upstream code
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*baseServer).accept"),                                   // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*baseServer).run"),                                      // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*client).dial"),                                         // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*closedLocalSession).run"),                              // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*incomingBidiStreamsMap).AcceptStream"),                 // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*receiveStream).readImpl"),                              // upstream code - the closing is did in go routine
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*sendQueue).Run"),                                       // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go.(*session).run"),                                         // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go/internal/handshake.(*cryptoSetup).ReadHandshakeMessage"), // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/lucas-clemente/quic-go/internal/handshake.(*cryptoSetup).RunHandshake"),         // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-quic-transport.(*reuse).gc"),                                   // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/whyrusleeping/mdns.(*client).query"),                                            // the closing routine has big timeout
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/discovery/mdns_legacy.(*mdnsService).startResolver.func1"), // the closing routine has big timeout, should be managed by ipfs
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/discovery/mdns_legacy.(*mdnsService).startResolver.func1"), // the closing routine has big timeout, should be managed by ipfs
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p/p2p/discovery/mdns.(*mdnsService).startResolver.func1"),        // the closing routine has big timeout, should be managed by ipfs
		goleak.IgnoreTopFunction("github.com/libp2p/zeroconf/v2.(*client).mainloop"),                                         // the closing routine has big timeout, should be managed by ipfs
		goleak.IgnoreTopFunction("github.com/libp2p/zeroconf/v2.(*client).periodicQuery"),                                    // the closing routine has big timeout, should be managed by ipfs
		goleak.IgnoreTopFunction("github.com/ipfs/go-ipfs/core/bootstrap.bootstrapConnect.func1 "),                           // the closing routine has big timeout, should be managed by ipfs
		goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-nat.(*NAT).refreshMappings"),                                   // the closing routine has big timeout, should be managed by ipfs
		goleak.IgnoreTopFunction("go.opencensus.io/stats/view.(*worker).start"),                                              // called by init() in berty/go/internal/grpcutil/server.go
		goleak.IgnoreTopFunction("go.uber.org/fx.withTimeout"),                                                               // sometimes happening on CI, need more investigation
		goleak.IgnoreTopFunction("internal/poll.runtime_pollWait"),                                                           // upstream issue of mdns, go wakeup periodiclly to do action before check exist, timeout about 10 seconds
		goleak.IgnoreTopFunction("net.(*netFD).connect.func2"),                                                               // FIXME - many libraries used this code
		goleak.IgnoreTopFunction("sync.runtime_Semacquire"),                                                                  // the closing routine has big timeout
		goleak.IgnoreTopFunction("sync.runtime_SemacquireMutex"),                                                             // sometimes happening on CI, need more investigation
	)
}

func Example_flags() {
	// init manager
	ctx := context.Background()
	manager, err := initutil.New(ctx, nil)
	if err != nil {
		panic(err)
	}
	defer manager.Close(nil)

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
	// before {}
	// after  {"RemoteAddr":"1.2.3.4:5678","Listeners":"/ip4/127.0.0.1/tcp/9091/grpc"}
}

func Example_noflags() {
	// init manager
	ctx := context.Background()
	manager, err := initutil.New(ctx, nil)
	if err != nil {
		panic(err)
	}
	defer manager.Close(nil)

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
	ret, err := client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
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
		manager, err := initutil.New(ctx1, nil)
		require.NoError(t, err)
		require.NotNil(t, manager)
		defer manager.Close(nil)
		fs := flag.NewFlagSet("man1", flag.ExitOnError)
		manager.SetupLoggingFlags(fs)
		manager.SetupLocalProtocolServerFlags(fs)
		manager.SetupEmptyGRPCListenersFlags(fs)
		err = fs.Parse([]string{"-node.listeners", "/ip4/127.0.0.1/tcp/9097", "-store.inmem", "-log.filters=", "-log.ring-filters="})
		require.NoError(t, err)
		man1 = manager
	}

	// init man 2
	{
		ctx2 = context.Background()
		manager, err := initutil.New(ctx2, nil)
		require.NoError(t, err)
		require.NotNil(t, manager)
		defer manager.Close(nil)
		fs := flag.NewFlagSet("man2", flag.ExitOnError)
		manager.SetupLoggingFlags(fs)
		manager.SetupRemoteNodeFlags(fs)
		manager.SetupEmptyGRPCListenersFlags(fs)
		err = fs.Parse([]string{"-node.remote-addr", "127.0.0.1:9097", "-log.filters=", "-log.ring-filters="})
		require.NoError(t, err)
		man2 = manager
	}

	// start man1's local server
	{
		server, err := man1.GetLocalMessengerServer()
		require.NoError(t, err)
		require.NotNil(t, server)

		go man1.RunWorkers()
		time.Sleep(time.Second * 2)
	}

	// start man2's client
	{
		client, err := man2.GetProtocolClient()
		require.NoError(t, err)
		require.NotNil(t, client)

		ret, err := client.InstanceGetConfiguration(ctx2, &protocoltypes.InstanceGetConfiguration_Request{})
		require.NoError(t, err)
		require.NotNil(t, ret.AccountPK)
	}
}

func TestCloseByContext(t *testing.T) {
	defer verifyRunningLeakDetection(t)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	manager, err := initutil.New(ctx, nil)
	require.NoError(t, err)
	require.NotNil(t, manager)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	fs.Parse([]string{"-store.inmem", "-node.listeners=/ip4/127.0.0.1/tcp/0/grpc", "-log.filters=", "-log.ring-filters="})

	server, err := manager.GetLocalProtocolServer()
	require.NoError(t, err)
	require.NotNil(t, server)
}

func TestFlagsLeak(t *testing.T) {
	// FIXME : should call defer verifySetupLeakDetection(t)
	// but maybe because when run test with other tests, still have some goroutine of previous tests are not done
	defer verifyRunningLeakDetection(t)
	ctx := context.Background()
	manager, err := initutil.New(ctx, nil)
	require.NoError(t, err)
	require.NotNil(t, manager)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupRemoteNodeFlags(fs)
	err = fs.Parse([]string{"-store.inmem", "-p2p.min-backoff=2m10s", "-node.remote-addr=1.2.3.4:5678", "-log.filters=", "-log.ring-filters="})
	require.NoError(t, err)
}

func TestLocalProtocolServerAndClient(t *testing.T) {
	ctx := context.Background()
	manager, err := initutil.New(ctx, nil)
	require.NoError(t, err)
	require.NotNil(t, manager)
	defer manager.Close(nil)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	err = fs.Parse([]string{"-node.listeners=/ip4/127.0.0.1/tcp/0/grpc", "-store.inmem", "-log.filters=", "-log.ring-filters="})
	require.NoError(t, err)

	server, err := manager.GetLocalProtocolServer()
	require.NoError(t, err)
	require.NotNil(t, server)

	client, err := manager.GetProtocolClient()
	require.NoError(t, err)
	require.NotNil(t, client)

	ret, err := client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	require.NoError(t, err)
	require.NotNil(t, ret.AccountPK)
}

func TestLocalProtocolServerLeak(t *testing.T) {
	defer verifyRunningLeakDetection(t)
	ctx := context.Background()
	manager, err := initutil.New(ctx, nil)
	require.NoError(t, err)
	require.NotNil(t, manager)
	defer manager.Close(nil)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	err = fs.Parse([]string{"-node.listeners=/ip4/127.0.0.1/tcp/0/grpc", "-store.inmem", "-log.filters=", "-log.ring-filters="})

	server, err := manager.GetLocalProtocolServer()
	require.NoError(t, err)
	require.NotNil(t, server)
}

func TestCloseOnUninited(t *testing.T) {
	defer verifyRunningLeakDetection(t)

	ctx := context.Background()
	manager, err := initutil.New(ctx, nil)
	require.NoError(t, err)
	require.NotNil(t, manager)
	manager.Close(nil)
}

func TestClosingTwice(t *testing.T) {
	defer verifyRunningLeakDetection(t)

	ctx := context.Background()
	manager, err := initutil.New(ctx, nil)
	require.NoError(t, err)
	require.NotNil(t, manager)

	// configure flags
	fs := flag.NewFlagSet("test", flag.ExitOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalProtocolServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	err = fs.Parse([]string{"-node.listeners=", "-store.inmem", "-log.filters=", "-log.ring-filters="})
	require.NoError(t, err)

	_, err = manager.GetLocalProtocolServer()
	require.NoError(t, err)

	go manager.Close(nil)
	go manager.Close(nil)
	go manager.Close(nil)
	manager.Close(nil)
	manager.Close(nil)
}

func TestCloseOpenClose(t *testing.T) {
	t.Skip("TODO")
}

func TestRacyClose(t *testing.T) {
	defer verifyRunningLeakDetection(t)

	ctx := context.Background()
	manager, err := initutil.New(ctx, nil)
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
		manager.Close(nil)
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
