package main

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"time"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func main() {
	tmpDir, err := ioutil.TempDir(os.TempDir(), "fixtures-gen")
	if err != nil {
		panic(err)
	}
	defer os.RemoveAll(tmpDir)

	if len(os.Args) < 2 {
		panic("missing arg")
	}
	outDir := os.Args[1]
	if err := os.MkdirAll(outDir, os.ModePerm); err != nil {
		panic(err)
	}

	infra, err := newInfra(tmpDir, outDir, "alice", "bob")
	if err != nil {
		panic(err)
	}

	ctx := context.Background()

	aliceAccount, err := infra.nodes["alice"].client.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	if err != nil {
		panic(err)
	}

	bobAccount, err := infra.nodes["bob"].client.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	if err != nil {
		panic(err)
	}

	if _, err := infra.nodes["bob"].client.ContactRequest(ctx, &messengertypes.ContactRequest_Request{Link: aliceAccount.Account.Link}); err != nil {
		panic(err)
	}

	time.Sleep(2 * time.Second)

	if _, err := infra.nodes["alice"].client.ContactAccept(ctx, &messengertypes.ContactAccept_Request{PublicKey: bobAccount.Account.PublicKey}); err != nil {
		panic(err)
	}

	time.Sleep(2 * time.Second)

	if err := infra.Close(); err != nil {
		panic(err)
	}

	for _, name := range []string{"alice", "bob"} {
		fmt.Printf("%s:\n\n", name)

		f, err := os.Open(filepath.Join(outDir, name+"-events.json"))
		if err != nil {
			panic(err)
		}
		defer f.Close()

		if _, err := io.Copy(os.Stdout, f); err != nil {
			panic(err)
		}

	}
}
