package bertyprotocol

import (
	"berty.tech/go-orbit-db/cache/cacheleveldown"
)

const (
	NamespaceDeviceKeystore   = "device_keystore"
	NamespaceOrbitDBDatastore = "orbitdb_datastore"
	NamespaceOrbitDBDirectory = "orbitdb"
	NamespaceIPFSDatastore    = "ipfs_datastore"
)

var InMemoryDirectory = cacheleveldown.InMemoryDirectory
