package bertymessenger

import (
	"context"
	"fmt"
	"io"
	"net"
	"strconv"
	"sync"
	"testing"
	"time"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/grpc/test/bufconn"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"
	"moul.io/zapring"

	sqlite "berty.tech/berty/v2/go/internal/gorm-sqlcipher"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/v2"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
	"berty.tech/weshnet/v2/pkg/testutil"
)

type TestingServiceOpts struct {
	Logger      *zap.Logger
	Client      weshnet.ServiceClient
	DB          *gorm.DB
	Index       int
	Ring        *zapring.Core
	LogFilePath string
	PushSK      *[32]byte
}

type TestingService struct {
	Logger  *zap.Logger
	Service Service
	Client  ServiceClient
}

func NewTestingService(ctx context.Context, t testing.TB, opts *TestingServiceOpts) (*TestingService, func()) {
	t.Helper()
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	cleanup := func() {}
	if opts.Client == nil {
		var protocol *weshnet.TestingProtocol
		protocol, cleanup = weshnet.NewTestingProtocol(ctx, t, &weshnet.TestingOpts{Logger: opts.Logger}, nil)
		opts.Client = protocol.Client
		// required to avoid "writing on closing socket",
		// should be better to have something blocking instead
		time.Sleep(10 * time.Millisecond)
	}

	zapLogger := zapgorm2.New(opts.Logger.Named("gorm"))
	zapLogger.SetAsDefault()

	if opts.DB == nil {
		db, err := gorm.Open(sqlite.Open("file:memdb"+strconv.Itoa(opts.Index)+"?mode=memory&cache=shared"), &gorm.Config{
			Logger:                                   zapLogger,
			DisableForeignKeyConstraintWhenMigrating: true,
		})
		if err != nil {
			cleanup()
			assert.NoError(t, err)
		}
		opts.DB = db
		cleanup = u.CombineFuncs(
			func() {
				sqlDB, err := db.DB()
				assert.NoError(t, err)
				sqlDB.Close()
			},
			cleanup,
		)
	}

	service, err := New(opts.Client, &Opts{
		Logger:           opts.Logger,
		DB:               opts.DB,
		Ring:             opts.Ring,
		LogFilePath:      opts.LogFilePath,
		GRPCInsecureMode: true,
		PushKey:          opts.PushSK,
	})
	if err != nil {
		cleanup()
		require.NoError(t, err)
	}

	// setup client
	grpcLogger := opts.Logger.Named("grpc")
	zapOpts := []grpc_zap.Option{}

	serverOpts := []grpc.ServerOption{
		grpc_middleware.WithUnaryServerChain(
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
		),
		grpc_middleware.WithStreamServerChain(
			grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
		),
	}

	clientOpts := []grpc.DialOption{
		grpc.WithChainUnaryInterceptor(),
		grpc.WithChainStreamInterceptor(),
	}

	server := grpc.NewServer(serverOpts...)
	client, cleanupClient := TestingClientFromServer(ctx, t, server, service, clientOpts...)

	ts := &TestingService{
		Service: service,
		Client:  client,
		Logger:  opts.Logger,
	}

	cleanup = u.CombineFuncs(func() {
		cleanupClient()
		service.Close()
	}, cleanup)

	return ts, cleanup
}

func TestingClientFromServer(ctx context.Context, t testing.TB, s *grpc.Server, svc Service, dialOpts ...grpc.DialOption) (client ServiceClient, cleanup func()) {
	t.Helper()

	var err error

	client, err = NewClientFromService(ctx, s, svc, dialOpts...)
	require.NoError(t, err)
	cleanup = func() {
		client.Close()
	}

	return
}

