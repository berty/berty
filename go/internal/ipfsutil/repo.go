package ipfsutil

import (
	crand "crypto/rand"
	"encoding/base64"
	"path/filepath"
	"time"

	// nolint:staticcheck
	afrepo "github.com/berty/go-ipfs-repo-afero/pkg/repo"
	"github.com/berty/gormfs"
	ipfs_ds "github.com/ipfs/go-datastore"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_loader "github.com/ipfs/go-ipfs/plugin/loader"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	p2p_ci "github.com/libp2p/go-libp2p-core/crypto"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/pkg/errors"
	"github.com/spf13/afero"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/errcode"
)

// defaultConnMgrHighWater is the default value for the connection managers
// 'high water' mark
const defaultConnMgrHighWater = 50

// defaultConnMgrLowWater is the default value for the connection managers 'low
// water' mark
const defaultConnMgrLowWater = 10

// defaultConnMgrGracePeriod is the default value for the connection managers
// grace period
const defaultConnMgrGracePeriod = time.Second * 20

// @NOTE(gfanton): this will be removed with gomobile-ipfs
var plugins *ipfs_loader.PluginLoader

func CreateMockedRepo(dstore ipfs_ds.Batching) (ipfs_repo.Repo, error) {
	c, err := createBaseConfig()
	if err != nil {
		return nil, err
	}

	return &ipfs_repo.Mock{
		D: dstore,
		C: *c,
	}, nil
}

// FIXME: move to go-ipfs-repo-afero
func MemRepo() (ipfs_repo.Repo, error) {
	buf := make([]byte, 32)
	_, err := crand.Read(buf)
	if err != nil {
		return nil, errors.Wrap(err, "generate nonce")
	}
	suffix := base64.RawURLEncoding.EncodeToString(buf)

	fs := afero.NewMemMapFs()

	afrepo.DsFs = fs

	cfg, err := createBaseConfig()
	if err != nil {
		return nil, errors.Wrap(err, "create base config")
	}

	ucfg, err := upgradeToPersistanceConfig(cfg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to upgrade repo")
	}

	if err := afrepo.Init(fs, "/ipfs"+suffix, ucfg); err != nil {
		return nil, errors.Wrap(err, "init repo")
	}

	repo, err := afrepo.Open(fs, "/ipfs"+suffix)
	if err != nil {
		return nil, errors.Wrap(err, "open repo")
	}

	return repo, nil
}

func LoadRepoFromPath(path string) (ipfs_repo.Repo, error) {
	if _, err := loadPlugins(path); err != nil {
		return nil, errors.Wrap(err, "failed to load plugins")
	}

	db, err := gorm.Open(sqlite.Open(filepath.Join(path, "berty.db")), &gorm.Config{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	fs, err := gormfs.NewGormFs(db)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	afrepo.DsFs = fs

	// init repo if needed
	if !afrepo.IsInitialized(fs, path) {
		cfg, err := createBaseConfig()
		if err != nil {
			return nil, errors.Wrap(err, "failed to create base config")
		}

		ucfg, err := upgradeToPersistanceConfig(cfg)
		if err != nil {
			return nil, errors.Wrap(err, "failed to upgrade repo")
		}

		if err := afrepo.Init(fs, path, ucfg); err != nil {
			return nil, errors.Wrap(err, "failed to init repo")
		}
	}

	return afrepo.Open(fs, path)
}

var DefaultSwarmListeners = []string{
	"/ip4/0.0.0.0/tcp/0",
	"/ip6/::/tcp/0",
	"/ip4/0.0.0.0/udp/0/quic",
	"/ip6/::/udp/0/quic",
}

func createBaseConfig() (*ipfs_cfg.Config, error) {
	c := ipfs_cfg.Config{}
	priv, pub, err := p2p_ci.GenerateKeyPairWithReader(p2p_ci.Ed25519, 2048, crand.Reader) // nolint:staticcheck
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	pid, err := p2p_peer.IDFromPublicKey(pub) // nolint:staticcheck
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	privkeyb, err := p2p_ci.MarshalPrivateKey(priv)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// set default bootstrap
	c.Bootstrap = ipfs_cfg.DefaultBootstrapAddresses
	c.Peering.Peers = []p2p_peer.AddrInfo{}

	// Identity
	c.Identity.PeerID = pid.Pretty()
	c.Identity.PrivKey = base64.StdEncoding.EncodeToString(privkeyb)

	// Discovery
	c.Discovery.MDNS.Enabled = true
	c.Discovery.MDNS.Interval = 5

	// swarm listeners
	c.Addresses.Swarm = DefaultSwarmListeners

	// Swarm
	c.Swarm.EnableAutoRelay = true
	c.Swarm.EnableRelayHop = false
	c.Swarm.ConnMgr = ipfs_cfg.ConnMgr{
		LowWater:    defaultConnMgrLowWater,
		HighWater:   defaultConnMgrHighWater,
		GracePeriod: defaultConnMgrGracePeriod.String(),
		Type:        "basic",
	}

	c.Routing = ipfs_cfg.Routing{
		Type: "dhtclient",
	}

	return &c, nil
}

func upgradeToPersistanceConfig(cfg *ipfs_cfg.Config) (*ipfs_cfg.Config, error) {
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
		Interval: "12h",
		Strategy: "all",
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
						"type": "afero",
						"path": "blocks",
					},
				},
				map[string]interface{}{
					"mountpoint": "/",
					"type":       "measure",
					"prefix":     "leveldb.datastore",
					"child": map[string]interface{}{
						"type": "afero",
						"path": "datastore",
					},
				},
			},
		},
	}

	return cfgCopy, nil
}

func loadPlugins(repoPath string) (*ipfs_loader.PluginLoader, error) {
	if plugins != nil {
		return plugins, nil
	}

	pluginpath := filepath.Join(repoPath, "plugins")

	lp, err := ipfs_loader.NewPluginLoader(pluginpath)
	if err != nil {
		return nil, err
	}

	if err = lp.Initialize(); err != nil {
		return nil, err
	}

	if err = lp.Inject(); err != nil {
		return nil, err
	}

	plugins = lp
	return lp, nil
}
