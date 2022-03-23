package initutil

import (
	"path/filepath"

	datastore "github.com/ipfs/go-datastore"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/pubsub/directchannel"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
)

func (m *Manager) GetRotationPoint() (rp *rendezvous.RotationPoint, err error) {
	m.mutex.Lock()
	rp, err = m.getRotationPoint()
	m.mutex.Unlock()
	return
}

func (m *Manager) getRotationPoint() (*rendezvous.RotationPoint, error) {
	if m.Node.Protocol.rotationPoint == nil {
		rendezvousRotationBase, err := m.GetRendezvousRotationBase()
		if err != nil {
			return nil, errcode.ErrDeserialization.Wrap(err)
		}
		m.Node.Protocol.rotationPoint = rendezvous.NewRotationPoint(rendezvousRotationBase)
	}

	return m.Node.Protocol.rotationPoint, nil
}

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

	if orbitDirectory != accountutils.InMemoryDir {
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
		deviceDS = ipfsutil.NewDatastoreKeystore(datastoreutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceDeviceKeystore)))
		deviceKS = cryptoutil.NewDeviceKeystore(deviceDS, nil)
		cache    = bertyprotocol.NewOrbitDatastoreCache(rootDS)
	)

	rp, err := m.getRotationPoint()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	opts := &bertyprotocol.NewOrbitDBOptions{
		NewOrbitDBOptions: baseorbitdb.NewOrbitDBOptions{
			Cache:                cache,
			Directory:            &orbitDirectory,
			Logger:               logger,
			DirectChannelFactory: directchannel.InitDirectChannelFactory(logger.Named("odb-dc"), node.PeerHost),
		},
		Datastore:      rootDS,
		DeviceKeystore: deviceKS,
		RotationPoint:  rp,
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
