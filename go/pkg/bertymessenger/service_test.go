package bertymessenger

import (
	"context"
	"net"
	"sync"
	"testing"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/test/bufconn"
)

func mkBufDialer(l *bufconn.Listener) func(context.Context, string) (net.Conn, error) {
	return func(context.Context, string) (net.Conn, error) { return l.Dial() }
}

const timeout = time.Second * 5

func TestClient(t *testing.T) {
	ctx := context.Background()
	l, err := zap.NewDevelopment()
	require.NoError(t, err)
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
	//

	streamCtx, cancelStreamCtx := context.WithTimeout(context.Background(), timeout)
	res, err := client.ConversationStream(streamCtx, &ConversationStream_Request{})
	require.NoError(t, err)

	var c *Conversation
	wg := sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		rep, err := res.Recv()
		c = rep.Conversation
		require.NoError(t, err)
	}()

	dn := "Tasty"

	ccrep, err := client.ConversationCreate(ctx, &ConversationCreate_Request{DisplayName: dn})
	require.NoError(t, err)
	require.NotEmpty(t, ccrep.GetPublicKey())

	wg.Wait()
	require.NotNil(t, c)
	require.Equal(t, ccrep.GetPublicKey(), c.GetPublicKey())
	require.Equal(t, dn, c.GetDisplayName())

	cancelStreamCtx()

	_, err = res.Recv()
	require.True(t, grpcIsCanceled(err))
}

func TestContactRequest(t *testing.T) {
	ctx := context.Background()
	l, err := zap.NewDevelopment()
	require.NoError(t, err)
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
	//

	streamCtx, cancelStreamCtx := context.WithTimeout(context.Background(), timeout)
	stream, err := client.EventStream(streamCtx, &EventStream_Request{})
	require.NoError(t, err)

	var c *Contact
	wg := sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			rep, err := stream.Recv()
			require.NoError(t, err)
			ev := rep.GetEvent()
			if ev.GetType() == StreamEvent_TypeContactUpdated {
				var p StreamEvent_ContactUpdated
				err := proto.Unmarshal(ev.GetPayload(), &p)
				require.NoError(t, err)
				c = p.Contact
				break
			}
		}
	}()

	contactName := "zxxma-iphone"
	link := "berty://id/#key=CiAdJso3YvHGxjkU1%252FXfBpMe00RFB0NZtPuEKRPtyUuQFBIg15Bbyrz0tdy8Su6DDcNpKBguhNuZsF1%252BjTzpCaN6qfA%253D&name=" + contactName
	ownMetadata := []byte("bar")

	metadata, err := proto.Marshal(&ContactMetadata{contactName})
	require.NoError(t, err)
	pdlRep, err := client.ParseDeepLink(ctx, &ParseDeepLink_Request{Link: link})
	require.NoError(t, err)
	_, err = client.SendContactRequest(ctx, &SendContactRequest_Request{BertyID: pdlRep.BertyID, Metadata: metadata, OwnMetadata: ownMetadata})
	require.NoError(t, err)

	wg.Wait()
	require.NotNil(t, c)
	require.Equal(t, contactName, c.GetDisplayName())
	require.Equal(t, c.GetState(), Contact_OutgoingRequestEnqueued)

	cancelStreamCtx()
	_, err = stream.Recv()
	require.True(t, grpcIsCanceled(err))
}
