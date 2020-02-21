package bertydemo

import (
	"context"
	"testing"

	"berty.tech/berty/go/internal/ipfsutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	// "github.com/fortytw2/leaktest"
)

// The leaktest calls are commented out since there is leaks remaining
// TODO: clean all leaks

func TestNew(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	ctx := context.Background()

	ipfsmock := ipfsutil.TestingCoreAPI(ctx, t)
	demo, err := New(&Opts{
		CoreAPI:          ipfsmock,
		OrbitDBDirectory: ":memory:",
	})
	require.NoError(t, err)

	err = demo.Close()
	require.NoError(t, err)
}

func testingLogToken(t *testing.T, d DemoServiceClient) string {
	res, err := d.LogToken(context.Background(), &LogToken_Request{})
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

func TestLogStream(t *testing.T) {
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
