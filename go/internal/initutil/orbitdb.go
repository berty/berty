package initutil

import (
	"path/filepath"

	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/pubsub/directchannel"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
	datastore "github.com/ipfs/go-datastore"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (m *Manager) getOrbitDB() (*bertyprotocol.BertyOrbitDB, error) {
	if m.Node.orbitDB != nil {
		return m.Node.orbitDB, nil
	}

	ipfs, node, err := m.getLocalIPFS()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	orbitDirectory, err := m.getDatastoreDir()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if orbitDirectory != InMemoryDir {
		orbitDirectory = filepath.Join(orbitDirectory, bertyprotocol.NamespaceOrbitDBDirectory)
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
		messageDS = bertyprotocol.NewMessageKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceMessageKeystore)))
		deviceDS  = ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceDeviceKeystore)))
		deviceKS  = bertyprotocol.NewDeviceKeystore(deviceDS)
		cache     = bertyprotocol.NewOrbitDatastoreCache(rootDS)
	)

	opts := &bertyprotocol.NewOrbitDBOptions{
		NewOrbitDBOptions: baseorbitdb.NewOrbitDBOptions{
			Cache:                cache,
			Directory:            &orbitDirectory,
			Logger:               logger,
			Tracer:               tracer.New("berty-orbitdb"),
			DirectChannelFactory: directchannel.InitDirectChannelFactory(node.PeerHost),
		},
		Datastore:       rootDS,
		MessageKeystore: messageDS,
		DeviceKeystore:  deviceKS,
	}

	if opts.PubSub != nil {
		self, err := ipfs.Key().Self(m.ctx)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		opts.PubSub = pubsubraw.NewPubSub(node.PubSub, self.ID(), opts.Logger, nil)
	}

	odb, err := bertyprotocol.NewBertyOrbitDB(m.ctx, ipfs, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	m.Node.orbitDB = odb

	return odb, nil
}

func (m *Manager) GetOrbitDB() (*bertyprotocol.BertyOrbitDB, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	return m.getOrbitDB()
}
