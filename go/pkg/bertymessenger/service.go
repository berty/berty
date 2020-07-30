package bertymessenger

import (
	"context"
	"encoding/base64"
	"errors"
	"io"
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

func bytesToB64(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}

func grpcIsCanceled(err error) bool {
	grpcStatus, ok := status.FromError(err)
	return ok && grpcStatus.Code() == codes.Canceled
}

func New(client bertyprotocol.ProtocolServiceClient, opts *Opts) (Service, error) {
	if opts.DB == nil {
		// Maybe create an in-memory db in this case? (and close it in Close())
		return nil, errors.New("missing required option DB")
	}
	if err := opts.DB.AutoMigrate(&Conversation{}, &Account{}, &Contact{}); err != nil {
		return nil, err
	}

	ctx := opts.Context
	if ctx == nil {
		ctx = context.Background()
	}
	ctx, cancel := context.WithCancel(ctx)

	svc := service{
		protocolClient:  client,
		logger:          opts.Logger,
		startedAt:       time.Now(),
		protocolService: opts.ProtocolService,
		db:              opts.DB,
		dispatcher:      NewDispatcher(),
		cancelFn:        cancel,
	}

	icr, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, err
	}
	pkStr := bytesToB64(icr.GetAccountGroupPK())
	svc.logger.Info("Instance info", zap.String("pk", pkStr))

	var acc Account
	err = svc.db.First(acc).Error
	if err == gorm.ErrRecordNotFound {
		svc.logger.Info("New account")
		acc.State = Account_NotReady
		acc.PublicKey = pkStr
		err = svc.db.Save(&acc).Error
	} else if pkStr != acc.GetPublicKey() { // Check that we are connected to the correct node
		err = errors.New("messenger's account key does not match protocol's account key")
	}
	if err != nil {
		return nil, err
	}

	// Sub to account group metadata, what is the best way to do this ?
	s, err := client.GroupMetadataSubscribe(ctx, &bertytypes.GroupMetadataSubscribe_Request{GroupPK: icr.GetAccountGroupPK()})
	if err != nil {
		return nil, err
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				switch {
				case err == io.EOF:
					svc.logger.Error("Account group metadata stream EOF")
				case grpcIsCanceled(err):
					svc.logger.Debug("Account group metadata stream canceled")
				default:
					svc.logger.Error("Error receiving from account group metadata stream", zap.Error(err))
				}
				return
			}
			err = handleProtocolEvent(&svc, gme)
			if err != nil {
				svc.logger.Error("Failed to handle protocol event", zap.Error(err))
			}
		}
	}()

	return &svc, nil
}

func (s *service) Close() {
	s.logger.Info("Closing service")
	s.cancelFn()
}

type Opts struct {
	Logger          *zap.Logger
	ProtocolService bertyprotocol.Service
	DB              *gorm.DB
	Context         context.Context
}

type service struct {
	logger          *zap.Logger
	protocolClient  bertyprotocol.ProtocolServiceClient
	startedAt       time.Time
	protocolService bertyprotocol.Service // optional, for debugging only
	db              *gorm.DB
	dispatcher      *Dispatcher
	cancelFn        func()
}

type Service interface {
	MessengerServiceServer
	Close()
}

var _ Service = (*service)(nil)
