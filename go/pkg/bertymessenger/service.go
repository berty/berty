package bertymessenger

import (
	"archive/tar"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"sync"
	"sync/atomic"
	"time"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"

	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type Service interface {
	MessengerServiceServer
	Close()
}

// service is a Service
var _ Service = (*service)(nil)

type service struct {
	logger                *zap.Logger
	isGroupMonitorEnabled bool
	protocolClient        bertyprotocol.ProtocolServiceClient
	startedAt             time.Time
	db                    *dbWrapper
	dispatcher            *Dispatcher
	cancelFn              func()
	optsCleanup           func()
	ctx                   context.Context
	handlerMutex          sync.Mutex
	notifmanager          notification.Manager
	lcmanager             *lifecycle.Manager
	eventHandler          *eventHandler
}

type Opts struct {
	EnableGroupMonitor  bool
	Logger              *zap.Logger
	DB                  *gorm.DB
	NotificationManager notification.Manager
	LifeCycleManager    *lifecycle.Manager
	StateBackup         *LocalDatabaseState
}

func (opts *Opts) applyDefaults() (func(), error) {
	cleanup := func() {}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}
	if opts.DB == nil {
		opts.Logger.Warn("Messenger started without database, creating a volatile one in memory")
		zapLogger := zapgorm2.New(opts.Logger.Named("gorm"))
		zapLogger.SetAsDefault()
		db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{
			Logger:                                   zapLogger,
			DisableForeignKeyConstraintWhenMigrating: true,
		})
		if err != nil {
			return nil, err
		}
		cleanup = func() {
			sqlDB, _ := db.DB()
			u.SilentClose(sqlDB)
		}
		opts.DB = db
	}

	if opts.NotificationManager == nil {
		opts.NotificationManager = notification.NewNoopManager()
	}

	if opts.LifeCycleManager == nil {
		opts.LifeCycleManager = lifecycle.NewManager(StateActive)
	}

	return cleanup, nil
}

func databaseStateRestoreAccountHandler(statePointer *LocalDatabaseState) bertyprotocol.RestoreAccountHandler {
	return bertyprotocol.RestoreAccountHandler{
		Handler: func(header *tar.Header, reader *tar.Reader) (bool, error) {
			if header.Name != exportLocalDBState {
				return false, nil
			}

			backupContents := new(bytes.Buffer)
			size, err := io.Copy(backupContents, reader)
			if err != nil {
				return true, errcode.ErrInternal.Wrap(fmt.Errorf("unable to read %d bytes: %w", header.Size, err))
			}

			if size != header.Size {
				return true, errcode.ErrInternal.Wrap(fmt.Errorf("unexpected file size"))
			}

			if err := proto.Unmarshal(backupContents.Bytes(), statePointer); err != nil {
				return true, errcode.ErrDeserialization.Wrap(err)
			}

			return true, nil
		},
		PostProcess: func() error {
			return nil
		},
	}
}

func RestoreFromAccountExport(ctx context.Context, reader io.Reader, coreAPI ipfs_interface.CoreAPI, odb *bertyprotocol.BertyOrbitDB, localDBState *LocalDatabaseState, logger *zap.Logger) error {
	return bertyprotocol.RestoreAccountExport(ctx, reader, coreAPI, odb, logger, databaseStateRestoreAccountHandler(localDBState))
}

