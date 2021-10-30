package bertybridge

// Config is used to build a bertybridge configuration using only simple types or types returned by the bertybridge package.
type Config struct {
	dLogger        NativeLoggerDriver
	lc             LifeCycleDriver
	notifdriver    NotificationDriver
	bleDriver      ProximityDriver
	nbDriver       ProximityDriver
	keystoreDriver NativeKeystoreDriver
	RootDirPath    string `json:"rootDir"`
}

func NewConfig() *Config {
	return &Config{}
}

func (c *Config) SetLoggerDriver(dLogger NativeLoggerDriver)      { c.dLogger = dLogger }
func (c *Config) SetNotificationDriver(driver NotificationDriver) { c.notifdriver = driver }
func (c *Config) SetBleDriver(driver ProximityDriver)             { c.bleDriver = driver }
func (c *Config) SetNBDriver(driver ProximityDriver)              { c.nbDriver = driver }
func (c *Config) SetLifeCycleDriver(lc LifeCycleDriver)           { c.lc = lc }
func (c *Config) SetKeystoreDriver(d NativeKeystoreDriver)        { c.keystoreDriver = d }
func (c *Config) SetRootDir(rootdir string)                       { c.RootDirPath = rootdir }
