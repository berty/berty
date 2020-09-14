package bertyprotocol

import (
	"berty.tech/go-orbit-db/cache/cacheleveldown"
)

const NamespaceMessageKeystore = "messages_keystore"
const NamespaceDeviceKeystore = "device_keystore"
const NamespaceOrbitDBDatastore = "orbitdb_datastore"
const NamespaceOrbitDBDirectory = "orbitdb"
const NamespaceIPFSDatastore = "ipfs_datastore"

var InMemoryDirectory = cacheleveldown.InMemoryDirectory
