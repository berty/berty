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
	ipfscid "github.com/ipfs/go-cid"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/internal/streamutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/berty/v2/go/pkg/errcode"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

type Service interface {
	mt.MessengerServiceServer
	Close()
}

// service is a Service
var _ Service = (*service)(nil)

type service struct {
	logger                *zap.Logger
	isGroupMonitorEnabled bool
	protocolClient        protocoltypes.ProtocolServiceClient
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
	ring                  *zapring.Core
}

type Opts struct {
	EnableGroupMonitor  bool
	Logger              *zap.Logger
	DB                  *gorm.DB
	NotificationManager notification.Manager
	LifeCycleManager    *lifecycle.Manager
	StateBackup         *mt.LocalDatabaseState
	Ring                *zapring.Core
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

func databaseStateRestoreAccountHandler(statePointer *mt.LocalDatabaseState) bertyprotocol.RestoreAccountHandler {
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

func RestoreFromAccountExport(ctx context.Context, reader io.Reader, coreAPI ipfs_interface.CoreAPI, odb *bertyprotocol.BertyOrbitDB, localDBState *mt.LocalDatabaseState, logger *zap.Logger) error {
	return bertyprotocol.RestoreAccountExport(ctx, reader, coreAPI, odb, logger, databaseStateRestoreAccountHandler(localDBState))
}

func New(client protocoltypes.ProtocolServiceClient, opts *Opts) (_ Service, err error) {
	l := opts.Logger
	if l == nil {
		l = zap.NewNop()
	}
	tyberCtx, _, tyberEndSection := tyber.Section(context.Background(), l, "Initializing MessengerService version "+bertyversion.Version)
	defer func() { tyberEndSection(err, "") }()

	optsCleanup, err := opts.applyDefaults()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("error while applying default of messenger opts: %w", err))
	}
	opts.Logger = opts.Logger.Named("msg")
	l = opts.Logger

	ctx, cancel := context.WithCancel(context.Background())
	db := newDBWrapper(opts.DB, opts.Logger)

	if opts.StateBackup != nil {
		tyber.LogStep(tyberCtx, l, "Restoring db state")

		if err := dropAllTables(db.db); err != nil {
			return nil, errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to drop database schema: %w", err))
		}

		if err := db.getUpdatedDB(getDBModels(), noopReplayer, l); err != nil {
			return nil, err
		}

		if err := replayLogsToDB(ctx, client, db); err != nil {
			return nil, errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to replay logs to database: %w", err))
		}

		if err := restoreDatabaseLocalState(db, opts.StateBackup); err != nil {
			return nil, errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to restore database local state: %w", err))
		}
	} else if err := db.initDB(getEventsReplayerForDB(ctx, client)); err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("error during db init: %w", err))
	}

	tyber.LogStep(tyberCtx, l, "Database initialization succeeded")

	cancel()

	ctx, cancel = context.WithCancel(context.Background())

	icr, err := client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	cancel()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("error while getting instance configuration: %w", err))
	}
	tyber.LogStep(tyberCtx, l, "Got instance configuration", tyber.WithJSONDetail("InstanceConfiguration", icr))
	pkStr := b64EncodeBytes(icr.GetAccountGroupPK())
	shortPkStr := pkStr
	const shortLen = 6
	if len(shortPkStr) > shortLen {
		shortPkStr = shortPkStr[:shortLen]
	}

	opts.Logger = opts.Logger.With(zap.String("a", shortPkStr))
	l = opts.Logger

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
		ring:                  opts.Ring,
	}

	svc.eventHandler = newEventHandler(ctx, db, client, opts.Logger, &svc, false)

	// get or create account in DB
	{
		acc, err := svc.db.getAccount()
		switch {
		case errcode.Is(err, errcode.ErrNotFound): // account not found, create a new one
			tyber.LogStep(tyberCtx, l, "Account not found, creating a new one", tyber.WithDetail("PublicKey", pkStr))
			ret, err := svc.internalInstanceShareableBertyID(ctx, &mt.InstanceShareableBertyID_Request{})
			if err != nil {
				return nil, errcode.TODO.Wrap(fmt.Errorf("error while creating shareable account link: %w", err))
			}

			if err = svc.db.firstOrCreateAccount(pkStr, ret.GetWebURL()); err != nil {
				return nil, err
			}
		case err != nil: // internal error
			return nil, errcode.ErrInternal.Wrap(err)
		case pkStr != acc.GetPublicKey(): // Check that we are connected to the correct node
			// FIXME: use errcode
			return nil, errcode.TODO.Wrap(errors.New("messenger's account key does not match protocol's account key"))
		default: // account exists, and public keys match
			// noop
			tyber.LogStep(tyberCtx, l, "Found account", tyber.WithDetail("PublicKey", pkStr))
		}
	}

	// monitor messenger lifecycle
	go svc.monitorState(ctx)

	// Dispatch app notifications to native manager
	svc.dispatcher.Register(&NotifieeBundle{StreamEventImpl: func(se *mt.StreamEvent) error {
		if se.GetType() != mt.StreamEvent_TypeNotified {
			return nil
		}

		var notif *mt.StreamEvent_Notified
		{
			payload, err := se.UnmarshalPayload()
			if err != nil {
				l.Error("unable to unmarshal Notified", zap.Error(err))
				return nil
			}
			notif = payload.(*mt.StreamEvent_Notified)
		}

		if svc.lcmanager.GetCurrentState() == StateInactive {
			if err := svc.notifmanager.Notify(&notification.Notification{
				Title: notif.GetTitle(),
				Body:  notif.GetBody(),
			}); err != nil {
				l.Error("unable to trigger notify", zap.Error(err))
			}
		}

		return nil
	}})

	tyberSubsCtx, _, endSection := tyber.Section(context.TODO(), l, "Subscribing to groups on MessengerService init")
	defer func() { endSection(err, "") }()

	// Subscribe to account group metadata
	err = svc.subscribeToMetadata(tyberSubsCtx, icr.GetAccountGroupPK())
	if err != nil {
		return nil, fmt.Errorf("error while subscribing to account metadata: %w", err)
	}

	// subscribe to groups
	{
		convs, err := svc.db.getAllConversations()
		if err != nil {
			return nil, fmt.Errorf("error while fetching conversations from db: %w", err)
		}
		for _, cv := range convs {
			gpkb, err := b64DecodeBytes(cv.GetPublicKey())
			if err != nil {
				return nil, errcode.ErrDeserialization.Wrap(err)
			}

			_, err = svc.protocolClient.ActivateGroup(svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gpkb})
			if err != nil {
				return nil, errcode.ErrInternal.Wrap(fmt.Errorf("error while activating group: %w", err))
			}

			if err := svc.subscribeToGroup(tyberSubsCtx, gpkb); err != nil {
				return nil, errcode.ErrInternal.Wrap(fmt.Errorf("error while subscribing to group metadata: %w", err))
			}
		}
	}

	// subscribe to contact groups
	{
		contacts, err := svc.db.getContactsByState(mt.Contact_OutgoingRequestSent)
		if err != nil {
			return nil, errcode.ErrDBRead.Wrap(fmt.Errorf("error while fetching contacts from db: %w", err))
		}
		for _, c := range contacts {
			gpkb, err := b64DecodeBytes(c.GetConversationPublicKey())
			if err != nil {
				return nil, errcode.ErrDeserialization.Wrap(err)
			}

			_, err = svc.protocolClient.ActivateGroup(svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gpkb})
			if err != nil {
				return nil, errcode.ErrInternal.Wrap(fmt.Errorf("error while activating contact group: %w", err))
			}

			if err := svc.subscribeToMetadata(tyberSubsCtx, gpkb); err != nil {
				return nil, errcode.ErrInternal.Wrap(fmt.Errorf("error while subscribing to contact group metadata: %w", err))
			}
		}
	}

	return &svc, nil
}

