package initutil

import (
	"flag"
	"fmt"
	"os"
	"path"

	badger_opts "github.com/dgraph-io/badger/options"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	ipfsbadger "github.com/ipfs/go-ds-badger"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
)

const InMemoryDir = ":memory:"

func (m *Manager) SetupDatastoreFlags(fs *flag.FlagSet) {
	dir := m.Datastore.Dir
	if dir == "" {
		dir = m.Datastore.defaultDir
	}
	fs.StringVar(&m.Datastore.Dir, "store.dir", dir, "root datastore directory")
	fs.BoolVar(&m.Datastore.InMemory, "store.inmem", m.Datastore.InMemory, "disable datastore persistence")
	fs.BoolVar(&m.Datastore.LowMemoryProfile, "store.lowmem", m.Datastore.LowMemoryProfile, "enable LowMemory Profile, useful for mobile environment")
}

func (m *Manager) GetDatastoreDir() (string, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getDatastoreDir()
}

func (m *Manager) getDatastoreDir() (string, error) {
	m.applyDefaults()

	if m.Datastore.dir != "" {
		return m.Datastore.dir, nil
	}
	switch {
	case m.Datastore.Dir == "" && !m.Datastore.InMemory:
		return "", errcode.TODO.Wrap(fmt.Errorf("--store.dir is empty"))
	case m.Datastore.Dir == InMemoryDir,
		m.Datastore.Dir == "",
		m.Datastore.InMemory:
		return InMemoryDir, nil
	}

	m.Datastore.dir = path.Join(m.Datastore.Dir, "account0") // account0 is a suffix that will be used with multi-account later

	_, err := os.Stat(m.Datastore.dir)
	switch {
	case os.IsNotExist(err):
		if err := os.MkdirAll(m.Datastore.dir, 0o700); err != nil {
			return "", errcode.TODO.Wrap(err)
		}
	case err != nil:
		return "", errcode.TODO.Wrap(err)
	}

	m.initLogger.Debug("datastore dir", zap.String("dir", m.Datastore.dir))
	return m.Datastore.dir, nil
}

func (m *Manager) GetRootDatastore() (datastore.Batching, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getRootDatastore()
}

func (m *Manager) getRootDatastore() (datastore.Batching, error) {
	m.applyDefaults()

	if m.Datastore.rootDS != nil {
		return m.Datastore.rootDS, nil
	}

	dir, err := m.getDatastoreDir()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if dir == InMemoryDir {
		return sync_ds.MutexWrap(datastore.NewMapDatastore()), nil
	}

	opts := ipfsbadger.DefaultOptions
	if m.Datastore.LowMemoryProfile {
		applyBadgerLowMemoryProfile(m.initLogger, &opts)
	}

	ds, err := ipfsbadger.NewDatastore(dir, &opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	m.Datastore.rootDS = ds

	m.Datastore.rootDS = sync_ds.MutexWrap(m.Datastore.rootDS)
	m.initLogger.Debug("datastore", zap.Bool("in-memory", dir == InMemoryDir))
	return m.Datastore.rootDS, nil
}

func applyBadgerLowMemoryProfile(logger *zap.Logger, o *ipfsbadger.Options) {
	logger.Info("Using Badger with low memory options")
	o.Options = o.Options.WithValueLogLoadingMode(badger_opts.FileIO)
	o.Options = o.Options.WithTableLoadingMode(badger_opts.FileIO)
	o.Options = o.Options.WithValueLogFileSize(16 << 20) // 16 MB value log file
	o.Options = o.Options.WithMaxTableSize(8 << 20)      // should already be set by ipfs
}
