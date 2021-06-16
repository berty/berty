package bertybridge

// Config is used to build a bertybridge configuration using only simple types or types returned by the bertybridge package.
type Config struct {
	dLogger     NativeLoggerDriver
	lc          LifeCycleDriver
	notifdriver NotificationDriver
	bleDriver   ProximityDriver
	nbDriver    ProximityDriver
	CLIArgs     []string `json:"cliArgs"`
	RootDirPath string   `json:"rootDir"`
	TyberHost   string   `json:"tyberHost"`
}

func NewConfig() *Config {
	return &Config{CLIArgs: []string{}}
}

func (c *Config) SetLoggerDriver(dLogger NativeLoggerDriver)      { c.dLogger = dLogger }
func (c *Config) SetNotificationDriver(driver NotificationDriver) { c.notifdriver = driver }
func (c *Config) SetBleDriver(driver ProximityDriver)             { c.bleDriver = driver }
func (c *Config) SetNBDriver(driver ProximityDriver)              { c.nbDriver = driver }
func (c *Config) SetLifeCycleDriver(lc LifeCycleDriver)           { c.lc = lc }
func (c *Config) SetRootDir(rootdir string)                       { c.RootDirPath = rootdir }
func (c *Config) AppendCLIArg(arg string)                         { c.CLIArgs = append(c.CLIArgs, arg) }
func (c *Config) SetTyberAddress(address string)                  { c.TyberHost = address }
