package bertymessenger

import (
	"context"
	"io"
	"net"
	"strconv"
	"sync"
	"testing"
	"time"

	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/grpc/test/bufconn"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type TestingServiceOpts struct {
	Logger *zap.Logger
	Client bertyprotocol.Client
	Index  int
}

func TestingService(ctx context.Context, t *testing.T, opts *TestingServiceOpts) (messengertypes.MessengerServiceServer, func()) {
	t.Helper()
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	cleanup := func() {}
	if opts.Client == nil {
		var protocol *bertyprotocol.TestingProtocol
		protocol, cleanup = bertyprotocol.NewTestingProtocol(ctx, t, nil, nil)
		opts.Client = protocol.Client
		// required to avoid "writing on closing socket",
		// should be better to have something blocking instead
		time.Sleep(10 * time.Millisecond)
	}

	zapLogger := zapgorm2.New(opts.Logger.Named("gorm"))
	zapLogger.SetAsDefault()
	db, err := gorm.Open(sqlite.Open("file:memdb"+strconv.Itoa(opts.Index)+"?mode=memory&cache=shared"), &gorm.Config{
		Logger:                                   zapLogger,
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		cleanup()
		require.NoError(t, err)
	}
	cleanup = u.CombineFuncs(
		func() {
			sqlDB, err := db.DB()
			assert.NoError(t, err)
			sqlDB.Close()
		},
		cleanup,
	)

	server, err := New(opts.Client, &Opts{Logger: opts.Logger, DB: db})
	if err != nil {
		cleanup()
		require.NoError(t, err)
	}

	cleanup = u.CombineFuncs(func() { server.Close() }, cleanup)

	return server, cleanup
}

func TestingInfra(ctx context.Context, t *testing.T, amount int, logger *zap.Logger) ([]messengertypes.MessengerServiceClient, []*bertyprotocol.TestingProtocol, func()) {
	t.Helper()
	mocknet := libp2p_mocknet.New(ctx)

	protocols, cleanup := bertyprotocol.NewTestingProtocolWithMockedPeers(ctx, t, &bertyprotocol.TestingOpts{Logger: logger, Mocknet: mocknet}, nil, amount)
	clients := make([]messengertypes.MessengerServiceClient, amount)

	for i, p := range protocols {
		// new messenger service
		svc, cleanupMessengerService := TestingService(ctx, t, &TestingServiceOpts{Logger: logger, Client: p.Client, Index: i})

		// new messenger client
		lis := bufconn.Listen(1024 * 1024)
		s := grpc.NewServer()
		messengertypes.RegisterMessengerServiceServer(s, svc)
		go func() {
			err := s.Serve(lis)
			require.NoError(t, err)
		}()
		conn, err := grpc.DialContext(ctx, "bufnet", grpc.WithContextDialer(mkBufDialer(lis)), grpc.WithInsecure())
		require.NoError(t, err)
		cleanup = u.CombineFuncs(func() {
			require.NoError(t, conn.Close())
			cleanupMessengerService()
		}, cleanup)
		clients[i] = messengertypes.NewMessengerServiceClient(conn)
	}

	require.NoError(t, mocknet.ConnectAllButSelf())

	return clients, protocols, cleanup
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

	// store
	account       *messengertypes.Account
	conversations map[string]*messengertypes.Conversation
	contacts      map[string]*messengertypes.Contact
	members       map[string]*messengertypes.Member
	interactions  map[string]*messengertypes.Interaction
	medias        map[string]*messengertypes.Media
}

func NewTestingAccount(ctx context.Context, t *testing.T, client messengertypes.MessengerServiceClient, protocolClient protocoltypes.ProtocolServiceClient, logger *zap.Logger) *TestingAccount {
	t.Helper()
	ctx, cancel := context.WithCancel(ctx)
	return &TestingAccount{
		ctx:            ctx,
		cancelFunc:     cancel,
		client:         client,
		protocolClient: protocolClient,
		logger:         logger,
		conversations:  make(map[string]*messengertypes.Conversation),
		contacts:       make(map[string]*messengertypes.Contact),
		members:        make(map[string]*messengertypes.Member),
		interactions:   make(map[string]*messengertypes.Interaction),
		medias:         make(map[string]*messengertypes.Media),
	}
}

func (a *TestingAccount) Close() {
	a.cancelFunc()
	a.closedMutex.Lock()
	a.closed = true
	a.closedMutex.Unlock()
}

func (a *TestingAccount) openStream(t *testing.T) {
	t.Helper()
	a.openStreamOnce.Do(func() {
		var err error
		a.stream, err = a.client.EventStream(a.ctx, &messengertypes.EventStream_Request{})
		require.NoError(t, err)
	})
}

func (a *TestingAccount) ProcessWholeStream(t *testing.T) func() {
	ch := make(chan struct{})

	a.openStream(t)
	go func() {
		for {
			rsp, err := a.stream.Recv()
			if err == io.EOF {
				return
			}
			if e, ok := status.FromError(err); ok && e.Code() == codes.Canceled {
				return
			}
			select {
			case _, ok := <-ch:
				if !ok {
					return
				}
			default:
			}
			require.NoError(t, err)
			evt := rsp.GetEvent()
			require.NotNil(t, evt)
			a.processEvent(t, evt)

		}
	}()

	return func() { close(ch) }
}

func (a *TestingAccount) processEvent(t *testing.T, event *messengertypes.StreamEvent) {
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
		t.Log("contact updated in", a.account.GetDisplayName(), ", name:", contact.GetDisplayName(), ", mpk:", contact.GetPublicKey(), ", acid: ", contact.GetAvatarCID())
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
		a.interactions[inte.GetCID()] = inte
	case messengertypes.StreamEvent_TypeMediaUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		media := payload.(*messengertypes.StreamEvent_MediaUpdated).Media
		a.medias[media.GetCID()] = media
	}
}

