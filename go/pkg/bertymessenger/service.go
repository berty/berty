package bertymessenger

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"sync"
	"sync/atomic"
	"time"

	sqlite "github.com/flyingtime/gorm-sqlcipher"
	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	ipfscid "github.com/ipfs/go-cid"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerpayloads"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/internal/streamutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertypush"
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
	db                    *messengerdb.DBWrapper
	dispatcher            *Dispatcher
	cancelFn              func()
	optsCleanup           func()
	ctx                   context.Context
	handlerMutex          sync.Mutex
	notifmanager          notification.Manager
	lcmanager             *lifecycle.Manager
	eventHandler          *messengerpayloads.EventHandler
	ring                  *zapring.Core
	pushReceiver          bertypush.MessengerPushReceiver
	tyberCleanup          func()
	logFilePath           string
}

type Opts struct {
	EnableGroupMonitor  bool
	Logger              *zap.Logger
	DB                  *gorm.DB
	NotificationManager notification.Manager
	LifeCycleManager    *lifecycle.Manager
	StateBackup         *mt.LocalDatabaseState
	PlatformPushToken   *protocoltypes.PushServiceReceiver
	Ring                *zapring.Core

	// LogFilePath defines the location of the current session's log file.
	//
	// This variable is used by svc.TyberHostAttach.
	LogFilePath string
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
		db, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:memdb%d?mode=memory&cache=shared", time.Now().UnixNano())), &gorm.Config{
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

	opts.Logger = opts.Logger.Named("msg")
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
	optsCleanup, err := opts.applyDefaults()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("error while applying default of messenger opts: %w", err))
	}

	tyberCtx, _, tyberEndSection := tyber.Section(context.Background(), opts.Logger, "Initializing MessengerService version "+bertyversion.Version)
	defer func() { tyberEndSection(err, "") }()

	ctx, cancel := context.WithCancel(context.Background())
	db := messengerdb.NewDBWrapper(opts.DB, opts.Logger)

	if opts.StateBackup != nil {
		tyber.LogStep(tyberCtx, opts.Logger, "Restoring db state")

		if err := db.RestoreFromBackup(opts.StateBackup, func() error {
			return replayLogsToDB(ctx, client, db, opts.Logger)
		}); err != nil {
			cancel()
			return nil, errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to restore exported state: %w", err))
		}
	} else if err := db.InitDB(getEventsReplayerForDB(ctx, client, opts.Logger)); err != nil {
		cancel()
		return nil, errcode.TODO.Wrap(fmt.Errorf("error during db init: %w", err))
	}

	tyber.LogStep(tyberCtx, opts.Logger, "Database initialization succeeded")

	cancel()

	ctx, cancel = context.WithCancel(context.Background())

	icr, err := client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	cancel()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("error while getting instance configuration: %w", err))
	}

	tyber.LogStep(tyberCtx, opts.Logger, "Got instance configuration", tyber.WithJSONDetail("InstanceConfiguration", icr))
	pkStr := messengerutil.B64EncodeBytes(icr.GetAccountGroupPK())

	shortPkStr := pkStr
	const shortLen = 6
	if len(shortPkStr) > shortLen {
		shortPkStr = shortPkStr[:shortLen]
	}

	opts.Logger = opts.Logger.With(logutil.PrivateString("a", shortPkStr))

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
		logFilePath:           opts.LogFilePath,
	}

	svc.eventHandler = messengerpayloads.NewEventHandler(ctx, db, &MetaFetcherFromProtocolClient{client: client}, newPostActionsService(&svc), opts.Logger, svc.dispatcher, false)
	svc.pushReceiver = bertypush.NewPushReceiver(bertypush.NewPushHandlerViaProtocol(ctx, client), svc.eventHandler, opts.Logger)

	// get or create account in DB
	{
		acc, err := svc.db.GetAccount()
		switch {
		case errcode.Is(err, errcode.ErrNotFound): // account not found, create a new one
			tyber.LogStep(tyberCtx, opts.Logger, "Account not found, creating a new one", tyber.WithDetail("PublicKey", pkStr))
			ret, err := svc.internalInstanceShareableBertyID(ctx, &mt.InstanceShareableBertyID_Request{})
			if err != nil {
				return nil, errcode.TODO.Wrap(fmt.Errorf("error while creating shareable account link: %w", err))
			}

			if err = svc.db.FirstOrCreateAccount(pkStr, ret.GetWebURL()); err != nil {
				return nil, err
			}
		case err != nil: // internal error
			return nil, errcode.ErrInternal.Wrap(err)
		case pkStr != acc.GetPublicKey(): // Check that we are connected to the correct node
			// FIXME: use errcode
			return nil, errcode.TODO.Wrap(errors.New("messenger's account key does not match protocol's account key"))
		default: // account exists, and public keys match
			// noop
			tyber.LogStep(tyberCtx, opts.Logger, "Found account", tyber.WithDetail("PublicKey", pkStr))
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
				opts.Logger.Error("unable to unmarshal Notified", zap.Error(err))
				return nil
			}
			notif = payload.(*mt.StreamEvent_Notified)
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

	tyberSubsCtx, _, endSection := tyber.Section(context.TODO(), opts.Logger, "Subscribing to groups on MessengerService init")
	defer func() { endSection(err, "") }()

	// Subscribe to account group metadata
	err = svc.subscribeToMetadata(tyberSubsCtx, icr.GetAccountGroupPK())
	if err != nil {
		return nil, fmt.Errorf("error while subscribing to account metadata: %w", err)
	}

	// subscribe to groups
	{
		convs, err := svc.db.GetAllConversations()
		if err != nil {
			return nil, fmt.Errorf("error while fetching conversations from db: %w", err)
		}

		for _, cv := range convs {
			gpkb, err := messengerutil.B64DecodeBytes(cv.GetPublicKey())
			if err != nil {
				return nil, errcode.ErrDeserialization.Wrap(err)
			}

			go func() {
				_, err = svc.protocolClient.ActivateGroup(svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gpkb})
				if err != nil {
					opts.Logger.Error("error while activating group", zap.Error(err))
					return
				}

				if err := svc.subscribeToGroup(tyberSubsCtx, gpkb); err != nil {
					opts.Logger.Error("error while subscribing to group metadata", zap.Error(err))
					return
				}
			}()
		}
	}

	// subscribe to contact groups
	{
		contacts, err := svc.db.GetContactsByState(mt.Contact_OutgoingRequestSent)
		if err != nil {
			return nil, errcode.ErrDBRead.Wrap(fmt.Errorf("error while fetching contacts from db: %w", err))
		}
		for _, c := range contacts {
			gpkb, err := messengerutil.B64DecodeBytes(c.GetConversationPublicKey())
			if err != nil {
				return nil, errcode.ErrDeserialization.Wrap(err)
			}

			go func() {
				_, err = svc.protocolClient.ActivateGroup(svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gpkb})
				if err != nil {
					opts.Logger.Error("error while activating contact group", zap.Error(err))
					return
				}

				if err := svc.subscribeToMetadata(tyberSubsCtx, gpkb); err != nil {
					opts.Logger.Error("error while subscribing to contact group metadata", zap.Error(err))
					return
				}
			}()
		}
	}

	if opts.PlatformPushToken != nil {
		icr, err = client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
		if err != nil {
			return nil, err
		}

		if icr.DevicePushToken == nil || (icr.DevicePushToken.TokenType == opts.PlatformPushToken.TokenType && !bytes.Equal(icr.DevicePushToken.Token, opts.PlatformPushToken.Token)) {
			if _, err := client.PushSetDeviceToken(ctx, &protocoltypes.PushSetDeviceToken_Request{
				Receiver: opts.PlatformPushToken,
			}); err != nil {
				return nil, errcode.ErrInternal.Wrap(err)
			}
		}
	}

	return &svc, nil
}

