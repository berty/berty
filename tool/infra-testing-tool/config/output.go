package config

import (
	"encoding/json"
	"gopkg.in/yaml.v3"
)

func OutputYaml(b []byte) (s string, err error) {
	c, _, err := Parse(b)
	if err != nil {
		return s, err
	}

	b, err = yaml.Marshal(c)
	if err != nil {
		return s, err
	}

	return string(b), nil
}

func OutputJson(b []byte) (s string, err error) {
	c, _, err := Parse(b)
	if err != nil {
		return s, err
	}

	b, err = json.MarshalIndent(c, "", "	")
	if err != nil {
		return s, err
	}

	return string(b), nil
}

func OutputHcl(b []byte) (s string, err error) {
	_, comp, err := Parse(b)
	if err != nil {
		return s, err
	}

	s = ToHCL(comp)
	return s, err
}

