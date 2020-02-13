package bertybridge

import (
	"context"

	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/pkg/bertydemo"

	"github.com/ipfs/go-ipfs/core"
	_ "github.com/jinzhu/gorm/dialects/sqlite" // required by gorm
	"go.uber.org/zap"
	"google.golang.org/grpc"

	ipfs_coreapi "github.com/ipfs/interface-go-ipfs-core"
)

type DemoBridge interface {
	Bridge
}

type demo struct {
	Bridge

	ipfsNode   *core.IpfsNode
	demoClient *bertydemo.Client
	grpcServer *grpc.Server
	logger     *zap.Logger
}

type DemoOpts struct {
	LogLevel   string
	BridgeOpts *BridgeOpts
}

func NewDemoBridge(opts *DemoOpts) (DemoBridge, error) {
	// setup logger
	var logger *zap.Logger
	{
		var err error

		logger, err = newLogger(opts.LogLevel)
		if err != nil {
			return nil, err
		}
	}

	return newDemoBridge(logger, opts)
}

func newDemoBridge(logger *zap.Logger, opts *DemoOpts) (DemoBridge, error) {
	d := &demo{
		grpcServer: grpc.NewServer(),
		logger:     logger,
	}
	ctx := context.Background()

	// setup demo
	{
		var err error
		var api ipfs_coreapi.CoreAPI

		api, d.ipfsNode, err = ipfsutil.NewInMemoryCoreAPI(ctx)
		if err != nil {
			return nil, err
		}

		d.demoClient, err = bertydemo.New(&bertydemo.Opts{
			CoreAPI:          api,
			OrbitDBDirectory: ":memory:",
		})
		if err != nil {
			return nil, err
		}
	}

	// register service
	bertydemo.RegisterDemoServiceServer(d.grpcServer, d.demoClient)

	// setup bridge
	{
		var err error

		d.Bridge, err = newBridge(d.grpcServer, logger, opts.BridgeOpts)
		if err != nil {
			return nil, err
		}
	}

	return d, nil
}

func (d *demo) Close() (err error) {
	// Close bridge
	err = d.Bridge.Close()

	// close others
	d.demoClient.Close()
	d.ipfsNode.Close()
	return
}
