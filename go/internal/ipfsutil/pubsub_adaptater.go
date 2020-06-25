package ipfsutil

import (
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
)

type pubsubCoreAPIAdaptater struct {
	ipfs_interface.PubSubAPI

	ipfs_interface.CoreAPI
}

func (ps *pubsubCoreAPIAdaptater) PubSub() ipfs_interface.PubSubAPI {
	return ps.PubSubAPI
}

func InjectPubSubAPI(api ipfs_interface.CoreAPI, ps ipfs_interface.PubSubAPI) ipfs_interface.CoreAPI {
	return &pubsubCoreAPIAdaptater{
		PubSubAPI: ps,
		CoreAPI:   api,
	}
}

type pubsubExtendedCoreAPIAdaptater struct {
	ipfs_interface.PubSubAPI

	ExtendedCoreAPI
}

func (ps *pubsubExtendedCoreAPIAdaptater) PubSub() ipfs_interface.PubSubAPI {
	return ps.PubSubAPI
}

func InjectPubSubCoreAPIExtendedAdaptater(exapi ExtendedCoreAPI, ps ipfs_interface.PubSubAPI) ExtendedCoreAPI {
	return &pubsubExtendedCoreAPIAdaptater{
		PubSubAPI:       ps,
		ExtendedCoreAPI: exapi,
	}
}