func (svc *service) subscribeToMetadata(tctx context.Context, gpkb []byte) error {
	tctx, newTrace := tyber.ContextWithTraceID(tctx)
	traceName := "Subscribing to metadata on group " + messengerutil.B64EncodeBytes(gpkb)
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
				svc.logger.Error("failed to cast cid for logging", logutil.PrivateBinary("cid-bytes", gme.EventContext.ID))
				ctx, _ := tyber.ContextWithTraceID(svc.eventHandler.Ctx())
				eventHandler = eventHandler.WithContext(ctx)
			} else {
				eventHandler = eventHandler.WithContext(tyber.ContextWithConstantTraceID(svc.eventHandler.Ctx(), "msgrcvd-"+cid.String()))
			}

			svc.handlerMutex.Lock()
			if err := eventHandler.HandleMetadataEvent(gme); err != nil {
				_ = tyber.LogFatalError(eventHandler.Ctx(), eventHandler.Logger(), "Failed to handle protocol event", err)
			} else {
				eventHandler.Logger().Debug("Messenger event handler succeeded", tyber.FormatStepLogFields(eventHandler.Ctx(), []tyber.Detail{}, tyber.EndTrace)...)
			}
			svc.handlerMutex.Unlock()
		}
	}()
	return nil
}

func (svc *service) subscribeToMessages(tctx context.Context, gpkb []byte) error {
	tctx, newTrace := tyber.ContextWithTraceID(tctx)
	traceName := "Subscribing to messages on group " + messengerutil.B64EncodeBytes(gpkb)
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
				svc.logger.Error("failed to cast cid for logging", zap.String("type", am.GetType().String()), logutil.PrivateBinary("cid-bytes", gme.EventContext.ID))
				ctx, _ := tyber.ContextWithTraceID(svc.eventHandler.Ctx())
				eventHandler = eventHandler.WithContext(ctx)
			} else {
				eventHandler = eventHandler.WithContext(tyber.ContextWithConstantTraceID(svc.eventHandler.Ctx(), "msgrcvd-"+cid.String()))
			}

			svc.handlerMutex.Lock()
			if err := eventHandler.HandleAppMessage(messengerutil.B64EncodeBytes(gpkb), gme, &am); err != nil {
				_ = tyber.LogFatalError(eventHandler.Ctx(), eventHandler.Logger(), "Failed to handle AppMessage", err)
			} else {
				eventHandler.Logger().Debug("AppMessage handler succeeded", tyber.FormatStepLogFields(eventHandler.Ctx(), []tyber.Detail{}, tyber.EndTrace)...)
			}
			svc.handlerMutex.Unlock()
		}
	}()
	return nil
}

