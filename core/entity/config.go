package entity

import (
	"errors"

	"go.uber.org/zap"
)

func (c *Config) Validate() error {
	if c == nil {
		err := errors.New("invalid config")
		logger().Warn("Config.Validate", zap.Error(err))
		return err
	}

	if c.Myself == nil {
		err := errors.New("invalid config: myself is not defined")
		logger().Warn("Config.Validate", zap.Error(err))
		return err
	}

	if len(c.Myself.Devices) < 1 {
		err := errors.New("invalid config: no devices listed")
		logger().Warn("Config.Validate", zap.Error(err))
		return err
	}

	return nil
}