func (svc *service) subscribeToMetadata(tctx context.Context, gpkb []byte) error {
	tctx, newTrace := tyber.ContextWithTraceID(tctx)
	traceName := "Subscribing to metadata on group " + b64EncodeBytes(gpkb)
	if newTrace {
		svc.logger.Debug(traceName, tyber.FormatTraceLogFields(tctx)...)
		defer tyber.LogTraceEnd(tctx, svc.logger, "Successfully subscribed to metadata")
	} else {
		tyber.LogStep(tctx, svc.logger, traceName)
	}

	// subscribe
	s, err := svc.protocolClient.GroupMetadataList(
		svc.ctx,
		&protocoltypes.GroupMetadataList_Request{GroupPK: gpkb},
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

			cid, err := ipfscid.Cast(gme.EventContext.ID)
			eventHandler := svc.eventHandler
			if err != nil {
				svc.logger.Error("failed to cast cid for logging", zap.Binary("cid-bytes", gme.EventContext.ID))
				ctx, _ := tyber.ContextWithTraceID(svc.eventHandler.ctx)
				eventHandler = eventHandler.withContext(ctx)
			} else {
				eventHandler = eventHandler.withContext(tyber.ContextWithConstantTraceID(svc.eventHandler.ctx, "msgrcvd-"+cid.String()))
			}

			svc.handlerMutex.Lock()
			if err := eventHandler.handleMetadataEvent(gme); err != nil {
				_ = tyber.LogFatalError(eventHandler.ctx, eventHandler.logger, "Failed to handle protocol event", err)
			} else {
				eventHandler.logger.Debug("Messenger event handler succeeded", tyber.FormatStepLogFields(eventHandler.ctx, []tyber.Detail{}, tyber.EndTrace)...)
			}
			svc.handlerMutex.Unlock()
		}
	}()
	return nil
}

