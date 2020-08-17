package bertymessenger

import (
	"context"
	"fmt"
	"io"
	"strconv"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"github.com/gogo/protobuf/proto"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/test/bufconn"
	"moul.io/u"
)

const timeout = time.Second * 5

func TestStreamThenCreateConv(t *testing.T) {
	ctx, cancelCtx := context.WithTimeout(context.Background(), timeout)
	defer cancelCtx()
	l := testutil.Logger(t)
	svc, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: l})
	defer cleanup()

	// new client
	lis := bufconn.Listen(1024 * 1024)
	s := grpc.NewServer()
	RegisterMessengerServiceServer(s, svc)
	go func() {
		err := s.Serve(lis)
		require.NoError(t, err)
	}()
	conn, err := grpc.DialContext(ctx, "bufnet", grpc.WithContextDialer(mkBufDialer(lis)), grpc.WithInsecure())
	require.NoError(t, err)
	defer conn.Close()
	client := NewMessengerServiceClient(conn)

	res, err := client.EventStream(ctx, &EventStream_Request{})
	require.NoError(t, err)

	dn := "Tasty"

	ccrep, err := client.ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: dn})
	require.NoError(t, err)
	require.NotEmpty(t, ccrep.GetPublicKey())

	var c *Conversation
	for {
		rep, err := res.Recv()
		requireNoEOF(t, err, "while waiting for conversation update after creating it")
		require.NoError(t, err)
		ev := rep.GetEvent()
		if ev.GetType() == StreamEvent_TypeConversationUpdated {
			var p StreamEvent_ConversationUpdated
			err := proto.Unmarshal(ev.GetPayload(), &p)
			require.NoError(t, err)
			nc := p.GetConversation()
			l.Debug("got conv", zap.String("display_name", nc.GetDisplayName()))
			require.NotNil(t, nc)
			require.Equal(t, nc.GetPublicKey(), ccrep.GetPublicKey())
			if nc.GetDisplayName() != "" {
				c = nc
				break
			}
		}
	}

	require.NotNil(t, c)
	require.Equal(t, ccrep.GetPublicKey(), c.GetPublicKey())
	require.Equal(t, dn, c.GetDisplayName())

	cancelCtx()
	for err = nil; err == nil; {
		_, err = res.Recv()
	}
	require.True(t, grpcIsCanceled(err))
}

func TestContactRequest(t *testing.T) {
	ctx, cancelCtx := context.WithTimeout(context.Background(), timeout)
	defer cancelCtx()
	l := testutil.Logger(t)
	svc, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: l})
	defer cleanup()

	// new client
	lis := bufconn.Listen(1024 * 1024)
	s := grpc.NewServer()
	RegisterMessengerServiceServer(s, svc)
	go func() {
		err := s.Serve(lis)
		require.NoError(t, err)
	}()
	conn, err := grpc.DialContext(ctx, "bufnet", grpc.WithContextDialer(mkBufDialer(lis)), grpc.WithInsecure())
	require.NoError(t, err)
	defer conn.Close()
	client := NewMessengerServiceClient(conn)

	stream, err := client.EventStream(ctx, &EventStream_Request{})
	require.NoError(t, err)

	contactName := "zxxma-iphone"
	link := "berty://id/#key=CiAdJso3YvHGxjkU1%252FXfBpMe00RFB0NZtPuEKRPtyUuQFBIg15Bbyrz0tdy8Su6DDcNpKBguhNuZsF1%252BjTzpCaN6qfA%253D&name=" + contactName
	ownMetadata := []byte("bar")

	metadata, err := proto.Marshal(&ContactMetadata{contactName})
	require.NoError(t, err)
	pdlRep, err := client.ParseDeepLink(ctx, &ParseDeepLink_Request{Link: link})
	require.NoError(t, err)
	_, err = client.SendContactRequest(ctx, &SendContactRequest_Request{BertyID: pdlRep.BertyID, Metadata: metadata, OwnMetadata: ownMetadata})
	require.NoError(t, err)

	var c *Contact
	for {
		rep, err := stream.Recv()
		requireNoEOF(t, err, "while waiting for contact update after sending a request")
		require.NoError(t, err)
		ev := rep.GetEvent()
		if ev.GetType() == StreamEvent_TypeContactUpdated {
			var p StreamEvent_ContactUpdated
			err := proto.Unmarshal(ev.GetPayload(), &p)
			require.NoError(t, err)
			c = p.GetContact()
			break
		}
	}
	require.NotNil(t, c)
	require.Equal(t, contactName, c.GetDisplayName())
	require.Equal(t, c.GetState(), Contact_OutgoingRequestEnqueued)

	cancelCtx()
	for err = nil; err == nil; {
		_, err = stream.Recv()
	}
	require.True(t, grpcIsCanceled(err))
}

