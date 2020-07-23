package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	mrand "math/rand"
	"net"
	"os"
	"os/user"
	"path"
	"strings"
	"time"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	ipfs_log "github.com/ipfs/go-log/v2"
	"github.com/juju/fslock"
	"github.com/libp2p/go-libp2p-core/peer"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"moul.io/srand"
)

type mainOpts struct {
	// global or very common
	debug          bool
	libp2pDebug    bool
	localDiscovery bool
	logFormat      string
	logToFile      string
	logger         *zap.Logger
	orbitDebug     bool
	poiDebug       bool
	tracer         string
	datastorePath  string

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
		debug:          false,
		libp2pDebug:    false,
		localDiscovery: true,
		logFormat:      "",
		logToFile:      "",
		logger:         zap.NewNop(),
		orbitDebug:     false,
		poiDebug:       false,
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
	isDebugEnabled := opts.debug || opts.orbitDebug || opts.libp2pDebug || opts.poiDebug
	flush := tracer.InitTracer(opts.tracer, "berty")

	// setup zap config
	var config zap.Config
	if opts.logToFile != "" {
		config = zap.NewProductionConfig()
		config.OutputPaths = []string{opts.logToFile}
	} else {
		config = zap.NewDevelopmentConfig()
		config.DisableStacktrace = true
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	if opts.logFormat != "" {
		switch strings.ToLower(opts.logFormat) {
		case "json":
			config.Encoding = "json"
		case "console":
			config.Encoding = "console"
			config.EncoderConfig.EncodeTime = zapcore.RFC3339TimeEncoder
			config.EncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
		case "color":
			config.Encoding = "console"
			config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
			config.EncoderConfig.EncodeDuration = zapcore.StringDurationEncoder
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		default:
			log.Fatalf("unknow log format: %s", opts.logFormat)
		}
	}

	if isDebugEnabled {
		config.Level.SetLevel(zap.DebugLevel)
	} else {
		config.Level.SetLevel(zap.InfoLevel)
	}

	var err error
	if opts.logger, err = config.Build(); err != nil {
		log.Fatalf("unable to build log config: %s", err)
	}

	ipfs_log.SetupLogging(ipfs_log.Config{
		Stderr: false,
		Stdout: false,
	})
	ipfs_log.SetAllLoggers(ipfs_log.LevelFatal)
	if opts.libp2pDebug {
		pr := ipfs_log.NewPipeReader()
		// ipfs_log.SetLogLevel("pubsub", "debug")
		r := bufio.NewReader(pr)
		go func() {
			defer pr.Close()
			var err error
			for err != io.EOF {
				var line []byte
				if line, _, err = r.ReadLine(); err == nil {
					opts.logger.Debug(fmt.Sprintf("%s", line))
				}
			}
		}()
	}

	if opts.orbitDebug {
		zap.ReplaceGlobals(opts.logger)
	}

	return flush
}
