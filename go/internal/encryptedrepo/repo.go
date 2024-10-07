package encryptedrepo

import (
	"fmt"
	"path/filepath"
	"time"

	ipfs_cfg "github.com/ipfs/kubo/config"
	ipfs_repo "github.com/ipfs/kubo/repo"
	"github.com/pkg/errors"

	"berty.tech/berty/v2/go/pkg/errcode"
	encrepo "berty.tech/go-ipfs-repo-encrypted"
	"berty.tech/weshnet/v2/pkg/ipfsutil"
)

// LoadEncryptedRepoFromPath
func LoadEncryptedRepoFromPath(path string, key []byte, salt []byte) (ipfs_repo.Repo, error) {
	dir, _ := filepath.Split(path)
	if _, err := ipfsutil.LoadPlugins(dir); err != nil {
		return nil, errors.Wrap(err, "failed to load plugins")
	}

	// init repo if needed
	sqldsOpts := encrepo.SQLCipherDatastoreOptions{JournalMode: "WAL", PlaintextHeader: len(salt) != 0, Salt: salt}
	isInit, err := encrepo.IsInitialized(path, key, sqldsOpts)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check if repo is initialized")
	}
	if !isInit {
		cfg, err := ipfsutil.CreateBaseConfig()
		if err != nil {
			return nil, errors.Wrap(err, "failed to create base config")
		}

		ucfg, err := upgradeToPersistentConfig(cfg)
		if err != nil {
			return nil, errors.Wrap(err, "failed to upgrade repo")
		}

		ucfg.Datastore.Spec = nil

		if err := encrepo.Init(path, key, sqldsOpts, ucfg); err != nil {
			return nil, errors.Wrap(err, "failed to init repo")
		}
	}

	return encrepo.Open(path, key, sqldsOpts)
}

func ResetExistingEncryptedRepoIdentity(repo ipfs_repo.Repo, path string, key []byte, salt []byte) (ipfs_repo.Repo, error) {
	repo, err := ipfsutil.ResetExistingRepoIdentity(repo)
	if err != nil {
		return nil, fmt.Errorf("unable to open reset existing repo identity: %w", err)
	}

	_ = repo.Close()

	sqldsOpts := encrepo.SQLCipherDatastoreOptions{JournalMode: "WAL", PlaintextHeader: len(salt) != 0, Salt: salt}
	repo, err = encrepo.Open(path, key, sqldsOpts)
	if err != nil {
		return nil, errcode.ErrCode_ErrInternal.Wrap(err)
	}

	return repo, nil
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
