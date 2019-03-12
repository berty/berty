package config

import (
	"encoding/json"
	"io/ioutil"
	"os"

	"berty.tech/core/pkg/deviceinfo"
)

func getPersistFilePath() string {
	return deviceinfo.GetStoragePath() + "/" + "network-config.json"
}

func (cfg *Config) ApplyPersistConfig() error {
	data, err := ioutil.ReadFile(getPersistFilePath())
	if err != nil {
		data = []byte{}
	}
	if len(data) == 0 {
		return nil
	}
	override := &Config{}
	if err := json.Unmarshal(data, override); err != nil {
		logger().Error("network-config.json is corrupted")
		return err
	}
	return cfg.Override(override)
}

func (cfg *Config) OverridePersistConfig() error {
	data, err := json.Marshal(cfg)
	if err != nil {
		return err
	}
	if err := ioutil.WriteFile(getPersistFilePath(), data, os.ModePerm); err != nil {
		return err
	}
	return nil
}
