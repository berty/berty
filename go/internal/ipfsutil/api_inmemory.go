package ipfsutil

import (
	"context"
	"crypto/rand"
	"encoding/base64"

	ipfs_datastore "github.com/ipfs/go-datastore"
	ipfs_datastoresync "github.com/ipfs/go-datastore/sync"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_coreapi "github.com/ipfs/go-ipfs/core/coreapi"
	ipfs_node "github.com/ipfs/go-ipfs/core/node"
	ipfs_libp2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	libp2p_ci "github.com/libp2p/go-libp2p-crypto" // nolint:staticcheck
	libp2p_peer "github.com/libp2p/go-libp2p-peer" // nolint:staticcheck
	"github.com/pkg/errors"
)

// NewInMemoryCoreAPI returns an IPFS CoreAPI based on an opininated ipfs_node.BuildCfg
func NewInMemoryCoreAPI(ctx context.Context) (ipfs_interface.CoreAPI, error) {
	cfg, err := createBuildConfig()
	if err != nil {
		return nil, errors.Wrap(err, "failed to create ipfs build config")
	}

	node, err := ipfs_core.NewNode(ctx, cfg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create a new ipfs node")
	}

	return ipfs_coreapi.NewCoreAPI(node)
}

func createBuildConfig() (*ipfs_node.BuildCfg, error) {
	ds := ipfs_datastore.NewMapDatastore()
	repo, err := createRepo(ipfs_datastoresync.MutexWrap(ds))
	if err != nil {
		return nil, errors.Wrap(err, "failed to create ipfs repo")
	}

	routing := ipfs_libp2p.DHTOption
	hostopts := ipfs_libp2p.DefaultHostOption
	return &ipfs_node.BuildCfg{
		Online:                      true,
		Permanent:                   true,
		DisableEncryptedConnections: false,
		NilRepo:                     false,
		Routing:                     routing,
		Host:                        hostopts,
		Repo:                        repo,
	}, nil
}

func createRepo(dstore ipfs_repo.Datastore) (ipfs_repo.Repo, error) {
	c := ipfs_cfg.Config{}
	priv, pub, err := libp2p_ci.GenerateKeyPairWithReader(libp2p_ci.RSA, 2048, rand.Reader) // nolint:staticcheck
	if err != nil {
		return nil, errors.Wrap(err, "failed to create ipfs build config")
	}

	pid, err := libp2p_peer.IDFromPublicKey(pub) // nolint:staticcheck
	if err != nil {
		return nil, errors.Wrap(err, "failed to convert public key to PeerID")
	}

	privkeyb, err := priv.Bytes()
	if err != nil {
		return nil, errors.Wrap(err, "failed to get serialized private key")
	}

	c.Bootstrap = ipfs_cfg.DefaultBootstrapAddresses
	c.Addresses.Swarm = []string{
		"/ip4/0.0.0.0/tcp/4001",
		"/ip6/0.0.0.0/tcp/4001",
	}
	c.Identity.PeerID = pid.Pretty()
	c.Identity.PrivKey = base64.StdEncoding.EncodeToString(privkeyb)

	return &ipfs_repo.Mock{
		D: dstore,
		C: c,
	}, nil
}
