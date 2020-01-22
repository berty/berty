package bertydemo

import (
	"context"
	"testing"
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
	demo, err := New(&Opts{":memory:"})
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
	client, clean := testingClient(t, &Opts{":memory:"})
	defer clean()

	demo, clean := testingClientService(t, client)
	defer clean()

	_ = testingLogToken(t, demo)
}

func TestLogFromToken(t *testing.T) {
	client, clean := testingClient(t, &Opts{":memory:"})
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
	client, clean := testingClient(t, &Opts{":memory:"})
	defer clean()

	demo, clean := testingClientService(t, client)
	defer clean()

	logToken := testingLogToken(t, demo)
	_ = testingAdd(t, demo, logToken, []byte("Hello log!"))
}

func TestLogGet(t *testing.T) {
	client, clean := testingClient(t, &Opts{":memory:"})
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
	client, clean := testingClient(t, &Opts{":memory:"})
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

func TestLogStream(t *testing.T) {
	client, clean := testingClient(t, &Opts{":memory:"})
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
