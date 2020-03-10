package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path"
	"strings"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	"github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/ipfs/go-ipfs/core"
	"github.com/juju/fslock"

	"berty.tech/berty/go/internal/account"
	"berty.tech/berty/go/internal/bertycrypto"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

func openGroupFromString(data string) (*bertyprotocol.Group, error) {
	// Read invitation (as base64 on stdin)
	iB64, err := base64.StdEncoding.DecodeString(strings.TrimSpace(data))
	if err != nil {
		return nil, err
	}

	grp := &bertyprotocol.Group{}
	err = grp.Unmarshal(iB64)
	if err != nil {
		return nil, err
	}

	return grp, nil
}

func unlockFS(l *fslock.Lock) {
	if l == nil {
		return
	}

	err := l.Unlock()
	if err != nil {
		panic(err)
	}
}

func panicUnlockFS(err error, l *fslock.Lock) {
	unlockFS(l)
	panic(err)
}

func initOrbitDB(ctx context.Context, opts *Opts) (orbitutil.BertyOrbitDB, datastore.Batching, *core.IpfsNode, *fslock.Lock) {
	var (
		swarmAddresses []string = nil
		lock           *fslock.Lock
	)

	if opts.Port != 0 {
		swarmAddresses = []string{
			fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", opts.Port),
			fmt.Sprintf("/ip6/0.0.0.0/tcp/%d", opts.Port),
		}
	}

	var baseDS datastore.Batching = datastore.NewMapDatastore()

	if opts.Path != cacheleveldown.InMemoryDirectory {
		basePath := path.Join(opts.Path, "berty")
		_, err := os.Stat(basePath)
		if err != nil {
			if !os.IsNotExist(err) {
				panic(err)
			}
			if err := os.MkdirAll(basePath, 0700); err != nil {
				panic(err)
			}
		}

		lock = fslock.New(path.Join(opts.Path, "lock"))
		err = lock.TryLock()
		if err != nil {
			panic(err)
		}

		baseDS, err = badger.NewDatastore(basePath, nil)
		if err != nil {
			panic(err)
		}
	}

	baseDS = ds_sync.MutexWrap(baseDS)

	accountDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("account"))
	messagesDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("messages"))
	ipfsDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("ipfs"))
	orbitdbDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("orbitdb"))

	accountKS := ipfsutil.NewDatastoreKeystore(accountDS)
	orbitdbCache := orbitutil.NewOrbitDatastoreCache(orbitdbDS)
	mk := bertycrypto.NewDatastoreMessageKeys(messagesDS)

	cfg, err := ipfsutil.CreateBuildConfigWithDatastore(&ipfsutil.BuildOpts{
		SwarmAddresses: swarmAddresses,
	}, ipfsDS)
	if err != nil {
		panicUnlockFS(err, lock)
	}

	api, node, err := ipfsutil.NewConfigurableCoreAPI(ctx, cfg, ipfsutil.OptionMDNSDiscovery)
	if err != nil {
		panicUnlockFS(err, lock)
	}

	odb, err := orbitutil.NewBertyOrbitDB(ctx, api, account.New(accountKS), mk, &orbitdb.NewOrbitDBOptions{Cache: orbitdbCache})
	if err != nil {
		panicUnlockFS(err, lock)
	}

	return odb, baseDS, node, lock
}

func pkAsShortID(pk []byte) string {
	if len(pk) > 24 {
		return base64.StdEncoding.EncodeToString(pk)[0:8]
	}

	return "--------"
}
