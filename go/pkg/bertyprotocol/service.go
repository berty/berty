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
	ipfs_coreapi "github.com/ipfs/interface-go-ipfs-core"
	"go.uber.org/zap"
)

var _ Service = (*service)(nil)

// Service is the main Berty Protocol interface
type Service interface {
	ProtocolServiceServer

	Close() error
	Status() Status
}

type service struct {
	// variables
	ctx             context.Context
	logger          *zap.Logger
	ipfsCoreAPI     ipfs_coreapi.CoreAPI
	odb             BertyOrbitDB
	accContextGroup ContextGroup
	account         AccountKeys
	openedGroups    map[string]ContextGroup
	groups          map[string]*bertytypes.Group
	lock            sync.RWMutex
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger        *zap.Logger
	IpfsCoreAPI   ipfs_coreapi.CoreAPI
	Account       AccountKeys
	RootContext   context.Context
	RootDatastore datastore.Batching
	MessageKeys   MessageKeys
	OrbitCache    cache.Interface
	DBConstructor BertyOrbitDBConstructor
}

// New initializes a new Client
func New(opts Opts) (Service, error) {
	if opts.Account == nil || opts.MessageKeys == nil || opts.DBConstructor == nil {
		return nil, errcode.ErrInvalidInput
	}

	client := &service{
		ctx:          opts.RootContext,
		ipfsCoreAPI:  opts.IpfsCoreAPI,
		logger:       opts.Logger,
		groups:       map[string]*bertytypes.Group{},
		openedGroups: map[string]ContextGroup{},
	}

	if opts.RootDatastore == nil {
		opts.RootDatastore = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	if opts.Logger == nil {
		client.logger = zap.NewNop()
	}

	ctx := opts.RootContext
	if ctx == nil {
		ctx = context.TODO()
	}

	if opts.IpfsCoreAPI == nil {
		var err error
		client.ipfsCoreAPI, _, err = ipfsutil.NewInMemoryCoreAPI(ctx)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	odb, err := opts.DBConstructor(ctx, opts.IpfsCoreAPI, opts.Account, opts.MessageKeys, &orbitdb.NewOrbitDBOptions{Cache: opts.OrbitCache})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	client.odb = odb
	client.account = opts.Account

	client.accContextGroup, err = odb.OpenAccountGroup(ctx, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	client.groups[string(client.accContextGroup.Group().PublicKey)] = client.accContextGroup.Group()
	client.openedGroups[string(client.accContextGroup.Group().PublicKey)] = client.accContextGroup

	return client, nil
}

func (c *service) Close() error {
	c.odb.Close()

	return nil
}

// Status contains results of status checks
type Status struct {
	DB       error
	Protocol error
}

func (c *service) Status() Status {
	return Status{
		Protocol: nil,
	}
}
