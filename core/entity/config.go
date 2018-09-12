package entity

import "errors"

func (c *Config) Validate() error {
	if c == nil {
		return errors.New("invalid config")
	}

	if c.Myself == nil {
		return errors.New("invalid config: myself is not defined")
	}

	if len(c.Myself.Devices) < 1 {
		return errors.New("invalid config: no devices listed")
	}

	return nil
}
