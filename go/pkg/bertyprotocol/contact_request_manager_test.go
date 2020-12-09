package bertyprotocol

import (
	"context"
	"io"
	"testing"
	"time"

	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestContactRequestFlow(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*20)
	defer cancel()
	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	opts := TestingOpts{
		Mocknet: libp2p_mocknet.New(ctx),
		Logger:  logger,
	}

	metadataSender1 := []byte("sender_1")

	pts, cleanup := NewTestingProtocolWithMockedPeers(ctx, t, &opts, nil, 2)
	defer cleanup()

	_, err := pts[0].Client.ContactRequestEnable(ctx, &protocoltypes.ContactRequestEnable_Request{})
	require.NoError(t, err)

	_, err = pts[1].Client.ContactRequestEnable(ctx, &protocoltypes.ContactRequestEnable_Request{})
	require.NoError(t, err)

	config0, err := pts[0].Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	require.NoError(t, err)
	require.NotNil(t, config0)

	config1, err := pts[1].Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	require.NoError(t, err)
	require.NotNil(t, config1)

	ref0, err := pts[0].Client.ContactRequestResetReference(ctx, &protocoltypes.ContactRequestResetReference_Request{})
	require.NoError(t, err)
	require.NotNil(t, ref0)

	ref1, err := pts[1].Client.ContactRequestResetReference(ctx, &protocoltypes.ContactRequestResetReference_Request{})
	require.NoError(t, err)
	require.NotNil(t, ref1)

	subCtx, subCancel := context.WithCancel(ctx)
	defer subCancel()

	subMeta0, err := pts[0].Client.GroupMetadataList(subCtx, &protocoltypes.GroupMetadataList_Request{
		GroupPK: config0.AccountGroupPK,
	})
	require.NoError(t, err)
	found := false

	_, err = pts[1].Client.ContactRequestSend(ctx, &protocoltypes.ContactRequestSend_Request{
		Contact: &protocoltypes.ShareableContact{
			PK:                   config0.AccountPK,
			PublicRendezvousSeed: ref0.PublicRendezvousSeed,
		},
		OwnMetadata: metadataSender1,
	})
	require.NoError(t, err)

	for {
		evt, err := subMeta0.Recv()
		if err == io.EOF || subMeta0.Context().Err() != nil {
			break
		}

		require.NoError(t, err)

		if evt == nil || evt.Metadata.EventType != protocoltypes.EventTypeAccountContactRequestIncomingReceived {
			continue
		}

		req := &protocoltypes.AccountContactRequestReceived{}
		err = req.Unmarshal(evt.Event)

		require.NoError(t, err)
		require.Equal(t, config1.AccountPK, req.ContactPK)
		require.Equal(t, metadataSender1, req.ContactMetadata)
		found = true
		subCancel()
	}

	require.True(t, found)

	_, err = pts[1].Client.ContactRequestAccept(ctx, &protocoltypes.ContactRequestAccept_Request{
		ContactPK: config0.AccountPK,
	})

	require.Error(t, err)

	_, err = pts[1].Client.ContactRequestAccept(ctx, &protocoltypes.ContactRequestAccept_Request{
		ContactPK: config1.AccountPK,
	})

	require.Error(t, err)

	_, err = pts[0].Client.ContactRequestAccept(ctx, &protocoltypes.ContactRequestAccept_Request{
		ContactPK: config0.AccountPK,
	})

	require.Error(t, err)

	_, err = pts[0].Client.ContactRequestAccept(ctx, &protocoltypes.ContactRequestAccept_Request{
		ContactPK: config1.AccountPK,
	})

	require.NoError(t, err)

	grpInfo, err := pts[0].Client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPK: config1.AccountPK,
	})
	require.NoError(t, err)

	_, err = pts[0].Client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
		GroupPK: grpInfo.Group.PublicKey,
	})

	require.NoError(t, err)

	_, err = pts[1].Client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
		GroupPK: grpInfo.Group.PublicKey,
	})

	require.NoError(t, err)
}

func TestContactRequestFlowWithoutIncoming(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	opts := TestingOpts{
		Mocknet: libp2p_mocknet.New(ctx),
		Logger:  logger,
	}

	metadataSender1 := []byte("sender_1")

	pts, cleanup := NewTestingProtocolWithMockedPeers(ctx, t, &opts, nil, 2)
	defer cleanup()

	_, err := pts[0].Client.ContactRequestEnable(ctx, &protocoltypes.ContactRequestEnable_Request{})
	require.NoError(t, err)

	config0, err := pts[0].Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	require.NoError(t, err)
	require.NotNil(t, config0)

	config1, err := pts[1].Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	require.NoError(t, err)
	require.NotNil(t, config1)

	ref0, err := pts[0].Client.ContactRequestResetReference(ctx, &protocoltypes.ContactRequestResetReference_Request{})
	require.NoError(t, err)
	require.NotNil(t, ref0)

	subCtx, subCancel := context.WithCancel(ctx)
	defer subCancel()

	subMeta0, err := pts[0].Client.GroupMetadataList(subCtx, &protocoltypes.GroupMetadataList_Request{
		GroupPK: config0.AccountGroupPK,
	})
	require.NoError(t, err)
	found := false

	_, err = pts[1].Client.ContactRequestSend(ctx, &protocoltypes.ContactRequestSend_Request{
		Contact: &protocoltypes.ShareableContact{
			PK:                   config0.AccountPK,
			PublicRendezvousSeed: ref0.PublicRendezvousSeed,
		},
		OwnMetadata: metadataSender1,
	})
	require.NoError(t, err)

	for {
		evt, err := subMeta0.Recv()
		if err == io.EOF || subMeta0.Context().Err() != nil {
			break
		}

		require.NoError(t, err)

		if evt == nil || evt.Metadata.EventType != protocoltypes.EventTypeAccountContactRequestIncomingReceived {
			continue
		}

		req := &protocoltypes.AccountContactRequestReceived{}
		err = req.Unmarshal(evt.Event)

		require.NoError(t, err)
		require.Equal(t, config1.AccountPK, req.ContactPK)
		require.Equal(t, metadataSender1, req.ContactMetadata)
		found = true
		subCancel()
	}

	require.True(t, found)

	_, err = pts[0].Client.ContactRequestAccept(ctx, &protocoltypes.ContactRequestAccept_Request{
		ContactPK: config1.AccountPK,
	})

	require.NoError(t, err)

	_, err = pts[0].Client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPK: config1.AccountPK,
	})
	require.NoError(t, err)
}