func (svc *service) subscribeToMessages(tctx context.Context, gpkb []byte) error {
	tctx, newTrace := tyber.ContextWithTraceID(tctx)
	traceName := "Subscribing to messages on group " + b64EncodeBytes(gpkb)
	if newTrace {
		svc.logger.Debug(traceName, tyber.FormatTraceLogFields(tctx)...)
		defer tyber.LogTraceEnd(tctx, svc.logger, "Successfully subscribed to messages")
	} else {
		tyber.LogStep(tctx, svc.logger, traceName)
	}

	ms, err := svc.protocolClient.GroupMessageList(
		svc.ctx,
		&protocoltypes.GroupMessageList_Request{
			GroupPK:  gpkb,
			SinceNow: true,
		},
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

			var am mt.AppMessage
			if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
				svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
				return
			}

			cid, err := ipfscid.Cast(gme.EventContext.ID)
			eventHandler := svc.eventHandler
			if err != nil {
				svc.logger.Error("failed to cast cid for logging", zap.String("type", am.GetType().String()), zap.Binary("cid-bytes", gme.EventContext.ID))
				ctx, _ := tyber.ContextWithTraceID(svc.eventHandler.ctx)
				eventHandler = eventHandler.withContext(ctx)
			} else {
				eventHandler = eventHandler.withContext(tyber.ContextWithConstantTraceID(svc.eventHandler.ctx, "msgrcvd-"+cid.String()))
			}

			svc.handlerMutex.Lock()
			if err := eventHandler.handleAppMessage(b64EncodeBytes(gpkb), gme, &am); err != nil {
				_ = tyber.LogFatalError(eventHandler.ctx, eventHandler.logger, "Failed to handle AppMessage", err)
			} else {
				eventHandler.logger.Debug("AppMessage handler succeeded", tyber.FormatStepLogFields(eventHandler.ctx, []tyber.Detail{}, tyber.EndTrace)...)
			}
			svc.handlerMutex.Unlock()
		}
	}()
	return nil
}

var monitorCounter uint64 = 0

func (svc *service) subscribeToGroupMonitor(groupPK []byte) error {
	cl, err := svc.protocolClient.MonitorGroup(svc.ctx, &protocoltypes.MonitorGroup_Request{
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

			meta := mt.AppMessage_MonitorMetadata{
				Event: evt.Event,
			}

			payload, err := proto.Marshal(&meta)
			if err != nil {
				svc.logger.Error("unable to marshal event")
				continue
			}

			cid := fmt.Sprintf("__monitor-group-%d", seqid)
			i := &mt.Interaction{
				CID:                   cid,
				Type:                  mt.AppMessage_TypeMonitorMetadata,
				ConversationPublicKey: b64EncodeBytes(evt.GetGroupPK()),
				Payload:               payload,
				SentDate:              timestampMs(time.Now()),
			}

			err = svc.dispatcher.StreamEvent(mt.StreamEvent_TypeInteractionUpdated, &mt.StreamEvent_InteractionUpdated{Interaction: i}, true)
			if err != nil {
				svc.logger.Error("unable to dispatch monitor event")
			}
		}
	}()

	return nil
}

func (svc *service) subscribeToGroup(tctx context.Context, gpkb []byte) error {
	tctx, newTrace := tyber.ContextWithTraceID(tctx)
	if newTrace {
		svc.logger.Debug("Subscribing to group "+b64EncodeBytes(gpkb), tyber.FormatTraceLogFields(tctx)...)
		defer tyber.LogTraceEnd(tctx, svc.logger, "Successfully subscribed to group")
	}

	if svc.isGroupMonitorEnabled {
		if err := svc.subscribeToGroupMonitor(gpkb); err != nil {
			return err
		}
	}

	if err := svc.subscribeToMetadata(tctx, gpkb); err != nil {
		return err
	}

	return svc.subscribeToMessages(tctx, gpkb)
}

func (svc *service) attachmentPrepare(ctx context.Context, attachment io.Reader) ([]byte, error) {
	stream, err := svc.protocolClient.AttachmentPrepare(ctx)
	if err != nil {
		return nil, errcode.ErrAttachmentPrepare.Wrap(err)
	}

	// send header
	if err := stream.Send(&protocoltypes.AttachmentPrepare_Request{}); err != nil {
		return nil, errcode.ErrStreamHeaderWrite.Wrap(err)
	}

	// send body
	if err := streamutil.FuncSink(make([]byte, 64*1024), attachment, func(b []byte) error {
		return stream.Send(&protocoltypes.AttachmentPrepare_Request{Block: b})
	}); err != nil {
		return nil, errcode.ErrStreamSink.Wrap(err)
	}

	// signal end of data and pass cid
	reply, err := stream.CloseAndRecv()
	if err != nil {
		return nil, errcode.ErrStreamCloseAndRecv.Wrap(err)
	}
	return reply.GetAttachmentCID(), nil
}