func testingInfra(ctx context.Context, t *testing.T, amount int, l *zap.Logger) ([]MessengerServiceClient, func()) {
	if l == nil {
		l = testutil.Logger(t)
	}

	mocknet := libp2p_mocknet.New(ctx)

	protocols, cleanup := bertyprotocol.NewTestingProtocolWithMockedPeers(ctx, t, &bertyprotocol.TestingOpts{Logger: l, Mocknet: mocknet}, amount)
	clients := make([]MessengerServiceClient, amount)

	for i, p := range protocols {
		// new messenger service
		svc, cleanupMessengerService := TestingService(ctx, t, &TestingServiceOpts{Logger: l, Client: p.Client, Index: i})

		// new messenger client
		lis := bufconn.Listen(1024 * 1024)
		s := grpc.NewServer()
		RegisterMessengerServiceServer(s, svc)
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
		clients[i] = NewMessengerServiceClient(conn)
	}

	require.NoError(t, mocknet.ConnectAllButSelf())

	return clients, cleanup
}

func TestCreateConvThenStream(t *testing.T) {
	ctx, cancelCtx := context.WithTimeout(context.Background(), timeout)
	defer cancelCtx()
	l := testutil.Logger(t)
	svc, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: l})
	defer cleanup()

	// new client
	lis := bufconn.Listen(1024 * 1024)
	s := grpc.NewServer()
	RegisterMessengerServiceServer(s, svc)
	go func() {
		err := s.Serve(lis)
		require.NoError(t, err)
	}()
	conn, err := grpc.DialContext(ctx, "bufnet", grpc.WithContextDialer(mkBufDialer(lis)), grpc.WithInsecure())
	require.NoError(t, err)
	defer conn.Close()
	client := NewMessengerServiceClient(conn)

	dn := "Tasty"

	ccrep, err := client.ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: dn})
	require.NoError(t, err)
	require.NotEmpty(t, ccrep.GetPublicKey())

	strm, err := client.EventStream(ctx, &EventStream_Request{})
	require.NoError(t, err)

	var c *Conversation
	for {
		rep, err := strm.Recv()
		requireNoEOF(t, err, "while waiting for conversation update after creating it")
		require.NoError(t, err)
		ev := rep.GetEvent()
		if ev.GetType() == StreamEvent_TypeConversationUpdated {
			var p StreamEvent_ConversationUpdated
			err := proto.Unmarshal(ev.GetPayload(), &p)
			require.NoError(t, err)
			nc := p.GetConversation()
			require.NotNil(t, nc)
			require.Equal(t, nc.GetPublicKey(), ccrep.GetPublicKey())
			if nc.GetDisplayName() != "" {
				c = nc
				break
			}
		}
	}

	require.NotNil(t, c)
	require.Equal(t, ccrep.GetPublicKey(), c.GetPublicKey())
	require.Equal(t, dn, c.GetDisplayName())

	cancelCtx()
	for err = nil; err == nil; {
		_, err = strm.Recv()
	}
	require.True(t, grpcIsCanceled(err))
}

