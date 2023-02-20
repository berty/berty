package bertypushrelay

import (
	"context"
	crand "crypto/rand"
	"net"
	"testing"

	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/ipfs/go-cid"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"
	"google.golang.org/grpc"

	"berty.tech/weshnet"
	"berty.tech/weshnet/pkg/cryptoutil"
	"berty.tech/weshnet/pkg/protocoltypes"
	"berty.tech/weshnet/pkg/pushtypes"
	"berty.tech/weshnet/pkg/testutil"
)

func PushServerForTests(ctx context.Context, t testing.TB, dispatchers []PushDispatcher, logger *zap.Logger) (PushService, *[32]byte, string, context.CancelFunc) {
	secret := make([]byte, cryptoutil.KeySize)
	_, err := crand.Read(secret)
	require.NoError(t, err)

	pushPK, pushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	pushService, err := NewPushService(pushSK, dispatchers, logger)
	require.NoError(t, err)

	ctx, cancel := context.WithCancel(ctx)
	server := grpc.NewServer()

	mux := grpcgw.NewServeMux()

	pushtypes.RegisterPushServiceServer(server, pushService)
	err = pushtypes.RegisterPushServiceHandlerServer(ctx, mux, pushService)
	require.NoError(t, err)

	l, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)

	go func() {
		err := server.Serve(l)
		if err != nil {
			cancel()
		}
	}()

	return pushService, pushPK, l.Addr().String(), cancel
}

func TestService_PushReceive(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	devicePushPK, devicePushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	serverPushPK, serverPushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	dispatcher := testutil.NewPushMockedDispatcher(testutil.PushMockBundleID)

	pushServer, err := NewPushService(serverPushSK, []PushDispatcher{dispatcher}, nil)
	require.NoError(t, err)
	require.NotNil(t, pushServer)

	tp, cancel := weshnet.NewTestingProtocol(ctx, t, &weshnet.TestingOpts{PushSK: devicePushSK}, nil)
	defer cancel()

	g, gSK, err := weshnet.NewGroupMultiMember()
	require.NoError(t, err)

	s := tp.Service

	_, err = s.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: &protocoltypes.PushServer{
		ServerKey:   serverPushPK[:],
		ServiceAddr: testutil.DummyPushServerAddr,
	}})
	require.NoError(t, err)

	_, err = s.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{Group: g})
	require.NoError(t, err)

	gPK, _ := gSK.GetPublic().Raw()
	require.NoError(t, err)

	_, err = s.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gPK})
	require.NoError(t, err)

	gc, err := s.(weshnet.ServiceMethods).GetContextGroupForID(g.PublicKey)
	require.NoError(t, err)

	otherMD, otherDS := weshnet.CreateVirtualOtherPeerSecretsShareSecret(t, ctx, []*weshnet.MetadataStore{gc.MetadataStore()})

	testPayload := []byte("test payload")
	devicePushToken := "token_test"

	envBytes, err := cryptoutil.SealEnvelope(testPayload, otherDS, otherMD.PrivateDevice(), g)
	require.NoError(t, err)

	env, headers, err := cryptoutil.OpenEnvelopeHeaders(envBytes, g)
	require.NoError(t, err)

	dummyCID, err := cid.Parse("QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u")
	require.NoError(t, err)

	oosMsgEnv, err := weshnet.SealOutOfStoreMessageEnvelope(dummyCID, env, headers, g)
	require.NoError(t, err)

	opaqueToken, err := weshnet.PushSealTokenForServer(&protocoltypes.PushServiceReceiver{
		TokenType:          dispatcher.TokenType(),
		BundleID:           testutil.PushMockBundleID,
		Token:              []byte(devicePushToken),
		RecipientPublicKey: devicePushPK[:],
	}, &protocoltypes.PushServer{
		ServerKey:   serverPushPK[:],
		ServiceAddr: testutil.DummyPushServerAddr,
	})
	require.NoError(t, err)

	_, err = pushServer.Send(ctx, &pushtypes.PushServiceSend_Request{
		Envelope: oosMsgEnv,
		Receivers: []*pushtypes.PushServiceOpaqueReceiver{
			{
				OpaqueToken: opaqueToken.Token,
				ServiceAddr: opaqueToken.Server.ServiceAddr,
			},
		},
	})
	require.NoError(t, err)
	require.Equal(t, 1, dispatcher.Len([]byte(devicePushToken)))

	res, err := s.PushReceive(ctx, &protocoltypes.PushReceive_Request{
		Payload: dispatcher.Shift([]byte(devicePushToken)),
	})

	require.NoError(t, err)
	require.NotNil(t, res)
	require.Equal(t, testPayload, res.Cleartext)
	require.Equal(t, dummyCID.Bytes(), res.Message.CID)

	// TODO: check failure
}
