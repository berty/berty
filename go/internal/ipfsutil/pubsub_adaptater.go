package ipfsutil

import (
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
)

type pubsubCoreAPIAdapter struct {
	ipfs_interface.PubSubAPI

	ipfs_interface.CoreAPI
}

func (ps *pubsubCoreAPIAdapter) PubSub() ipfs_interface.PubSubAPI {
	return ps.PubSubAPI
}

func InjectPubSubAPI(api ipfs_interface.CoreAPI, ps ipfs_interface.PubSubAPI) ipfs_interface.CoreAPI {
	return &pubsubCoreAPIAdapter{
		PubSubAPI: ps,
		CoreAPI:   api,
	}
}

type pubsubExtendedCoreAPIAdapter struct {
	ipfs_interface.PubSubAPI

	ExtendedCoreAPI
}

func (ps *pubsubExtendedCoreAPIAdapter) PubSub() ipfs_interface.PubSubAPI {
	return ps.PubSubAPI
}

func InjectPubSubCoreAPIExtendedAdapter(exapi ExtendedCoreAPI, ps ipfs_interface.PubSubAPI) ExtendedCoreAPI {
	return &pubsubExtendedCoreAPIAdapter{
		PubSubAPI:       ps,
		ExtendedCoreAPI: exapi,
	}
}