func Test1To1Exchange(t *testing.T) {
	testutil.SkipSlow(t)
	testutil.SkipUnstable(t)

	l := testutil.Logger(t)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	clients, cleanup := testingInfra(ctx, t, 2, l)
	defer cleanup()

	// Init accounts

	aname := "Alice"
	alice := clients[0]
	_, err := alice.AccountUpdate(ctx, &AccountUpdate_Request{DisplayName: aname})
	require.NoError(t, err)

	astrm, err := alice.EventStream(ctx, &EventStream_Request{})
	require.NoError(t, err)

	var alink string
	for alink == "" {
		esr, err := astrm.Recv()
		requireNoEOF(t, err, "while waiting for account update after starting alice's events stream")
		require.NoError(t, err)
		if esr.GetEvent().GetType() == StreamEvent_TypeAccountUpdated {
			var cu StreamEvent_AccountUpdated
			err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
			require.NoError(t, err)
			acc := cu.GetAccount()
			require.Equal(t, aname, acc.GetDisplayName())
			alink = acc.GetLink()
		}
	}

	bname := "Bob"
	bob := clients[1]
	_, err = bob.AccountUpdate(ctx, &AccountUpdate_Request{DisplayName: bname})
	require.NoError(t, err)

	bstrm, err := bob.EventStream(ctx, &EventStream_Request{})
	require.NoError(t, err)

	for {
		esr, err := bstrm.Recv()
		requireNoEOF(t, err, "while waiting for account update after starting bob's events stream")
		require.NoError(t, err)
		if esr.GetEvent().GetType() == StreamEvent_TypeAccountUpdated {
			var cu StreamEvent_AccountUpdated
			err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
			require.NoError(t, err)
			acc := cu.GetAccount()
			require.Equal(t, bname, acc.GetDisplayName())
			break
		}
	}

	// Request contact

	_, err = bob.ContactRequest(ctx, &ContactRequest_Request{Link: alink})
	require.NoError(t, err)

	enqueued := false
	for {
		esr, err := bstrm.Recv()
		requireNoEOF(t, err, "while waiting for outgoing contact request updates (enqueued: %t)", enqueued)
		require.NoError(t, err)
		if esr.GetEvent().GetType() == StreamEvent_TypeContactUpdated {
			var cu StreamEvent_ContactUpdated
			err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
			require.NoError(t, err)
			c := cu.GetContact()

			require.Equal(t, aname, c.GetDisplayName())

			if !enqueued && c.GetState() == Contact_OutgoingRequestEnqueued {
				enqueued = true
			} else if enqueued && c.GetState() == Contact_OutgoingRequestSent {
				break
			}
		}
	}

	var bc *Contact
	for bc == nil {
		esr, err := astrm.Recv()
		requireNoEOF(t, err, "while waiting for incoming contact request update")
		require.NoError(t, err)
		if esr.GetEvent().GetType() == StreamEvent_TypeContactUpdated {
			var cu StreamEvent_ContactUpdated
			err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
			require.NoError(t, err)
			c := cu.GetContact()

			require.Equal(t, bname, c.GetDisplayName())

			if c.GetState() == Contact_IncomingRequest {
				bc = c
			}
		}
	}

	bpk := bc.GetPublicKey()
	alice.ContactAccept(ctx, &ContactAccept_Request{PublicKey: bpk})

	var gpk string

	for {
		esr, err := astrm.Recv()
		requireNoEOF(t, err, "while waiting for contact established in requested node")
		require.NoError(t, err)
		if esr.GetEvent().GetType() == StreamEvent_TypeContactUpdated {
			var cu StreamEvent_ContactUpdated
			err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
			require.NoError(t, err)
			c := cu.GetContact()

			require.Equal(t, bname, c.GetDisplayName())

			if c.GetState() == Contact_Established {
				gpk = c.GetConversationPublicKey()
				require.NotEmpty(t, gpk)
				break
			}
		}
	}

	for {
		esr, err := bstrm.Recv()
		requireNoEOF(t, err, "while waiting for contact established in requester node")
		require.NoError(t, err)
		if esr.GetEvent().GetType() == StreamEvent_TypeContactUpdated {
			var cu StreamEvent_ContactUpdated
			err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
			require.NoError(t, err)
			c := cu.GetContact()

			require.Equal(t, aname, c.GetDisplayName())

			if c.GetState() == Contact_Established {
				require.Equal(t, c.GetConversationPublicKey(), gpk)
				break
			}
		}
	}

	// Exchange messages

	testMessage(ctx, t, l, "Hello Bob!", gpk, alice, astrm, bstrm)
	testMessage(ctx, t, l, "Hello Alice!", gpk, bob, bstrm, astrm)
}

