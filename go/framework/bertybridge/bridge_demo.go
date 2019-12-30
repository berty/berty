package bertybridge

import (
	_ "github.com/jinzhu/gorm/dialects/sqlite" // required by gorm
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type DemoBridge interface {
	Bridge
}

type demo struct {
	Bridge

	grpcServer *grpc.Server
	logger     *zap.Logger
}

type DemoOpts struct {
	LogLevel   string
	BridgeOpts *BridgeOpts
}

func NewDemoBridge(opts *DemoOpts) (DemoBridge, error) {
	if opts.BridgeOpts == nil {
		opts.BridgeOpts = &BridgeOpts{}
	}

	bridgeOpts := opts.BridgeOpts

	// setup logger
	var logger *zap.Logger
	{
		var err error

		logger, err = newLogger(opts.LogLevel)
		if err != nil {
			return nil, err
		}
	}

	b := &demo{
		grpcServer: grpc.NewServer(),
		logger:     logger,
	}

	// setup demo
	{
		// var err error

	}

	// register service
	// bertyprotocol.RegisterProtocolServiceServer(b.grpcServer, b.protocolClient)

	// setup bridge
	{
		var err error

		b.Bridge, err = newBridge(b.grpcServer, logger, bridgeOpts)
		if err != nil {
			return nil, err
		}
	}

	return b, nil
}

func (b *demo) Close() (err error) {
	// Close bridge
	err = b.Bridge.Close()

	// close others

	return
}
