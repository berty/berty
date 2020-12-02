package bertyprotocol

import (
	"berty.tech/go-orbit-db/cache/cacheleveldown"
)

const (
	NamespaceMessageKeystore          = "messages_keystore"
	NamespaceDeviceKeystore           = "device_keystore"
	NamespaceOrbitDBDatastore         = "orbitdb_datastore"
	NamespaceOrbitDBDirectory         = "orbitdb"
	NamespaceIPFSDatastore            = "ipfs_datastore"
	NamespaceGroupDatastore           = "account_groups_datastore"
	NamespaceAccountCacheDatastore    = "account_cache_datastore"
	AccountCacheDatastorePushServerPK = "push_server_public_key"
)

var InMemoryDirectory = cacheleveldown.InMemoryDirectory
