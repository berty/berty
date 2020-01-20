package bertydemo

import (
	"context"
	"encoding/hex"
	"testing"

	"github.com/libp2p/go-libp2p-core/crypto"
	"google.golang.org/grpc"
	//"github.com/fortytw2/leaktest"
)

func initDemo(t *testing.T) *Client {
	opts := &Opts{":memory:"}
	demo, err := New(opts)
	checkErr(t, err)
	return demo
}

func closeDemo(t *testing.T, d *Client) {
	checkErr(t, d.Close())
}

// The leaktest calls are commented out since there is leaks remaining
// TODO: clean all leaks

func TestNewDemo(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	demo := initDemo(t)
	closeDemo(t, demo)
}

func TestLog(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	demo := initDemo(t)
	skb := []byte("squidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisq")
	addkreq := AddKey_Request{
		PrivKey: skb,
	}
	sk, err := crypto.UnmarshalEd25519PrivateKey(skb)
	checkErr(t, err)
	_, err = demo.AddKey(context.Background(), &addkreq)
	checkErr(t, err)
	pubkb, err := sk.GetPublic().Raw()
	checkErr(t, err)
	req := Log_Request{
		Name:         "42",
		ManifestType: "simple",
		ManifestAccess: []*Log_ManifestEntry{
			&Log_ManifestEntry{Key: "write", Values: []string{"lucyintehskywithdiamonds"}},
		},
		IdentityType: "testzor",
		IdentityId:   hex.EncodeToString(pubkb),
	}
	_, err = demo.Log(context.Background(), &req)
	checkErr(t, err)
	closeDemo(t, demo)
}

func testLog(t *testing.T, d *Client) string {
	req := GroupToLog_Request{
		Name:            "jambon",
		GroupPubKey:     []byte("squidibosquidibosquidibosquidibo"),
		GroupSigningKey: []byte("squidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisq"),
	}
	res, err := d.GroupToLog(context.Background(), &req)
	checkErr(t, err)
	return res.LogHandle
}

func TestGroupToLog(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	demo := initDemo(t)
	_ = testLog(t, demo)
	closeDemo(t, demo)
}

func testAdd(t *testing.T, d *Client, lh string, data []byte) string {
	req := LogAdd_Request{
		LogHandle: lh,
		Data:      data,
	}
	res, err := d.LogAdd(context.Background(), &req)
	checkErr(t, err)
	return res.Cid
}

func TestLogAdd(t *testing.T) {
	demo := initDemo(t)
	log_handle := testLog(t, demo)
	_ = testAdd(t, demo, log_handle, []byte("Hello log!"))
	closeDemo(t, demo)
}

func TestLogGet(t *testing.T) {
	demo := initDemo(t)
	log_handle := testLog(t, demo)

	data := []byte("Hello log!")
	op_cid := testAdd(t, demo, log_handle, data)

	req := LogGet_Request{
		LogHandle: log_handle,
		Cid:       op_cid,
	}
	res, err := demo.LogGet(context.Background(), &req)
	checkErr(t, err)

	got := res.Op.Name
	should_get := "ADD"
	if got != should_get {
		t.Errorf("LogGet().Op.Name = %s; want %s", got, should_get)
	}

	got = string(res.Op.Value)
	should_get = string(data)
	if got != should_get {
		t.Errorf("LogGet().Op.Value = %s; want %s", got, should_get)
	}

	closeDemo(t, demo)
}

func TestLogList(t *testing.T) {
	demo := initDemo(t)
	log_handle := testLog(t, demo)

	data := []byte("Hello log!")
	_ = testAdd(t, demo, log_handle, data)

	req := LogList_Request{
		LogHandle: log_handle,
		Options:   nil,
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
		t.Errorf("Added operation not found in LogList()")
	}

	closeDemo(t, demo)
}

// https://stackoverflow.com/a/44619697
type mockDemoService_LogStreamServer struct {
	grpc.ServerStream
	Results []*Log_Operation
}

func (_m *mockDemoService_LogStreamServer) Send(m *Log_Operation) error {
	_m.Results = append(_m.Results, m)
	return nil
}

func (_m *mockDemoService_LogStreamServer) Context() context.Context {
	return context.Background()
}

/*func TestLogStream(t *testing.T) {
	demo := initDemo(t)
	log_handle := testLog(t, demo)

	data := []byte("Hello log!")
	_ = testAdd(t, demo, log_handle, data)

	srv_mock := &mockDemoService_LogStreamServer{}
	req := LogStream_Request{
		LogHandle: log_handle,
		Options:   nil,
	}
	err := demo.LogStream(&req, srv_mock)
	checkErr(t, err)

	should_get := string(data)
	found := false
	for _, op := range srv_mock.Results {
		if op.Name == "ADD" && string(op.Value) == should_get {
			found = true
		}
	}
	if !found {
		t.Errorf("Added operation not found in what was sent by LogStream()")
	}

	closeDemo(t, demo)
}*/
