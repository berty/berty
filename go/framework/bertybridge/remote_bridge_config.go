package bertybridge

// Config is used to build a bertybridge configuration using only simple types or types returned by the bertybridge package.
type RemoteBridgeConfig struct {
	dLogger NativeLoggerDriver
}

func NewRemoteBridgeConfig() *RemoteBridgeConfig {
	return &RemoteBridgeConfig{}
}

func (c *RemoteBridgeConfig) SetLoggerDriver(dLogger NativeLoggerDriver) { c.dLogger = dLogger }
