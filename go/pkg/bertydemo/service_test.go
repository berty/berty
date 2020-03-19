package bertydemo

import (
	"context"
	"fmt"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/testutil"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	// "github.com/fortytw2/leaktest"
)

// The leaktest calls are commented out since there is leaks remaining
// TODO: clean all leaks

func TestNew(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	ctx := context.Background()

	logger := testutil.Logger(t)
	ipfsmock := ipfsutil.TestingCoreAPI(ctx, t)
	client, err := New(&Opts{
		Logger:           logger,
		CoreAPI:          ipfsmock,
		OrbitDBDirectory: ":memory:",
	})

	require.NoError(t, err)

	err = client.Close()
	require.NoError(t, err)
}

func testingLogToken(t *testing.T, d DemoServiceClient) string {
	res, err := d.LogToken(context.Background(), &LogToken_Request{})
	require.NoError(t, err)
	return res.GetLogToken()
}

func TestLogToken(t *testing.T) {
	service, _, clean := testingInMemoryService(t)
	defer clean()

	client, clean := testingClient(t, service)
	defer clean()

	_ = testingLogToken(t, client)
}

func TestLogFromToken(t *testing.T) {
	service, _, clean := testingInMemoryService(t)
	defer clean()

	client, clean := testingClient(t, service)
	defer clean()

	ctx := context.Background()
	token := testingLogToken(t, client)

	firstLog, err := service.logFromToken(ctx, token)
	require.NoError(t, err)

	secondLog, err := service.logFromToken(ctx, token)
	require.NoError(t, err)

	assert.Equal(t, firstLog, secondLog)
}

func testingAdd(t *testing.T, d DemoServiceClient, lt string, data []byte) string {
	req := LogAdd_Request{
		LogToken: lt,
		Data:     data,
	}

	res, err := d.LogAdd(context.Background(), &req)
	require.NoError(t, err)

	return res.GetCid()
}

func TestLogAdd(t *testing.T) {
	service, _, clean := testingInMemoryService(t)
	defer clean()

	client, clean := testingClient(t, service)
	defer clean()

	logToken := testingLogToken(t, client)
	_ = testingAdd(t, client, logToken, []byte("Hello log!"))
}

func TestLogGet(t *testing.T) {
	service, _, clean := testingInMemoryService(t)
	defer clean()

	client, clean := testingClient(t, service)
	defer clean()

	logToken := testingLogToken(t, client)
	data := []byte("Hello log!")
	opCid := testingAdd(t, client, logToken, data)
	req := LogGet_Request{
		LogToken: logToken,
		Cid:      opCid,
	}

	res, err := client.LogGet(context.Background(), &req)
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
	service, _, clean := testingInMemoryService(t)
	defer clean()

	client, clean := testingClient(t, service)
	defer clean()

	logToken := testingLogToken(t, client)
	data := []byte("Hello log!")
	_ = testingAdd(t, client, logToken, data)

	req := LogList_Request{
		LogToken: logToken,
		Options:  nil,
	}

	res, err := client.LogList(context.Background(), &req)
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
	service, _, clean := testingInMemoryService(t)
	defer clean()

	client, clean := testingClient(t, service)
	defer clean()

	logToken := testingLogToken(t, client)
	req := &LogStream_Request{
		LogToken: logToken,
		Options:  nil,
	}

	logClient, err := client.LogStream(context.Background(), req)
	require.NoError(t, err)

	defer logClient.CloseSend()

	data := []byte("Hello log!")
	_ = testingAdd(t, client, logToken, data)

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
	service, _, clean := testingInMemoryService(t)
	defer clean()
	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.SlowTest {
				testutil.SkipSlow(t)
			}
			client, clean := testingClient(t, service)
			defer clean()
			logToken := testingLogToken(t, client)
			req := &LogStream_Request{
				LogToken: logToken,
			}
			go func(maxIteration int) {
				for i := 0; i < maxIteration; i++ {
					data := []byte(fmt.Sprintf("Hello log number %d!", i))
					_ = testingAdd(t, client, logToken, data)
				}
			}(tc.Iteration)

			// @FIXME(gfanton): wait at last 100millisecond, if not
			// set test may fail unable to find the first log
			time.Sleep(tc.Sleep + (time.Millisecond * 100))
			logClient, err := client.LogStream(context.Background(), req)
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
