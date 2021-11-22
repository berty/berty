package bertyprotocol

import (
	"bytes"
	"context"
	crand "crypto/rand"
	"fmt"
	mrand "math/rand"
	"testing"
	"time"

	datastore "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/crypto"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestMetadataStoreSecret_Basic(t *testing.T) {
	t.Skip("skipping as we don't care about this code now")

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	// TODO: handle more cases (more members, more devices...)
	memberCount := 2
	deviceCount := 1

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peers, groupSK, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/secrets_test", memberCount, deviceCount)
	defer cleanup()

	secretsAdded := make(chan struct{})

	msA := peers[0].GC.MetadataStore()
	msB := peers[1].GC.MetadataStore()

	go WatchNewMembersAndSendSecrets(ctx, logger, peers[0].GC)
	go WatchNewMembersAndSendSecrets(ctx, logger, peers[1].GC)
	go waitForBertyEventType(ctx, t, msA, protocoltypes.EventTypeGroupDeviceSecretAdded, 2, secretsAdded)
	go waitForBertyEventType(ctx, t, msB, protocoltypes.EventTypeGroupDeviceSecretAdded, 2, secretsAdded)
	inviteAllPeersToGroup(ctx, t, peers, groupSK)

	devPkA := peers[0].GC.DevicePubKey()
	devPkB := peers[1].GC.DevicePubKey()

	<-secretsAdded
	<-secretsAdded

	_ = devPkA
	_ = devPkB

	// secretAForB, err := msB.DeviceSecret(devPkA)
	// assert.NoError(t, err)
	//
	// secretBForA, err := msA.DeviceSecret(devPkB)
	// assert.NoError(t, err)
	//
	// secretAForA, err := peers[0].GetGroupContext().DeviceSecret(ctx)
	// assert.NoError(t, err)
	//
	// secretBForB, err := peers[1].GetGroupContext().DeviceSecret(ctx)
	// assert.NoError(t, err)
	//
	// assert.Equal(t, secretAForA.ChainKey, secretAForB.ChainKey)
	// assert.Equal(t, secretAForA.Counter, secretAForB.Counter)
	//
	// assert.Equal(t, secretBForB.ChainKey, secretBForA.ChainKey)
	// assert.Equal(t, secretBForB.Counter, secretBForA.Counter)
}

func TestMetadataStoreMember(t *testing.T) {
	t.Skip("skipping as we don't care about this code now")

	// If seed is not set, it will default to 1, explicitly setting it and displaying it if the test fails
	seed := time.Now().UTC().UnixNano()
	mrand.Seed(seed)

	for _, tc := range []struct {
		memberCount int
		deviceCount int
		slow        bool
	}{
		{memberCount: 1, deviceCount: 1, slow: false},
		{memberCount: 1, deviceCount: 3, slow: false},
		{memberCount: 3, deviceCount: 1, slow: false},
		// TODO: fix pubsub issues
		// {memberCount: 3, deviceCount: 3, slow: false},
	} {
		t.Run(fmt.Sprintf("testMemberStore seed: %d, memberCount: %d, deviceCount: %d", seed, tc.memberCount, tc.deviceCount), func(t *testing.T) {
			if tc.slow {
				// TODO: re-enable this test
				t.Skip()
				testutil.FilterSpeed(t, testutil.Slow)
			}

			testMemberStore(t, tc.memberCount, tc.deviceCount)
		})
	}
}

func testMemberStore(t *testing.T, memberCount, deviceCount int) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Creates N members with M devices each within the same group
	peers, groupSK, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/member_test", memberCount, deviceCount)
	defer cleanup()

	done := make(chan struct{})

	for _, peer := range peers {
		go waitForBertyEventType(ctx, t, peer.GC.MetadataStore(), protocoltypes.EventTypeGroupMemberDeviceAdded, len(peers), done)
	}

	for i, peer := range peers {
		if _, err := peer.GC.MetadataStore().AddDeviceToGroup(ctx); err != nil {
			t.Fatal(err)
		}

		if i == 0 {
			if _, err := peer.GC.MetadataStore().ClaimGroupOwnership(ctx, groupSK); err != nil {
				t.Fatal(err)
			}
		}
	}

	// Wait for all events to be received in all peers's member log (or timeout)
	for i := range peers {
		<-done
		t.Logf("got all members for member %d", i)
	}

	// Test if everything was replicated and indexed correctly
	for i, peer := range peers {
		ms := peer.GC.MetadataStore()

		// Test list functions (only length, checking all entries would be too long)
		memberList := ms.ListMembers()
		if len(memberList) != memberCount {
			t.Fatalf("%d member(s) missing from peer %d member list (%d/%d)", memberCount-len(memberList), i, len(memberList), memberCount)
		}

		deviceList := ms.ListDevices()
		if len(deviceList) != memberCount*deviceCount {
			t.Fatalf("%d device(s) missing from peer %d device list (%d/%d)", memberCount*deviceCount-len(deviceList), i, len(deviceList), memberCount*deviceCount)
		}

		// Test entries getter functions
		for j, peerDev := range peers {
			if _, err := ms.GetDevicesForMember(peerDev.GC.MemberPubKey()); err != nil {
				t.Fatalf("member of peer %d is missing from peer %d member map: %v", j, i, err)
			}
			if _, err := ms.GetMemberByDevice(peerDev.GC.MemberPubKey()); err != nil {
				t.Fatalf("device of peer %d is missing from peer %d device map: %v", j, i, err)
			}
		}
	}
}