func TestingInfra(ctx context.Context, t testing.TB, amount int, logger *zap.Logger) ([]*TestingService, []*weshnet.TestingProtocol, func()) {
	t.Helper()
	mocknet := mocknet.New()
	t.Cleanup(func() { mocknet.Close() })

	protocols, cleanup := weshnet.NewTestingProtocolWithMockedPeers(ctx, t, &weshnet.TestingOpts{Logger: logger, Mocknet: mocknet}, nil, amount)
	tss := make([]*TestingService, amount)

	// setup client
	for i, p := range protocols {
		// new messenger service
		ts, cleanupMessengerService := NewTestingService(ctx, t, &TestingServiceOpts{Logger: logger, Client: p.Client, Index: i})

		cleanup = u.CombineFuncs(func() {
			cleanupMessengerService()
		}, cleanup)
		tss[i] = ts
	}

	require.NoError(t, mocknet.ConnectAllButSelf())

	return tss, protocols, cleanup
}

func Testing1To1ProcessWholeStream(t testing.TB) (context.Context, []*TestingAccount, *zap.Logger, func()) {
	t.Helper()

	// PREPARE
	logger, cleanup := testutil.Logger(t)
	clean := cleanup

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	clean = u.CombineFuncs(cancel, clean)

	const l = 2

	clients, protocols, cleanup := TestingInfra(ctx, t, l, logger)
	clean = u.CombineFuncs(cleanup, clean)

	nodes := make([]*TestingAccount, l)
	for i := range nodes {
		nodes[i] = NewTestingAccount(ctx, t, clients[i].Client, protocols[i].Client, logger)
		nodes[i].SetName(t, fmt.Sprintf("node-%d", i))
		close := nodes[i].ProcessWholeStream(t)
		clean = u.CombineFuncs(close, clean)
	}

	// @FIXME: link should already be ready at this point

	friend := nodes[1]
	require.Eventually(t, func() bool {
		return friend.GetAccount().GetLink() != ""
	}, time.Second*5, time.Millisecond*100)

	user := nodes[0]
	require.Eventually(t, func() bool {
		fmt.Println("account", user.GetAccount().GetLink())
		return user.GetAccount().GetLink() != ""
	}, time.Second*5, time.Millisecond*100)

	userPK := user.GetAccount().GetPublicKey()

	subctx, cancel := context.WithCancel(ctx)
	defer cancel()

	cl, err := friend.client.EventStream(subctx, &messengertypes.EventStream_Request{})
	require.NoError(t, err)

	_, err = user.client.ContactRequest(ctx, &messengertypes.ContactRequest_Request{Link: friend.GetAccount().GetLink()})
	require.NoError(t, err)
	logger.Info("waiting for request propagation")

	// wait to receive contact request
	for {
		evt, err := cl.Recv()
		require.NoError(t, err)

		if evt.GetEvent().GetType() == messengertypes.StreamEvent_TypeNotified {
			var notif messengertypes.StreamEvent_Notified
			err := proto.Unmarshal(evt.GetEvent().Payload, &notif)
			require.NoError(t, err)

			if notif.GetType() == messengertypes.StreamEvent_Notified_TypeContactRequestReceived {
				break
			}
		}
	}

	_, err = friend.client.ContactAccept(ctx, &messengertypes.ContactAccept_Request{PublicKey: userPK})
	require.NoError(t, err)

	logger.Info("waiting for contact settlement")
	for {
		evt, err := cl.Recv()
		require.NoError(t, err)
		if evt.GetEvent().GetType() == messengertypes.StreamEvent_TypeDeviceUpdated {
			break
		}
	}

	return ctx, nodes, logger, clean
}

func mkBufDialer(l *bufconn.Listener) func(context.Context, string) (net.Conn, error) {
	return func(context.Context, string) (net.Conn, error) {
		return l.Dial()
	}
}

type TestingAccount struct {
	ctx            context.Context
	logger         *zap.Logger
	client         messengertypes.MessengerServiceClient
	protocolClient protocoltypes.ProtocolServiceClient
	stream         messengertypes.MessengerService_EventStreamClient
	openStreamOnce sync.Once
	closed         bool
	cancelFunc     func()
	closedMutex    sync.RWMutex
	processMutex   sync.Mutex
	tryNextMutex   sync.Mutex
	cstream        <-chan *RecvEvent

	// store
	account       *messengertypes.Account
	conversations map[string]*messengertypes.Conversation
	contacts      map[string]*messengertypes.Contact
	members       map[string]*messengertypes.Member
	interactions  map[string]*messengertypes.Interaction
}

