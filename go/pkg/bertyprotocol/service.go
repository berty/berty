package bertyprotocol

import (
	"context"
	"path/filepath"
	"sync"
	"sync/atomic"
	"time"

	ipfs_mobile "github.com/ipfs-shipyard/gomobile-ipfs/go/pkg/ipfsmobile"
	ds "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/host"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/iface"
)

var _ Service = (*service)(nil)

// Service is the main Berty Protocol interface
type Service interface {
	protocoltypes.ProtocolServiceServer

	Close() error
	Status() Status
	IpfsCoreAPI() ipfs_interface.CoreAPI
}

type service struct {
	// variables
	ctx            context.Context
	logger         *zap.Logger
	ipfsCoreAPI    ipfsutil.ExtendedCoreAPI
	odb            *BertyOrbitDB
	accountGroup   *groupContext
	deviceKeystore DeviceKeystore
	openedGroups   map[string]*groupContext
	groups         map[string]*protocoltypes.Group
	lock           sync.RWMutex
	authSession    atomic.Value
	close          func() error
	startedAt      time.Time
	host           host.Host
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger                 *zap.Logger
	IpfsCoreAPI            ipfsutil.ExtendedCoreAPI
	DeviceKeystore         DeviceKeystore
	DatastoreDir           string
	RootDatastore          ds.Batching
	OrbitDB                *BertyOrbitDB
	TinderDriver           tinder.Driver
	RendezvousRotationBase time.Duration
	Host                   host.Host
	PubSub                 *pubsub.PubSub
	LocalOnly              bool
	close                  func() error
}

func (opts *Opts) applyDefaults(ctx context.Context) error {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	if opts.RootDatastore == nil {
		if opts.DatastoreDir == "" || opts.DatastoreDir == InMemoryDirectory {
			opts.RootDatastore = ds_sync.MutexWrap(ds.NewMapDatastore())
		} else {
			opts.RootDatastore = nil
		}
	}

	if opts.DeviceKeystore == nil {
		ks := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(opts.RootDatastore, ds.NewKey(NamespaceDeviceKeystore)))
		opts.DeviceKeystore = NewDeviceKeystore(ks)
	}

	if opts.RendezvousRotationBase.Nanoseconds() <= 0 {
		opts.RendezvousRotationBase = time.Hour * 24
	}

	if opts.IpfsCoreAPI == nil {
		dsync := ds_sync.MutexWrap(ds.NewMapDatastore())
		repo, err := ipfsutil.CreateMockedRepo(dsync)
		if err != nil {
			return err
		}

		mrepo := ipfs_mobile.NewRepoMobile("", repo)
		mnode, err := ipfsutil.NewIPFSMobile(ctx, mrepo, &ipfsutil.MobileOptions{
			ExtraOpts: map[string]bool{
				"pubsub": true,
			},
		})
		if err != nil {
			return err
		}

		opts.IpfsCoreAPI, err = ipfsutil.NewExtendedCoreAPIFromNode(mnode.IpfsNode)
		if err != nil {
			return err
		}
		opts.Host = mnode.PeerHost()

		oldClose := opts.close
		opts.close = func() error {
			if oldClose != nil {
				_ = oldClose()
			}

			return mnode.Close()
		}
	}

	if opts.OrbitDB == nil {
		orbitDirectory := InMemoryDirectory
		if opts.DatastoreDir != InMemoryDirectory {
			orbitDirectory = filepath.Join(opts.DatastoreDir, NamespaceOrbitDBDirectory)
		}

		odbOpts := &NewOrbitDBOptions{
			NewOrbitDBOptions: baseorbitdb.NewOrbitDBOptions{
				Directory: &orbitDirectory,
				Logger:    opts.Logger,
			},
			Datastore:      ipfsutil.NewNamespacedDatastore(opts.RootDatastore, ds.NewKey(NamespaceOrbitDBDatastore)),
			DeviceKeystore: opts.DeviceKeystore,
		}

		odb, err := NewBertyOrbitDB(ctx, opts.IpfsCoreAPI, odbOpts)
		if err != nil {
			return err
		}

		oldClose := opts.close
		opts.close = func() error {
			if oldClose != nil {
				_ = oldClose()
			}

			return odb.Close()
		}

		opts.OrbitDB = odb
	}

	return nil
}

// New initializes a new Service
func New(ctx context.Context, opts Opts) (Service, error) {
	if err := opts.applyDefaults(ctx); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	opts.Logger = opts.Logger.Named("pt")
	opts.Logger.Debug("initializing protocol", zap.String("version", bertyversion.Version))

	dbOpts := &iface.CreateDBOptions{LocalOnly: &opts.LocalOnly}

	acc, err := opts.OrbitDB.openAccountGroup(ctx, dbOpts, opts.IpfsCoreAPI)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if opts.TinderDriver != nil {
		s := NewSwiper(opts.Logger, opts.PubSub, opts.RendezvousRotationBase)
		opts.Logger.Debug("tinder swiper is enabled")

		if err := initContactRequestsManager(ctx, s, acc.metadataStore, opts.IpfsCoreAPI, opts.Logger); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	} else {
		opts.Logger.Warn("no tinder driver provided, incoming and outgoing contact requests won't be enabled")
	}

	return &service{
		ctx:            ctx,
		host:           opts.Host,
		ipfsCoreAPI:    opts.IpfsCoreAPI,
		logger:         opts.Logger,
		odb:            opts.OrbitDB,
		deviceKeystore: opts.DeviceKeystore,
		close:          opts.close,
		accountGroup:   acc,
		startedAt:      time.Now(),
		groups: map[string]*protocoltypes.Group{
			string(acc.Group().PublicKey): acc.Group(),
		},
		openedGroups: map[string]*groupContext{
			string(acc.Group().PublicKey): acc,
		},
	}, nil
}

func (s *service) IpfsCoreAPI() ipfs_interface.CoreAPI {
	return s.ipfsCoreAPI
}

func (s *service) Close() error {
	s.odb.Close()
	if s.close != nil {
		s.close()
	}

	return nil
}

// Status contains results of status checks
type Status struct {
	DB       error
	Protocol error
}

func (s *service) Status() Status {
	return Status{
		Protocol: nil,
	}
}
