package bertybridge

import (
	"context"
	"strings"

	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/pkg/bertydemo"
	"go.uber.org/zap"

	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	_ "github.com/jinzhu/gorm/dialects/sqlite" // required by gorm
	"google.golang.org/grpc"
)

// type DemoBridge Bridge

type Demo struct {
	*Bridge

	client *bertydemo.Client
}

type DemoConfig struct {
	*Config

	dLogger  NativeLoggerDriver
	loglevel string

	swarmListeners   []string
	orbitDBDirectory string
}

func NewDemoConfig() *DemoConfig {
	return &DemoConfig{
		Config: NewConfig(),
	}
}

func (dc *DemoConfig) OrbitDBDirectory(dir string) {
	dc.orbitDBDirectory = dir
}

func (dc *DemoConfig) LogLevel(level string) {
	dc.loglevel = level
}

func (dc *DemoConfig) LoggerDriver(dLogger NativeLoggerDriver) {
	dc.dLogger = dLogger
}

// separate with a comma
func (dc *DemoConfig) SwarmListeners(laddrs string) {
	dc.swarmListeners = strings.Split(laddrs, ",")
}

func NewDemoBridge(config *DemoConfig) (*Demo, error) {
	// setup logger
	var logger *zap.Logger
	{
		var err error

		if config.dLogger != nil {
			logger, err = newNativeLogger(config.loglevel, config.dLogger)
		} else {
			logger, err = newLogger(config.loglevel)
		}

		if err != nil {
			return nil, err
		}
	}

	return newDemoBridge(logger.Named("demo"), config)
}

func newDemoBridge(logger *zap.Logger, config *DemoConfig) (*Demo, error) {
	ctx := context.Background()

	// setup demo
	var client *bertydemo.Client
	{
		var err error

		swarmaddrs := []string{}
		if len(config.swarmListeners) > 0 {
			swarmaddrs = config.swarmListeners
		}

		var api ipfs_interface.CoreAPI
		api, _, err = ipfsutil.NewInMemoryCoreAPI(ctx, swarmaddrs...)
		if err != nil {
			return nil, err
		}

		directory := ":memory:"
		if config.orbitDBDirectory != "" {
			directory = config.orbitDBDirectory
		}

		opts := &bertydemo.Opts{
			Logger:           logger,
			CoreAPI:          api,
			OrbitDBDirectory: directory,
		}

		if client, err = bertydemo.New(opts); err != nil {
			return nil, err
		}

		ipfsinfos := getIPFSZapInfosFields(ctx, api)
		logger.Info("ipfs infos", ipfsinfos...)
	}

	// register service
	var grpcServer *grpc.Server
	{
		grpcServer = grpc.NewServer()
		bertydemo.RegisterDemoServiceServer(grpcServer, client)
	}

	var bridge *Bridge
	// setup bridge
	{
		var err error

		bridge, err = newBridge(grpcServer, logger, config.Config)
		if err != nil {
			return nil, err
		}
	}

	// setup bridge
	return &Demo{
		Bridge: bridge,
		client: client,
	}, nil
}

func (d *Demo) Close() (err error) {
	// Close bridge
	err = d.Bridge.Close()

	// close others
	d.client.Close()
	return
}
