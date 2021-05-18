package config

import (
	"os"
	"path/filepath"
	"sync"

	"berty.tech/berty/tool/tyber/go/logger"
	"github.com/pkg/errors"
)

const (
	appDataPath      = "Tyber"
	sessionsSubpath  = "sessions"
	settingsFilename = "settings.json"
)

type Config struct {
	logger       *logger.Logger
	dataPath     string
	sessionsPath string
	settingsPath string
	initialized  bool
	initLock     sync.RWMutex
	settings     Settings
	settingsLock sync.RWMutex
}

func New(l *logger.Logger) *Config {
	return &Config{
		logger: l.Named("config"),
	}
}

func (c *Config) Init(dataPath string) error {
	c.dataPath = filepath.Join(dataPath, appDataPath)
	c.sessionsPath = filepath.Join(c.dataPath, sessionsSubpath)
	c.settingsPath = filepath.Join(c.dataPath, settingsFilename)

	if err := os.MkdirAll(c.sessionsPath, 0755); err != nil {
		return errors.Wrap(err, "sessions directory creation failed")
	}

	if err := c.loadSettingsFromFile(); err != nil {
		return errors.Wrap(err, "loading settings file failed")
	}

	c.initLock.Lock()
	c.initialized = true
	c.initLock.Unlock()

	c.logger.Infof("initialization successful with data path %s", c.dataPath)

	return nil
}

func (c *Config) isInitialized() bool {
	c.initLock.RLock()
	defer c.initLock.RUnlock()
	return c.initialized
}

func (c *Config) GetSessionsPath() (string, error) {
	if !c.isInitialized() {
		return "", errors.New("config not initialized")
	}
	return c.sessionsPath, nil
}

// TODO remove this
func (c *Config) GetSettingsPath() (string, error) {
	if !c.isInitialized() {
		return "", errors.New("config not initialized")
	}
	return c.settingsPath, nil
}
