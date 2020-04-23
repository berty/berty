package bertydemo

import (
	"context"
	"fmt"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	// "github.com/fortytw2/leaktest"
	"encoding/hex"
	"strings"

	orbitdb "berty.tech/go-orbit-db"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

// The leaktest calls are commented out since there is leaks remaining
// TODO: clean all leaks

func TestNew(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	ctx := context.Background()

	logger := testutil.Logger(t)
	ipfsmock, cleanup := ipfsutil.TestingCoreAPI(ctx, t)
	defer cleanup()

	demo, err := New(&Opts{
		Logger:           logger,
		CoreAPI:          ipfsmock,
		OrbitDBDirectory: ":memory:",
	})

	require.NoError(t, err)

	err = demo.Close()
	require.NoError(t, err)
}

func testingLogToken(t *testing.T, c DemoServiceClient) string {
	res, err := c.LogToken(context.Background(), &LogToken_Request{})
	require.NoError(t, err)
	return res.GetLogToken()
}

func TestLogToken(t *testing.T) {
	client, _, clean := testingInMemoryClient(t)
	defer clean()

	demo, clean := testingClientService(t, client)
	defer clean()

	_ = testingLogToken(t, demo)
}

func TestLogFromToken(t *testing.T) {
	client, _, clean := testingInMemoryClient(t)
	defer clean()

	demo, clean := testingClientService(t, client)
	defer clean()

	ctx := context.Background()
	token := testingLogToken(t, demo)

	firstLog, err := client.logFromToken(ctx, token)
	require.NoError(t, err)

	secondLog, err := client.logFromToken(ctx, token)
	require.NoError(t, err)

	assert.Equal(t, firstLog, secondLog)
}

func TestLogFromTokenDiffClients(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	_, _ = ipfsutil.TestingRDVP(ctx, t, rdvp)

	ipfsOpts := &ipfsutil.TestingAPIOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	}

	client1, _, clean := testingInMemoryClientWithOpts(t, ipfsOpts)
	defer clean()

	demo1, clean := testingClientService(t, client1)
	defer clean()

	client2, _, clean := testingInMemoryClientWithOpts(t, ipfsOpts)
	defer clean()

	demo2, clean := testingClientService(t, client2)
	defer clean()

	err = mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	tokenA := testingLogToken(t, demo1)
	tokenB := testingLogToken(t, demo2)

	assert.NotEqual(t, tokenA, tokenB)

	log1a, err := client1.logFromToken(ctx, tokenA)
	require.NoError(t, err)

	log2a, err := client2.logFromToken(ctx, tokenA)
	require.NoError(t, err)

	log1b, err := client1.logFromToken(ctx, tokenB)
	require.NoError(t, err)

	log2b, err := client2.logFromToken(ctx, tokenB)
	require.NoError(t, err)

	assert.Equal(t, log1a.Address().String(), log2a.Address().String())
	assert.Equal(t, log1b.Address().String(), log2b.Address().String())
	assert.NotEqual(t, log1a.Address().String(), log1b.Address().String())

	authorized1, err := log1a.AccessController().GetAuthorizedByRole("write")
	require.NoError(t, err)

	authorized2, err := log1a.AccessController().GetAuthorizedByRole("write")
	require.NoError(t, err)

	assert.Equal(t, strings.Join(authorized1, ","), strings.Join(authorized2, ","))

	pk1, err := log1a.Identity().GetPublicKey()
	require.NoError(t, err)

	pk2, err := log2a.Identity().GetPublicKey()
	require.NoError(t, err)

	require.True(t, pk1.Equals(pk2))

	rawPK, err := pk1.Raw()
	require.NoError(t, err)

	require.Equal(t, hex.EncodeToString(rawPK), authorized1[0])

	_, err = log1a.Add(ctx, []byte("From 1 - 1"))
	require.NoError(t, err)

	_, err = log2a.Add(ctx, []byte("From 2 - 1"))
	require.NoError(t, err)

	_, err = log1b.Add(ctx, []byte("From 1 - 2"))
	require.NoError(t, err)

	_, err = log2b.Add(ctx, []byte("From 2 - 2"))
	require.NoError(t, err)

	_, err = log1b.Add(ctx, []byte("From 1 - 3"))
	require.NoError(t, err)

	_, err = log2b.Add(ctx, []byte("From 2 - 3"))
	require.NoError(t, err)

	time.Sleep(time.Second)

	infinity := -1

	ops1, err := log1a.List(ctx, &orbitdb.StreamOptions{
		Amount: &infinity,
	})
	require.NoError(t, err)

	ops2, err := log2a.List(ctx, &orbitdb.StreamOptions{
		Amount: &infinity,
	})
	require.NoError(t, err)

	ops3, err := log1b.List(ctx, &orbitdb.StreamOptions{
		Amount: &infinity,
	})
	require.NoError(t, err)

	ops4, err := log2b.List(ctx, &orbitdb.StreamOptions{
		Amount: &infinity,
	})
	require.NoError(t, err)

	assert.Equal(t, 2, len(ops1))
	assert.Equal(t, 2, len(ops2))
	assert.Equal(t, 4, len(ops3))
	assert.Equal(t, 4, len(ops4))
}