func (a *TestingAccount) GetClient() messengertypes.MessengerServiceClient {
	return a.client
}

func (a *TestingAccount) DrainInitEvents(t *testing.T) {
	for {
		event := a.TryNextEvent(t, 100*time.Millisecond)
		if event.Type == messengertypes.StreamEvent_TypeListEnded {
			return
		}
	}
}

func (a *TestingAccount) GetStream(t *testing.T) messengertypes.MessengerService_EventStreamClient {
	a.openStream(t)
	return a.stream
}

func (a *TestingAccount) SetName(t *testing.T, name string) {
	t.Helper()
	_, err := a.client.AccountUpdate(a.ctx, &messengertypes.AccountUpdate_Request{DisplayName: name})
	require.NoError(t, err)
}

func (a *TestingAccount) SetNameAndDrainUpdate(t *testing.T, name string) {
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

func (a *TestingAccount) NextEvent(t *testing.T) *messengertypes.StreamEvent {
	t.Helper()
	a.openStream(t)

	entry, err := a.stream.Recv()

	a.closedMutex.RLock()
	if a.closed {
		a.closedMutex.RUnlock()
		return nil
	}
	a.closedMutex.RUnlock()

	require.NotEqual(t, err, io.EOF, "EOF while draining events")
	require.NoError(t, err)

	a.processEvent(t, entry.Event)

	return entry.Event
}

func (a *TestingAccount) GetAccount() *messengertypes.Account {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	return a.account
}

func (a *TestingAccount) GetContact(t *testing.T, pk string) *messengertypes.Contact {
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

func (a *TestingAccount) GetConversation(t *testing.T, pk string) *messengertypes.Conversation {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	conv, ok := a.conversations[pk]
	require.True(t, ok)
	return conv
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

func (a *TestingAccount) GetMedia(t *testing.T, cid string) *messengertypes.Media {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()
	media, ok := a.medias[cid]
	require.True(t, ok)
	return media
}

func (a *TestingAccount) TryNextEvent(t *testing.T, timeout time.Duration) *messengertypes.StreamEvent {
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
