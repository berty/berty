package core

import (
	"encoding/json"
	"github.com/pkg/errors"

	account "berty.tech/core/manager/account"
	"berty.tech/core/network/p2p"
)

type networkConfig struct {
	DefaultTransport   bool
	BluetoothTransport bool
	DefaultBootstrap   bool
	IPFSBootstrap      bool
	CustomBootstrap    []string
	MDNS               bool
	Relay              bool
}

func createNetworkConfig() (*account.P2PNetworkOptions, error) {
	var (
		netConf   networkConfig
		bind      []string
		transport []string
		bootstrap []string
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
	if netConf.IPFSBootstrap {
		bootstrap = append(bootstrap, p2p.BootstrapIpfs...)
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
	}, nil
}

func GetNetworkConfig() string {
	return string(appConfig.JSONNetConf)
}

func UpdateNetworkConfig(jsonConf string) error {
	waitDaemon(accountName)
	currentAccount, _ := account.Get(accountName)

	var newNetworkConfig networkConfig
	if err := json.Unmarshal([]byte(jsonConf), &newNetworkConfig); err != nil {
		return err
	}

	netConf, err := createNetworkConfig()
	if err != nil {
		return err
	}
	if err := currentAccount.UpdateP2PNetwork(netConf); err != nil {
		return err
	}

	appConfig.JSONNetConf = jsonConf
	appConfig.StartCounter++
	if err := appConfig.Save(); err != nil {
		return errors.Wrap(err, "state DB save failed")
	}

	return nil
}
