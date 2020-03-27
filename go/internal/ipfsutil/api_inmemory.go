package ipfsutil

import (
	"context"
	crand "crypto/rand"
	"encoding/base64"

	"berty.tech/berty/v2/go/pkg/errcode"
	ipfs_datastore "github.com/ipfs/go-datastore"
	ipfs_datastoresync "github.com/ipfs/go-datastore/sync"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_node "github.com/ipfs/go-ipfs/core/node"
	ipfs_libp2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto" // nolint:staticcheck
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer" // nolint:staticcheck
)

// @FIXME: listeners should not be pass as direct argument, instead we should pass a config

// NewInMemoryCoreAPI returns an IPFS CoreAPI based on an opininated ipfs_node.BuildCfg
func NewInMemoryCoreAPI(ctx context.Context, listeners ...string) (ipfs_interface.CoreAPI, *ipfs_core.IpfsNode, error) {
	cfg, err := createBuildConfig(listeners...)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}
	return NewConfigurableCoreAPI(ctx, cfg)
}

func createBuildConfig(listeners ...string) (*ipfs_node.BuildCfg, error) {
	ds := ipfs_datastore.NewMapDatastore()
	repo, err := createRepo(ipfs_datastoresync.MutexWrap(ds), listeners...)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	routing := ipfs_libp2p.DHTClientOption
	hostopts := ipfs_libp2p.DefaultHostOption
	return &ipfs_node.BuildCfg{
		Online:                      true,
		Permanent:                   true,
		DisableEncryptedConnections: false,
		NilRepo:                     false,
		Routing:                     routing,
		Host:                        hostopts,
		Repo:                        repo,
		ExtraOpts: map[string]bool{
			"pubsub": true,
		},
	}, nil
}

func createRepo(dstore ipfs_repo.Datastore, listeners ...string) (ipfs_repo.Repo, error) {
	c := ipfs_cfg.Config{}
	priv, pub, err := libp2p_ci.GenerateKeyPairWithReader(libp2p_ci.RSA, 2048, crand.Reader) // nolint:staticcheck
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	pid, err := libp2p_peer.IDFromPublicKey(pub) // nolint:staticcheck
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	privkeyb, err := priv.Bytes()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	c.Bootstrap = ipfs_cfg.DefaultBootstrapAddresses

	if len(listeners) > 0 {
		c.Addresses.Swarm = listeners
	} else {
		c.Addresses.Swarm = []string{
			"/ip4/0.0.0.0/tcp/4001",
			"/ip6/0.0.0.0/tcp/4001",
		}
	}

	c.Identity.PeerID = pid.Pretty()
	c.Identity.PrivKey = base64.StdEncoding.EncodeToString(privkeyb)

	// enable MDNS
	c.Discovery.MDNS.Enabled = true
	c.Discovery.MDNS.Interval = 10

	return &ipfs_repo.Mock{
		D: dstore,
		C: c,
	}, nil
}