func testMessage(ctx context.Context, t *testing.T, l *zap.Logger, msg string, gpk string, sender MessengerServiceClient, senderStream MessengerService_EventStreamClient, receiverStream MessengerService_EventStreamClient) {
	um, err := proto.Marshal(&AppMessage_UserMessage{Body: msg})
	require.NoError(t, err)
	ir := Interact_Request{Type: AppMessage_TypeUserMessage, Payload: um, ConversationPublicKey: gpk}
	_, err = sender.Interact(ctx, &ir)
	require.NoError(t, err)

	var cid string
	var gotMsg, gotAck bool
	for !(gotAck && gotMsg) {
		esr, err := receiverStream.Recv()
		requireNoEOF(t, err, "while waiting for msg or ack in receiver node (gotMsg: %t, gotAck: %t)", gotMsg, gotAck)
		require.NoError(t, err)

		evt := esr.GetEvent()
		if evt.GetType() == StreamEvent_TypeInteractionUpdated {
			var cu StreamEvent_InteractionUpdated
			err := proto.Unmarshal(evt.GetPayload(), &cu)
			require.NoError(t, err)

			inte := cu.GetInteraction()
			if inte.GetType() == AppMessage_TypeUserMessage && inte.GetConversationPublicKey() == gpk {
				var um AppMessage_UserMessage
				err := proto.Unmarshal(inte.GetPayload(), &um)
				require.NoError(t, err)

				if um.GetBody() == msg {
					require.False(t, gotAck)
					require.False(t, inte.GetIsMe())
					cid = inte.GetCid()
					gotMsg = true
				}
			} else if inte.GetType() == AppMessage_TypeAcknowledge && inte.GetConversationPublicKey() == gpk {
				var ack AppMessage_Acknowledge
				err := proto.Unmarshal(inte.GetPayload(), &ack)
				require.NoError(t, err)

				if ack.GetTarget() == cid {
					require.True(t, gotMsg)
					require.True(t, inte.GetIsMe())
					gotAck = true
				}
			}
		}
	}

	gotAck = false
	gotMsg = false
	for !(gotAck && gotMsg) {
		esr, err := senderStream.Recv()
		requireNoEOF(t, err, "while waiting for msg or ack in sender node (gotMsg: %t, gotAck: %t)", gotMsg, gotAck)
		require.NoError(t, err)

		evt := esr.GetEvent()
		if evt.GetType() == StreamEvent_TypeInteractionUpdated {
			var cu StreamEvent_InteractionUpdated
			err := proto.Unmarshal(evt.GetPayload(), &cu)
			require.NoError(t, err)

			inte := cu.GetInteraction()
			if inte.GetType() == AppMessage_TypeUserMessage && inte.GetConversationPublicKey() == gpk {
				var um AppMessage_UserMessage
				err := proto.Unmarshal(inte.GetPayload(), &um)
				require.NoError(t, err)

				if inte.GetCid() == cid {
					require.False(t, gotAck)
					require.Equal(t, msg, um.GetBody())
					require.True(t, inte.GetIsMe())
					gotMsg = true
				}
			} else if inte.GetType() == AppMessage_TypeAcknowledge && inte.GetConversationPublicKey() == gpk {
				var ack AppMessage_Acknowledge
				err := proto.Unmarshal(inte.GetPayload(), &ack)
				require.NoError(t, err)

				if ack.GetTarget() == cid {
					require.True(t, gotMsg)
					require.False(t, inte.GetIsMe())
					gotAck = true
				}
			}
		}
	}
}

func requireNoEOF(t *testing.T, err error, format string, a ...interface{}) {
	t.Helper()
	require.NotEqual(t, err, io.EOF, fmt.Sprintf("EOF "+format, a...))
}

