package bertymessenger

import (
	"context"
	"errors"
	"sync"
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"

	"github.com/golang/protobuf/proto" // nolint:staticcheck: not sure how to use the new protobuf api to unmarshal
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"
)

func New(client bertyprotocol.ProtocolServiceClient, opts *Opts) (Service, error) {
	optsCleanup, err := opts.applyDefaults()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	opts.Logger = opts.Logger.Named("msg")

	if err := initDB(opts.DB); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	ctx, cancel := context.WithCancel(opts.Context)
	svc := service{
		protocolClient:  client,
		logger:          opts.Logger,
		startedAt:       time.Now(),
		protocolService: opts.ProtocolService,
		db:              opts.DB,
		dispatcher:      NewDispatcher(),
		cancelFn:        cancel,
		optsCleanup:     optsCleanup,
		ctx:             ctx,
		handlerMutex:    sync.Mutex{},
	}

	icr, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, err
	}
	pkStr := bytesToString(icr.GetAccountGroupPK())

	// get or create account in DB
	{
		acc, err := getAccount(svc.db)
		switch {
		case err == gorm.ErrRecordNotFound: // account not found, create a new one
			svc.logger.Debug("account not found, creating a new one", zap.String("pk", pkStr))
			ret, err := svc.internalInstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{})
			if err != nil {
				return nil, err
			}
			acc = Account{
				PublicKey: pkStr,
				Link:      ret.GetHTMLURL(),
				State:     Account_NotReady,
			}
			if err := svc.db.Create(&acc).Error; err != nil {
				return nil, err
			}
		case err != nil: // internal error
			return nil, err
		case err == nil && pkStr != acc.GetPublicKey(): // Check that we are connected to the correct node
			// FIXME: use errcode
			return nil, errors.New("messenger's account key does not match protocol's account key")
		default: // account exists, and public keys match
			// noop
		}
	}

	// Subscribe to account group metadata

	err = svc.subscribeToMetadata(icr.GetAccountGroupPK())

	if err != nil {
		return nil, err
	}

	// subscribe to groups
	{
		var convs []Conversation
		err := svc.db.Find(&convs).Error
		if err != nil {
			return nil, err
		}
		for _, cv := range convs {
			gpkb, err := stringToBytes(cv.GetPublicKey())
			if err != nil {
				return nil, err
			}

			_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb})
			if err != nil {
				return nil, err
			}

			if err := svc.subscribeToGroup(gpkb); err != nil {
				return nil, err
			}
		}
	}

	// subscribe to contact groups
	{
		var contacts []Contact
		err := svc.db.Find(&contacts).Error
		if err != nil {
			return nil, err
		}
		for _, c := range contacts {
			if c.State != Contact_OutgoingRequestSent {
				continue
			}

			gpkb, err := stringToBytes(c.GetConversationPublicKey())
			if err != nil {
				return nil, err
			}

			_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb})
			if err != nil {
				return nil, err
			}

			if err := svc.subscribeToMetadata(gpkb); err != nil {
				return nil, err
			}
		}
	}

	return &svc, nil
}

func (svc *service) subscribeToMetadata(gpkb []byte) error {
	// subscribe
	s, err := svc.protocolClient.GroupMetadataSubscribe(svc.ctx, &bertytypes.GroupMetadataSubscribe_Request{GroupPK: gpkb})
	if err != nil {
		return err
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				svc.logStreamingError("group metadata", err)
				return
			}
			svc.handlerMutex.Lock()
			err = handleProtocolEvent(svc, gme)
			svc.handlerMutex.Unlock()
			if err != nil {
				svc.logger.Error("failed to handle protocol event", zap.Error(errcode.ErrInternal.Wrap(err)))
			}
		}
	}()
	return nil
}

func (svc *service) subscribeToMessages(gpkb []byte) error {
	ms, err := svc.protocolClient.GroupMessageSubscribe(svc.ctx, &bertytypes.GroupMessageSubscribe_Request{GroupPK: gpkb})
	if err != nil {
		return err
	}
	go func() {
		for {
			gme, err := ms.Recv()
			if err != nil {
				svc.logStreamingError("group message", err)
				return
			}

			var am AppMessage
			if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
				svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
				return
			}
			svc.handlerMutex.Lock()
			err = handleAppMessage(svc, bytesToString(gpkb), gme, &am)
			svc.handlerMutex.Unlock()
			if err != nil {
				svc.logger.Error("failed to handle app message", zap.Error(errcode.ErrInternal.Wrap(err)))
			}
		}
	}()
	return nil
}

func (svc *service) subscribeToGroup(gpkb []byte) error {
	if err := svc.subscribeToMetadata(gpkb); err != nil {
		return err
	}
	return svc.subscribeToMessages(gpkb)
}

func (svc *service) Close() {
	svc.logger.Info("closing service")
	svc.cancelFn()
	svc.optsCleanup()
}

type Opts struct {
	Logger          *zap.Logger
	ProtocolService bertyprotocol.Service
	DB              *gorm.DB
	Context         context.Context
}

func (opts *Opts) applyDefaults() (func(), error) {
	cleanup := func() {}

	if opts.Context == nil {
		opts.Context = context.Background()
	}
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}
	if opts.DB == nil {
		opts.Logger.Warn("Messenger started without database, creating a volatile one in memory")
		zapLogger := zapgorm2.New(opts.Logger.Named("gorm"))
		zapLogger.SetAsDefault()
		db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{Logger: zapLogger})
		if err != nil {
			return nil, err
		}
		cleanup = func() {
			sqlDB, _ := db.DB()
			u.SilentClose(sqlDB)
		}
		opts.DB = db
	}

	return cleanup, nil
}

type service struct {
	logger          *zap.Logger
	protocolClient  bertyprotocol.ProtocolServiceClient
	startedAt       time.Time
	protocolService bertyprotocol.Service // optional, for debugging only
	db              *gorm.DB
	dispatcher      *Dispatcher
	cancelFn        func()
	optsCleanup     func()
	ctx             context.Context
	handlerMutex    sync.Mutex
}

type Service interface {
	MessengerServiceServer
	Close()
}

var _ Service = (*service)(nil)
