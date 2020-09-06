package bertymessenger

import (
	"context"

	"runtime"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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
	assert.Equal(t, ret1.BertyID.DisplayName, "anonymous#1337")

	ret2, err := svc.InstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{})
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret2)
	assert.Equal(t, ret2.BertyID.DisplayName, "anonymous#1337")
	assert.Equal(t, ret1, ret2)

	ret3, err := svc.InstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{DisplayName: "Hello World! 👋"})
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret3)
	assert.Equal(t, ret3.BertyID.DisplayName, "Hello World! 👋")
	assert.NotEqual(t, ret2.BertyID, ret3.BertyID)

	ret4, err := svc.InstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{Reset_: true})
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret4)
	assert.Equal(t, ret4.BertyID.DisplayName, "anonymous#1337")
	assert.NotEqual(t, ret1.BertyID, ret4.BertyID)
	assert.NotEqual(t, ret3.BertyID, ret4.BertyID)

	ret5, err := svc.InstanceShareableBertyID(ctx, nil)
	require.NoError(t, err)
	testParseInstanceShareable(ctx, t, svc, ret5)
	assert.Equal(t, ret4, ret5)
}

func testParseInstanceShareable(ctx context.Context, t *testing.T, svc MessengerServiceServer, ret *InstanceShareableBertyID_Reply) {
	t.Helper()
	assert.NotEmpty(t, ret.BertyID)
	assert.NotEmpty(t, ret.BertyID.PublicRendezvousSeed)
	assert.NotEmpty(t, ret.BertyID.AccountPK)
	assert.NotEmpty(t, ret.BertyID.DisplayName)
	assert.NotEmpty(t, ret.HTMLURL)
	assert.NotEmpty(t, ret.DeepLink)
	assert.NotEqual(t, ret.HTMLURL, ret.DeepLink)

	parsed1, err := svc.ParseDeepLink(ctx, &ParseDeepLink_Request{Link: ret.DeepLink})
	require.NoError(t, err)
	parsed2, err := svc.ParseDeepLink(ctx, &ParseDeepLink_Request{Link: ret.HTMLURL})
	require.NoError(t, err)

	assert.Equal(t, parsed1, parsed2)
	assert.Equal(t, parsed1.BertyID.PublicRendezvousSeed, ret.BertyID.PublicRendezvousSeed)
	assert.Equal(t, parsed1.BertyID.AccountPK, ret.BertyID.AccountPK)
	assert.Equal(t, parsed1.BertyID.DisplayName, ret.BertyID.DisplayName)
}