func ipfsAPIUsingMockNet(ctx context.Context, t *testing.T) (ipfsutil.ExtendedCoreAPI, func()) {
	ipfsopts := &ipfsutil.TestingAPIOpts{
		Logger:    zap.NewNop(),
		Mocknet:   libp2p_mocknet.New(ctx),
		Datastore: ds_sync.MutexWrap(datastore.NewMapDatastore()),
	}

	node, cleanupNode := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsopts)

	return node.API(), cleanupNode
}

func TestFlappyMetadataRendezvousPointLifecycle(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Flappy, testutil.Fast)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Creates N members with M devices each within the same group
	peers, _, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/member_test", 1, 1)
	defer cleanup()

	api, cleanupNode := ipfsAPIUsingMockNet(ctx, t)
	defer cleanupNode()

	ownCG, err := peers[0].DB.openAccountGroup(ctx, nil, api)
	assert.NoError(t, err)

	meta := ownCG.MetadataStore()

	accSK, err := peers[0].DevKS.AccountPrivKey()
	assert.NoError(t, err)
	accPK, err := accSK.GetPublic().Raw()
	assert.NoError(t, err)

	enabled, shareableContact := meta.GetIncomingContactRequestsStatus()
	assert.False(t, enabled)
	assert.NotNil(t, shareableContact)

	// reset rdv seed
	_, err = meta.ContactRequestReferenceReset(ctx)
	assert.NoError(t, err)

	// get set shareable contact, not enabled
	enabled, shareableContact = meta.GetIncomingContactRequestsStatus()
	assert.False(t, enabled)
	assert.NotNil(t, shareableContact)
	assert.Equal(t, accPK, shareableContact.PK)
	assert.Equal(t, 32, len(shareableContact.PublicRendezvousSeed))

	_, err = meta.ContactRequestEnable(ctx)
	assert.NoError(t, err)

	enabled, shareableContact = meta.GetIncomingContactRequestsStatus()
	assert.True(t, enabled)
	assert.NotNil(t, shareableContact)

	// Force reindex to check both enabled and seed
	err = meta.Load(ctx, -1)
	assert.NoError(t, err)

	enabled, shareableContact = meta.GetIncomingContactRequestsStatus()
	assert.True(t, enabled)
	assert.NotNil(t, shareableContact)
	assert.Equal(t, accPK, shareableContact.PK)
	assert.Equal(t, 32, len(shareableContact.PublicRendezvousSeed))

	// Disable incoming contact requests
	_, err = meta.ContactRequestDisable(ctx)
	assert.NoError(t, err)

	enabled, shareableContact = meta.GetIncomingContactRequestsStatus()
	assert.False(t, enabled)
	assert.NotNil(t, shareableContact)
	assert.Equal(t, accPK, shareableContact.PK)
	assert.Equal(t, 32, len(shareableContact.PublicRendezvousSeed))
}

