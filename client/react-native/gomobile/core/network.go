package core

import (
	"encoding/json"

	account "berty.tech/core/manager/account"
	"berty.tech/core/network"
	network_config "berty.tech/core/network/config"
	"berty.tech/core/network/state"
)

// Berty network config related
func GetNetworkConfig() (string, error) {
	defer panicHandler()
	waitDaemon(accountName)

	a, _ := account.Get(rootContext, accountName)

	cfg := a.Network().Config()
	data, err := json.Marshal(cfg)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func UpdateNetworkConfig(jsonConf string) error {
	defer panicHandler()
	waitDaemon(accountName)

	currentAccount, _ := account.Get(rootContext, accountName)

	cfg := &network_config.Config{}
	if err := json.Unmarshal([]byte(jsonConf), cfg); err != nil {
		return err
	}

	if err := currentAccount.UpdateNetwork(
		rootContext,
		network.WithDefaultMobileOptions(),
		network.WithConfig(cfg),
		network.OverridePersistConfig(),
	); err != nil {
		return err
	}

	return nil
}

// Device network state related
func UpdateConnectivityState(newState string) {
	go func() {
		defer panicHandler()
		state.Global().UpdateConnectivityState(newState)
	}()
}

func UpdateBluetoothState(newState int) {
	go func() {
		defer panicHandler()
		state.Global().UpdateBluetoothState(newState)
	}()
}
