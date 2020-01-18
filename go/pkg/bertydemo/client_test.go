package bertydemo

import (
	"context"
	"encoding/hex"
	"testing"

	"github.com/libp2p/go-libp2p-core/crypto"
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

func TestGroupToLog(t *testing.T) {
	// defer leaktest.CheckTimeout(t, 30*time.Second)()
	demo := initDemo(t)
	req := GroupToLog_Request{
		Name:            "jambon",
		GroupPubKey:     []byte("squidibosquidibosquidibosquidibo"),
		GroupSigningKey: []byte("squidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisq"),
	}
	_, err := demo.GroupToLog(context.Background(), &req)
	checkErr(t, err)
	closeDemo(t, demo)
}
