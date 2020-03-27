package bertyprotocol

import (
	"context"
	"sync"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/cache"
	"github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_coreapi "github.com/ipfs/interface-go-ipfs-core"
	"go.uber.org/zap"
)

var _ Client = (*client)(nil)

// Client is the main Berty Protocol interface
type Client interface {
	ProtocolServiceServer

	Close() error
	Status() Status
}

type client struct {
	// variables
	ctx             context.Context
	logger          *zap.Logger
	ipfsCoreAPI     ipfs_coreapi.CoreAPI
	odb             *bertyOrbitDB
	accountGroup    *groupContext
	deviceKeystore  DeviceKeystore
	openedGroups    map[string]*groupContext
	groups          map[string]*bertytypes.Group
	lock            sync.RWMutex
	createdIPFSNode *ipfs_core.IpfsNode
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger          *zap.Logger
	IpfsCoreAPI     ipfs_coreapi.CoreAPI
	DeviceKeystore  DeviceKeystore
	MessageKeystore *MessageKeystore
	RootContext     context.Context
	RootDatastore   datastore.Batching
	OrbitCache      cache.Interface
	createdIPFSNode *ipfs_core.IpfsNode
}

func defaultClientOptions(opts *Opts) error {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	if opts.RootContext == nil {
		opts.RootContext = context.TODO()
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

	if opts.IpfsCoreAPI == nil {
		var err error
		opts.IpfsCoreAPI, opts.createdIPFSNode, err = ipfsutil.NewInMemoryCoreAPI(opts.RootContext)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

// New initializes a new Client
func New(opts Opts) (Client, error) {
	if err := defaultClientOptions(&opts); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	odb, err := newBertyOrbitDB(opts.RootContext, opts.IpfsCoreAPI, opts.DeviceKeystore, opts.MessageKeystore, &orbitdb.NewOrbitDBOptions{Cache: opts.OrbitCache})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	acc, err := odb.OpenAccountGroup(opts.RootContext, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &client{
		ctx:             opts.RootContext,
		ipfsCoreAPI:     opts.IpfsCoreAPI,
		logger:          opts.Logger,
		odb:             odb,
		deviceKeystore:  opts.DeviceKeystore,
		createdIPFSNode: opts.createdIPFSNode,
		accountGroup:    acc,
		groups: map[string]*bertytypes.Group{
			string(acc.Group().PublicKey): acc.Group(),
		},
		openedGroups: map[string]*groupContext{
			string(acc.Group().PublicKey): acc,
		},
	}, nil
}

func (c *client) Close() error {
	c.odb.Close()
	if c.createdIPFSNode != nil {
		c.createdIPFSNode.Close()
	}

	return nil
}

// Status contains results of status checks
type Status struct {
	DB       error
	Protocol error
}

func (c *client) Status() Status {
	return Status{
		Protocol: nil,
	}
}
