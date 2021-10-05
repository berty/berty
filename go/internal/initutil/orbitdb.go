package initutil

import (
	"path/filepath"

	datastore "github.com/ipfs/go-datastore"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
)

func (m *Manager) getOrbitDB() (*bertyprotocol.BertyOrbitDB, error) {
	m.applyDefaults()

	if m.Node.Protocol.orbitDB != nil {
		return m.Node.Protocol.orbitDB, nil
	}

	ipfs, node, err := m.getLocalIPFS()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	rootDS, err := m.getRootDatastore()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	var (
		deviceDS = ipfsutil.NewDatastoreKeystore(datastoreutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceDeviceKeystore)))
		deviceKS = cryptoutil.NewDeviceKeystore(deviceDS)
		cache    = bertyprotocol.NewOrbitDatastoreCache(rootDS)
	)

	orbitDirectory := filepath.Join(m.Datastore.Dir, bertyprotocol.NamespaceOrbitDBDirectory)

	opts := &bertyprotocol.NewOrbitDBOptions{
		NewOrbitDBOptions: baseorbitdb.NewOrbitDBOptions{
			Cache:     cache,
			Directory: &orbitDirectory,
			Logger:    logger,
		},
		Datastore:      rootDS,
		DeviceKeystore: deviceKS,
	}

	if node.PubSub != nil {
		self, err := ipfs.Key().Self(m.getContext())
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		opts.PubSub = pubsubraw.NewPubSub(node.PubSub, self.ID(), opts.Logger, nil)
	}

	odb, err := bertyprotocol.NewBertyOrbitDB(m.getContext(), ipfs, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	m.Node.Protocol.orbitDB = odb

	return odb, nil
}

func (m *Manager) GetOrbitDB() (*bertyprotocol.BertyOrbitDB, error) {
	defer m.prepareForGetter()()

	return m.getOrbitDB()
}