var monitorCounter uint64

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
				ConversationPublicKey: messengerutil.B64EncodeBytes(evt.GetGroupPK()),
				Payload:               payload,
				SentDate:              messengerutil.TimestampMs(time.Now()),
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
		svc.logger.Debug("Subscribing to group "+messengerutil.B64EncodeBytes(gpkb), tyber.FormatTraceLogFields(tctx)...)
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
	cidBytes, err := messengerutil.B64DecodeBytes(cid)
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

	pk, err := messengerutil.B64DecodeBytes(groupPK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	acc, err := svc.db.GetAccount()
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
		avatarCID = messengerutil.B64EncodeBytes(avatarCIDBytes)
		attachmentCIDs = [][]byte{avatarCIDBytes}

		if medias, err = svc.db.GetMedias([]string{acc.GetAvatarCID()}); err != nil {
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
		messengerutil.TimestampMs(time.Now()),
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

func (svc *service) Close() {
	ctx, _ := tyber.ContextWithTraceID(svc.ctx)
	svc.logger.Debug("Closing MessengerService", tyber.FormatTraceLogFields(ctx)...)
	svc.dispatcher.UnregisterAll()
	svc.cancelFn()
	svc.optsCleanup()
	svc.logger.Debug("Closed MessengerService successfully", tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.EndTrace)...)
}

func (svc *service) ActivateGroup(groupPK []byte) error {
	if _, err := svc.protocolClient.ActivateGroup(svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
		return err
	}

	// subscribe to group
	if err := svc.subscribeToGroup(svc.ctx, groupPK); err != nil {
		return err
	}

	svc.logger.Debug("Subscribed to group", tyber.FormatStepLogFields(svc.ctx, []tyber.Detail{
		{Name: "GroupPublicKey", Description: messengerutil.B64EncodeBytes(groupPK)},
	})...)

	return nil
}

func (svc *service) ActivateContactGroup(contactPK []byte) error {
	groupPK, err := messengerutil.GroupPKFromContactPK(svc.ctx, svc.protocolClient, contactPK)
	if err != nil {
		return err
	}

	return svc.ActivateGroup(groupPK)
}

func (svc *service) SendAck(cid, conversationPK string) error {
	tyber.LogStep(svc.ctx, svc.logger, fmt.Sprintf("Sending acknowledge with target %s on group %s", cid, conversationPK))
	logError := func(text string, err error) error { return tyber.LogError(svc.ctx, svc.logger, text, err) }

	// TODO: Don't send ack if message is already acked to prevent spam in multimember groups
	// Maybe wait a few seconds before checking since we're likely to receive the message before any ack
	amp, err := mt.AppMessage_TypeAcknowledge.MarshalPayload(0, cid, nil, &mt.AppMessage_Acknowledge{})
	if err != nil {
		return logError("Failed to marshal acknowledge", err)
	}

	cpk, err := messengerutil.B64DecodeBytes(conversationPK)
	if err != nil {
		return logError("Failed to decode conversation public key", err)
	}

	reply, err := svc.protocolClient.AppMessageSend(svc.ctx, &protocoltypes.AppMessageSend_Request{
		GroupPK: cpk,
		Payload: amp,
	})
	if err != nil {
		return logError("Protocol error", err)
	}
	tyber.LogStep(svc.ctx, svc.logger, "Acknowledge sent", tyber.WithCIDDetail("CID", reply.GetCID()))

	return nil
}

func (svc *service) sharePushTokenForConversation(conversation *mt.Conversation) error {
	if conversation == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("no conversation supplied"))
	}

	svc.logger.Info("sharing push token", logutil.PrivateString("conversation-pk", conversation.PublicKey))

	account, err := svc.db.GetAccount()
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	if account.DevicePushToken == nil {
		svc.logger.Warn("no push token known, won't share it")
		return errcode.ErrPushUnknownDestination.Wrap(fmt.Errorf("no push token known, won't share it"))
	}

	if account.DevicePushServer == nil {
		svc.logger.Warn("no push server known, won't share push token")
		return errcode.ErrPushUnknownProvider.Wrap(fmt.Errorf("no push server known, won't share push token"))
	}

	pushServer := &protocoltypes.PushServer{}
	if err := pushServer.Unmarshal(account.DevicePushServer); err != nil {
		return errcode.ErrDeserialization.Wrap(fmt.Errorf("unable to unmarshal push server: %w", err))
	}

	pushToken := &protocoltypes.PushServiceReceiver{}
	if err := pushToken.Unmarshal(account.DevicePushToken); err != nil {
		return errcode.ErrDeserialization.Wrap(fmt.Errorf("unable to unmarshal device push token: %w", err))
	}

	if err := svc.sharePushTokenForConversationInternal(conversation, pushServer, pushToken); err != nil {
		return errcode.ErrInternal.Wrap(fmt.Errorf("unable to share device push token: %w", err))
	}

	return nil
}

