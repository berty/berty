package bertybridge

import (
	"context"
	"sync"

	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	berty_grpcutil "berty.tech/berty/v2/go/internal/grpcutil"
	bridge_svc "berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/weshnet/v2/pkg/grpcutil"
	"berty.tech/weshnet/v2/pkg/logutil"
)

type RemoteBridge struct {
	serviceBridge bridge_svc.Service
	grpcServer    *grpc.Server
	logger        *zap.Logger
	mutex         sync.Mutex

	ServiceClient
}

type RemoteBridgeConfig struct{}

func NewRemoteBridgeConfig() *RemoteBridgeConfig {
	return &RemoteBridgeConfig{}
}

func NewRemoteBridge(address string, _ *RemoteBridgeConfig) (*RemoteBridge, error) {
	if address == "" {
		return nil, errcode.ErrCode_ErrInvalidInput
	}

	ctx := context.Background()

	// create bridge instance
	b := &RemoteBridge{}

	// setup logger
	{
		b.logger = logutil.NewNativeLogger("bertybridge")

		// @NOTE(gfanton): replace grpc logger as soon as possible to avoid DATA_RACE
		logutil.ReplaceGRPCLogger(b.logger.Named("grpc"))

		b.logger.Debug("starting Bridge")
	}

	// setup native bridge client
	{
		opts := &bridge_svc.Options{
			Logger: b.logger,
		}

		b.serviceBridge = bridge_svc.NewService(opts)
		b.grpcServer = grpc.NewServer()

		bridge_svc.RegisterBridgeServiceServer(b.grpcServer, b.serviceBridge)

		bl := grpcutil.NewBufListener(bufListenerSize)
		go func() {
			if err := b.grpcServer.Serve(bl); err != nil {
				b.logger.Debug("Remote bridge GRPC server failed", zap.Error(err))
			}
		}()

		// create native bridge client
		ccBridge, err := bl.NewClientConn(ctx)
		if err != nil {
			return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
		}

		b.ServiceClient = NewServiceClient(berty_grpcutil.NewLazyClient(ccBridge))
	}

	// setup account client
	{
		opts := []grpc.DialOption{
			grpc.WithTransportCredentials(insecure.NewCredentials()),
		}
		client, err := grpc.NewClient(address, opts...)
		if err != nil {
			return nil, err
		}

		b.serviceBridge.RegisterService("berty.account.v1.AccountService", client)
	}

	return b, nil
}

func (b *RemoteBridge) ConnectService(serviceName string, address string) error {
	b.logger.Debug("connectService", zap.String("serviceName", serviceName), zap.String("address", address))

	if serviceName == "" {
		return errors.New("empty serviceName")
	}

	if address == "" {
		return errors.New("empty address")
	}

	if b.serviceBridge == nil {
		return errcode.ErrCode_ErrBridgeNotRunning
	}

	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}

	client, err := grpc.NewClient(address, opts...)
	if err != nil {
		return err
	}

	b.serviceBridge.RegisterService(serviceName, client)

	return nil
}

func (b *RemoteBridge) Close() error {
	b.logger.Info("Bridge.Close called")

	b.mutex.Lock()
	defer b.mutex.Unlock()

	var err error

	if b.grpcServer != nil {
		b.grpcServer.Stop()
		b.grpcServer = nil
	} else {
		err = errcode.ErrCode_ErrBridgeNotRunning
	}

	if b.serviceBridge != nil {
		b.serviceBridge.Close()
		b.serviceBridge = nil
	} else {
		err = errcode.ErrCode_ErrBridgeNotRunning
	}

	return err
}
