package core

import (
	"encoding/json"

	account "berty.tech/core/manager/account"
)

type networkConfig struct {
	DefaultTransport   bool
	BluetoothTransport bool
	DefaultBootstrap   bool
	CustomBootstrap    []string
	MDNS               bool
	Relay              bool
}

var currentNetworkConfig = networkConfig{
	DefaultTransport:   true,
	BluetoothTransport: false,
	DefaultBootstrap:   true,
	CustomBootstrap:    []string{},
	MDNS:               false,
	Relay:              false,
}

func createNetworkConfig() *account.P2PNetworkOptions {
	var transport []string

	if currentNetworkConfig.DefaultTransport {
		transport = append(transport, "default")
	}
	if currentNetworkConfig.BluetoothTransport {
		transport = append(transport, "ble")
	}

	return &account.P2PNetworkOptions{
		Bind:             []string{"/ip4/0.0.0.0/tcp/0", "/ble/00000000-0000-0000-0000-000000000000"},
		Transport:        transport,
		Bootstrap:        currentNetworkConfig.CustomBootstrap,
		DefaultBootstrap: currentNetworkConfig.DefaultBootstrap,
		MDNS:             currentNetworkConfig.MDNS,
		Relay:            currentNetworkConfig.Relay,
		Metrics:          true,
		Identity:         "",
	}
}

func GetNetworkConfig() (string, error) {
	json, err := json.Marshal(currentNetworkConfig)
	if err != nil {
		return "", err
	}

	return string(json), nil
}

func UpdateNetworkConfig(jsonConf string) error {
	currentAccount, _ := account.Get(accountName)
	if currentAccount == nil {
		return errors.New("account not running")
	}

	var newNetworkConfig networkConfig

	if err := json.Unmarshal([]byte(jsonConf), &newNetworkConfig); err != nil {
		return err
	}

	currentNetworkConfig = newNetworkConfig

	if err := currentAccount.UpdateP2PNetwork(createNetworkConfig()); err != nil {
		return err
	}

	return nil
}
