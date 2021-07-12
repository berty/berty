package initutil

import (
	"path/filepath"

	datastore "github.com/ipfs/go-datastore"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/pubsub/directchannel"
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
		deviceDS = ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceDeviceKeystore)))
		deviceKS = bertyprotocol.NewDeviceKeystore(deviceDS)
		cache    = bertyprotocol.NewOrbitDatastoreCache(rootDS)
	)

	opts := &bertyprotocol.NewOrbitDBOptions{
		NewOrbitDBOptions: baseorbitdb.NewOrbitDBOptions{
			Cache:                cache,
			Directory:            &orbitDirectory,
			Logger:               logger,
			Tracer:               tracer.New("orbitdb"),
			DirectChannelFactory: directchannel.InitDirectChannelFactory(node.PeerHost),
		},
		Datastore:      rootDS,
		DeviceKeystore: deviceKS,
	}

	if m.Node.Protocol.pubsub != nil {
		opts.PubSub = pubsubraw.NewPubSub(m.Node.Protocol.pubsub, node.Identity, opts.Logger, nil)
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
