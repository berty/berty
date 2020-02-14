package bertybridge

import (
	"berty.tech/berty/go/pkg/bertydemo"
	"go.uber.org/zap"

	_ "github.com/jinzhu/gorm/dialects/sqlite" // required by gorm
	"google.golang.org/grpc"
)

// type DemoBridge Bridge

// type demo struct {
// 	Bridge

// 	demoClient *bertydemo.Client
// 	grpcServer *grpc.Server
// 	logger     *zap.Logger
// }

type Demo struct {
	*Bridge

	client *bertydemo.Client
}

type DemoConfig struct {
	*Config

	loglevel         string
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

func NewDemoBridge(config *DemoConfig) (*Demo, error) {
	// setup logger
	var logger *zap.Logger
	{
		var err error

		logger, err = newLogger(config.loglevel)
		if err != nil {
			return nil, err
		}
	}

	return newDemoBridge(logger, config)
}

func newDemoBridge(logger *zap.Logger, config *DemoConfig) (*Demo, error) {
	demo := &Demo{}

	// setup demo
	{
		var err error

		directory := ":memory:"
		if config.orbitDBDirectory != "" {
			directory = config.orbitDBDirectory
		}

		demo.client, err = bertydemo.New(&bertydemo.Opts{
			OrbitDBDirectory: directory,
		})

		if err != nil {
			return nil, err
		}
	}

	// register service
	grpcserver := grpc.NewServer()
	bertydemo.RegisterDemoServiceServer(grpcserver, demo.client)

	// setup bridge
	{
		var err error

		demo.Bridge, err = newBridge(demo.grpcServer, logger, config.Config)
		if err != nil {
			return nil, err
		}
	}

	// setup bridge
	return demo, nil
}

func (d *Demo) Close() (err error) {
	// Close bridge
	err = d.Bridge.Close()

	// close others
	d.client.Close()
	return
}
