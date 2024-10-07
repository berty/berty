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

	ipfs_interface "github.com/ipfs/kubo/core/coreiface"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/dbfetcher"
	sqlite "berty.tech/berty/v2/go/internal/gorm-sqlcipher"
	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerpayloads"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/v2"
	"berty.tech/weshnet/v2/pkg/cryptoutil"
	"berty.tech/weshnet/v2/pkg/lifecycle"
	"berty.tech/weshnet/v2/pkg/logutil"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
	"berty.tech/weshnet/v2/pkg/tyber"
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
	pushHandler           bertypush.PushHandler
	pushClients           map[string]*grpc.ClientConn
	muPushClients         sync.RWMutex
	tyberCleanup          func()
	logFilePath           string
	cancelGroupStatus     map[string] /*groupPK */ context.CancelFunc
	muCancelGroupStatus   sync.Mutex
	knownPeers            map[string] /* peer.ID */ protocoltypes.GroupDeviceStatus_Type
	muKnownPeers          sync.Mutex
	cancelSubsCtx         func()
	subsCtx               context.Context
	subsMutex             *sync.Mutex
	groupsToSubTo         map[string]struct{}
	accountGroup          []byte
	grpcInsecure          bool
	dd                    debugCommand
	authSession           atomic.Value

	mt.UnimplementedMessengerServiceServer
}

type Opts struct {
	EnableGroupMonitor  bool
	Logger              *zap.Logger
	DB                  *gorm.DB
	NotificationManager notification.Manager
	LifeCycleManager    *lifecycle.Manager
	StateBackup         *mt.LocalDatabaseState
	PushKey             *[cryptoutil.KeySize]byte
	PlatformPushToken   *pushtypes.PushServiceReceiver
	Ring                *zapring.Core
	GRPCInsecureMode    bool

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
		opts.LifeCycleManager = lifecycle.NewManager(lifecycle.StateActive)
	}

	opts.Logger = opts.Logger.Named("msg")
	return cleanup, nil
}

func databaseStateRestoreAccountHandler(statePointer *mt.LocalDatabaseState) weshnet.RestoreAccountHandler {
	return weshnet.RestoreAccountHandler{
		Handler: func(header *tar.Header, reader *tar.Reader) (bool, error) {
			if header.Name != exportLocalDBState {
				return false, nil
			}

			backupContents := new(bytes.Buffer)
			size, err := io.Copy(backupContents, reader)
			if err != nil {
				return true, errcode.ErrCode_ErrInternal.Wrap(fmt.Errorf("unable to read %d bytes: %w", header.Size, err))
			}

			if size != header.Size {
				return true, errcode.ErrCode_ErrInternal.Wrap(fmt.Errorf("unexpected file size"))
			}

			if err := proto.Unmarshal(backupContents.Bytes(), statePointer); err != nil {
				return true, errcode.ErrCode_ErrDeserialization.Wrap(err)
			}

			return true, nil
		},
		PostProcess: func() error {
			return nil
		},
	}
}

func RestoreFromAccountExport(ctx context.Context, reader io.Reader, coreAPI ipfs_interface.CoreAPI, odb *weshnet.WeshOrbitDB, localDBState *mt.LocalDatabaseState, logger *zap.Logger) error {
	return weshnet.RestoreAccountExport(ctx, reader, coreAPI, odb, logger, databaseStateRestoreAccountHandler(localDBState))
}

