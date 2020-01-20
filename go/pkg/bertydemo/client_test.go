package bertydemo

import (
	"context"
	"testing"
	//"google.golang.org/grpc"
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

func initDemo(t *testing.T) *Client {
	opts := &Opts{":memory:"}
	demo, err := New(opts)
	checkErr(t, err)
	return demo
}

func closeDemo(t *testing.T, d *Client) {
	checkErr(t, d.Close())
}

func TestLogFromToken(t *testing.T) {
	demo := initDemo(t)
	defer closeDemo(t, demo)

	res, err := demo.LogToken(context.Background(), &LogToken_Request{})
	checkErr(t, err)
	token := res.LogToken

	first_log, err := demo.logFromToken(context.Background(), token)
	checkErr(t, err)

	second_log, err := demo.logFromToken(context.Background(), token)
	checkErr(t, err)

	if first_log != second_log {
		t.Fatalf("second_log = %p; want %p", second_log, first_log)
	}
}

// The leaktest calls are commented out since there is leaks remaining
// TODO: clean all leaks

func TestNew(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	demo := initDemo(t)
	closeDemo(t, demo)
}

func testLog(t *testing.T, d *Client) string {
	res, err := d.LogToken(context.Background(), &LogToken_Request{})
	checkErr(t, err)
	return res.LogToken
}

func TestLogToken(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	demo := initDemo(t)
	_ = testLog(t, demo)
	closeDemo(t, demo)
}

func testAdd(t *testing.T, d *Client, lt string, data []byte) string {
	req := LogAdd_Request{
		LogToken: lt,
		Data:     data,
	}
	res, err := d.LogAdd(context.Background(), &req)
	checkErr(t, err)
	return res.Cid
}

func TestLogAdd(t *testing.T) {
	demo := initDemo(t)
	log_token := testLog(t, demo)
	_ = testAdd(t, demo, log_token, []byte("Hello log!"))
	closeDemo(t, demo)
}

func TestLogGet(t *testing.T) {
	demo := initDemo(t)
	log_token := testLog(t, demo)

	data := []byte("Hello log!")
	op_cid := testAdd(t, demo, log_token, data)

	req := LogGet_Request{
		LogToken: log_token,
		Cid:      op_cid,
	}
	res, err := demo.LogGet(context.Background(), &req)
	checkErr(t, err)

	if res.Op == nil {
		t.Fatalf("LogGet().Op = nil; want an Op")
	}

	got := res.Op.Name
	should_get := "ADD"
	if got != should_get {
		t.Fatalf("LogGet().Op.Name = %s; want %s", got, should_get)
	}

	got = string(res.Op.Value)
	should_get = string(data)
	if got != should_get {
		t.Fatalf("LogGet().Op.Value = %s; want %s", got, should_get)
	}

	closeDemo(t, demo)
}

func TestLogList(t *testing.T) {
	demo := initDemo(t)
	log_token := testLog(t, demo)

	data := []byte("Hello log!")
	_ = testAdd(t, demo, log_token, data)

	req := LogList_Request{
		LogToken: log_token,
		Options:  nil,
	}
	res, err := demo.LogList(context.Background(), &req)
	checkErr(t, err)

	should_get := string(data)
	found := false
	for _, op := range res.Ops {
		if op.Name == "ADD" && string(op.Value) == should_get {
			found = true
		}
	}
	if !found {
		t.Fatalf("Added operation not found in LogList()")
	}

	closeDemo(t, demo)
}
