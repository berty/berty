package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"math/big"

	"berty.tech/go/pkg/errcode"
	ipfs_datastore "github.com/ipfs/go-datastore"
	ipfs_datastoresync "github.com/ipfs/go-datastore/sync"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_node "github.com/ipfs/go-ipfs/core/node"
	ipfs_libp2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto" // nolint:staticcheck
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer" // nolint:staticcheck
)

func createBuildConfig() (*ipfs_node.BuildCfg, error) {
	ds := ipfs_datastore.NewMapDatastore()
	repo, err := createRepo(ipfs_datastoresync.MutexWrap(ds))
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
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
		ExtraOpts: map[string]bool{
			"pubsub": true,
		},
	}, nil
}

func createRepo(dstore ipfs_repo.Datastore) (ipfs_repo.Repo, error) {
	c := ipfs_cfg.Config{}
	priv, pub, err := libp2p_ci.GenerateKeyPairWithReader(libp2p_ci.RSA, 2048, rand.Reader) // nolint:staticcheck
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

	portOffsetBI, err := rand.Int(rand.Reader, big.NewInt(100))
	if err != nil {
		panic(err)
	}

	portOffset := portOffsetBI.Int64() % 100

	println("Listening on port", 4001+portOffset)

	c.Bootstrap = ipfs_cfg.DefaultBootstrapAddresses
	c.Addresses.Swarm = []string{
		fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", 4001+portOffset),
		fmt.Sprintf("/ip6/0.0.0.0/tcp/%d", 4001+portOffset),
	}
	c.Identity.PeerID = pid.Pretty()
	c.Identity.PrivKey = base64.StdEncoding.EncodeToString(privkeyb)
	c.Discovery.MDNS.Enabled = true
	c.Discovery.MDNS.Interval = 1

	return &ipfs_repo.Mock{
		D: dstore,
		C: c,
	}, nil
}
