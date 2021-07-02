package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"os"
	"strconv"

	"github.com/pkg/errors"
)

type Settings struct {
	Port             int
	Notification     bool
	AutoScroll       bool
	TraceUncollapsed bool
	Address          string
}

var defaultSettings = Settings{
	Port:             4242,
	Notification:     true,
	AutoScroll:       false,
	TraceUncollapsed: false,
	Address:          "0.0.0.0",
}

const (
	minPort = 1024
	maxPort = 49151
)

func (c *Config) GetAddressSetting() (string, error) {
	if !c.isInitialized() {
		return "", errors.New("config not initialized")
	}
	settings := c.getSettings()

	return settings.Address, nil
}

func (c *Config) SetAddressSetting(address string) error {
	if !c.isInitialized() {
		return errors.New("config not initialized")
	}

	if net.ParseIP(address) == nil {
		return errors.New(fmt.Sprintf("invalid address value: %s", address))
	}

	newSettings := c.getSettings()
	newSettings.Address = address

	if err := c.saveSettingsToFile(newSettings); err != nil {
		return errors.Wrap(err, "saving settings to file failed")
	}

	c.logger.Debugf("address setting successfully updated with value: %d", address)
	c.setSettings(newSettings)

	return nil
}

func (c *Config) GetPortSetting() (int, error) {
	if !c.isInitialized() {
		return 0, errors.New("config not initialized")
	}
	settings := c.getSettings()

	return settings.Port, nil
}

func (c *Config) SetPortSetting(port string) error {
	if !c.isInitialized() {
		return errors.New("config not initialized")
	}

	portN, err := strconv.Atoi(port)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("invalid port value: %s", port))
	}

	if portN < minPort || portN > maxPort {
		return errors.New(fmt.Sprintf("port number out of range: %d (min: %d / max: %d)", portN, minPort, maxPort))
	}

	newSettings := c.getSettings()
	newSettings.Port = portN

	if err := c.saveSettingsToFile(newSettings); err != nil {
		return errors.Wrap(err, "saving settings to file failed")
	}

	c.logger.Debugf("port setting successfully updated with value: %d", portN)
	c.setSettings(newSettings)

	return nil
}

func (c *Config) GetNotificationSetting() (bool, error) {
	if !c.isInitialized() {
		return false, errors.New("config not initialized")
	}
	settings := c.getSettings()

	return settings.Notification, nil
}

func (c *Config) SetNotificationSetting(enabled bool) error {
	if !c.isInitialized() {
		return errors.New("config not initialized")
	}

	newSettings := c.getSettings()
	newSettings.Notification = enabled

	if err := c.saveSettingsToFile(newSettings); err != nil {
		return errors.Wrap(err, "saving settings to file failed")
	}

	c.logger.Debugf("notification setting successfully updated with value: %t", enabled)
	c.setSettings(newSettings)

	return nil
}

func (c *Config) GetAutoScrollSetting() (bool, error) {
	if !c.isInitialized() {
		return false, errors.New("config not initialized")
	}
	settings := c.getSettings()

	return settings.AutoScroll, nil
}

func (c *Config) SetAutoScrollSetting(enabled bool) error {
	if !c.isInitialized() {
		return errors.New("config not initialized")
	}

	newSettings := c.getSettings()
	newSettings.AutoScroll = enabled

	if err := c.saveSettingsToFile(newSettings); err != nil {
		return errors.Wrap(err, "saving settings to file failed")
	}

	c.logger.Debugf("autoscroll setting successfully updated with value: %t", enabled)
	c.setSettings(newSettings)

	return nil
}

func (c *Config) GetTraceUncollapsedSetting() (bool, error) {
	if !c.isInitialized() {
		return false, errors.New("config not initialized")
	}
	settings := c.getSettings()

	return settings.TraceUncollapsed, nil
}

func (c *Config) SetTraceUncollapsedSetting(enabled bool) error {
	if !c.isInitialized() {
		return errors.New("config not initialized")
	}

	newSettings := c.getSettings()
	newSettings.TraceUncollapsed = enabled

	if err := c.saveSettingsToFile(newSettings); err != nil {
		return errors.Wrap(err, "saving settings to file failed")
	}

	c.logger.Debugf("trace uncollapsed setting successfully updated with value: %t", enabled)
	c.setSettings(newSettings)

	return nil
}

func (c *Config) loadSettingsFromFile() error {
	if _, err := os.Stat(c.settingsPath); err != nil {
		if os.IsNotExist(err) {
			c.logger.Debugf("settings file %s doesn't exists", c.settingsPath)
			if err := c.saveSettingsToFile(defaultSettings); err != nil {
				return err
			}
			c.logger.Infof("restored default settings: %+v", defaultSettings)
			c.setSettings(defaultSettings)
			return nil
		}
		return err
	}

	content, err := ioutil.ReadFile(c.settingsPath)
	if err != nil {
		return err
	}

	var settings Settings
	if err := json.Unmarshal(content, &settings); err != nil {
		return err
	}

	c.logger.Infof("settings file %s successfully loaded with settings: %+v", c.settingsPath, settings)
	c.setSettings(settings)

	return nil
}

func (c *Config) saveSettingsToFile(settings Settings) error {
	content, err := json.MarshalIndent(&settings, "", "  ")
	if err != nil {
		return err
	}
	content = append(content, '\n')

	err = ioutil.WriteFile(c.settingsPath, content, 0644)
	if err != nil {
		return err
	}

	return nil
}

func (c *Config) getSettings() Settings {
	c.settingsLock.RLock()
	defer c.settingsLock.RUnlock()
	return c.settings
}

func (c *Config) setSettings(settings Settings) {
	c.settingsLock.Lock()
	c.settings = settings
	c.settingsLock.Unlock()
}