func Test3PeersExchange(t *testing.T) {
	testutil.SkipSlow(t)
	testutil.SkipUnstable(t)

	amount := 3
	require.Greater(t, amount, 1)

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	l := testutil.Logger(t)
	clients, cleanup := testingInfra(ctx, t, amount, l)
	defer cleanup()

	creator := clients[0]

	name := "My Group"

	ccr, err := creator.ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: name})
	require.NoError(t, err)

	creatorStrm, err := creator.EventStream(ctx, &EventStream_Request{})
	require.NoError(t, err)

	gpk := ccr.GetPublicKey()

	// Create conv

	var link string

	for link == "" {
		esr, err := creatorStrm.Recv()
		requireNoEOF(t, err, "while waiting for conversation update after creating it")
		require.NoError(t, err)
		evt := esr.GetEvent()
		if evt.GetType() == StreamEvent_TypeConversationUpdated {
			var cu StreamEvent_ConversationUpdated
			err := proto.Unmarshal(evt.GetPayload(), &cu)
			require.NoError(t, err)

			conv := cu.GetConversation()
			if conv.GetPublicKey() == gpk {
				require.Equal(t, name, conv.GetDisplayName())
				link = conv.GetLink()
			}
		}
	}
	l.Debug("created conv", zap.String("pk", gpk))

	// Join conv in other nodes

	streams := make([]MessengerService_EventStreamClient, amount)
	streams[0] = creatorStrm
	for i := 1; i < amount; i++ {
		cl := clients[i]

		// also test while opening stream after
		streams[i], err = cl.EventStream(ctx, &EventStream_Request{})
		require.NoError(t, err)

		_, err := cl.ConversationJoin(ctx, &ConversationJoin_Request{Link: link})
		require.NoError(t, err)

		for {
			esr, err := streams[i].Recv()
			requireNoEOF(t, err, "while waiting for conversation in member node %d", i)
			require.NoError(t, err)
			evt := esr.GetEvent()
			if evt.GetType() == StreamEvent_TypeConversationUpdated {
				var cu StreamEvent_ConversationUpdated
				err := proto.Unmarshal(evt.GetPayload(), &cu)
				require.NoError(t, err)

				conv := cu.GetConversation()
				pk := conv.GetPublicKey()
				l.Debug("received conv", zap.String("pk", pk), zap.Int("index", i))
				if pk == gpk {
					require.Equal(t, name, conv.GetDisplayName())
					require.Equal(t, link, conv.GetLink())
					l.Debug("found correct conv", zap.String("pk", pk), zap.Int("index", i))
					break
				}
			}
		}
	}

	// FIXME: really wait for everyone to know everyone (via MemberUpdated)
	time.Sleep(time.Second * 20)

	// TODO: check that members names are propagated

	// Exchange messages

	for i := 0; i < amount; i++ {
		sender := clients[i]
		senderStrm := streams[i]
		strms := append(streams[0:i:i], streams[i+1:]...)
		testMultiMessage(ctx, t, l, "Hello Group! "+strconv.Itoa(i), gpk, sender, senderStrm, strms)
	}
}