func New(client protocoltypes.ProtocolServiceClient, opts *Opts) (_ Service, err error) {
	optsCleanup, err := opts.applyDefaults()
	if err != nil {
		return nil, errcode.ErrCode_TODO.Wrap(fmt.Errorf("error while applying default of messenger opts: %w", err))
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
			return nil, errcode.ErrCode_ErrDBWrite.Wrap(fmt.Errorf("unable to restore exported state: %w", err))
		}
	} else if err := db.InitDB(getEventsReplayerForDB(ctx, client, opts.Logger)); err != nil {
		cancel()
		return nil, errcode.ErrCode_TODO.Wrap(fmt.Errorf("error during db init: %w", err))
	}

	tyber.LogStep(tyberCtx, opts.Logger, "Database initialization succeeded")

	cancel()

	ctx, cancel = context.WithCancel(context.Background())

	icr, err := client.ServiceGetConfiguration(ctx, &protocoltypes.ServiceGetConfiguration_Request{})
	cancel()
	if err != nil {
		return nil, errcode.ErrCode_TODO.Wrap(fmt.Errorf("error while getting instance configuration: %w", err))
	}

	tyber.LogStep(tyberCtx, opts.Logger, "Got instance configuration", tyber.WithJSONDetail("InstanceConfiguration", icr))
	pkStr := messengerutil.B64EncodeBytes(icr.GetAccountGroupPk())

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
		cancelGroupStatus:     make(map[string] /* groupPK */ context.CancelFunc),
		knownPeers:            make(map[string] /* peer.ID */ protocoltypes.GroupDeviceStatus_Type),
		subsMutex:             &sync.Mutex{},
		groupsToSubTo:         make(map[string]struct{}),
		accountGroup:          icr.GetAccountGroupPk(),
		grpcInsecure:          opts.GRPCInsecureMode,
		pushClients:           make(map[string]*grpc.ClientConn),
	}

	svc.eventHandler = messengerpayloads.NewEventHandler(ctx, db, &MetaFetcherFromProtocolClient{client: client}, newPostActionsService(&svc), opts.Logger, svc.dispatcher, false)
	svc.pushHandler = (bertypush.PushHandler)(nil)
	dbFetcher := dbfetcher.NewDBFetcher(pkStr, db)
	if opts.PushKey != nil {
		svc.pushHandler, err = bertypush.NewPushHandler(client, dbFetcher, opts.PushKey, &bertypush.PushHandlerOpts{
			Logger: opts.Logger,
		})
		if err != nil {
			cancel()
			return nil, errcode.ErrCode_ErrInternal.Wrap(fmt.Errorf("unable to init push handler: %w", err))
		}
	}
	svc.pushReceiver = bertypush.NewPushReceiver(svc.pushHandler, svc.eventHandler, dbFetcher, opts.Logger)

	// get or create account in DB
	{
		acc, err := svc.db.GetAccount()
		switch {
		case errcode.Is(err, errcode.ErrCode_ErrNotFound): // account not found, create a new one
			tyber.LogStep(tyberCtx, opts.Logger, "Account not found, creating a new one", tyber.WithDetail("PublicKey", pkStr))
			ret, err := svc.internalInstanceShareableBertyID(ctx, &mt.InstanceShareableBertyID_Request{})
			if err != nil {
				return nil, errcode.ErrCode_TODO.Wrap(fmt.Errorf("error while creating shareable account link: %w", err))
			}

			if err = svc.db.FirstOrCreateAccount(pkStr, ret.GetWebUrl()); err != nil {
				return nil, err
			}
		case err != nil: // internal error
			return nil, errcode.ErrCode_ErrInternal.Wrap(err)
		case pkStr != acc.GetPublicKey(): // Check that we are connected to the correct node
			// FIXME: use errcode
			return nil, errcode.ErrCode_TODO.Wrap(errors.New("messenger's account key does not match protocol's account key"))
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

		if svc.lcmanager.GetCurrentState() == lifecycle.StateInactive {
			if err := svc.notifmanager.Notify(&notification.Notification{
				Title: notif.GetTitle(),
				Body:  notif.GetBody(),
			}); err != nil {
				opts.Logger.Error("unable to trigger notify", zap.Error(err))
			}
		}

		return nil
	}})

	if opts.PlatformPushToken != nil {
		token, err := db.GetPushDeviceToken(pkStr)
		if err != nil && !errcode.Is(err, errcode.ErrCode_ErrNotFound) {
			return nil, errcode.ErrCode_ErrInternal.Wrap(err)
		} else if errcode.Is(err, errcode.ErrCode_ErrNotFound) || (token.TokenType == opts.PlatformPushToken.TokenType && !bytes.Equal(token.Token, opts.PlatformPushToken.Token)) {
			if _, err := svc.PushSetDeviceToken(ctx, &messengertypes.PushSetDeviceToken_Request{
				Receiver: opts.PlatformPushToken,
			}); err != nil {
				return nil, errcode.ErrCode_ErrInternal.Wrap(err)
			}
		}
	}

	// Subscribe to account group metadata
	svc.accountGroup = icr.GetAccountGroupPk()

	// subscribe to groups
	{
		convs, err := svc.db.GetAllConversations()
		if err != nil {
			return nil, fmt.Errorf("error while fetching conversations from db: %w", err)
		}

		for _, cv := range convs {
			gpkb, err := messengerutil.B64DecodeBytes(cv.GetPublicKey())
			if err != nil {
				return nil, errcode.ErrCode_ErrDeserialization.Wrap(err)
			}

			_, err = svc.protocolClient.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPk: gpkb})
			if err != nil {
				return nil, errcode.ErrCode_TODO.Wrap(err)
			}

			svc.groupsToSubTo[cv.GetPublicKey()] = struct{}{}
		}
	}

	// subscribe to contact groups
	{
		contacts, err := svc.db.GetContactsByState(mt.Contact_OutgoingRequestSent)
		if err != nil {
			return nil, errcode.ErrCode_ErrDBRead.Wrap(fmt.Errorf("error while fetching contacts from db: %w", err))
		}
		for _, c := range contacts {
			gpkb, err := messengerutil.B64DecodeBytes(c.GetConversationPublicKey())
			if err != nil {
				return nil, errcode.ErrCode_ErrDeserialization.Wrap(err)
			}

			_, err = svc.protocolClient.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPk: gpkb})
			if err != nil {
				return nil, errcode.ErrCode_TODO.Wrap(err)
			}

			svc.groupsToSubTo[c.GetConversationPublicKey()] = struct{}{}
		}
	}

	go svc.manageSubscriptions()

	return &svc, nil
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
		return errcode.ErrCode_ErrDeserialization.Wrap(err)
	}

	acc, err := svc.db.GetAccount()
	if err != nil {
		return errcode.ErrCode_ErrDBRead.Wrap(err)
	}

	am, err := mt.AppMessage_TypeSetUserInfo.MarshalPayload(
		messengerutil.TimestampMs(time.Now()),
		"",
		&mt.AppMessage_SetUserInfo{DisplayName: acc.GetDisplayName()},
	)
	if err != nil {
		return errcode.ErrCode_ErrSerialization.Wrap(err)
	}

	sendReply, err := svc.protocolClient.AppMetadataSend(ctx, &protocoltypes.AppMetadataSend_Request{GroupPk: pk, Payload: am})
	if err != nil {
		return errcode.ErrCode_ErrProtocolSend.Wrap(err)
	}

	endSection(nil, "Sent account info", tyber.WithCIDDetail("CID", sendReply.Cid))
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
	svc.subsMutex.Lock()
	defer svc.subsMutex.Unlock()

	if _, ok := svc.groupsToSubTo[messengerutil.B64EncodeBytes(groupPK)]; ok {
		svc.logger.Warn("Already subscribed to group. Don't call subscribeToGroup again.", zap.String("gpk", messengerutil.B64EncodeBytes(groupPK)))
		return nil
	}

	// mark group
	svc.groupsToSubTo[messengerutil.B64EncodeBytes(groupPK)] = struct{}{}

	// subscribe to group if app is active
	if svc.subsCtx != nil {
		if err := svc.subscribeToGroup(svc.subsCtx, svc.ctx, groupPK); err != nil {
			return err
		}
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
	amp, err := mt.AppMessage_TypeAcknowledge.MarshalPayload(0, cid, &mt.AppMessage_Acknowledge{})
	if err != nil {
		return logError("Failed to marshal acknowledge", err)
	}

	cpk, err := messengerutil.B64DecodeBytes(conversationPK)
	if err != nil {
		return logError("Failed to decode conversation public key", err)
	}

	reply, err := svc.protocolClient.AppMessageSend(svc.ctx, &protocoltypes.AppMessageSend_Request{
		GroupPk: cpk,
		Payload: amp,
	})
	if err != nil {
		return logError("Protocol error", err)
	}
	tyber.LogStep(svc.ctx, svc.logger, "Acknowledge sent", tyber.WithCIDDetail("CID", reply.GetCid()))

	return nil
}

type MetaFetcherFromProtocolClient struct {
	client protocoltypes.ProtocolServiceClient
}

func (svc *MetaFetcherFromProtocolClient) OwnMemberAndDevicePKForConversation(ctx context.Context, conversationPK []byte) (member []byte, device []byte, err error) {
	gi, err := svc.client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{GroupPk: conversationPK})
	if err != nil {
		return nil, nil, err
	}

	return gi.MemberPk, gi.DevicePk, nil
}

func (svc *MetaFetcherFromProtocolClient) GroupPKForContact(ctx context.Context, contactPK []byte) ([]byte, error) {
	groupInfoReply, err := svc.client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{ContactPk: contactPK})
	if err != nil {
		return nil, errcode.ErrCode_ErrProtocolGetGroupInfo.Wrap(err)
	}

	return groupInfoReply.GetGroup().GetPublicKey(), nil
}
