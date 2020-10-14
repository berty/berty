package initutil

import (
	"flag"
	"os"
	"path"

	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
)

const InMemoryDir = ":memory:"

func (m *Manager) SetupDatastoreFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Datastore.Dir, "store.dir", m.Datastore.defaultDir, "root datastore directory")
	fs.BoolVar(&m.Datastore.InMemory, "store.inmem", false, "disable datastore persistence")
}

func (m *Manager) GetDatastoreDir() (string, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getDatastoreDir()
}

func (m *Manager) getDatastoreDir() (string, error) {
	_, err := m.getLogger() // needed by m.initLogger below
	if err != nil {
		return "", err
	}

	if m.Datastore.dir != "" {
		return m.Datastore.dir, nil
	}
	switch {
	case m.Datastore.Dir == InMemoryDir,
		m.Datastore.Dir == "",
		m.Datastore.InMemory:
		return InMemoryDir, nil
	}

	if m.IsMobile {
		m.Datastore.dir = path.Join(m.Datastore.Dir, "store")
	} else {
		m.Datastore.dir = path.Join(m.Datastore.Dir, "berty")
	}
	_, err = os.Stat(m.Datastore.dir)
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

	ds, err := badger.NewDatastore(dir, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	m.Datastore.rootDS = ds

	m.Datastore.rootDS = sync_ds.MutexWrap(m.Datastore.rootDS)
	m.initLogger.Debug("datastore", zap.Bool("in-memory", dir == InMemoryDir))
	return m.Datastore.rootDS, nil
}
