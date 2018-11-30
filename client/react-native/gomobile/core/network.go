package core

import (
	"encoding/json"
	"io"
	"strings"

	account "berty.tech/core/manager/account"
	"berty.tech/core/network/p2p"
	"github.com/pkg/errors"
)

type networkConfig struct {
	DefaultTransport   bool
	BluetoothTransport bool
	IPFSBootstrap      bool
	DefaultBootstrap   bool
	CustomBootstrap    []string
	MDNS               bool
	Relay              bool
}

func createNetworkConfig() (*account.P2PNetworkOptions, error) {
	defer panicHandler()
	var (
		netConf   networkConfig
		bind      []string
		transport []string
		bootstrap []string
		swarmKey  io.Reader
	)

	if err := json.Unmarshal([]byte(appConfig.JSONNetConf), &netConf); err != nil {
		return nil, errors.Wrap(err, "JSONNetConf unmarshal failed")
	}

	if netConf.DefaultTransport {
		transport = append(transport, "default")
		bind = append(bind, defaultBind)
	}
	if netConf.BluetoothTransport {
		transport = append(transport, "ble")
		bind = append(bind, defaultBLEBind)
	}
	if netConf.DefaultBootstrap {
		bootstrap = append(bootstrap, p2p.DefaultBootstrap...)
	}

	// If ipfs is disable protect swarm with a default key, this will avoid to
	// spread ipfs nodes over our network
	if netConf.IPFSBootstrap {
		bootstrap = append(bootstrap, p2p.BootstrapIpfs...)
	} else {
		swarmKey = strings.NewReader(p2p.DefaultSwarmKey)
	}

	bootstrap = append(bootstrap, netConf.CustomBootstrap...)

	return &account.P2PNetworkOptions{
		Bind:      bind,
		Transport: transport,
		Bootstrap: bootstrap,
		MDNS:      netConf.MDNS,
		Relay:     netConf.Relay,
		Metrics:   defaultMetrics,
		Identity:  defaultIdentity,
		SwarmKey:  swarmKey,
	}, nil
}

func GetNetworkConfig() string {
	defer panicHandler()
	return string(appConfig.JSONNetConf)
}

func UpdateNetworkConfig(jsonConf string) error {
	defer panicHandler()
	waitDaemon(accountName)
	currentAccount, _ := account.Get(rootContext, accountName)

	var newNetworkConfig networkConfig
	if err := json.Unmarshal([]byte(jsonConf), &newNetworkConfig); err != nil {
		return err
	}

	appConfig.JSONNetConf = jsonConf
	netConf, err := createNetworkConfig()
	if err != nil {
		return err
	}
	if err := currentAccount.UpdateP2PNetwork(rootContext, netConf); err != nil {
		return err
	}

	appConfig.StartCounter++
	if err := appConfig.Save(); err != nil {
		return errors.Wrap(err, "state DB save failed")
	}

	return nil
}
