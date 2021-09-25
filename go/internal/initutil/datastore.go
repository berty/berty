package initutil

import (
	"flag"

	afrepo "github.com/berty/go-ipfs-repo-afero/pkg/repo"
	badger_opts "github.com/dgraph-io/badger/options"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	ipfsbadger "github.com/ipfs/go-ds-badger"
	"github.com/spf13/afero"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/pkg/errcode"
)

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
	defer m.prepareForGetter()()

	return m.getDatastoreDir()
}

func (m *Manager) getDatastoreDir() (string, error) {
	m.applyDefaults()

	if m.Datastore.dir != "" {
		return m.Datastore.dir, nil
	} else if m.Datastore.InMemory {
		return accountutils.InMemoryDir, nil
	}

	if dir, err := getDatastoreDir(m.Datastore.Fs, m.Datastore.Dir); err != nil {
	} else {
		m.Datastore.dir = dir
	}

	inMemory := m.Datastore.dir == accountutils.InMemoryDir
	m.initLogger.Debug("datastore dir",
		zap.String("dir", m.Datastore.dir),
		zap.Bool("in-memory", inMemory),
	)

	return m.Datastore.dir, nil
}

func getDatastoreDir(fs afero.Fs, dir string) (string, error) {
	switch {
	case dir == "":
		return "", errcode.TODO.Wrap(fmt.Errorf("--store.dir is empty"))
	case dir == InMemoryDir:
		return InMemoryDir, nil
	}

	dir = path.Join(dir, "account0") // account0 is a suffix that will be used with multi-account later

	_, err := fs.Stat(dir)
	switch {
	case os.IsNotExist(err):
		if err := fs.MkdirAll(dir, 0o700); err != nil {
			return "", errcode.TODO.Wrap(err)
		}
	case err != nil:
		return "", errcode.TODO.Wrap(err)
	}

	return dir, nil
}

func (m *Manager) GetRootDatastore() (datastore.Batching, error) {
	defer m.prepareForGetter()()

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

	if m.Datastore.rootDS, err = getRootDatastoreForPath(m.Datastore.Fs, dir, m.Datastore.LowMemoryProfile, m.initLogger); err != nil {
		return nil, err
	}

	m.initLogger.Debug("datastore", zap.Bool("in-memory", dir == accountutils.InMemoryDir))

	return m.Datastore.rootDS, nil
}

func getRootDatastoreForPath(fs afero.Fs, dir string, lowMemoryProfile bool, logger *zap.Logger) (datastore.Batching, error) {
	var err error

	afrepo.DsFs = fs

	conf, err := afrepo.AferoDatastoreConfig(map[string]interface{}{"path": dir})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	ds, err := conf.Create(".")
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	ds = sync_ds.MutexWrap(ds)

	return ds, nil
}

func applyBadgerLowMemoryProfile(logger *zap.Logger, o *ipfsbadger.Options) {
	logger.Info("Using Badger with low memory options")
	o.Options = o.Options.WithValueLogLoadingMode(badger_opts.FileIO)
	o.Options = o.Options.WithTableLoadingMode(badger_opts.FileIO)
	o.Options = o.Options.WithValueLogFileSize(16 << 20) // 16 MB value log file
	o.Options = o.Options.WithMaxTableSize(8 << 20)      // should already be set by ipfs
}
