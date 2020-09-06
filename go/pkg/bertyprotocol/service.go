package bertyprotocol

import (
	"context"
	"sync"
	"time"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/cache"
	"berty.tech/go-orbit-db/pubsub/directchannel"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
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
	odb            *bertyOrbitDB
	accountGroup   *groupContext
	deviceKeystore DeviceKeystore
	openedGroups   map[string]*groupContext
	groups         map[string]*bertytypes.Group
	lock           sync.RWMutex
	close          func() error
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger                 *zap.Logger
	IpfsCoreAPI            ipfsutil.ExtendedCoreAPI
	DeviceKeystore         DeviceKeystore
	MessageKeystore        *MessageKeystore
	RootDatastore          datastore.Batching
	OrbitDirectory         string
	OrbitCache             cache.Interface
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

	if opts.OrbitDirectory == "" {
		opts.OrbitDirectory = ":memory:"
	}

	if opts.RootDatastore == nil {
		opts.RootDatastore = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	if opts.DeviceKeystore == nil {
		ks := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(opts.RootDatastore, datastore.NewKey("accountGroup")))
		opts.DeviceKeystore = NewDeviceKeystore(ks)
	}

	if opts.MessageKeystore == nil {
		mk := ipfsutil.NewNamespacedDatastore(opts.RootDatastore, datastore.NewKey("messages"))
		opts.MessageKeystore = NewMessageKeystore(mk)
	}

	if opts.RendezvousRotationBase.Nanoseconds() <= 0 {
		opts.RendezvousRotationBase = time.Hour * 24
	}

	if opts.IpfsCoreAPI == nil {
		var err error
		var createdIPFSNode *ipfs_core.IpfsNode

		opts.IpfsCoreAPI, createdIPFSNode, err = ipfsutil.NewCoreAPI(ctx, &ipfsutil.CoreAPIConfig{})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		oldClose := opts.close
		opts.close = func() error {
			if oldClose != nil {
				_ = oldClose()
			}

			return createdIPFSNode.Close()
		}
	}

	return nil
}

// New initializes a new Service
func New(ctx context.Context, opts Opts) (Service, error) {
	if err := opts.applyDefaults(ctx); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	opts.Logger = opts.Logger.Named("pt")

	orbitDirectory := opts.OrbitDirectory
	odbOpts := &orbitdb.NewOrbitDBOptions{
		Cache:     opts.OrbitCache,
		Directory: &orbitDirectory,
		Logger:    opts.Logger.Named("odb"),
		Tracer:    tracer.New("berty-orbitdb"),
	}

	if opts.Host != nil {
		odbOpts.DirectChannelFactory = directchannel.InitDirectChannelFactory(opts.Host)
	}

	if opts.PubSub != nil {
		self, err := opts.IpfsCoreAPI.Key().Self(ctx)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		odbOpts.PubSub = pubsubraw.NewPubSub(opts.PubSub, self.ID(), opts.Logger, nil)
	}

	odb, err := newBertyOrbitDB(ctx, opts.IpfsCoreAPI, opts.DeviceKeystore, opts.MessageKeystore, odbOpts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	acc, err := odb.OpenAccountGroup(ctx, nil)
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
		odb:            odb,
		deviceKeystore: opts.DeviceKeystore,
		close:          opts.close,
		accountGroup:   acc,
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
