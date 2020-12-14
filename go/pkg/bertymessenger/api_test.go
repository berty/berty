package bertymessenger

import (
	"context"
	"runtime"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestServiceInstanceShareableBertyID(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	svc, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: logger})
	defer cleanup()

	ret1, err := svc.InstanceShareableBertyID(ctx, nil)
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret1)
	assert.Equal(t, ret1.Link.BertyID.DisplayName, "")

	ret2, err := svc.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{})
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret2)
	assert.Equal(t, ret2.Link.BertyID.DisplayName, "")
	assert.Equal(t, ret1, ret2)

	ret3, err := svc.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{DisplayName: "Hello World! 👋"})
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret3)
	assert.Equal(t, ret3.Link.BertyID.DisplayName, "Hello World! 👋")
	assert.NotEqual(t, ret2.Link.BertyID, ret3.Link.BertyID)

	ret4, err := svc.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{Reset_: true})
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret4)
	assert.Equal(t, ret4.Link.BertyID.DisplayName, "")
	assert.NotEqual(t, ret1.Link.BertyID, ret4.Link.BertyID)
	assert.NotEqual(t, ret3.Link.BertyID, ret4.Link.BertyID)

	ret5, err := svc.InstanceShareableBertyID(ctx, nil)
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret5)
	assert.Equal(t, ret4, ret5)
}

func testParseInstanceShareable(ctx context.Context, t *testing.T, svc messengertypes.MessengerServiceServer, ret *messengertypes.InstanceShareableBertyID_Reply) {
	t.Helper()
	assert.NotEmpty(t, ret.Link.BertyID)
	assert.NotEmpty(t, ret.Link.BertyID.PublicRendezvousSeed)
	assert.NotEmpty(t, ret.Link.BertyID.AccountPK)
	assert.NotEmpty(t, ret.WebURL)
	assert.NotEmpty(t, ret.InternalURL)
	assert.NotEqual(t, ret.WebURL, ret.InternalURL)

	parsed1, err := svc.ParseDeepLink(ctx, &messengertypes.ParseDeepLink_Request{Link: ret.InternalURL})
	require.NoError(t, err)
	parsed2, err := svc.ParseDeepLink(ctx, &messengertypes.ParseDeepLink_Request{Link: ret.WebURL})
	require.NoError(t, err)

	assert.Equal(t, parsed1, parsed2)
	assert.Equal(t, parsed1.Link.BertyID.PublicRendezvousSeed, ret.Link.BertyID.PublicRendezvousSeed)
	assert.Equal(t, parsed1.Link.BertyID.AccountPK, ret.Link.BertyID.AccountPK)
	assert.Equal(t, parsed1.Link.BertyID.DisplayName, ret.Link.BertyID.DisplayName)
}

func TestServiceParseDeepLink(t *testing.T) {
	tests := []struct {
		name            string
		request         *messengertypes.ParseDeepLink_Request
		expectedErrcode error
		expectedValidID bool
		expectedName    bool
	}{
		{"nil", nil, errcode.ErrMissingInput, false, false},
		{"empty", &messengertypes.ParseDeepLink_Request{}, errcode.ErrMessengerInvalidDeepLink, false, false},
		{"invalid", &messengertypes.ParseDeepLink_Request{Link: "foobar"}, errcode.ErrMessengerInvalidDeepLink, false, false},
		{"invalid2", &messengertypes.ParseDeepLink_Request{Link: "BERTY://FOOBAR"}, errcode.ErrMessengerInvalidDeepLink, false, false},
		{"invalid2", &messengertypes.ParseDeepLink_Request{Link: "berty://foobar"}, errcode.ErrMessengerInvalidDeepLink, false, false},
		{"invalid3", &messengertypes.ParseDeepLink_Request{Link: "https://berty.tech/id#foobar"}, errcode.ErrMessengerInvalidDeepLink, false, false},
		{"internal", &messengertypes.ParseDeepLink_Request{Link: "BERTY://PB/" + validContactInternalBlob}, nil, true, true},
		{"internal-2", &messengertypes.ParseDeepLink_Request{Link: "berty://pb/" + validContactInternalBlob}, nil, true, true},
		{"weburl", &messengertypes.ParseDeepLink_Request{Link: "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice"}, nil, true, true},
		{"weburl-noname", &messengertypes.ParseDeepLink_Request{Link: "https://berty.tech/id#contact/" + validContactBlob}, nil, true, false},
		{"test-real-case", &messengertypes.ParseDeepLink_Request{Link: "https://berty.tech/id#contact/oZBLEm2jFndwNvX9yQTVqcMkVuuJQYMoU1XQsmxhS9Q1n1L9npGFVhrFitqR9p8Wgd8Kf3sTLdLoQxKDmr3aK2pP9humsHz/name=moul+%28cli%29"}, nil, true, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			logger, cleanup := testutil.Logger(t)
			defer cleanup()
			service, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: logger})
			defer cleanup()

			ret, err := service.ParseDeepLink(ctx, tt.request)
			if tt.expectedErrcode == nil {
				tt.expectedErrcode = errcode.ErrCode(-1)
			}
			assert.Equal(t, errcode.Code(err), tt.expectedErrcode)
			if tt.expectedValidID {
				assert.NotEmpty(t, ret.GetLink().GetBertyID().GetPublicRendezvousSeed())
				assert.NotEmpty(t, ret.GetLink().GetBertyID().GetAccountPK())
			} else {
				assert.True(t, ret == nil || ret.GetLink().GetBertyID().GetPublicRendezvousSeed() == nil)
				assert.True(t, ret == nil || ret.GetLink().GetBertyID().GetAccountPK() == nil)
			}
			if tt.expectedName {
				assert.NotEmpty(t, ret.GetLink().GetBertyID().GetDisplayName())
			} else {
				assert.True(t, ret == nil || ret.GetLink().GetBertyID().GetDisplayName() == "")
			}
		})
	}
}

