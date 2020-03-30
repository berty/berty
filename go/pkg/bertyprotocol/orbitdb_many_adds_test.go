package bertyprotocol

import (
	"context"
	crand "crypto/rand"
	"fmt"
	"os"
	"testing"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	orbitdb "berty.tech/go-orbit-db"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func TestAdd(t *testing.T) {
	amount := 20 // speeding up tests, 2000 takes ~25 seconds

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ipfs := ipfsutil.TestingCoreAPI(ctx, t)
	defer ipfs.Close()

	dir := "./orbitdb/benchmarks"
	defer os.RemoveAll(dir)

	orbit, err := orbitdb.NewOrbitDB(ctx, ipfs, &orbitdb.NewOrbitDBOptions{Directory: &dir})
	if err != nil {
		t.Fatal(err)
	}
	defer orbit.Close()

	if err := orbit.RegisterAccessControllerType(NewSimpleAccessController); err != nil {
		t.Fatal(err)
	}

	sigk, _, err := crypto.GenerateEd25519Key(crand.Reader)
	if err != nil {
		t.Fatal(err)
	}

	ks := &BertySignedKeyStore{}
	err = ks.SetKey(sigk)
	if err != nil {
		t.Fatal(err)
	}

	sigkB, err := cryptoutil.SeedFromEd25519PrivateKey(sigk)
	if err != nil {
		t.Fatal(err)
	}

	pubkB, err := sigk.GetPublic().Raw()
	if err != nil {
		t.Fatal(err)
	}

	g := &bertytypes.Group{PublicKey: pubkB, Secret: sigkB}
	opts, err := DefaultOrbitDBOptions(g, &orbitdb.CreateDBOptions{}, ks, "log")
	if err != nil {
		t.Fatal(err)
	}
	db, err := orbit.Log(ctx, "DemoLog", opts)
	if err != nil {
		t.Fatal(err)
	}

	defer db.Drop()
	defer db.Close()

	for n := 0; n < amount; n++ {
		if _, err := db.Add(ctx, []byte(fmt.Sprintf("%d", n))); err != nil {
			t.Fatal(err)
		}
	}
}
