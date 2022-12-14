package bertyprotocol

import (
	"context"
	"encoding/hex"
	"fmt"
	"path/filepath"
	"sync"
	"sync/atomic"
	"time"

	ds "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/event"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/p2p/host/eventbus"
	"github.com/pkg/errors"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	ipfs_mobile "berty.tech/berty/v2/go/internal/ipfsutil/mobile"
	tinder "berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/bertyvcissuer"
	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/pubsub/directchannel"
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
	ctx                    context.Context
	ctxCancel              context.CancelFunc
	logger                 *zap.Logger
	ipfsCoreAPI            ipfsutil.ExtendedCoreAPI
	odb                    *BertyOrbitDB
	accountGroup           *GroupContext
	deviceKeystore         cryptoutil.DeviceKeystore
	openedGroups           map[string]*GroupContext
	lock                   sync.RWMutex
	authSession            atomic.Value
	close                  func() error
	startedAt              time.Time
	host                   host.Host
	groupDatastore         *cryptoutil.GroupDatastore
	pushHandler            bertypush.PushHandler
	accountCache           ds.Batching
	messageKeystore        *cryptoutil.MessageKeystore
	pushClients            map[string]*grpc.ClientConn
	muPushClients          sync.RWMutex
	grpcInsecure           bool
	refreshprocess         map[string]context.CancelFunc
	muRefreshprocess       sync.RWMutex
	swiper                 *Swiper
	peerStatusManager      *ConnectednessManager
	accountEventBus        event.Bus
	contactRequestsManager *contactRequestsManager
	vcClient               *bertyvcissuer.Client
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger           *zap.Logger
	IpfsCoreAPI      ipfsutil.ExtendedCoreAPI
	DeviceKeystore   cryptoutil.DeviceKeystore
	DatastoreDir     string
	RootDatastore    ds.Batching
	GroupDatastore   *cryptoutil.GroupDatastore
	AccountCache     ds.Batching
	MessageKeystore  *cryptoutil.MessageKeystore
	OrbitDB          *BertyOrbitDB
	TinderService    *tinder.Service
	Host             host.Host
	PubSub           *pubsub.PubSub
	GRPCInsecureMode bool
	LocalOnly        bool
	close            func() error
	PushKey          *[cryptoutil.KeySize]byte
}

func (opts *Opts) applyPushDefaults() error {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	opts.applyDefaultsGetDatastore()

	if opts.GroupDatastore == nil {
		var err error
		opts.GroupDatastore, err = cryptoutil.NewGroupDatastore(opts.RootDatastore)
		if err != nil {
			return err
		}
	}

	if opts.AccountCache == nil {
		opts.AccountCache = datastoreutil.NewNamespacedDatastore(opts.RootDatastore, ds.NewKey(datastoreutil.NamespaceAccountCacheDatastore))
	}

	if opts.MessageKeystore == nil {
		opts.MessageKeystore = cryptoutil.NewMessageKeystore(datastoreutil.NewNamespacedDatastore(opts.RootDatastore, ds.NewKey(datastoreutil.NamespaceMessageKeystore)))
	}

	return nil
}

func (opts *Opts) applyDefaultsGetDatastore() {
	if opts.RootDatastore == nil {
		if opts.DatastoreDir == "" || opts.DatastoreDir == InMemoryDirectory {
			opts.RootDatastore = ds_sync.MutexWrap(ds.NewMapDatastore())
		} else {
			opts.RootDatastore = nil
		}
	}
}

