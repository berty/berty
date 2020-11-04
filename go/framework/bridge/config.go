package bridge

// Config is used to build a bridge configuration using only simple types or types returned by the bridge package.
type Config struct {
	dLogger     NativeLoggerDriver
	lc          LifeCycleDriver
	notifdriver NotificationDriver
	cliArgs     []string
	rootDir     string
}

func NewConfig() *Config {
	return &Config{cliArgs: []string{}}
}

func (c *Config) SetLoggerDriver(dLogger NativeLoggerDriver)      { c.dLogger = dLogger }
func (c *Config) SetNotificationDriver(driver NotificationDriver) { c.notifdriver = driver }
func (c *Config) SetLifeCycleDriver(lc LifeCycleDriver)           { c.lc = lc }
func (c *Config) SetRootDir(rootdir string)                       { c.rootDir = rootdir }
func (c *Config) AppendCLIArg(arg string)                         { c.cliArgs = append(c.cliArgs, arg) }