func TestMetadataContactLifecycle(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peersCount := 4

	// Creates N members with M devices each within the same group
	peers, _, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/member_test", peersCount, 1)
	defer cleanup()

	var (
		err      error
		meta     = make([]*MetadataStore, peersCount)
		ownCG    = make([]*GroupContext, peersCount)
		contacts = make([]*protocoltypes.ShareableContact, peersCount)
	)

	api, cleanupNode := ipfsAPIUsingMockNet(ctx, t)
	defer cleanupNode()

	for i, p := range peers {
		ownCG[i], err = p.DB.openAccountGroup(ctx, nil, api)
		require.NoError(t, err)

		meta[i] = ownCG[i].MetadataStore()
		_, err = meta[i].ContactRequestReferenceReset(ctx)
		require.NoError(t, err)

		_, contacts[i] = meta[i].GetIncomingContactRequestsStatus()
		require.NotNil(t, contacts[i])

		contacts[i].Metadata = []byte(fmt.Sprintf("own meta %d", i))
	}

	_, randPK, err := crypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err)

	// no contacts
	require.Equal(t, len(meta[0].Index().(*metadataStoreIndex).contacts), 0)

	_, err = meta[0].ContactRequestReferenceReset(ctx)
	require.NoError(t, err)

	contact2PK := contacts[1].PK
	contact2RDVS := contacts[1].PublicRendezvousSeed

	// Enqueuing outgoing

	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[0], contacts[0].Metadata)
	require.Error(t, err)

	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1], contacts[0].Metadata)
	require.NoError(t, err)

	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1], contacts[0].Metadata)
	require.NoError(t, err)

	require.Equal(t, len(meta[0].Index().(*metadataStoreIndex).contacts), 1)
	require.NotNil(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)])
	require.Equal(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].state, protocoltypes.ContactStateToRequest)
	require.Equal(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].contact.PK, contact2PK)
	require.Equal(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].contact.PublicRendezvousSeed, contact2RDVS)
	require.Equal(t, contacts[0].Metadata, meta[0].Index().(*metadataStoreIndex).contactRequestMetadata[string(contact2PK)])

	contacts[1].PublicRendezvousSeed = nil
	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1], contacts[0].Metadata)
	require.Error(t, err)

	contacts[1].PublicRendezvousSeed = []byte("too_short")
	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1], contacts[0].Metadata)
	require.Error(t, err)

	contacts[1].PK = nil
	contacts[1].PublicRendezvousSeed = contact2RDVS
	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1], contacts[0].Metadata)
	require.Error(t, err)

	contacts[1].PK = []byte("invalid")
	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1], contacts[0].Metadata)
	require.Error(t, err)

	require.Equal(t, 1, len(meta[0].Index().(*metadataStoreIndex).contacts))
	require.NotNil(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)])
	require.Equal(t, protocoltypes.ContactStateToRequest, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].state)
	require.Equal(t, contact2PK, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].contact.PK)
	require.Equal(t, contact2RDVS, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].contact.PublicRendezvousSeed)
	require.Equal(t, contacts[0].Metadata, meta[0].Index().(*metadataStoreIndex).contactRequestMetadata[string(contact2PK)])

	contacts[1].PK = contact2PK
	contacts[1].PublicRendezvousSeed = contact2RDVS
	meta[0].Index().(*metadataStoreIndex).contactRequestMetadata[string(contacts[1].PK)] = contacts[0].Metadata

	// Marking as sent

	_, err = meta[0].ContactRequestOutgoingSent(ctx, nil)
	require.Error(t, err)

	_, err = meta[0].ContactRequestOutgoingSent(ctx, randPK)
	require.Error(t, err)

	_, err = meta[0].ContactRequestOutgoingSent(ctx, ownCG[0].MemberPubKey())
	require.Error(t, err)

	meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].state = protocoltypes.ContactStateAdded
	_, err = meta[0].ContactRequestOutgoingSent(ctx, ownCG[1].MemberPubKey())
	require.Error(t, err)

	meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].state = protocoltypes.ContactStateToRequest
	_, err = meta[0].ContactRequestOutgoingSent(ctx, ownCG[1].MemberPubKey())
	require.NoError(t, err)

	require.Equal(t, len(meta[0].Index().(*metadataStoreIndex).contacts), 1)
	require.NotNil(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)])
	require.Equal(t, protocoltypes.ContactStateAdded, meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].state)
	require.Equal(t, contacts[1].PK, meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].contact.PK)
	require.Equal(t, contacts[1].PublicRendezvousSeed, meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].contact.PublicRendezvousSeed)

	// Marking as received

	_, err = meta[1].ContactRequestIncomingReceived(ctx, &protocoltypes.ShareableContact{})
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, &protocoltypes.ShareableContact{PK: []byte("invalid"), PublicRendezvousSeed: []byte("invalid")})
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, &protocoltypes.ShareableContact{PK: []byte("invalid"), PublicRendezvousSeed: contacts[0].PublicRendezvousSeed})
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, &protocoltypes.ShareableContact{PK: contacts[0].PK, PublicRendezvousSeed: []byte("invalid")})
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[1])
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[0])
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 1)
	require.NotNil(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)])
	require.Equal(t, protocoltypes.ContactStateReceived, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state)
	require.Equal(t, contacts[0].PK, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.PK)
	require.Equal(t, contacts[0].PublicRendezvousSeed, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.PublicRendezvousSeed)
	require.Equal(t, contacts[0].Metadata, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.Metadata)

	// Accepting received

	_, err = meta[1].ContactRequestIncomingAccept(ctx, nil)
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingAccept(ctx, randPK)
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingAccept(ctx, ownCG[1].MemberPubKey())
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingAccept(ctx, ownCG[0].MemberPubKey())
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 1)
	require.NotNil(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)])
	require.Equal(t, protocoltypes.ContactStateAdded, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state)
	require.Equal(t, contacts[0].PK, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.PK)
	require.Equal(t, contacts[0].PublicRendezvousSeed, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.PublicRendezvousSeed)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[0])
	require.Error(t, err)

	// Auto accept when receiving an invitation from a contact you were waiting to send an invitation to

	_, err = meta[1].ContactRequestOutgoingEnqueue(ctx, contacts[3], contacts[1].Metadata)
	require.NoError(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[3])
	require.NoError(t, err)

	require.Equal(t, 2, len(meta[1].Index().(*metadataStoreIndex).contacts))

	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[3].PK)].state, protocoltypes.ContactStateAdded)

	// Refuse contact

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[2])
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, protocoltypes.ContactStateReceived)

	_, err = meta[1].ContactRequestIncomingDiscard(ctx, nil)
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingDiscard(ctx, randPK)
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingDiscard(ctx, ownCG[0].MemberPubKey())
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingDiscard(ctx, ownCG[1].MemberPubKey())
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingDiscard(ctx, ownCG[2].MemberPubKey())
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, protocoltypes.ContactStateDiscarded)

	// Allow receiving requests again after discarded

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[2])
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, protocoltypes.ContactStateReceived)

	_, err = meta[1].ContactRequestOutgoingEnqueue(ctx, contacts[2], contacts[1].Metadata)
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, protocoltypes.ContactStateAdded)

	// Auto accept discarded requests

	meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state = protocoltypes.ContactStateDiscarded

	_, err = meta[1].ContactRequestOutgoingEnqueue(ctx, contacts[2], contacts[1].Metadata)
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, protocoltypes.ContactStateAdded)

	// Block contact

	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 0)

	_, err = meta[2].ContactBlock(ctx, ownCG[2].MemberPubKey())
	require.Error(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 0)

	_, err = meta[2].ContactBlock(ctx, ownCG[0].MemberPubKey())
	require.NoError(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, protocoltypes.ContactStateBlocked)

	_, err = meta[2].ContactBlock(ctx, ownCG[0].MemberPubKey())
	require.Error(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, protocoltypes.ContactStateBlocked)

	// Unblock contact

	_, err = meta[2].ContactUnblock(ctx, ownCG[1].MemberPubKey())
	require.Error(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, protocoltypes.ContactStateBlocked)

	_, err = meta[2].ContactUnblock(ctx, ownCG[0].MemberPubKey())
	require.NoError(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, protocoltypes.ContactStateRemoved)

	_, err = meta[2].ContactUnblock(ctx, ownCG[0].MemberPubKey())
	require.Error(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, protocoltypes.ContactStateRemoved)
}

