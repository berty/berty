package bertybridge

// Config is used to build a bertybridge configuration using only simple types or types returned by the bertybridge package.
type Config struct {
	dLogger     NativeLoggerDriver
	lc          LifeCycleDriver
	notifdriver NotificationDriver
	bleDriver   NativeBleDriver
	cliArgs     []string
	rootDir     string
}

func NewConfig() *Config {
	return &Config{cliArgs: []string{}}
}

func (c *Config) SetLoggerDriver(dLogger NativeLoggerDriver)      { c.dLogger = dLogger }
func (c *Config) SetNotificationDriver(driver NotificationDriver) { c.notifdriver = driver }
func (c *Config) SetBleDriver(driver NativeBleDriver)             { c.bleDriver = driver }
func (c *Config) SetLifeCycleDriver(lc LifeCycleDriver)           { c.lc = lc }
func (c *Config) SetRootDir(rootdir string)                       { c.rootDir = rootdir }
func (c *Config) AppendCLIArg(arg string)                         { c.cliArgs = append(c.cliArgs, arg) }