func testMultiMessage(ctx context.Context, t *testing.T, l *zap.Logger, msg string, gpk string, sender MessengerServiceClient, senderStream MessengerService_EventStreamClient, receivers []MessengerService_EventStreamClient) {
	um, err := proto.Marshal(&AppMessage_UserMessage{Body: msg})
	require.NoError(t, err)
	ir := Interact_Request{Type: AppMessage_TypeUserMessage, Payload: um, ConversationPublicKey: gpk}
	_, err = sender.Interact(ctx, &ir)
	require.NoError(t, err)

	var cid string
	var gotMsg, gotAck bool
	for !(gotAck && gotMsg) {
		esr, err := senderStream.Recv()
		requireNoEOF(t, err, "while waiting for msg or ack in sender node (gotMsg: %t, gotAck: %t)", gotMsg, gotAck)
		require.NoError(t, err)

		evt := esr.GetEvent()
		if evt.GetType() == StreamEvent_TypeInteractionUpdated {
			var cu StreamEvent_InteractionUpdated
			err := proto.Unmarshal(evt.GetPayload(), &cu)
			require.NoError(t, err)

			inte := cu.GetInteraction()
			l.Debug("sender received interaction", zap.String("cid", inte.GetCid()), zap.String("type", inte.GetType().String()))
			if inte.GetType() == AppMessage_TypeUserMessage && inte.GetConversationPublicKey() == gpk {
				var um AppMessage_UserMessage
				err := proto.Unmarshal(inte.GetPayload(), &um)
				require.NoError(t, err)

				l.Debug("sender received message", zap.String("cid", inte.GetCid()), zap.String("body", um.GetBody()))

				if msg == um.GetBody() {
					l.Debug("sender found correct message", zap.String("cid", inte.GetCid()))
					require.False(t, gotAck)
					require.Equal(t, msg, um.GetBody())
					require.True(t, inte.GetIsMe())
					cid = inte.GetCid()
					require.NotEmpty(t, cid)
					gotMsg = true
				}
			} else if inte.GetType() == AppMessage_TypeAcknowledge && inte.GetConversationPublicKey() == gpk {
				var ack AppMessage_Acknowledge
				err := proto.Unmarshal(inte.GetPayload(), &ack)
				require.NoError(t, err)

				l.Debug("sender received ack", zap.String("target", ack.GetTarget()))

				if ack.GetTarget() == cid {
					l.Debug("sender found correct ack", zap.String("target", ack.GetTarget()))
					require.True(t, gotMsg)
					require.False(t, inte.GetIsMe())
					gotAck = true
				}
			}
		}
	}

	for i, receiverStream := range receivers {
		gotMsg := false
		gotAck := false
		for !(gotAck && gotMsg) {
			esr, err := receiverStream.Recv()
			requireNoEOF(t, err, "while waiting for msg or ack in receiver node (gotMsg: %t, gotAck: %t)", gotMsg, gotAck)
			require.NoError(t, err)

			evt := esr.GetEvent()
			if evt.GetType() == StreamEvent_TypeInteractionUpdated {
				var iu StreamEvent_InteractionUpdated
				err := proto.Unmarshal(evt.GetPayload(), &iu)
				require.NoError(t, err)

				inte := iu.GetInteraction()
				l.Debug("received interaction", zap.String("cid", inte.GetCid()), zap.String("type", inte.GetType().String()), zap.Int("index", i))

				if inte.GetType() == AppMessage_TypeUserMessage && inte.GetConversationPublicKey() == gpk {
					var um AppMessage_UserMessage
					err := proto.Unmarshal(inte.GetPayload(), &um)
					require.NoError(t, err)

					l.Debug("received message", zap.String("cid", inte.GetCid()), zap.String("body", um.GetBody()), zap.Int("index", i))

					if inte.GetCid() == cid {
						l.Debug("found correct cid", zap.String("cid", inte.GetCid()), zap.Int("index", i))
						//require.False(t, gotAck) // Maybe FIXME otherwise we have to keep an ack backlog
						require.False(t, inte.GetIsMe())
						require.Equal(t, msg, um.GetBody())
						gotMsg = true
					}
				} else if inte.GetType() == AppMessage_TypeAcknowledge && inte.GetConversationPublicKey() == gpk {
					var ack AppMessage_Acknowledge
					err := proto.Unmarshal(inte.GetPayload(), &ack)
					require.NoError(t, err)
					target := ack.GetTarget()
					require.NotEmpty(t, target)

					l.Debug("received ack", zap.String("target", target), zap.Int("index", i))

					if target == cid {
						l.Debug("found correct ack", zap.Int("index", i))
						//require.True(t, gotMsg) // Maybe FIXME
						gotAck = true
					}
				}
			}
		}
	}
}

