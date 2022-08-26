package initutil

import (
	"flag"

	datastore "github.com/ipfs/go-datastore"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (m *Manager) SetupDatastoreFlags(fs *flag.FlagSet) {
	dir := m.Datastore.AppDir
	if dir == "" {
		dir = m.Datastore.defaultDir
	}
	fs.StringVar(&m.Datastore.AppDir, "store.dir", dir, "root datastore directory")

	fs.StringVar(&m.Datastore.SharedDir, "store.shared-dir", "", "shared root datastore directory")

	fs.BoolVar(&m.Datastore.InMemory, "store.inmem", m.Datastore.InMemory, "disable datastore persistence")
}

func (m *Manager) GetAppDataDir() (string, error) {
	defer m.prepareForGetter()()

	return m.getAppDataDir()
}

func (m *Manager) getAppDataDir() (string, error) {
	m.applyDefaults()

	if m.Datastore.appDir != "" {
		return m.Datastore.appDir, nil
	}

	if m.Datastore.InMemory {
		return accountutils.InMemoryDir, nil
	}

	err := accountutils.CreateDataDir(m.Datastore.AppDir)
	if err != nil {
		return "", err
	}
	m.Datastore.appDir = m.Datastore.AppDir

	inMemory := m.Datastore.appDir == accountutils.InMemoryDir
	m.initLogger.Debug("datastore dir",
		zap.String("dir", m.Datastore.appDir),
		zap.Bool("in-memory", inMemory),
	)

	return m.Datastore.appDir, nil
}

func (m *Manager) GetSharedDataDir() (string, error) {
	defer m.prepareForGetter()()

	return m.getSharedDataDir()
}

func (m *Manager) getSharedDataDir() (string, error) {
	m.applyDefaults()

	if m.Datastore.sharedDir != "" {
		return m.Datastore.sharedDir, nil
	}

	if m.Datastore.InMemory {
		return accountutils.InMemoryDir, nil
	}

	err := accountutils.CreateDataDir(m.Datastore.SharedDir)
	if err != nil {
		return "", err
	}
	m.Datastore.sharedDir = m.Datastore.SharedDir

	inMemory := m.Datastore.sharedDir == accountutils.InMemoryDir
	m.initLogger.Debug("datastore shared dir",
		zap.String("dir", m.Datastore.sharedDir),
		zap.Bool("in-memory", inMemory),
	)

	return m.Datastore.sharedDir, nil
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

	dir, err := m.getSharedDataDir()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	storageKey, err := m.GetAccountStorageKey()
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	storageSalt, err := m.GetAccountRootDatastoreSalt()
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	if m.Datastore.rootDS, err = accountutils.GetRootDatastoreForPath(dir, storageKey, storageSalt, m.initLogger); err != nil {
		return nil, err
	}

	m.initLogger.Debug("datastore", zap.Bool("in-memory", dir == accountutils.InMemoryDir))

	return m.Datastore.rootDS, nil
}
