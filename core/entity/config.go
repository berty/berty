package entity

import "errors"

func (c *Config) Validate() error {
	if c == nil || c.Myself == nil || len(c.Myself.Devices) < 1 {
		return errors.New("invalid config")
	}
	return nil
}
