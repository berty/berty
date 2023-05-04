package repo

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"sync"

	"github.com/ipfs/go-datastore"
	"github.com/ipfs/go-filestore"
	keystore "github.com/ipfs/go-ipfs-keystore"
	config "github.com/ipfs/kubo/config"
	"github.com/ipfs/kubo/repo"
	"github.com/ipfs/kubo/repo/common"
	rcmgr "github.com/libp2p/go-libp2p/p2p/host/resource-manager"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"github.com/pkg/errors"
)

const configKey = "ipfs-config"

// DSRepo implement repo.Repo
var _ repo.Repo = (*DSRepo)(nil)

type DSRepo struct {
	ctx    context.Context
	cancel context.CancelFunc
	root   datastore.Datastore
	ds     repo.Datastore
	ks     keystore.Keystore
	config *config.Config
	closed bool
	muRepo sync.Mutex
}

func NewFromDatastore(ds datastore.Datastore, namespace string) *DSRepo {
	nds := NewNamespacedDatastore(ds, datastore.NewKey(namespace))
	ctx, cancel := context.WithCancel(context.Background())
	return &DSRepo{
		ctx:    ctx,
		cancel: cancel,
		root:   nds,
		ds:     nds.NewNamespace(datastore.NewKey("data")),
		ks:     KeystoreFromDatastore(nds.NewNamespace(datastore.NewKey("keys"))),
		config: &config.Config{},
	}
}

func (r *DSRepo) Open() (repo.Repo, error) {
	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	cfg, err := getConfigFromDatastore(r.ctx, r.root)
	if err != nil {
		return nil, fmt.Errorf("unable to open ds repo: %w", err)
	}

	r.config = cfg
	return r, nil
}

func (r *DSRepo) IsInitialized() (yes bool) {
	r.muRepo.Lock()
	yes = r.isInitialized()
	r.muRepo.Unlock()
	return
}

func (r *DSRepo) Initialize(cfg *config.Config) error {
	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	if r.isInitialized() {
		return fmt.Errorf("repo already initialized")
	}

	// initialization is the one time when it's okay to write to the config
	// without reading the config from disk and merging any user-provided keys
	// that may exist.
	if err := writeConfigToDatastore(r.ctx, r.root, cfg); err != nil {
		return fmt.Errorf("unable to write config to datastore: %w", err)
	}

	return nil
}

// Config returns the ipfs configuration file from the repo. Changes made
// to the returned config are not automatically persisted.
func (r *DSRepo) Config() (*config.Config, error) {
	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	if r.closed {
		return nil, errors.New("cannot access config, repo not open")
	}

	return r.config, nil
}

// BackupConfig creates a backup of the current configuration file using
// the given prefix for naming.
func (r *DSRepo) BackupConfig(prefix string) (string, error) {
	// Not implemented since the implementation of this in fsrepo makes no sense
	// The backup file name is randomly generated within the function but not returned, so it's not possible to find the backup file afterwards
	return "", errors.New("not implemented")
}

// SetGatewayAddr sets the Gateway address in the repo.
func (r *DSRepo) SetGatewayAddr(addr net.Addr) error {
	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	m, err := manet.FromNetAddr(addr)
	if err != nil {
		return fmt.Errorf("unable to parse addr `%s` to multiaddr: %w", m.String(), err)
	}

	bytes, err := m.MarshalBinary()
	if err != nil {
		return errors.Wrap(err, "marshal ma")
	}

	key := datastore.NewKey("gateway")
	if err := r.root.Put(r.ctx, key, bytes); err != nil {
		return errors.Wrap(err, fmt.Sprintf("put '%s' in ds", key))
	}

	return nil
}

// SetConfig persists the given configuration struct to storage.
func (r *DSRepo) SetConfig(updated *config.Config) error {
	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	if r.config == nil {
		return fmt.Errorf("repo not opened")
	}

	return r.setConfig(r.ctx, updated)
}

// SetConfig persists the given configuration struct to storage.
func (r *DSRepo) setConfig(ctx context.Context, updated *config.Config) error {
	// to avoid clobbering user-provided keys, must read the config from disk
	// as a map, write the updated struct values to the map and write the map
	// to disk.
	var mapconf map[string]interface{}
	if err := readConfigFromDatastore(ctx, r.root, &mapconf); err != nil {
		return err
	}
	m, err := config.ToMap(updated)
	if err != nil {
		return err
	}
	for k, v := range m {
		mapconf[k] = v
	}

	// Do not use `*r.config = ...`. This will modify the *shared* config
	// returned by `r.Config`.
	conf, err := config.FromMap(mapconf)
	if err != nil {
		return err
	}

	if err := writeConfigToDatastore(ctx, r.root, conf); err != nil {
		return err
	}

	r.config = conf

	return nil
}

