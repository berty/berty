package main

import (
	"context"
	"fmt"
	"log"
	mrand "math/rand"
	"net"
	"os"
	"os/user"
	"path"
	"time"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/juju/fslock"
	"github.com/libp2p/go-libp2p-core/peer"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"moul.io/srand"
)

type mainOpts struct {
	// global or very common
	localDiscovery bool
	logFormat      string
	logToFile      string
	logFilters     string
	logger         *zap.Logger
	tracer         string
	datastorePath  string
	sqlitePath     string
	replay         bool

	// more specific
	bannerLight           bool
	bannerRandom          bool
	displayName           string
	infoRefreshEvery      time.Duration
	rdvpForce             bool
	rdvpMaddr             string
	remoteDaemonAddr      string
	daemonListeners       string
	miniPort              uint
	miniGroup             string
	miniInMemory          bool
	shareInviteOnDev      bool
	shareInviteReset      bool
	shareInviteNoTerminal bool
}

func newMainOpts() mainOpts {
	return mainOpts{
		// global or very common
		localDiscovery: true,
		logFormat:      "color",                        // json, console, color, light-console, light-color
		logToFile:      "stderr",                       // can be stdout, stderr or a file path
		logFilters:     "info,warn:bty,bty.* error+:*", // info and warn for bty* + all namespaces for errors, panics, dpanics and fatals
		logger:         zap.NewNop(),
		tracer:         "",
		datastorePath:  cacheleveldown.InMemoryDirectory,

		miniPort:              0,
		miniGroup:             "",
		miniInMemory:          false,
		bannerLight:           false,
		bannerRandom:          false,
		displayName:           safeDefaultDisplayName(),
		infoRefreshEvery:      time.Duration(0),
		rdvpForce:             false,
		rdvpMaddr:             config.BertyDev.RendezVousPeer,
		remoteDaemonAddr:      "",
		daemonListeners:       "/ip4/127.0.0.1/tcp/9091/grpc",
		shareInviteOnDev:      false,
		shareInviteReset:      false,
		shareInviteNoTerminal: false,
	}
}

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

func parseAddr(addr string) (maddr ma.Multiaddr, err error) {
	maddr, err = ma.NewMultiaddr(addr)
	if err != nil {
		// try to get a tcp multiaddr from host:port
		host, port, serr := net.SplitHostPort(addr)
		if serr != nil {
			return
		}

		if host == "" {
			host = "127.0.0.1"
		}

		addr = fmt.Sprintf("/ip4/%s/tcp/%s/", host, port)
		maddr, err = ma.NewMultiaddr(addr)
	}

	return
}

func parseRdvpMaddr(ctx context.Context, rdvpMaddr string, logger *zap.Logger) (*peer.AddrInfo, error) {
	if rdvpMaddr == "" {
		logger.Debug("no rendezvous peer set")
		return nil, nil
	}

	resoveCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rdvpeer, err := ipfsutil.ParseAndResolveIpfsAddr(resoveCtx, rdvpMaddr)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	fds := make([]zapcore.Field, len(rdvpeer.Addrs))
	for i, maddr := range rdvpeer.Addrs {
		key := fmt.Sprintf("#%d", i)
		fds[i] = zap.String(key, maddr.String())
	}
	logger.Debug("rdvp peer resolved addrs", fds...)
	return rdvpeer, nil
}

func safeDefaultDisplayName() string {
	var name string
	current, err := user.Current()
	if err == nil {
		name = current.Username
	}
	if name == "" {
		name = os.Getenv("USER")
	}
	if name == "" {
		name = "Anonymous4242"
	}
	return fmt.Sprintf("%s (cli)", name)
}

func globalPreRun() func() {
	mrand.Seed(srand.Secure())
	tracerFlush := tracer.InitTracer(opts.tracer, "berty")

	var (
		err           error
		loggerCleanup func()
	)
	opts.logger, loggerCleanup, err = logutil.NewLogger(opts.logFilters, opts.logFormat, opts.logToFile)
	if err != nil {
		log.Fatalf("unable to build logger: %v", err)
	}

	cleanup := func() {
		loggerCleanup()
		tracerFlush()
	}
	return cleanup
}
