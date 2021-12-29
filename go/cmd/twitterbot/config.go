package main

import (
	"encoding/json"
	"io/fs"
	"io/ioutil"

	"github.com/pkg/errors"
)

type config struct {
	BearerToken string
}

func loadConfig(configPath string) (*config, error) {
	var conf config
	{
		configBytes, err := ioutil.ReadFile(configPath)
		if !errors.Is(err, fs.ErrNotExist) {
			if err != nil {
				return nil, errors.Wrap(err, "read config file")
			}
			if err := json.Unmarshal(configBytes, &conf); err != nil {
				return nil, errors.Wrap(err, "unmarshal config")
			}
		}
	}
	if conf.BearerToken == "" {
		return nil, errors.New("missing bearer token")
	}
	return &conf, nil
}
