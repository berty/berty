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

func (m *Manager) GetRootDatastore() (datastore.Batching, error) {
	defer m.prepareForGetter()()

	return m.getRootDatastore()
}

func (m *Manager) getRootDatastore() (datastore.Batching, error) {
	m.applyDefaults()

	if m.Datastore.rootDS != nil {
		return m.Datastore.rootDS, nil
	}

	path := "root-ds"

	fs, err := m.getFs()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if m.Datastore.rootDS, err = getRootDatastoreForPath(fs, path, m.Datastore.LowMemoryProfile, m.initLogger); err != nil {
		return nil, err
	}

<<<<<<< HEAD
	m.initLogger.Debug("datastore", zap.Bool("in-memory", dir == accountutils.InMemoryDir))
=======
	m.initLogger.Debug("loaded or created root datastore in virtual fs", zap.String("path", path))
>>>>>>> 78686df6d (fix: make daemon boot)

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
