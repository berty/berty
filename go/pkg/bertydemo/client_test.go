package bertydemo

import (
	"context"
	"fmt"
	"testing"
	"time"

	"berty.tech/berty/go/internal/testutil"

	"berty.tech/berty/go/internal/ipfsutil"
	//"github.com/fortytw2/leaktest"
	//"go.uber.org/zap"
	//"go.uber.org/zap/zapcore"
	//"go.uber.org/zap/zaptest"
)

func init() {
	//zaptest.Level(zapcore.DebugLevel)
	//config := zap.NewDevelopmentConfig()
	//config.OutputPaths = []string{"stdout"}
	//logger, _ := config.Build()
	//zap.ReplaceGlobals(logger)
}

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

	if err != nil {
		t.Fatal(err)
	}

	if err := demo.Close(); err != nil {
		t.Fatal(err)
	}
}

func testingLogToken(t *testing.T, d DemoServiceClient) string {
	res, err := d.LogToken(context.Background(), &LogToken_Request{})
	checkErr(t, err)
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

	first_log, err := client.logFromToken(ctx, token)
	checkErr(t, err)

	second_log, err := client.logFromToken(ctx, token)
	checkErr(t, err)

	if first_log != second_log {
		t.Fatalf("second_log = %p; want %p", second_log, first_log)
	}
}

func testingAdd(t *testing.T, d DemoServiceClient, lt string, data []byte) string {
	req := LogAdd_Request{
		LogToken: lt,
		Data:     data,
	}

	res, err := d.LogAdd(context.Background(), &req)
	checkErr(t, err)

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
	op_cid := testingAdd(t, demo, logToken, data)
	req := LogGet_Request{
		LogToken: logToken,
		Cid:      op_cid,
	}

	res, err := demo.LogGet(context.Background(), &req)
	checkErr(t, err)

	if res.GetOperation() == nil {
		t.Fatalf("LogGet().Op = nil; want an Op")
	}

	got := res.GetOperation().GetName()
	shouldGet := "ADD"
	if got != shouldGet {
		t.Fatalf("LogGet().Op.Name = %s; want %s", got, shouldGet)
	}

	got = string(res.GetOperation().GetValue())
	shouldGet = string(data)
	if got != shouldGet {
		t.Fatalf("LogGet().Op.Value = %s; want %s", got, shouldGet)
	}
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
	checkErr(t, err)

	shouldGet := string(data)
	found := false
	for _, op := range res.GetOperations() {
		if op.GetName() == "ADD" && string(op.GetValue()) == shouldGet {
			found = true
		}
	}
	if !found {
		t.Fatalf("Added operation not found in LogList()")
	}
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
	checkErr(t, err)

	defer logClient.CloseSend()

	data := []byte("Hello log!")
	_ = testingAdd(t, demo, logToken, data)

	op, err := logClient.Recv()
	checkErr(t, err)

	got := op.GetName()
	shouldGet := "ADD"
	if got != shouldGet {
		t.Fatalf("LogStream()->Op.Name = %s; want %s", got, shouldGet)
	}

	got = string(op.GetValue())
	shouldGet = string(data)
	if got != shouldGet {
		t.Fatalf("LogStream()->Op.Value = %s; want %s", got, shouldGet)
	}
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
			}(tc.Iteration) // @FIXME(gfanton): wait at last 100millisecond, if not
			// set test may fail unable to find the first log
			time.Sleep(tc.Sleep + (time.Millisecond * 100))
			logClient, err := demo.LogStream(context.Background(), req)
			checkErr(t, err)
			defer logClient.CloseSend()
			for i := 0; i < tc.Iteration; i++ {
				op, err := logClient.Recv()
				checkErr(t, err)
				fmt.Println("receiving op #", i, "in test", tc.Iteration)
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
				checkErr(t, err)
			}
		})
	}
}
