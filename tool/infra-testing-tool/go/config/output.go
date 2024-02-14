package config

import (
	"encoding/json"

	"go.uber.org/zap"
	"gopkg.in/yaml.v3"
)

func OutputYaml(logger *zap.Logger, b []byte) (s string, err error) {
	comp, err := Parse(logger, b)
	if err != nil {
		return s, err
	}

	ToHCL(logger, comp)

	c := GetConfig()

	// marshall to yaml
	b, err = yaml.Marshal(c)
	if err != nil {
		return s, err
	}

	return string(b), nil
}

func OutputJson(logger *zap.Logger, b []byte) (s string, err error) {
	comp, err := Parse(logger, b)
	if err != nil {
		return s, err
	}

	ToHCL(logger, comp)

	c := GetConfig()

	// marshall to json (indented)
	b, err = json.MarshalIndent(c, "", "	")
	if err != nil {
		return s, err
	}

	return string(b), nil
}

func OutputHcl(logger *zap.Logger, b []byte) (s string, err error) {
	comp, err := Parse(logger, b)
	if err != nil {
		return s, err
	}

	_, s = ToHCL(logger, comp)
	return s, err
}

func OutputNormal(logger *zap.Logger, b []byte) (hcl, y string, err error) {
	comp, err := Parse(logger, b)
	if err != nil {
		return hcl, y, err
	}

	_, hcl = ToHCL(logger, comp)

	c := GetConfig()

	logger.Debug("converting config to Yaml")

	b, err = yaml.Marshal(c)
	if err != nil {
		return hcl, y, err
	}

	return hcl, string(b), nil
}
