package bertyprotocol

import (
	"context"
	"path/filepath"
	"sync"
	"sync/atomic"
	"time"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/pubsub/directchannel"
	datastore "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/host"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"
)

var _ Service = (*service)(nil)

// Service is the main Berty Protocol interface
type Service interface {
	ProtocolServiceServer

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
	groups         map[string]*bertytypes.Group
	lock           sync.RWMutex
	authSession    atomic.Value
	close          func() error
	startedAt      time.Time
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger                 *zap.Logger
	IpfsCoreAPI            ipfsutil.ExtendedCoreAPI
	DeviceKeystore         DeviceKeystore
	DatastoreDir           string
	RootDatastore          datastore.Batching
	OrbitDB                *BertyOrbitDB
	TinderDriver           tinder.Driver
	RendezvousRotationBase time.Duration
	Host                   host.Host
	PubSub                 *pubsub.PubSub
	close                  func() error
}

func (opts *Opts) applyDefaults(ctx context.Context) error {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	if opts.RootDatastore == nil {
		if opts.DatastoreDir == "" || opts.DatastoreDir == InMemoryDirectory {
			opts.RootDatastore = ds_sync.MutexWrap(datastore.NewMapDatastore())
		} else {
			opts.RootDatastore = nil
		}
	}

	if opts.DeviceKeystore == nil {
		ks := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(opts.RootDatastore, datastore.NewKey(NamespaceDeviceKeystore)))
		opts.DeviceKeystore = NewDeviceKeystore(ks)
	}

	if opts.RendezvousRotationBase.Nanoseconds() <= 0 {
		opts.RendezvousRotationBase = time.Hour * 24
	}

	var createdIPFSHost host.Host
	if opts.IpfsCoreAPI == nil {
		var err error
		var createdIPFSNode *ipfs_core.IpfsNode

		opts.IpfsCoreAPI, createdIPFSNode, err = ipfsutil.NewCoreAPI(ctx, &ipfsutil.CoreAPIConfig{})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		createdIPFSHost = createdIPFSNode.PeerHost

		oldClose := opts.close
		opts.close = func() error {
			if oldClose != nil {
				_ = oldClose()
			}

			return createdIPFSNode.Close()
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
			Datastore:      ipfsutil.NewNamespacedDatastore(opts.RootDatastore, datastore.NewKey(NamespaceOrbitDBDatastore)),
			DeviceKeystore: opts.DeviceKeystore,
		}

		if createdIPFSHost != nil {
			odbOpts.DirectChannelFactory = directchannel.InitDirectChannelFactory(createdIPFSHost)
		}

		odb, err := NewBertyOrbitDB(ctx, opts.IpfsCoreAPI, odbOpts)
		if err != nil {
			return nil
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

	acc, err := opts.OrbitDB.openAccountGroup(ctx, nil)
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
		ipfsCoreAPI:    opts.IpfsCoreAPI,
		logger:         opts.Logger,
		odb:            opts.OrbitDB,
		deviceKeystore: opts.DeviceKeystore,
		close:          opts.close,
		accountGroup:   acc,
		startedAt:      time.Now(),
		groups: map[string]*bertytypes.Group{
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