type RecvEvent struct {
	e   *messengertypes.EventStream_Reply
	err error
}

func NewTestingAccount(ctx context.Context, t testing.TB, client messengertypes.MessengerServiceClient, protocolClient protocoltypes.ProtocolServiceClient, logger *zap.Logger) *TestingAccount {
	t.Helper()
	ctx, cancel := context.WithCancel(ctx)
	return &TestingAccount{
		ctx:            ctx,
		cancelFunc:     cancel,
		client:         client,
		protocolClient: protocolClient,
		logger:         logger,
		cstream:        make(chan *RecvEvent),
		conversations:  make(map[string]*messengertypes.Conversation),
		contacts:       make(map[string]*messengertypes.Contact),
		members:        make(map[string]*messengertypes.Member),
		interactions:   make(map[string]*messengertypes.Interaction),
	}
}

func (a *TestingAccount) Close() {
	a.cancelFunc()
	a.closedMutex.Lock()
	a.closed = true
	a.closedMutex.Unlock()
}

func (a *TestingAccount) openStream(t testing.TB) {
	t.Helper()
	a.openStreamOnce.Do(func() {
		var err error
		a.stream, err = a.client.EventStream(a.ctx, &messengertypes.EventStream_Request{})
		require.NoError(t, err)

		a.cstream = monitorEventStream(t, a.stream, time.Second*10)
	})
}

func (a *TestingAccount) ProcessWholeStream(t testing.TB) func() {
	ch := make(chan struct{})

	a.openStream(t)
	go func() {
		for {
			rsp := <-a.cstream

			if rsp.err == io.EOF {
				return
			}
			if e, ok := status.FromError(rsp.err); ok && e.Code() == codes.Canceled {
				return
			}
			select {
			case _, ok := <-ch:
				if !ok {
					return
				}
			default:
			}
			require.NoError(t, rsp.err)
			evt := rsp.e.GetEvent()
			require.NotNil(t, evt)
			a.processEvent(t, evt)
		}
	}()

	return func() { close(ch) }
}

func (a *TestingAccount) processEvent(t testing.TB, event *messengertypes.StreamEvent) {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()

	t.Helper()
	switch event.GetType() {
	case messengertypes.StreamEvent_TypeAccountUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		a.account = payload.(*messengertypes.StreamEvent_AccountUpdated).Account
	case messengertypes.StreamEvent_TypeContactUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		contact := payload.(*messengertypes.StreamEvent_ContactUpdated).Contact
		a.contacts[contact.GetPublicKey()] = contact
		t.Log("contact updated in", a.account.GetDisplayName(), ", name:", contact.GetDisplayName(), ", mpk:", contact.GetPublicKey())
	case messengertypes.StreamEvent_TypeConversationUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*messengertypes.StreamEvent_ConversationUpdated).Conversation
		a.conversations[conversation.GetPublicKey()] = conversation
	case messengertypes.StreamEvent_TypeMemberUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		member := payload.(*messengertypes.StreamEvent_MemberUpdated).Member
		a.members[member.GetPublicKey()] = member
		t.Log("member updated in", a.account.GetDisplayName(), ", value:", member.GetDisplayName(), ", mpk:", member.GetPublicKey())
	case messengertypes.StreamEvent_TypeInteractionUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		inte := payload.(*messengertypes.StreamEvent_InteractionUpdated).Interaction
		a.interactions[inte.GetCid()] = inte
	}
}

func (a *TestingAccount) GetClient() messengertypes.MessengerServiceClient {
	return a.client
}

func (a *TestingAccount) DrainInitEvents(t testing.TB) {
	for {
		event := a.TryNextEvent(t, 100*time.Millisecond)
		if event == nil {
			continue
		}

		if event.Type == messengertypes.StreamEvent_TypeListEnded {
			return
		}
	}
}