func TestConversationInvitation2Contacts(t *testing.T) {
	testutil.SkipSlow(t)
	testutil.SkipUnstable(t)

	amount := 3
	require.Greater(t, amount, 2)

	names := []string{"alice", "bob", "john"}
	require.Equal(t, amount, len(names))

	ctx, cancel := context.WithTimeout(context.Background(), 80*time.Second)
	defer cancel()
	l := testutil.Logger(t)
	clients, cleanup := testingInfra(ctx, t, amount, l)
	defer cleanup()

	streams := make([]MessengerService_EventStreamClient, amount)
	links := make([]string, amount)
	publicKeys := make([]string, amount)
	for i, client := range clients {
		name := names[i]
		_, err := client.AccountUpdate(ctx, &AccountUpdate_Request{DisplayName: name})
		require.NoError(t, err)

		stream, err := client.EventStream(ctx, &EventStream_Request{})
		require.NoError(t, err)
		streams[i] = stream

		for {
			esr, err := stream.Recv()
			requireNoEOF(t, err, "while waiting for account update after starting events stream in node %d", i)
			require.NoError(t, err)
			if esr.GetEvent().GetType() == StreamEvent_TypeAccountUpdated {
				var cu StreamEvent_AccountUpdated
				err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
				require.NoError(t, err)
				acc := cu.GetAccount()
				require.Equal(t, name, acc.GetDisplayName())
				links[i] = acc.GetLink()
				publicKeys[i] = acc.GetPublicKey()
				break
			}
		}
	}

	for i, client := range clients {
		bstrm := streams[i]
		bname := names[i]

		for j := i + 1; j < amount; j++ {
			otherClient := clients[j]
			astrm := streams[j]
			aname := names[j]

			l.Debug("adding contacts", zap.String("aname", aname), zap.String("bname", bname))

			_, err := client.ContactRequest(ctx, &ContactRequest_Request{Link: links[j]})
			require.NoError(t, err)

			enqueued := false
			for {
				esr, err := bstrm.Recv()
				requireNoEOF(t, err, "while waiting for outgoing contact request updates (%d to %d, enqueued: %t)", i, j, enqueued)
				require.NoError(t, err)
				if esr.GetEvent().GetType() == StreamEvent_TypeContactUpdated {
					var cu StreamEvent_ContactUpdated
					err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
					require.NoError(t, err)
					c := cu.GetContact()

					if c.GetPublicKey() != publicKeys[j] {
						continue
					}

					require.Equal(t, aname, c.GetDisplayName())

					if !enqueued && c.GetState() == Contact_OutgoingRequestEnqueued {
						enqueued = true
					} else if enqueued && c.GetState() == Contact_OutgoingRequestSent {
						break
					}
				}
			}

			var bc *Contact
			for bc == nil {
				esr, err := astrm.Recv()
				requireNoEOF(t, err, "while waiting for incoming contact request (%d to %d)", i, j)
				require.NoError(t, err)
				if esr.GetEvent().GetType() == StreamEvent_TypeContactUpdated {
					var cu StreamEvent_ContactUpdated
					err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
					require.NoError(t, err)
					c := cu.GetContact()

					if c.GetPublicKey() != publicKeys[i] {
						continue
					}

					require.Equal(t, bname, c.GetDisplayName())

					if c.GetState() == Contact_IncomingRequest {
						bc = c
					}
				}
			}

			bpk := bc.GetPublicKey()
			otherClient.ContactAccept(ctx, &ContactAccept_Request{PublicKey: bpk})

			var gpk string

			for {
				esr, err := astrm.Recv()
				requireNoEOF(t, err, "while waiting for contact established in requested node (%d to %d)", i, j)
				require.NoError(t, err)
				if esr.GetEvent().GetType() == StreamEvent_TypeContactUpdated {
					var cu StreamEvent_ContactUpdated
					err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
					require.NoError(t, err)
					c := cu.GetContact()

					if c.GetPublicKey() != publicKeys[i] {
						continue
					}

					require.Equal(t, bname, c.GetDisplayName())

					if c.GetState() == Contact_Established {
						gpk = c.GetConversationPublicKey()
						require.NotEmpty(t, gpk)
						break
					}
				}
			}

			for {
				esr, err := bstrm.Recv()
				requireNoEOF(t, err, "while waiting for contact established in requester node (%d to %d)", i, j)
				require.NoError(t, err)
				if esr.GetEvent().GetType() == StreamEvent_TypeContactUpdated {
					var cu StreamEvent_ContactUpdated
					err := proto.Unmarshal(esr.GetEvent().GetPayload(), &cu)
					require.NoError(t, err)
					c := cu.GetContact()

					if c.GetPublicKey() != publicKeys[j] {
						continue
					}

					require.Equal(t, aname, c.GetDisplayName())

					if c.GetState() == Contact_Established {
						require.Equal(t, gpk, c.GetConversationPublicKey())
						break
					}
				}
			}
		}
	}

	creator := clients[0]

	name := "My Group"

	ccr, err := creator.ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: name, ContactsToInvite: publicKeys[1:]})
	require.NoError(t, err)

	creatorStrm := streams[0]

	gpk := ccr.GetPublicKey()

	var link string

	for link == "" {
		esr, err := creatorStrm.Recv()
		requireNoEOF(t, err, "while waiting for conversation update after creating it")
		require.NoError(t, err)
		evt := esr.GetEvent()
		if evt.GetType() == StreamEvent_TypeConversationUpdated {
			var cu StreamEvent_ConversationUpdated
			err := proto.Unmarshal(evt.GetPayload(), &cu)
			require.NoError(t, err)

			conv := cu.GetConversation()
			if conv.GetPublicKey() == gpk && name == conv.GetDisplayName() {
				// require.Equal(t, name, conv.GetDisplayName())
				link = conv.GetLink()
			}
		}
	}
	l.Debug("created conv", zap.String("pk", gpk))

	var inviteLink string
	for i := 1; i < amount; i++ {
		stream := streams[i]
		for inviteLink == "" {
			esr, err := stream.Recv()
			requireNoEOF(t, err, "while waiting for group invitation in node %d", i)
			require.NoError(t, err)
			evt := esr.GetEvent()
			if evt.GetType() == StreamEvent_TypeInteractionUpdated {
				var iu StreamEvent_InteractionUpdated
				err := proto.Unmarshal(evt.GetPayload(), &iu)
				require.NoError(t, err)

				inte := iu.GetInteraction()
				if inte.GetType() == AppMessage_TypeGroupInvitation {
					var ginv AppMessage_GroupInvitation
					err := proto.Unmarshal(inte.GetPayload(), &ginv)
					require.NoError(t, err)
					inviteLink = ginv.GetLink()
					require.Equal(t, inviteLink, link)

					_, err = clients[i].ConversationJoin(ctx, &ConversationJoin_Request{Link: inviteLink})
					require.NoError(t, err)

					for {
						esr, err := stream.Recv()
						requireNoEOF(t, err, "while waiting for conversation update after joining one in node %d", i)
						require.NoError(t, err)
						evt := esr.GetEvent()
						if evt.GetType() == StreamEvent_TypeConversationUpdated {
							var cu StreamEvent_ConversationUpdated
							err := proto.Unmarshal(evt.GetPayload(), &cu)
							require.NoError(t, err)

							conv := cu.GetConversation()
							if conv.GetPublicKey() == gpk && name == conv.GetDisplayName() {
								// require.Equal(t, name, conv.GetDisplayName())
								require.Equal(t, link, conv.GetLink())
								break
							}
						}
					}
				}
			}
		}
	}

	// FIXME: really wait for everyone to know everyone (via MemberUpdated)
	time.Sleep(time.Second * 20)

	// TODO: check that members names are propagated

	// Exchange messages

	// NOTE: Uncomment when messages exchange is stable
	/*for i := 0; i < amount; i++ {
		sender := clients[i]
		senderStrm := streams[i]
		strms := append(streams[0:i:i], streams[i+1:]...)
		testMultiMessage(ctx, t, l, "Hello Group! "+strconv.Itoa(i), gpk, sender, senderStrm, strms)
	}*/
}

// TODO: implem and test "read" logic