// SetConfigKey sets the given key-value pair within the config and persists it to storage.
func (r *DSRepo) SetConfigKey(key string, value interface{}) error {
	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	if r.closed {
		return errors.New("repo is closed")
	}

	// Load into a map so we don't end up writing any additional defaults to the config file.
	var mapconf map[string]interface{}
	if err := readConfigFromDatastore(r.ctx, r.root, &mapconf); err != nil {
		return err
	}
	// Load private key to guard against it being overwritten.
	// NOTE: this is a temporary measure to secure this field until we move
	// keys out of the config file.
	pkval, err := common.MapGetKV(mapconf, config.PrivKeySelector)
	if err != nil {
		return err
	}

	// Set the key in the map.
	if err := common.MapSetKV(mapconf, key, value); err != nil {
		return err
	}

	// replace private key, in case it was overwritten.
	if err := common.MapSetKV(mapconf, config.PrivKeySelector, pkval); err != nil {
		return err
	}

	// This step doubles as to validate the map against the struct
	// before serialization
	conf, err := config.FromMap(mapconf)
	if err != nil {
		return err
	}

	// Write config
	return r.setConfig(r.ctx, conf)
}

// GetConfigKey reads the value for the given key from the configuration in storage.
func (r *DSRepo) GetConfigKey(key string) (interface{}, error) {
	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	if r.closed {
		return nil, errors.New("repo is closed")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var cfg map[string]interface{}
	if err := readConfigFromDatastore(ctx, r.root, &cfg); err != nil {
		return nil, err
	}
	return common.MapGetKV(cfg, key)
}

// Datastore returns a reference to the configured data storage backend.
func (r *DSRepo) Datastore() repo.Datastore {
	return r.ds
}

// GetStorageUsage returns the number of bytes stored.
func (r *DSRepo) GetStorageUsage(ctx context.Context) (uint64, error) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	go func() {
		select {
		case <-ctx.Done():
		case <-r.ctx.Done():
			cancel()
		}
	}()

	return datastore.DiskUsage(ctx, r.Datastore())
}

// Keystore returns a reference to the key management interface.
func (r *DSRepo) Keystore() keystore.Keystore {
	return r.ks
}

// FileManager returns a reference to the filestore file manager.
func (r *DSRepo) FileManager() *filestore.FileManager {
	// noop
	return nil
}

// SetAPIAddr sets the API address in the repo.
func (r *DSRepo) SetAPIAddr(addr ma.Multiaddr) error {
	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	bytes, err := addr.MarshalBinary()
	if err != nil {
		return errors.Wrap(err, "marshal ma")
	}
	key := datastore.NewKey("api")
	if err := r.root.Put(r.ctx, key, bytes); err != nil {
		return errors.Wrap(err, fmt.Sprintf("put '%s' in ds", key))
	}
	return nil
}

// SwarmKey returns the configured shared symmetric key for the private networks feature.
func (r *DSRepo) SwarmKey() ([]byte, error) {
	swarmKey, err := r.root.Get(r.ctx, datastore.NewKey("swarm.key"))
	switch err {
	case nil:
		return swarmKey, nil
	case datastore.ErrNotFound:
		return nil, nil
	default:
		return nil, err
	}
}

func (r *DSRepo) Close() error {
	r.cancel()

	r.muRepo.Lock()
	defer r.muRepo.Unlock()

	if r.closed {
		return errors.New("repo is already closed")
	}

	r.closed = true

	return r.root.Close()
}

func (r *DSRepo) UserResourceOverrides() (rcmgr.PartialLimitConfig, error) {
	// @NOTE(gfanton): this method is a noop for the moment, but we can use a
	// system similar that the one in `ipfs/fsrepo` by using a file or environments
	// variables. cf. https://github.com/ipfs/kubo/blob/353dd49be239be651650c3ef3dfef83deebac58c/repo/fsrepo/fsrepo.go#L446
	// this method is only here to fullfil the `repo.Repo` interface
	return rcmgr.PartialLimitConfig{}, nil
}

func (r *DSRepo) isInitialized() (yes bool) {
	yes, _ = r.root.Has(r.ctx, datastore.NewKey(configKey))
	return
}

func readConfigFromDatastore(ctx context.Context, ds datastore.Datastore, dest interface{}) error {
	confBytes, err := ds.Get(ctx, datastore.NewKey(configKey))
	switch err {
	case nil:
		if err := json.Unmarshal(confBytes, dest); err != nil {
			return errors.Wrap(err, "unmarshal config")
		}
		return nil
	case datastore.ErrNotFound:
		return datastore.ErrNotFound
	default:
		return errors.Wrap(err, "get config")
	}
}

func writeConfigToDatastore(ctx context.Context, ds datastore.Datastore, src interface{}) error {
	confBytes, err := config.Marshal(src)
	if err != nil {
		return errors.Wrap(err, "marshal config")
	}
	if err := ds.Put(ctx, datastore.NewKey(configKey), confBytes); err != nil {
		return errors.Wrap(err, "put config in ds")
	}
	return nil
}

func getConfigFromDatastore(ctx context.Context, ds datastore.Datastore) (*config.Config, error) {
	var conf config.Config
	err := readConfigFromDatastore(ctx, ds, &conf)
	switch err {
	case nil:
		return &conf, nil
	case datastore.ErrNotFound:
		return nil, nil
	default:
		return nil, err
	}
}