func New(client bertyprotocol.ProtocolServiceClient, opts *Opts) (Service, error) {
	optsCleanup, err := opts.applyDefaults()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	opts.Logger = opts.Logger.Named("msg")
	opts.Logger.Debug("initializing messenger", zap.String("version", bertyversion.Version))

	ctx, cancel := context.WithCancel(context.Background())
	db := newDBWrapper(opts.DB, opts.Logger)

	if opts.StateBackup != nil {
		opts.Logger.Info("restoring db state")

		if err := dropAllTables(db.db); err != nil {
			return nil, errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to drop database schema: %w", err))
		}

		if err := db.db.AutoMigrate(getDBModels()...); err != nil {
			return nil, errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to create database schema: %w", err))
		}

		if err := replayLogsToDB(ctx, client, db); err != nil {
			return nil, errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to replay logs to database: %w", err))
		}

		if err := restoreDatabaseLocalState(db, opts.StateBackup); err != nil {
			return nil, errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to restore database local state: %w", err))
		}
	} else if err := db.initDB(getEventsReplayerForDB(ctx, client)); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	cancel()

	ctx, cancel = context.WithCancel(context.Background())
	svc := service{
		protocolClient:        client,
		logger:                opts.Logger,
		isGroupMonitorEnabled: opts.EnableGroupMonitor,
		startedAt:             time.Now(),
		db:                    db,
		notifmanager:          opts.NotificationManager,
		lcmanager:             opts.LifeCycleManager,
		dispatcher:            NewDispatcher(),
		cancelFn:              cancel,
		optsCleanup:           optsCleanup,
		ctx:                   ctx,
		handlerMutex:          sync.Mutex{},
	}

	svc.eventHandler = newEventHandler(ctx, db, client, opts.Logger, &svc, false)

	icr, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, err
	}
	pkStr := b64EncodeBytes(icr.GetAccountGroupPK())

	// get or create account in DB
	{
		acc, err := svc.db.getAccount()
		switch {
		case err == gorm.ErrRecordNotFound: // account not found, create a new one
			svc.logger.Debug("account not found, creating a new one", zap.String("pk", pkStr))
			ret, err := svc.internalInstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{})
			if err != nil {
				return nil, err
			}

			if err = svc.db.addAccount(pkStr, ret.GetHTMLURL()); err != nil {
				return nil, err
			}
		case err != nil: // internal error
			return nil, err
		case pkStr != acc.GetPublicKey(): // Check that we are connected to the correct node
			// FIXME: use errcode
			return nil, errcode.TODO.Wrap(errors.New("messenger's account key does not match protocol's account key"))
		default: // account exists, and public keys match
			// noop
		}
	}

	// monitor messenger lifecycle
	go svc.monitorState(ctx)

	// Dispatch app notifications to native manager
	svc.dispatcher.Register(&NotifieeBundle{StreamEventImpl: func(se *StreamEvent) error {
		if se.GetType() != StreamEvent_TypeNotified {
			return nil
		}

		var notif *StreamEvent_Notified
		{
			payload, err := se.UnmarshalPayload()
			if err != nil {
				opts.Logger.Error("unable to unmarshal Notified", zap.Error(err))
				return nil
			}
			notif = payload.(*StreamEvent_Notified)
		}

		if svc.lcmanager.GetCurrentState() == StateInactive {
			if err := svc.notifmanager.Notify(&notification.Notification{
				Title: notif.GetTitle(),
				Body:  notif.GetBody(),
			}); err != nil {
				opts.Logger.Error("unable to trigger notify", zap.Error(err))
			}
		}

		return nil
	}})

	// Subscribe to account group metadata
	err = svc.subscribeToMetadata(icr.GetAccountGroupPK())
	if err != nil {
		return nil, err
	}

	// subscribe to groups
	{
		convs, err := svc.db.getAllConversations()
		if err != nil {
			return nil, err
		}
		for _, cv := range convs {
			gpkb, err := b64DecodeBytes(cv.GetPublicKey())
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
		contacts, err := svc.db.getContactsByState(Contact_OutgoingRequestSent)
		if err != nil {
			return nil, err
		}
		for _, c := range contacts {
			gpkb, err := b64DecodeBytes(c.GetConversationPublicKey())
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
	s, err := svc.protocolClient.GroupMetadataList(
		svc.ctx,
		&bertytypes.GroupMetadataList_Request{GroupPK: gpkb},
	)
	if err != nil {
		return errcode.ErrEventListMetadata.Wrap(err)
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				svc.logStreamingError("group metadata", err)
				return
			}

			svc.handlerMutex.Lock()
			if err := svc.eventHandler.handleMetadataEvent(gme); err != nil {
				svc.logger.Error("failed to handle protocol event", zap.Error(errcode.ErrInternal.Wrap(err)))
			}
			svc.handlerMutex.Unlock()
		}
	}()
	return nil
}

func (svc *service) subscribeToMessages(gpkb []byte) error {
	ms, err := svc.protocolClient.GroupMessageList(
		svc.ctx,
		&bertytypes.GroupMessageList_Request{GroupPK: gpkb},
	)
	if err != nil {
		return errcode.ErrEventListMessage.Wrap(err)
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
			if err := svc.eventHandler.handleAppMessage(b64EncodeBytes(gpkb), gme, &am); err != nil {
				svc.logger.Error("failed to handle app message", zap.Error(errcode.ErrInternal.Wrap(err)))
			}
			svc.handlerMutex.Unlock()
		}
	}()
	return nil
}

var monitorCounter uint64 = 0

func (svc *service) subscribeToGroupMonitor(groupPK []byte) error {
	cl, err := svc.protocolClient.MonitorGroup(svc.ctx, &bertytypes.MonitorGroup_Request{
		GroupPK: groupPK,
	})
	if err != nil {
		return fmt.Errorf("unable to monitor group: %w", err)
	}

	go func() {
		for {
			seqid := atomic.AddUint64(&monitorCounter, 1)
			evt, err := cl.Recv()
			switch err {
			case nil:
			// everything fine
			case io.EOF:
				return
			case context.Canceled, context.DeadlineExceeded:
				svc.logger.Warn("monitoring group interrupted", zap.Error(err))
				return
			default:
				svc.logger.Error("error while monitoring group", zap.Error(err))
				return
			}

			meta := AppMessage_MonitorMetadata{
				Event: evt.Event,
			}

			payload, err := proto.Marshal(&meta)
			if err != nil {
				svc.logger.Error("unable to marshal event")
				continue
			}

			cid := fmt.Sprintf("__monitor-group-%d", seqid)
			i := &Interaction{
				CID:                   cid,
				Type:                  AppMessage_TypeMonitorMetadata,
				ConversationPublicKey: b64EncodeBytes(evt.GetGroupPK()),
				Payload:               payload,
				SentDate:              timestampMs(time.Now()),
			}

			err = svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{i}, true)
			if err != nil {
				svc.logger.Error("unable to dispatch monitor event")
			}
		}
	}()

	return nil
}

func (svc *service) subscribeToGroup(gpkb []byte) error {
	if svc.isGroupMonitorEnabled {
		if err := svc.subscribeToGroupMonitor(gpkb); err != nil {
			return err
		}
	}

	if err := svc.subscribeToMetadata(gpkb); err != nil {
		return err
	}

	return svc.subscribeToMessages(gpkb)
}

func (svc *service) Close() {
	svc.logger.Debug("closing service")
	svc.dispatcher.UnregisterAll()
	svc.cancelFn()
	svc.optsCleanup()
}