func TestServiceSendContactRequest(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	svc, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: logger})
	defer cleanup()

	ret, err := svc.SendContactRequest(ctx, nil)
	assert.Equal(t, errcode.Code(err), errcode.ErrMissingInput)
	assert.Nil(t, ret)

	ret, err = svc.SendContactRequest(ctx, &messengertypes.SendContactRequest_Request{})
	assert.Equal(t, errcode.Code(err), errcode.ErrMissingInput)
	assert.Nil(t, ret)

	parseRet, err := svc.ParseDeepLink(ctx, &messengertypes.ParseDeepLink_Request{Link: "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice"})
	require.NoError(t, err)

	ret, err = svc.SendContactRequest(ctx, &messengertypes.SendContactRequest_Request{BertyID: parseRet.Link.BertyID})
	require.NoError(t, err)
	assert.NotNil(t, ret)
}

func TestSystemInfo(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	svc, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: logger})
	defer cleanup()

	ret, err := svc.SystemInfo(ctx, nil)
	require.NoError(t, err)
	diff := time.Now().Unix() - ret.Messenger.Process.StartedAt
	assert.GreaterOrEqual(t, diff, int64(0))
	assert.GreaterOrEqual(t, int64(1), diff)
	assert.Greater(t, ret.Messenger.Process.NumCPU, int64(0))
	assert.NotEmpty(t, ret.Messenger.Process.GoVersion)
	assert.Equal(t, ret.Messenger.Process.Arch, runtime.GOARCH)
	assert.Equal(t, ret.Messenger.Process.OperatingSystem, runtime.GOOS)
	assert.NotEmpty(t, ret.Messenger.Process.HostName)
	assert.NotNil(t, ret.Protocol.Process)
	assert.True(t, ret.Messenger.ProtocolInSameProcess)
}

func testParseSharedGroup(t *testing.T, g *protocoltypes.Group, name string, ret *messengertypes.ShareableBertyGroup_Reply) {
	t.Helper()
	group := &messengertypes.BertyGroup{
		Group:       g,
		DisplayName: name,
	}
	link := group.GetBertyLink()
	internal, web, err := bertylinks.MarshalLink(link)

	assert.NoError(t, err)
	assert.Equal(t, internal, ret.InternalURL)
	assert.Equal(t, web, ret.WebURL)
	assert.Equal(t, name, ret.Link.BertyGroup.DisplayName)
	assert.Equal(t, g.PublicKey, ret.Link.BertyGroup.Group.PublicKey)
	assert.Equal(t, g.GroupType, ret.Link.BertyGroup.Group.GroupType)
	assert.Equal(t, g.Secret, ret.Link.BertyGroup.Group.Secret)
	assert.Equal(t, g.SecretSig, ret.Link.BertyGroup.Group.SecretSig)
}

func TestServiceShareableBertyGroup(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var protocol *bertyprotocol.TestingProtocol
	protocol, cleanup := bertyprotocol.NewTestingProtocol(ctx, t, nil, nil)

	// required to avoid "writing on closing socket",
	// should be better to have something blocking instead
	time.Sleep(10 * time.Millisecond)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	svc, cleanup := TestingService(ctx, t, &TestingServiceOpts{
		Logger: logger,
		Client: protocol.Client,
	})
	defer cleanup()

	g, _, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	_, err = protocol.Client.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{
		Group: g,
	})
	require.NoError(t, err)

	ret1, err := svc.ShareableBertyGroup(ctx, nil)
	require.Error(t, err)

	ret1, err = svc.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   nil,
		GroupName: "",
	})
	require.Error(t, err)

	ret1, err = svc.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   []byte("garbage id"),
		GroupName: "",
	})
	require.Error(t, err)

	ret1, err = svc.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   g.PublicKey,
		GroupName: "",
	})
	require.NoError(t, err)

	testParseSharedGroup(t, g, "", ret1)

	ret1, err = svc.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   g.PublicKey,
		GroupName: "named group",
	})
	require.NoError(t, err)

	testParseSharedGroup(t, g, "named group", ret1)
}

func TestServiceBannerQuote(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	svc, cleanup := TestingService(ctx, t, &TestingServiceOpts{Logger: logger})
	defer cleanup()

	ret, err := svc.BannerQuote(ctx, nil)
	require.NoError(t, err)
	assert.NotEmpty(t, ret.Quote)
	assert.NotEmpty(t, ret.Author)
}
