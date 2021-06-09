package config

import (
	"encoding/json"
	"fmt"
	"gopkg.in/yaml.v3"
)

func OutputYaml(b []byte) error {
	c, _, err := Parse(b)
	if err != nil {
		return err
	}

	s, err := yaml.Marshal(c)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(s))
	return nil
}

func OutputJson(b []byte) error {
	c, _, err := Parse(b)
	if err != nil {
		return err
	}

	s, err := json.MarshalIndent(c, "", "	")
	if err != nil {
		panic(err)
	}

	fmt.Println(string(s))
	return nil
}

func OutputHcl(b []byte) error {
	_, comp, err := Parse(b)
	if err != nil {
		return err
	}

	s := ToHCL(comp)
	fmt.Println(s)
	return err
}