func testingAdd(t *testing.T, c DemoServiceClient, lt string, data []byte) string {
	req := LogAdd_Request{
		LogToken: lt,
		Data:     data,
	}

	res, err := c.LogAdd(context.Background(), &req)
	require.NoError(t, err)

	return res.GetCid()
}

func TestLogAdd(t *testing.T) {
	client, _, clean := testingInMemoryClient(t)
	defer clean()

	demo, clean := testingClientService(t, client)
	defer clean()

	logToken := testingLogToken(t, demo)
	_ = testingAdd(t, demo, logToken, []byte("Hello log!"))
}

func TestLogGet(t *testing.T) {
	client, _, clean := testingInMemoryClient(t)
	defer clean()

	demo, clean := testingClientService(t, client)
	defer clean()

	logToken := testingLogToken(t, demo)
	data := []byte("Hello log!")
	opCid := testingAdd(t, demo, logToken, data)
	req := LogGet_Request{
		LogToken: logToken,
		Cid:      opCid,
	}

	res, err := demo.LogGet(context.Background(), &req)
	require.NoError(t, err)

	require.NotNil(t, res.GetOperation(), "LogGet().Op = nil; want an Op")

	got := res.GetOperation().GetName()
	shouldGet := "ADD"
	require.Equal(t, shouldGet, got)

	got = string(res.GetOperation().GetValue())
	shouldGet = string(data)
	assert.Equal(t, shouldGet, got)
}

func TestLogList(t *testing.T) {
	client, _, clean := testingInMemoryClient(t)
	defer clean()

	demo, clean := testingClientService(t, client)
	defer clean()

	logToken := testingLogToken(t, demo)
	data := []byte("Hello log!")
	_ = testingAdd(t, demo, logToken, data)

	req := LogList_Request{
		LogToken: logToken,
		Options:  nil,
	}

	res, err := demo.LogList(context.Background(), &req)
	require.NoError(t, err)

	shouldGet := string(data)
	found := false
	for _, op := range res.GetOperations() {
		if op.GetName() == "ADD" && string(op.GetValue()) == shouldGet {
			found = true
		}
	}
	require.True(t, found, "Added operation not found in LogList()")
}

func TestLogStreamSimple(t *testing.T) {
	client, _, clean := testingInMemoryClient(t)
	defer clean()

	demo, clean := testingClientService(t, client)
	defer clean()

	logToken := testingLogToken(t, demo)
	req := &LogStream_Request{
		LogToken: logToken,
		Options:  nil,
	}

	logClient, err := demo.LogStream(context.Background(), req)
	require.NoError(t, err)

	defer logClient.CloseSend()

	data := []byte("Hello log!")
	_ = testingAdd(t, demo, logToken, data)

	op, err := logClient.Recv()
	require.NoError(t, err)

	got := op.GetName()
	shouldGet := "ADD"
	require.Equal(t, shouldGet, got)

	got = string(op.GetValue())
	shouldGet = string(data)
	require.Equal(t, shouldGet, got)
}

func TestLogStream(t *testing.T) {
	cases := []struct {
		Name      string
		Iteration int
		Sleep     time.Duration
		SlowTest  bool
	}{
		{"None", 0, 0, false},
		{"1 iteration", 1, 0, false},
		{"1 iteration - 500ms sleep", 1, time.Millisecond * 500, false},
		{"10 iteration", 10, 0, false},
		{"10 iteration - 500ms sleep", 10, time.Millisecond * 500, true},
		{"50 iterations", 50, 0, true},
		{"50 iterations - 500ms sleep", 50, time.Millisecond * 500, true},
	}
	client, _, clean := testingInMemoryClient(t)
	defer clean()
	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.SlowTest {
				testutil.SkipSlow(t)
			}
			demo, clean := testingClientService(t, client)
			defer clean()
			logToken := testingLogToken(t, demo)
			req := &LogStream_Request{
				LogToken: logToken,
			}
			go func(maxIteration int) {
				for i := 0; i < maxIteration; i++ {
					data := []byte(fmt.Sprintf("Hello log number %d!", i))
					_ = testingAdd(t, demo, logToken, data)
				}
			}(tc.Iteration)

			// @FIXME(gfanton): wait at last 100millisecond, if not
			// set test may fail unable to find the first log
			time.Sleep(tc.Sleep + (time.Millisecond * 100))
			logClient, err := demo.LogStream(context.Background(), req)
			require.NoError(t, err)
			defer logClient.CloseSend()
			for i := 0; i < tc.Iteration; i++ {
				op, err := logClient.Recv()
				require.NoError(t, err)
				// fmt.Println("receiving op #", i, "in test", tc.Iteration)
				got := op.GetName()
				shouldGet := "ADD"
				if got != shouldGet {
					t.Fatalf("LogStream()->Op.Name = %s; want %s", got, shouldGet)
				}
				got = string(op.GetValue())
				shouldGet = fmt.Sprintf("Hello log number %d!", i)
				if got != shouldGet {
					t.Fatalf("LogStream()->Op.Value = %s; want %s", got, shouldGet)
				}
				require.NoError(t, err)
			}
		})
	}
}