func TestMetadataAliasLifecycle(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peersCount := 4

	// Creates N members with M devices each within the same group
	peers, _, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/member_test", peersCount, 1)
	defer cleanup()

	// disclose
	_, err := peers[0].GC.MetadataStore().ContactSendAliasKey(ctx)
	require.Error(t, err)

	sk, err := peers[0].DevKS.ContactGroupPrivKey(peers[1].GC.MemberPubKey())
	require.NoError(t, err)

	g, err := cryptoutil.GetGroupForContact(sk)
	require.NoError(t, err)

	cg0, err := peers[0].DB.OpenGroup(ctx, g, nil)
	require.NoError(t, err)

	require.False(t, cg0.MetadataStore().Index().(*metadataStoreIndex).ownAliasKeySent)

	_, err = cg0.MetadataStore().AddDeviceToGroup(ctx)
	require.NoError(t, err)

	_, err = cg0.MetadataStore().ContactSendAliasKey(ctx)
	require.NoError(t, err)

	require.Empty(t, cg0.MetadataStore().Index().(*metadataStoreIndex).otherAliasKey)
	require.True(t, cg0.MetadataStore().Index().(*metadataStoreIndex).ownAliasKeySent)

	sk, err = peers[1].DevKS.ContactGroupPrivKey(peers[0].GC.MemberPubKey())
	require.NoError(t, err)

	g, err = cryptoutil.GetGroupForContact(sk)
	require.NoError(t, err)

	cg1, err := peers[1].DB.OpenGroup(ctx, g, nil)
	require.NoError(t, err)

	_ = cg1

	// TODO: receive key on cg1 from cg0

	// TODO: match received alias proof with previously disclosed key
}