func (svc *service) attachmentRetrieve(ctx context.Context, cid string) (*io.PipeReader, error) {
	cidBytes, err := b64DecodeBytes(cid)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	stream, err := svc.protocolClient.AttachmentRetrieve(ctx, &protocoltypes.AttachmentRetrieve_Request{AttachmentCID: cidBytes})
	if err != nil {
		return nil, errcode.ErrAttachmentRetrieve.Wrap(err)
	}

	return streamutil.FuncReader(func() ([]byte, error) {
		reply, err := stream.Recv()
		return reply.GetBlock(), err
	}, svc.logger), nil
}

func (svc *service) sendAccountUserInfo(ctx context.Context, groupPK string) (err error) {
	ctx, _, endSection := tyber.Section(ctx, svc.logger, fmt.Sprintf("Sending account info to group %s", groupPK))
	defer func() {
		if err != nil {
			endSection(err, "")
		}
	}()

	pk, err := b64DecodeBytes(groupPK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	acc, err := svc.db.getAccount()
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	var avatarCID string
	var attachmentCIDs [][]byte
	var medias []*mt.Media
	if acc.GetAvatarCID() != "" {
		// TODO: add AttachmentRecrypt to bertyprotocol
		avatar, err := svc.attachmentRetrieve(ctx, acc.GetAvatarCID())
		if err != nil {
			return errcode.ErrAttachmentRetrieve.Wrap(err)
		}
		avatarCIDBytes, err := svc.attachmentPrepare(ctx, avatar)
		if err != nil {
			return errcode.ErrAttachmentPrepare.Wrap(err)
		}
		avatarCID = b64EncodeBytes(avatarCIDBytes)
		attachmentCIDs = [][]byte{avatarCIDBytes}

		if medias, err = svc.db.getMedias([]string{acc.GetAvatarCID()}); err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}
		if len(medias) < 1 {
			return errcode.ErrInternal
		}
		medias[0].CID = avatarCID

		svc.logger.Debug("Re-encrypted avatar", tyber.FormatStepLogFields(ctx, []tyber.Detail{
			{Name: "OldAvatarCID", Description: acc.GetAvatarCID()},
			{Name: "NewAvatarCID", Description: avatarCID},
		})...)
	}

	am, err := mt.AppMessage_TypeSetUserInfo.MarshalPayload(
		timestampMs(time.Now()),
		"",
		medias,
		&mt.AppMessage_SetUserInfo{DisplayName: acc.GetDisplayName(), AvatarCID: avatarCID},
	)
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	sendReply, err := svc.protocolClient.AppMetadataSend(ctx, &protocoltypes.AppMetadataSend_Request{GroupPK: pk, Payload: am, AttachmentCIDs: attachmentCIDs})
	if err != nil {
		return errcode.ErrProtocolSend.Wrap(err)
	}

	endSection(nil, "Sent account info", tyber.WithCIDDetail("CID", sendReply.CID))
	return nil
}

func (svc *service) streamInteraction(tx *dbWrapper, cid string, isNew bool) error {
	if svc != nil && svc.dispatcher != nil {
		interaction, err := tx.getAugmentedInteraction(cid)
		if err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		if err := svc.dispatcher.StreamEvent(
			mt.StreamEvent_TypeInteractionUpdated,
			&mt.StreamEvent_InteractionUpdated{Interaction: interaction},
			isNew,
		); err != nil {
			return errcode.ErrMessengerStreamEvent.Wrap(err)
		}
	}
	return nil
}

func buildReactionsView(tx *dbWrapper, cid string) ([]*mt.Interaction_ReactionView, error) {
	views := ([]*mt.Interaction_ReactionView)(nil)
	if err := tx.db.Raw(
		"SELECT count(*) AS count, emoji, MAX(is_mine) > 0 AS own_state FROM reactions WHERE target_cid = ? AND state = true GROUP BY emoji ORDER BY MIN(state_date) ASC",
		cid,
	).Scan(&views).Error; err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}
	return views, nil
}

func (svc *service) Close() {
	ctx, _ := tyber.ContextWithTraceID(svc.ctx)
	svc.logger.Debug("Closing MessengerService", tyber.FormatTraceLogFields(ctx)...)
	svc.dispatcher.UnregisterAll()
	svc.cancelFn()
	svc.optsCleanup()
	svc.logger.Debug("Closed MessengerService successfully", tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.EndTrace)...)
}
