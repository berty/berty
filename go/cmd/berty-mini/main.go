package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"path"

	"berty.tech/berty/v2/go/cmd/berty-mini/mini"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	"github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/juju/fslock"
	ff "github.com/peterbourgon/ff/v3"
	"github.com/shibukawa/configdir"
	"go.uber.org/zap"
)

func main() {
	fs := flag.NewFlagSet("my-program", flag.ExitOnError)
	var (
		group            = fs.String("g", "", "group to join, leave empty to create a new group")
		datastorePath    = fs.String("d", cacheleveldown.InMemoryDirectory, "datastore base directory")
		port             = fs.Uint("p", 0, "default IPFS listen port")
		remoteDaemonAddr = fs.String("r", "", "remote berty daemon")
		//rdvpMaddr        = fs.String("rdvp", DevRendezVousPoint, "rendezvous point maddr")
		inMemory = fs.Bool("inmem", false, "disable persistence")
	)
	ff.Parse(fs, os.Args[1:], ff.WithEnvVarPrefix("BERTY_MINI"))

	run := func() error {
		ctx := context.Background()
		if !*inMemory && *datastorePath == cacheleveldown.InMemoryDirectory {
			storagePath := configdir.New("Berty", "Mini")
			storageDirs := storagePath.QueryFolders(configdir.Global)
			if len(storageDirs) == 0 {
				return fmt.Errorf("no storage path found")
			}

			if err := storageDirs[0].CreateParentDir(""); err != nil {
				return err
			}
			*datastorePath = storageDirs[0].Path
		}

		rootDS, dsLock, err := getRootDatastore(*datastorePath)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		if dsLock != nil {
			defer func() { _ = dsLock.Unlock() }()
		}
		defer rootDS.Close()

		//rdvpeer, err := parseRdvpMaddr(ctx, *rdvpMaddr, logger)
		//if err != nil {
		//return errcode.TODO.Wrap(err)
		//}

		//l := zap.NewNop()
		//if globalLogToFile != "" {
		//l = logger
		//}

		// FIXME: use globalPreRun
		l := zap.NewNop()

		err = mini.Main(ctx, &mini.Opts{
			RemoteAddr:      *remoteDaemonAddr,
			GroupInvitation: *group,
			Port:            *port,
			RootDS:          rootDS,
			Logger:          l,
			//POIDebug:        globalPOIDebug,
			//Bootstrap: DefaultBootstrap,
			//RendezVousPeer:  rdvpeer,
			//DisplayName:     displayName,
			//LocalDiscovery: globalLocalDiscovery,
		})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		return nil
	}

	if err := run(); err != nil {
		log.Fatalf("error: %v", err)
	}
}

// FIXME: move to mainhelper package
func getRootDatastore(optPath string) (datastore.Batching, *fslock.Lock, error) {
	var (
		baseDS datastore.Batching = sync_ds.MutexWrap(datastore.NewMapDatastore())
		lock   *fslock.Lock
	)

	if optPath != "" && optPath != cacheleveldown.InMemoryDirectory {
		basePath := path.Join(optPath, "berty")
		_, err := os.Stat(basePath)
		if err != nil {
			if !os.IsNotExist(err) {
				return nil, nil, errcode.TODO.Wrap(err)
			}
			if err := os.MkdirAll(basePath, 0700); err != nil {
				return nil, nil, errcode.TODO.Wrap(err)
			}
		}

		lock = fslock.New(path.Join(optPath, "lock"))
		err = lock.TryLock()
		if err != nil {
			return nil, nil, err
		}

		baseDS, err = badger.NewDatastore(basePath, nil)
		if err != nil {
			return nil, nil, err
		}

		baseDS = sync_ds.MutexWrap(baseDS)
	}

	return baseDS, lock, nil
}
