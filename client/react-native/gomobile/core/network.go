package core

import (
	"encoding/json"

	account "berty.tech/core/manager/account"
	"berty.tech/core/network"
	network_config "berty.tech/core/network/config"
)

func GetNetworkConfig() (string, error) {
	defer panicHandler()
	waitDaemon(accountName)

	cfg := networkDriver.Config()
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
