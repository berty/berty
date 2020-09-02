package bertymessenger

import (
	"context"
	"io"
	"strconv"
	"sync"
	"testing"
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"
)

type TestingServiceOpts struct {
	Logger *zap.Logger
	Client bertyprotocol.Client
	Index  int
}

func TestingService(ctx context.Context, t *testing.T, opts *TestingServiceOpts) (MessengerServiceServer, func()) {
	t.Helper()
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	cleanup := func() {}
	if opts.Client == nil {
		var protocol *bertyprotocol.TestingProtocol
		protocol, cleanup = bertyprotocol.NewTestingProtocol(ctx, t, nil)
		opts.Client = protocol.Client
		// required to avoid "writing on closing socket",
		// should be better to have something blocking instead
		time.Sleep(10 * time.Millisecond)
	}

	zapLogger := zapgorm2.New(opts.Logger.Named("gorm"))
	zapLogger.SetAsDefault()
	db, err := gorm.Open(sqlite.Open("file:memdb"+strconv.Itoa(opts.Index)+"?mode=memory&cache=shared"), &gorm.Config{Logger: zapLogger})
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

type TestingAccount struct {
	ctx            context.Context
	logger         *zap.Logger
	client         MessengerServiceClient
	stream         MessengerService_EventStreamClient
	openStreamOnce sync.Once
	closed         bool
	cancelFunc     func()
	closedMutex    sync.RWMutex
	processMutex   sync.Mutex
	tryNextMutex   sync.Mutex

	// store
	account       *Account
	conversations map[string]*Conversation
	contacts      map[string]*Contact
	members       map[string]*Member
}

func NewTestingAccount(ctx context.Context, t *testing.T, client MessengerServiceClient, logger *zap.Logger) *TestingAccount {
	t.Helper()
	ctx, cancel := context.WithCancel(ctx)
	return &TestingAccount{
		ctx:           ctx,
		cancelFunc:    cancel,
		client:        client,
		logger:        logger,
		conversations: make(map[string]*Conversation),
		contacts:      make(map[string]*Contact),
		members:       make(map[string]*Member),
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
		a.stream, err = a.client.EventStream(a.ctx, &EventStream_Request{})
		require.NoError(t, err)
	})

}

func (a *TestingAccount) processEvent(t *testing.T, event *StreamEvent) {
	a.processMutex.Lock()
	defer a.processMutex.Unlock()

	t.Helper()
	switch event.GetType() {
	case StreamEvent_TypeAccountUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		a.account = payload.(*StreamEvent_AccountUpdated).Account
	case StreamEvent_TypeContactUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		contact := payload.(*StreamEvent_ContactUpdated).Contact
		a.contacts[contact.GetPublicKey()] = contact
	case StreamEvent_TypeConversationUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		conversation := payload.(*StreamEvent_ConversationUpdated).Conversation
		a.conversations[conversation.GetPublicKey()] = conversation
	case StreamEvent_TypeMemberUpdated:
		payload, err := event.UnmarshalPayload()
		require.NoError(t, err)
		member := payload.(*StreamEvent_MemberUpdated).Member
		a.members[member.GetPublicKey()] = member
		t.Log("member updated in", a.GetAccount().GetDisplayName(), ", value:", member.GetDisplayName(), ", mpk:", member.GetPublicKey())
	}
}

func (a *TestingAccount) GetClient() MessengerServiceClient {
	return a.client
}

func (a *TestingAccount) DrainInitEvents(t *testing.T) {
	for {
		event := a.TryNextEvent(t, 100*time.Millisecond)
		if event.Type == StreamEvent_TypeListEnd {
			return
		}
	}
}

func (a *TestingAccount) GetStream(t *testing.T) MessengerService_EventStreamClient {
	a.openStream(t)
	return a.stream
}

func (a *TestingAccount) SetName(t *testing.T, name string) {
	t.Helper()
	_, err := a.client.AccountUpdate(a.ctx, &AccountUpdate_Request{DisplayName: name})
	require.NoError(t, err)
}

func (a *TestingAccount) SetNameAndDrainUpdate(t *testing.T, name string) {
	t.Helper()
	a.SetName(t, name)
	event := a.NextEvent(t)
	require.Equal(t, event.Type, StreamEvent_TypeAccountUpdated)
	payload, err := event.UnmarshalPayload()
	require.NoError(t, err)
	account := payload.(*StreamEvent_AccountUpdated).Account
	require.Equal(t, a.GetAccount(), account)
	require.Equal(t, Account_Ready, account.State)
	require.Equal(t, name, account.DisplayName)
}

func (a *TestingAccount) NextEvent(t *testing.T) *StreamEvent {
	t.Helper()
	a.openStream(t)

	entry, err := a.stream.Recv()

	a.closedMutex.RLock()
	if a.closed {
		return nil
	}
	a.closedMutex.RUnlock()

	require.NotEqual(t, err, io.EOF, "EOF while draining events")
	require.NoError(t, err)

	a.processEvent(t, entry.Event)

	return entry.Event
}

func (a *TestingAccount) GetAccount() *Account {
	return a.account
}

func (a *TestingAccount) TryNextEvent(t *testing.T, timeout time.Duration) *StreamEvent {
	t.Helper()
	a.openStream(t)

	a.tryNextMutex.Lock()
	defer a.tryNextMutex.Unlock()

	done := make(chan struct{})
	var event *StreamEvent
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