func (opts *Opts) applyDefaults(ctx context.Context) error {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	opts.applyDefaultsGetDatastore()

	if err := opts.applyPushDefaults(); err != nil {
		return err
	}

	if opts.DeviceKeystore == nil {
		ks := ipfsutil.NewDatastoreKeystore(datastoreutil.NewNamespacedDatastore(opts.RootDatastore, ds.NewKey(NamespaceDeviceKeystore)))
		opts.DeviceKeystore = cryptoutil.NewDeviceKeystore(ks, nil)
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
			Datastore:      datastoreutil.NewNamespacedDatastore(opts.RootDatastore, ds.NewKey(NamespaceOrbitDBDatastore)),
			DeviceKeystore: opts.DeviceKeystore,
		}

		if opts.Host != nil {
			odbOpts.DirectChannelFactory = directchannel.InitDirectChannelFactory(opts.Logger, opts.Host)
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
func New(opts Opts) (_ Service, err error) {
	ctx, cancel := context.WithCancel(context.Background())

	if err := opts.applyDefaults(ctx); err != nil {
		cancel()
		return nil, errcode.TODO.Wrap(err)
	}

	opts.Logger = opts.Logger.Named("pt")

	ctx, _, endSection := tyber.Section(tyber.ContextWithoutTraceID(ctx), opts.Logger, fmt.Sprintf("Initializing ProtocolService version %s", bertyversion.Version))
	defer func() { endSection(err, "") }()

	accountEventBus := eventbus.NewBus()
	dbOpts := &iface.CreateDBOptions{
		EventBus:  accountEventBus,
		LocalOnly: &opts.LocalOnly,
	}

	acc, err := opts.OrbitDB.openAccountGroup(ctx, dbOpts, opts.IpfsCoreAPI)
	if err != nil {
		cancel()
		return nil, errcode.TODO.Wrap(err)
	}

	opts.Logger.Debug("Opened account group", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "AccountGroup", Description: acc.group.String()}})...)

	var contactRequestsManager *contactRequestsManager
	var swiper *Swiper
	if opts.TinderService != nil {
		swiper = NewSwiper(opts.Logger, opts.TinderService, opts.OrbitDB.rotationInterval)
		opts.Logger.Debug("Tinder swiper is enabled", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

		if contactRequestsManager, err = newContactRequestsManager(swiper, acc.metadataStore, opts.IpfsCoreAPI, opts.Logger); err != nil {
			cancel()
			return nil, errcode.TODO.Wrap(err)
		}
	} else {
		opts.Logger.Warn("No tinder driver provided, incoming and outgoing contact requests won't be enabled", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)
	}

	if err := opts.GroupDatastore.Put(ctx, acc.Group()); err != nil {
		cancel()
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to add account group to group datastore, err: %w", err))
	}

	pushHandler := (bertypush.PushHandler)(nil)
	if opts.PushKey != nil {
		pushHandler, err = bertypush.NewPushHandler(&bertypush.PushHandlerOpts{
			RootDatastore: opts.RootDatastore,
			PushKey:       opts.PushKey,
			Logger:        opts.Logger,
		})
		if err != nil {
			cancel()
			return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to init push handler: %w", err))
		}
	}

	s := &service{
		ctx:            ctx,
		ctxCancel:      cancel,
		host:           opts.Host,
		ipfsCoreAPI:    opts.IpfsCoreAPI,
		logger:         opts.Logger,
		odb:            opts.OrbitDB,
		deviceKeystore: opts.DeviceKeystore,
		close:          opts.close,
		accountGroup:   acc,
		swiper:         swiper,
		startedAt:      time.Now(),
		groupDatastore: opts.GroupDatastore,
		openedGroups: map[string]*GroupContext{
			string(acc.Group().PublicKey): acc,
		},
		accountCache:           opts.AccountCache,
		messageKeystore:        opts.MessageKeystore,
		pushHandler:            pushHandler,
		pushClients:            make(map[string]*grpc.ClientConn),
		grpcInsecure:           opts.GRPCInsecureMode,
		refreshprocess:         make(map[string]context.CancelFunc),
		peerStatusManager:      NewConnectednessManager(),
		accountEventBus:        accountEventBus,
		contactRequestsManager: contactRequestsManager,
	}

	s.startGroupDeviceMonitor()

	return s, nil
}

func (s *service) IpfsCoreAPI() ipfs_interface.CoreAPI {
	return s.ipfsCoreAPI
}

func (s *service) Close() error {
	endSection := tyber.SimpleSection(tyber.ContextWithoutTraceID(s.ctx), s.logger, "Closing ProtocolService")

	var err error
	pks := []crypto.PubKey{}

	// gather public keys
	s.lock.Lock()

	if s.contactRequestsManager != nil {
		s.contactRequestsManager.close()
		s.contactRequestsManager = nil
	}

	for _, gc := range s.openedGroups {
		pk, subErr := crypto.UnmarshalEd25519PublicKey(gc.group.PublicKey)
		if subErr != nil {
			err = multierr.Append(err, subErr)
			continue
		}

		pks = append(pks, pk)
	}
	s.lock.Unlock()

	// deactivate all groups
	for _, pk := range pks {
		derr := s.deactivateGroup(pk)
		if derr != nil {
			err = multierr.Append(derr, derr)
		}
	}

	err = multierr.Append(err, s.odb.Close())

	if s.close != nil {
		err = multierr.Append(err, s.close())
	}

	endSection(err)

	s.ctxCancel()

	return err
}

func (s *service) startGroupDeviceMonitor() {
	if s.host == nil {
		return
	}

	// monitor exchange heads events
	subHead, err := s.odb.EventBus().Subscribe(new(baseorbitdb.EventExchangeHeads))
	if err != nil {
		s.logger.Error("startGroupDeviceMonitor", zap.Error(errors.Wrap(err, "unable to subscribe odb event")))
		return
	}

	// monitor peer connectednesschanged
	subPeer, err := s.host.EventBus().Subscribe(new(event.EvtPeerConnectednessChanged))
	if err != nil {
		s.logger.Error("startGroupDeviceMonitor", zap.Error(errors.Wrap(err, "unable to subscribe odb event")))
		subHead.Close()
		return
	}

	go func() {
		defer subHead.Close()
		defer subPeer.Close()

		for {
			var evt interface{}

			select {
			case evt = <-subHead.Out():
			case evt = <-subPeer.Out():
			case <-s.ctx.Done():
				return
			}

			switch e := evt.(type) {
			case event.EvtPeerConnectednessChanged:
				switch e.Connectedness {
				case network.Connected:
					s.peerStatusManager.UpdateState(e.Peer, ConnectednessTypeConnected)
				case network.NotConnected:
					s.peerStatusManager.UpdateState(e.Peer, ConnectednessTypeDisconnected)
				}
			case baseorbitdb.EventExchangeHeads:
				if dpk, ok := s.odb.GetDevicePKForPeerID(e.Peer); ok {
					gkey := hex.EncodeToString(dpk.Group.PublicKey)
					s.peerStatusManager.AssociatePeer(gkey, e.Peer)
				}
			}
		}
	}()

	// get status of peers in the peerstore
	peers := s.host.Peerstore().Peers()
	for _, peer := range peers {
		// if we got some connected peer check their status
		if s.host.Network().Connectedness(peer) == network.Connected {
			s.peerStatusManager.UpdateState(peer, ConnectednessTypeConnected)
		}

		// if we already have some head exchange with this peer, associate it
		if dpk, ok := s.odb.GetDevicePKForPeerID(peer); ok {
			gkey := hex.EncodeToString(dpk.Group.PublicKey)
			s.peerStatusManager.AssociatePeer(gkey, peer)
		}
	}
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