func (a *TestingAccount) GetStream(t testing.TB) <-chan *RecvEvent {
	a.openStream(t)
	return a.cstream
}

func (a *TestingAccount) SetName(t testing.TB, name string) {
	t.Helper()
	_, err := a.client.AccountUpdate(a.ctx, &messengertypes.AccountUpdate_Request{DisplayName: name})
	require.NoError(t, err)
}

func (a *TestingAccount) SetNameAndDrainUpdate(t testing.TB, name string) {
	t.Helper()
	a.SetName(t, name)
	event := a.NextEvent(t)
	require.Equal(t, event.Type, messengertypes.StreamEvent_TypeAccountUpdated)
	payload, err := event.UnmarshalPayload()
	require.NoError(t, err)
	account := payload.(*messengertypes.StreamEvent_AccountUpdated).Account
	require.Equal(t, a.GetAccount(), account)
	require.Equal(t, name, account.DisplayName)
}

func (a *TestingAccount) NextEvent(t testing.TB) *messengertypes.StreamEvent {
	t.Helper()
	a.openStream(t)

	entry := <-a.cstream

	a.closedMutex.RLock()
	if a.closed {
		a.closedMutex.RUnlock()
		return nil
	}
	a.closedMutex.RUnlock()

	require.NotEqual(t, entry.err, io.EOF, "EOF while draining events")
	require.NoError(t, entry.err)

	a.processEvent(t, entry.e.Event)

	return entry.e.Event
}

func (a *TestingAccount) GetAccount() *messengertypes.Account {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	return a.account
}

func (a *TestingAccount) GetContact(t testing.TB, pk string) *messengertypes.Contact {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	c, ok := a.contacts[pk]
	require.True(t, ok)
	return c
}

func (a *TestingAccount) GetAllContacts() map[string]*messengertypes.Contact {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	newMap := make(map[string]*messengertypes.Contact)
	for k, v := range a.contacts {
		newMap[k] = v
	}
	return newMap
}

func (a *TestingAccount) GetConversation(t testing.TB, pk string) *messengertypes.Conversation {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	conv, ok := a.conversations[pk]
	require.True(t, ok)
	return conv
}

func (a *TestingAccount) GetMember(t testing.TB, pk string) *messengertypes.Member {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	member, ok := a.members[pk]
	require.True(t, ok)
	return member
}

func (a *TestingAccount) GetInteraction(t testing.TB, cid string) *messengertypes.Interaction {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	interaction, ok := a.interactions[cid]
	require.True(t, ok)
	return interaction
}

func (a *TestingAccount) GetAllConversations() map[string]*messengertypes.Conversation {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	newMap := make(map[string]*messengertypes.Conversation)
	for k, v := range a.conversations {
		newMap[k] = v
	}
	return newMap
}

func (a *TestingAccount) TryNextEvent(t testing.TB, timeout time.Duration) *messengertypes.StreamEvent {
	t.Helper()
	a.openStream(t)

	a.tryNextMutex.Lock()
	defer a.tryNextMutex.Unlock()

	done := make(chan struct{})
	var event *messengertypes.StreamEvent
	go func() {
		event = a.NextEvent(t)
		close(done)
	}()
	select {
	case <-done:
		return event
	case <-time.After(timeout):
	}
	return nil
}

func monitorEventStream(t testing.TB, stream messengertypes.MessengerService_EventStreamClient, expire time.Duration) <-chan *RecvEvent {
	t.Helper()

	cstream := make(chan *RecvEvent)
	go func() {
		defer close(cstream)

		var err error
		for err == nil {
			var e *messengertypes.EventStream_Reply

			e, err = stream.Recv()
			evt := &RecvEvent{e, err}

			select {
			case cstream <- evt:
			case <-time.After(expire):
				err := fmt.Sprintf("event not consumed after %f ms", expire.Seconds())
				panic(err)
			}
		}
	}()

	return cstream
}
