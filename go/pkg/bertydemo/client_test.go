package bertydemo

import (
	"context"
	"encoding/hex"
	"testing"

	"github.com/libp2p/go-libp2p-core/crypto"
)

func initDemo(t *testing.T) *Client {
	opts := &Opts{":memory:"}
	demo, err := New(opts)
	checkErr(t, err)
	return demo
}

func TestNewDemo(t *testing.T) {
	demo := initDemo(t)
	demo.Close()
}

func TestLog(t *testing.T) {
	demo := initDemo(t)
	skb := []byte("squidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisq")
	addkreq := AddKey_Request{
		PrivKey: skb,
	}
	sk, err := crypto.UnmarshalEd25519PrivateKey(skb)
	checkErr(t, err)
	ctx := context.TODO()
	_, err = demo.AddKey(ctx, &addkreq)
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
	_, err = demo.Log(ctx, &req)
	checkErr(t, err)
	demo.Close()
}

func TestGroupToLog(t *testing.T) {
	demo := initDemo(t)
	req := GroupToLog_Request{
		Name:            "jambon",
		GroupPubKey:     []byte("squidibosquidibosquidibosquidibo"),
		GroupSigningKey: []byte("squidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisqsquidisq"),
	}
	_, err := demo.GroupToLog(context.TODO(), &req)
	checkErr(t, err)
	demo.Close()
}