func TestServiceParseDeepLink(t *testing.T) {
	tests := []struct {
		name            string
		request         *ParseDeepLink_Request
		expectedErrcode error
		expectedValidID bool
		expectedName    bool
	}{
		{"nil", nil, errcode.ErrMissingInput, false, false},
		{"empty", &ParseDeepLink_Request{}, errcode.ErrMissingInput, false, false},
		{"invalid", &ParseDeepLink_Request{Link: "invalid"}, errcode.ErrMessengerInvalidDeepLink, false, false},
		{"invalid2", &ParseDeepLink_Request{Link: "berty://id/#key=blah&name=blih"}, errcode.ErrMessengerInvalidDeepLink, false, false},
		{"invalid3", &ParseDeepLink_Request{Link: "https://berty.tech/id#key=blah&name=blih"}, errcode.ErrMessengerInvalidDeepLink, false, false},
		{"deeplink", &ParseDeepLink_Request{Link: "berty://id/#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA&name=Alice"}, nil, true, true},
		{"htmlurl", &ParseDeepLink_Request{Link: "https://berty.tech/id#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA&name=Alice"}, nil, true, true},
		{"deeplink-noname", &ParseDeepLink_Request{Link: "berty://id/#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA"}, nil, true, false},
		{"htmlurl-noname", &ParseDeepLink_Request{Link: "https://berty.tech/id#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA"}, nil, true, false},
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
				assert.NotEmpty(t, ret.BertyID.PublicRendezvousSeed)
				assert.NotEmpty(t, ret.BertyID.AccountPK)
			} else {
				assert.True(t, ret == nil || ret.BertyID == nil || ret.BertyID.PublicRendezvousSeed == nil)
				assert.True(t, ret == nil || ret.BertyID == nil || ret.BertyID.AccountPK == nil)
			}
			if tt.expectedName {
				assert.NotEmpty(t, ret.BertyID.DisplayName)
			} else {
				assert.True(t, ret == nil || ret.BertyID == nil || ret.BertyID.DisplayName == "")
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

	ret, err = svc.SendContactRequest(ctx, &SendContactRequest_Request{})
	assert.Equal(t, errcode.Code(err), errcode.ErrMissingInput)
	assert.Nil(t, ret)

	parseRet, err := svc.ParseDeepLink(ctx, &ParseDeepLink_Request{Link: "https://berty.tech/id#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA&name=Alice"})
	require.NoError(t, err)

	ret, err = svc.SendContactRequest(ctx, &SendContactRequest_Request{BertyID: parseRet.BertyID})
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
	diff := time.Now().Unix() - ret.StartedAt
	assert.GreaterOrEqual(t, diff, int64(0))
	assert.GreaterOrEqual(t, int64(1), diff)
	assert.Greater(t, ret.NumCPU, int64(0))
	assert.NotEmpty(t, ret.GoVersion)
	assert.Equal(t, ret.Arch, runtime.GOARCH)
	assert.Equal(t, ret.OperatingSystem, runtime.GOOS)
	assert.NotEmpty(t, ret.HostName)
	// assert.NotEmpty(t, ret.VcsRef)
	// assert.NotEmpty(t, ret.Version)
	// assert.Greater(t, ret.BuildTime, int64(0))
}

func testParseSharedGroup(t *testing.T, g *bertytypes.Group, name string, ret *ShareableBertyGroup_Reply) {
	t.Helper()
	uri, url, err := ShareableBertyGroupURL(g, name)

	assert.NoError(t, err)
	assert.Equal(t, uri, ret.DeepLink)
	assert.Equal(t, url, ret.HTMLURL)
	assert.Equal(t, name, ret.BertyGroup.DisplayName)
	assert.Equal(t, g.PublicKey, ret.BertyGroup.Group.PublicKey)
	assert.Equal(t, g.GroupType, ret.BertyGroup.Group.GroupType)
	assert.Equal(t, g.Secret, ret.BertyGroup.Group.Secret)
	assert.Equal(t, g.SecretSig, ret.BertyGroup.Group.SecretSig)

	marshaled, err := proto.Marshal(ret.BertyGroup)
	assert.NoError(t, err)
	assert.Equal(t, bytesToString(marshaled), ret.BertyGroupPayload)
}

func TestServiceShareableBertyGroup(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var protocol *bertyprotocol.TestingProtocol
	protocol, cleanup := bertyprotocol.NewTestingProtocol(ctx, t, nil)

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

	_, err = protocol.Client.MultiMemberGroupJoin(ctx, &bertytypes.MultiMemberGroupJoin_Request{
		Group: g,
	})
	require.NoError(t, err)

	ret1, err := svc.ShareableBertyGroup(ctx, nil)
	require.Error(t, err)

	ret1, err = svc.ShareableBertyGroup(ctx, &ShareableBertyGroup_Request{
		GroupPK:   nil,
		GroupName: "",
	})
	require.Error(t, err)

	ret1, err = svc.ShareableBertyGroup(ctx, &ShareableBertyGroup_Request{
		GroupPK:   []byte("garbage id"),
		GroupName: "",
	})
	require.Error(t, err)

	ret1, err = svc.ShareableBertyGroup(ctx, &ShareableBertyGroup_Request{
		GroupPK:   g.PublicKey,
		GroupName: "",
	})
	require.NoError(t, err)

	testParseSharedGroup(t, g, "", ret1)

	ret1, err = svc.ShareableBertyGroup(ctx, &ShareableBertyGroup_Request{
		GroupPK:   g.PublicKey,
		GroupName: "named group",
	})
	require.NoError(t, err)

	testParseSharedGroup(t, g, "named group", ret1)
}