func TestMetadataGroupsLifecycle(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Creates N members with M devices each within the same group
	peers, _, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/member_test", 1, 1)
	defer cleanup()

	api, cleanupNode := ipfsAPIUsingMockNet(ctx, t)
	defer cleanupNode()

	ownCG, err := peers[0].DB.openAccountGroup(ctx, nil, api)
	assert.NoError(t, err)

	g1, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	g2, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	g3, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	g1PK, err := g1.GetPubKey()
	require.NoError(t, err)

	g3PK, err := g3.GetPubKey()
	require.NoError(t, err)

	_, err = ownCG.MetadataStore().GroupJoin(ctx, g1)
	require.NoError(t, err)

	groups := ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 1)
	require.Equal(t, groups[0].PublicKey, g1.PublicKey)
	require.Equal(t, groups[0].Secret, g1.Secret)
	require.Equal(t, groups[0].SecretSig, g1.SecretSig)
	require.Equal(t, groups[0].GroupType, g1.GroupType)

	_, err = ownCG.MetadataStore().GroupJoin(ctx, g2)
	require.NoError(t, err)

	groups = ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 2)
	first, second := 0, 1
	if bytes.Compare(groups[1].PublicKey, g1.PublicKey) == 0 {
		first, second = 1, 0
	}
	require.Equal(t, groups[first].PublicKey, g1.PublicKey)
	require.Equal(t, groups[first].Secret, g1.Secret)
	require.Equal(t, groups[first].SecretSig, g1.SecretSig)
	require.Equal(t, groups[first].GroupType, g1.GroupType)

	require.Equal(t, groups[second].PublicKey, g2.PublicKey)
	require.Equal(t, groups[second].Secret, g2.Secret)
	require.Equal(t, groups[second].SecretSig, g2.SecretSig)
	require.Equal(t, groups[second].GroupType, g2.GroupType)

	_, err = ownCG.MetadataStore().GroupJoin(ctx, &protocoltypes.Group{
		PublicKey: []byte("invalid_pk"),
		Secret:    g3.Secret,
		SecretSig: g3.SecretSig,
		GroupType: protocoltypes.GroupTypeMultiMember,
	})
	require.Error(t, err)

	groups = ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 2)

	_, err = ownCG.MetadataStore().GroupJoin(ctx, &protocoltypes.Group{
		PublicKey: g3.PublicKey,
		Secret:    nil,
		SecretSig: g3.SecretSig,
		GroupType: protocoltypes.GroupTypeMultiMember,
	})
	require.Error(t, err)

	_, err = ownCG.MetadataStore().GroupJoin(ctx, &protocoltypes.Group{
		PublicKey: g3.PublicKey,
		Secret:    g3.Secret,
		SecretSig: []byte("invalid_sig"),
		GroupType: protocoltypes.GroupTypeMultiMember,
	})
	require.Error(t, err)

	_, err = ownCG.MetadataStore().GroupJoin(ctx, g1)
	require.Error(t, err)

	groups = ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 2)

	_, err = ownCG.MetadataStore().GroupLeave(ctx, nil)
	require.Error(t, err)

	groups = ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 2)

	_, err = ownCG.MetadataStore().GroupLeave(ctx, g1PK)
	require.NoError(t, err)

	groups = ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 1)

	_, err = ownCG.MetadataStore().GroupLeave(ctx, g1PK)
	require.Error(t, err)

	groups = ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 1)

	_, err = ownCG.MetadataStore().GroupLeave(ctx, g3PK)
	require.Error(t, err)

	groups = ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 1)
	require.Equal(t, groups[0].PublicKey, g2.PublicKey)
	require.Equal(t, groups[0].Secret, g2.Secret)
	require.Equal(t, groups[0].SecretSig, g2.SecretSig)
	require.Equal(t, groups[0].GroupType, g2.GroupType)
}