func (svc *service) sharePushTokenForConversationInternal(conversation *mt.Conversation, pushServer *protocoltypes.PushServer, pushToken *protocoltypes.PushServiceReceiver) error {
	if len(pushToken.Token) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing token in PushServiceReceiver"))
	}
	if pushToken.TokenType == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("wrong token type in PushServiceReceiver"))
	}
	if len(pushToken.RecipientPublicKey) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing recipient public key in PushServiceReceiver"))
	}
	if len(pushToken.BundleID) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing bundleID in PushServiceReceiver"))
	}

	tokenIdentifier := makeSharedPushIdentifier(pushServer, pushToken)

	pubKey, err := messengerutil.B64DecodeBytes(conversation.PublicKey)
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	if conversation.SharedPushTokenIdentifier != tokenIdentifier {
		if _, err := svc.protocolClient.PushShareToken(svc.ctx, &protocoltypes.PushShareToken_Request{
			GroupPK:  pubKey,
			Server:   pushServer,
			Receiver: pushToken,
		}); err != nil {
			return err
		}

		if _, err := svc.db.UpdateConversation(mt.Conversation{PublicKey: conversation.PublicKey, SharedPushTokenIdentifier: tokenIdentifier}); err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}
	}

	return nil
}

func makeSharedPushIdentifier(server *protocoltypes.PushServer, token *protocoltypes.PushServiceReceiver) string {
	// @TODO(@gfanton): make something smarter here
	b64serverKey := base64.StdEncoding.EncodeToString(server.ServerKey)
	b64token := base64.StdEncoding.EncodeToString(token.Token)

	return fmt.Sprintf("%s-%s", b64serverKey, b64token)
}

func (svc *service) pushDeviceTokenBroadcast(account *mt.Account) error {
	conversations, err := svc.db.GetAllConversations()
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	svc.logger.Info("sharing push token", zap.Int("conversation-count", len(conversations)))

	server := &protocoltypes.PushServer{}
	if err := server.Unmarshal(account.DevicePushServer); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	token := &protocoltypes.PushServiceReceiver{}
	if err := token.Unmarshal(account.DevicePushToken); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	for _, c := range conversations {
		if err := svc.sharePushTokenForConversationInternal(c, server, token); err != nil {
			svc.logger.Error("unable to share push token on conversation", logutil.PrivateString("conversation-pk", c.PublicKey), zap.Error(err))
		}
	}

	return nil
}

type MetaFetcherFromProtocolClient struct {
	client protocoltypes.ProtocolServiceClient
}

func (svc *MetaFetcherFromProtocolClient) OwnMemberAndDevicePKForConversation(ctx context.Context, conversationPK []byte) (member []byte, device []byte, err error) {
	gi, err := svc.client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{GroupPK: conversationPK})
	if err != nil {
		return nil, nil, err
	}

	return gi.MemberPK, gi.DevicePK, nil
}

func (svc *MetaFetcherFromProtocolClient) GroupPKForContact(ctx context.Context, contactPK []byte) ([]byte, error) {
	groupInfoReply, err := svc.client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{ContactPK: contactPK})
	if err != nil {
		return nil, errcode.ErrProtocolGetGroupInfo.Wrap(err)
	}

	return groupInfoReply.GetGroup().GetPublicKey(), nil
}
