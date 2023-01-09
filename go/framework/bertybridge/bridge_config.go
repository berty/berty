package bertybridge

import "strings"

// Config is used to build a bertybridge configuration using only simple types or types returned by the bertybridge package.
type BridgeConfig struct {
	languages         []string
	lc                LifeCycleDriver
	notifdriver       NotificationDriver
	bleDriver         ProximityDriver
	nbDriver          ProximityDriver
	keystoreDriver    NativeKeystoreDriver
	netDriver         NativeNetDriver
	mdnsLockerDriver  NativeMDNSLockerDriver
	CLIArgs           []string `json:"cliArgs"`
	AppRootDirPath    string   `json:"appRootDir"`
	SharedRootDirPath string   `json:"sharedRootDir"`
}

func NewBridgeConfig() *BridgeConfig {
	return &BridgeConfig{
		CLIArgs:   []string{},
		languages: []string{},
	}
}

func (c *BridgeConfig) SetNotificationDriver(driver NotificationDriver) { c.notifdriver = driver }
func (c *BridgeConfig) SetMDNSLocker(driver NativeMDNSLockerDriver)     { c.mdnsLockerDriver = driver }
func (c *BridgeConfig) SetBleDriver(driver ProximityDriver)             { c.bleDriver = driver }
func (c *BridgeConfig) SetNetDriver(driver NativeNetDriver)             { c.netDriver = driver }
func (c *BridgeConfig) SetNBDriver(driver ProximityDriver)              { c.nbDriver = driver }
func (c *BridgeConfig) SetLifeCycleDriver(lc LifeCycleDriver)           { c.lc = lc }
func (c *BridgeConfig) SetKeystoreDriver(d NativeKeystoreDriver)        { c.keystoreDriver = d }
func (c *BridgeConfig) SetAppRootDir(rootdir string)                    { c.AppRootDirPath = rootdir }
func (c *BridgeConfig) SetSharedRootDir(rootdir string)                 { c.SharedRootDirPath = rootdir }
func (c *BridgeConfig) AppendCLIArg(arg string)                         { c.CLIArgs = append(c.CLIArgs, arg) }
func (c *BridgeConfig) SetPreferredLanguages(preferred string) {
	c.languages = strings.Split(preferred, ",")
}

func (c *BridgeConfig) AppendPreferredLanguage(preferred string) {
	c.languages = append(c.languages, preferred)
}
