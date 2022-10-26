package bertybridge

import (
	"context"
	"sync"
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/logutil"
	bridge_svc "berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type RemoteBridge struct {
	serviceBridge bridge_svc.Service
	grpcServer    *grpc.Server
	logger        *zap.Logger
	mutex         sync.Mutex

	ServiceClient
}

func NewRemoteBridge(address string, config *RemoteBridgeConfig) (*RemoteBridge, error) {
	if address == "" {
		return nil, errcode.ErrInvalidInput
	}

	ctx := context.Background()

	// create bridge instance
	b := &RemoteBridge{}

	// setup logger
	{
		if nativeLogger := config.dLogger; nativeLogger != nil {
			b.logger = newLogger(nativeLogger)
		} else {
			b.logger = zap.NewNop()
		}

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

		bl := grpcutil.NewBufListener(ctx, bufListenerSize)
		go func() {
			if err := b.grpcServer.Serve(bl); err != nil {
				b.logger.Debug("Remote bridge GRPC server failed", zap.Error(err))
			}
		}()

		// create native bridge client
		ccBridge, err := bl.NewClientConn()
		if err != nil {
			return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
		}

		b.ServiceClient = NewServiceClient(grpcutil.NewLazyClient(ccBridge))
	}

	// setup account client
	{
		ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()

		opts := []grpc.DialOption{
			grpc.WithBlock(),
			grpc.WithInsecure(),
		}
		client, err := grpc.DialContext(ctx, address, opts...)
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
		return errcode.ErrBridgeNotRunning
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := []grpc.DialOption{
		grpc.WithBlock(),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}

	client, err := grpc.DialContext(ctx, address, opts...)
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
		err = errcode.ErrBridgeNotRunning
	}

	if b.serviceBridge != nil {
		b.serviceBridge.Close()
		b.serviceBridge = nil
	} else {
		err = errcode.ErrBridgeNotRunning
	}

	return err
}