func TestFlappyMultiDevices_Basic(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Flappy, testutil.Slow)

	memberCount := 2
	deviceCount := 3
	totalDevices := memberCount * deviceCount

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	peers, _, cleanup := CreatePeersWithGroupTest(ctx, t, "/tmp/multidevices_test", memberCount, deviceCount)
	defer cleanup()

	api, cleanupNode := ipfsAPIUsingMockNet(ctx, t)
	defer cleanupNode()
	// make peer index
	pi := [][]int{}
	for i := 0; i < memberCount; i++ {
		pi = append(pi, []int{})
		for j := 0; j < deviceCount; j++ {
			pi[i] = append(pi[i], i*deviceCount+j)
		}
	}

	var (
		err          error
		meta         = make([]*MetadataStore, totalDevices)
		ownCG        = make([]*GroupContext, totalDevices)
		contacts     = make([]*protocoltypes.ShareableContact, totalDevices)
		listContacts map[string]*AccountContact
		groups       []*protocoltypes.Group
	)

	// Activate account group + contact request
	for i, p := range peers {
		// except for the latest peer devices
		if (i % deviceCount) == (deviceCount - 1) {
			continue
		}
		ownCG[i], err = p.DB.openAccountGroup(ctx, nil, api)
		require.NoError(t, err)

		meta[i] = ownCG[i].MetadataStore()
		_, err = meta[i].ContactRequestEnable(ctx)
		assert.NoError(t, err)

		_, err = meta[i].ContactRequestReferenceReset(ctx)
		require.NoError(t, err)

		_, contacts[i] = meta[i].GetIncomingContactRequestsStatus()
		require.NotNil(t, contacts[i])

		contacts[i].Metadata = []byte(fmt.Sprintf("own meta %d", i))
	}

	syncChan := make(chan struct{})
	go waitForBertyEventType(ctx, t, meta[pi[0][0]], protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued, 1, syncChan)
	go waitForBertyEventType(ctx, t, meta[pi[0][1]], protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued, 1, syncChan)
	go waitForBertyEventType(ctx, t, meta[pi[1][0]], protocoltypes.EventTypeAccountContactRequestIncomingReceived, 1, syncChan)
	go waitForBertyEventType(ctx, t, meta[pi[1][1]], protocoltypes.EventTypeAccountContactRequestIncomingReceived, 1, syncChan)

	// Add peers to contact
	// Enqueuing outgoing
	_, err = meta[pi[0][0]].ContactRequestOutgoingEnqueue(ctx, contacts[pi[1][0]], contacts[pi[0][0]].Metadata)
	require.NoError(t, err)

	// Marking as sent
	_, err = meta[pi[0][0]].ContactRequestOutgoingSent(ctx, ownCG[pi[1][0]].MemberPubKey())
	require.NoError(t, err)

	// Marking as received
	_, err = meta[pi[1][0]].ContactRequestIncomingReceived(ctx, contacts[pi[0][0]])
	require.NoError(t, err)

	// Accepting received
	_, err = meta[pi[1][0]].ContactRequestIncomingAccept(ctx, ownCG[pi[0][0]].MemberPubKey())
	require.NoError(t, err)

	for i := 0; i < 4; i++ {
		select {
		case <-syncChan:
		case <-ctx.Done():
			require.NoError(t, ctx.Err())
		}
	}

	// test if contact is established
	listContacts = meta[pi[0][0]].ListContacts()
	require.Equal(t, 1, len(listContacts))
	require.NotNil(t, listContacts[string(contacts[pi[1][0]].PK)])
	listContacts = meta[pi[1][0]].ListContacts()
	require.Equal(t, 1, len(listContacts))
	require.NotNil(t, listContacts[string(contacts[pi[0][0]].PK)])

	// test if 2nd devices have also the contact
	listContacts = meta[pi[0][1]].ListContacts()
	require.Equal(t, 1, len(listContacts))
	require.NotNil(t, listContacts[string(contacts[pi[1][0]].PK)])
	listContacts = meta[pi[1][1]].ListContacts()
	require.Equal(t, 1, len(listContacts))
	require.NotNil(t, listContacts[string(contacts[pi[0][0]].PK)])

	// Activate group for 2nd peer's 1st device
	groups = meta[pi[1][0]].ListMultiMemberGroups()
	require.Len(t, groups, 0)
	go waitForBertyEventType(ctx, t, meta[pi[1][0]], protocoltypes.EventTypeAccountGroupJoined, 1, syncChan)
	go waitForBertyEventType(ctx, t, meta[pi[1][1]], protocoltypes.EventTypeAccountGroupJoined, 1, syncChan)
	_, err = meta[pi[1][0]].GroupJoin(ctx, peers[pi[1][0]].GC.group)
	require.NoError(t, err)
	for i := 0; i < 2; i++ {
		select {
		case <-syncChan:
		case <-ctx.Done():
			require.NoError(t, ctx.Err())
		}
	}
	groups = meta[pi[1][0]].ListMultiMemberGroups()
	require.Len(t, groups, 1)

	// Test if other devices have the group too
	groups = meta[pi[1][1]].ListMultiMemberGroups()
	require.Len(t, groups, 1)

	// Check if a account group activate after the contact request is synchronized
	// Activate the 2nd peer's latest device account group
	ownCG[pi[1][2]], err = peers[pi[1][2]].DB.openAccountGroup(ctx, nil, api)
	require.NoError(t, err)
	meta[pi[1][2]] = ownCG[pi[1][2]].MetadataStore()

	// wait for replication db
	<-time.After(time.Second * 2)

	listContacts = meta[pi[1][2]].ListContacts()
	require.Equal(t, 1, len(listContacts))
	require.NotNil(t, listContacts[string(contacts[0].PK)])

	// Test for group
	groups = meta[pi[1][2]].ListMultiMemberGroups()
	require.Len(t, groups, 1)
}
