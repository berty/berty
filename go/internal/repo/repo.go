package repo

import (
	"fmt"
	"time"

	"github.com/ipfs/go-datastore"
	ipfs_cfg "github.com/ipfs/kubo/config"
	"github.com/ipfs/kubo/repo"
	"github.com/pkg/errors"

	"berty.tech/weshnet/pkg/ipfsutil"
)

// LoadEncryptedRepoFromPath
func OpenDSRepo(ds datastore.Datastore) (repo.Repo, error) {
	dsrepo := NewFromDatastore(ds, "ipfs")

	// init repo if needed
	if !dsrepo.IsInitialized() {
		cfg, err := ipfsutil.CreateBaseConfig()
		if err != nil {
			return nil, errors.Wrap(err, "failed to create base config")
		}

		ucfg, err := upgradeToPersistentConfig(cfg)
		if err != nil {
			return nil, errors.Wrap(err, "failed to upgrade repo")
		}
		ucfg.Datastore.Spec = nil

		if err := dsrepo.Initialize(cfg); err != nil {
			return nil, fmt.Errorf("unable to initialized database: %w", err)
		}
	}

	return dsrepo.Open()
}

func ResetIdentity(r repo.Repo) error {
	cfg, err := r.Config()
	if err != nil {
		return err
	}

	if err := ipfsutil.ResetRepoIdentity(cfg); err != nil {
		return err
	}

	return r.SetConfig(cfg)
}

func upgradeToPersistentConfig(cfg *ipfs_cfg.Config) (*ipfs_cfg.Config, error) {
	cfgCopy, err := cfg.Clone()
	if err != nil {
		return nil, err
	}

	// setup the node mount points.
	cfgCopy.Mounts = ipfs_cfg.Mounts{
		IPFS: "/ipfs",
		IPNS: "/ipns",
	}

	cfgCopy.Ipns = ipfs_cfg.Ipns{
		ResolveCacheSize: 128,
	}

	cfgCopy.Reprovider = ipfs_cfg.Reprovider{
		Interval: ipfs_cfg.NewOptionalDuration(time.Hour * 12),
		Strategy: ipfs_cfg.NewOptionalString("all"),
	}

	cfgCopy.Datastore = ipfs_cfg.Datastore{
		StorageMax:         "10GB",
		StorageGCWatermark: 90, // 90%
		GCPeriod:           "1h",
		BloomFilterSize:    0,
		Spec: map[string]interface{}{
			"type": "mount",
			"mounts": []interface{}{
				map[string]interface{}{
					"mountpoint": "/blocks",
					"type":       "measure",
					"prefix":     "flatfs.datastore",
					"child": map[string]interface{}{
						"type":      "flatfs",
						"path":      "blocks",
						"sync":      true,
						"shardFunc": "/repo/flatfs/shard/v1/next-to-last/2",
					},
				},
				map[string]interface{}{
					"mountpoint": "/",
					"type":       "measure",
					"prefix":     "leveldb.datastore",
					"child": map[string]interface{}{
						"type":        "levelds",
						"path":        "datastore",
						"compression": "none",
					},
				},
			},
		},
	}

	return cfgCopy, nil
}
