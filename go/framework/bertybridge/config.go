package bertybridge

import "strings"

// Config is used to build a bertybridge configuration using only simple types or types returned by the bertybridge package.
type Config struct {
	languages        []string
	dLogger          NativeLoggerDriver
	lc               LifeCycleDriver
	notifdriver      NotificationDriver
	bleDriver        ProximityDriver
	nbDriver         ProximityDriver
	keystoreDriver   NativeKeystoreDriver
	netDriver        NativeNetDriver
	mdnsLockerDriver NativeMDNSLockerDriver
	CLIArgs          []string `json:"cliArgs"`
	RootDirPath      string   `json:"rootDir"`
}

func NewConfig() *Config {
	return &Config{
		CLIArgs:   []string{},
		languages: []string{},
	}
}

func (c *Config) SetLoggerDriver(dLogger NativeLoggerDriver)      { c.dLogger = dLogger }
func (c *Config) SetNotificationDriver(driver NotificationDriver) { c.notifdriver = driver }
func (c *Config) SetMDNSLocker(driver NativeMDNSLockerDriver)     { c.mdnsLockerDriver = driver }
func (c *Config) SetBleDriver(driver ProximityDriver)             { c.bleDriver = driver }
func (c *Config) SetNetDriver(driver NativeNetDriver)             { c.netDriver = driver }
func (c *Config) SetNBDriver(driver ProximityDriver)              { c.nbDriver = driver }
func (c *Config) SetLifeCycleDriver(lc LifeCycleDriver)           { c.lc = lc }
func (c *Config) SetKeystoreDriver(d NativeKeystoreDriver)        { c.keystoreDriver = d }
func (c *Config) SetRootDir(rootdir string)                       { c.RootDirPath = rootdir }
func (c *Config) AppendCLIArg(arg string)                         { c.CLIArgs = append(c.CLIArgs, arg) }
func (c *Config) SetPreferredLanguages(preferred string)          { c.languages = strings.Split(preferred, ",") }
func (c *Config) AppendPreferredLanguage(preferred string) {
	c.languages = append(c.languages, preferred)
}
