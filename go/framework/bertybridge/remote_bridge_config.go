package bertybridge

// Config is used to build a bertybridge configuration using only simple types or types returned by the bertybridge package.
type RemoteBridgeConfig struct{}

func NewRemoteBridgeConfig() *RemoteBridgeConfig {
	return &RemoteBridgeConfig{}
}
