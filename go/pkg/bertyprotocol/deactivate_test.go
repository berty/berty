package bertyprotocol_test

import (
	"context"
	"testing"
	"time"

	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

// @FIXME(gfanton): this test doesn't make sense as long as we can't close account group at the moment.
// func TestReactivateAccountGroup(t *testing.T) {
// 	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
// 	defer cancel()

// 	logger, cleanup := testutil.Logger(t)
// 	defer cleanup()

// 	opts := bertyprotocol.TestingOpts{
// 		Mocknet:     libp2p_mocknet.New(ctx),
// 		Logger:      logger,
// 		ConnectFunc: bertyprotocol.ConnectAll,
// 	}

// 	nodes, cleanup := bertyprotocol.NewTestingProtocolWithMockedPeers(ctx, t, &opts, nil, 1)
// 	defer cleanup()

// 	// get contact group
// 	sub, err := nodes[0].Client.DebugListGroups(ctx, &protocoltypes.DebugListGroups_Request{})
// 	require.NoError(t, err)
// 	acc, err := sub.Recv()
// 	require.NoError(t, err)
// 	require.Equal(t, acc.GroupType, protocoltypes.GroupTypeAccount)
// 	accPK := acc.GroupPK

// 	// deactivate contact group on one end
// 	_, err = nodes[0].Client.DeactivateGroup(ctx, &protocoltypes.DeactivateGroup_Request{
// 		GroupPK: accPK,
// 	})
// 	require.NoError(t, err)

// 	// reactivate group
// 	_, err = nodes[0].Client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
// 		GroupPK: accPK,
// 	})
// 	require.NoError(t, err)
// }

func TestDeactivateGroup(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	opts := bertyprotocol.TestingOpts{
		Mocknet:     libp2p_mocknet.New(ctx),
		Logger:      logger,
		ConnectFunc: bertyprotocol.ConnectAll,
	}

	nodes, cleanup := bertyprotocol.NewTestingProtocolWithMockedPeers(ctx, t, &opts, nil, 2)
	defer cleanup()

	addAsContact(ctx, t, nodes, nodes)

	// send messages before deactivating
	sendMessageToContact(ctx, t, []string{"pre-deactivate"}, nodes)

	// get contact group
	contactGroup := getContactGroup(ctx, t, nodes[0], nodes[1])

	// deactivate contact group on one end
	_, err := nodes[0].Client.DeactivateGroup(ctx, &protocoltypes.DeactivateGroup_Request{
		GroupPK: contactGroup.Group.PublicKey,
	})
	require.NoError(t, err)

	// reactivate group
	_, err = nodes[0].Client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
		GroupPK: contactGroup.Group.PublicKey,
	})
	require.NoError(t, err)

	// send message after reactivating
	sendMessageToContact(ctx, t, []string{"post-reactivate"}, nodes)
}
