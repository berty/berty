package initutil

import (
	"flag"

	datastore "github.com/ipfs/go-datastore"
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

	dir, err := accountutils.GetDatastoreDir(m.Datastore.Dir)
	if err != nil {
		return "", err
	}
	m.Datastore.dir = dir

	inMemory := m.Datastore.dir == accountutils.InMemoryDir
	m.initLogger.Debug("datastore dir",
		zap.String("dir", m.Datastore.dir),
		zap.Bool("in-memory", inMemory),
	)

	return m.Datastore.dir, nil
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

	storageKey, err := m.GetAccountStorageKey()
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	storageSalt, err := m.GetAccountStorageSalt()
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	if m.Datastore.rootDS, err = accountutils.GetRootDatastoreForPath(dir, storageKey, storageSalt, m.initLogger); err != nil {
		return nil, err
	}

	m.initLogger.Debug("datastore", zap.Bool("in-memory", dir == accountutils.InMemoryDir))

	return m.Datastore.rootDS, nil
}
