package bertyprotocol

import (
	"bytes"
	"context"
	crand "crypto/rand"
	"fmt"
	mrand "math/rand"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

func TestMetadataStoreSecret_Basic(t *testing.T) {
	t.Skip("skipping as we don't care about this code now")

	// TODO: handle more cases (more members, more devices...)
	memberCount := 2
	deviceCount := 1

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peers, groupSK := createPeersWithGroup(ctx, t, "/tmp/secrets_test", memberCount, deviceCount)
	defer dropPeers(t, peers)

	secretsAdded := make(chan struct{})

	msA := peers[0].GC.MetadataStore()
	msB := peers[1].GC.MetadataStore()

	go WatchNewMembersAndSendSecrets(ctx, zap.L(), peers[0].GC)
	go WatchNewMembersAndSendSecrets(ctx, zap.L(), peers[1].GC)
	go waitForBertyEventType(ctx, t, msA, bertytypes.EventTypeGroupDeviceSecretAdded, 2, secretsAdded)
	go waitForBertyEventType(ctx, t, msB, bertytypes.EventTypeGroupDeviceSecretAdded, 2, secretsAdded)
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
				testutil.SkipSlow(t)
			}

			testMemberStore(t, tc.memberCount, tc.deviceCount)
		})
	}
}

func testMemberStore(t *testing.T, memberCount, deviceCount int) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Creates N members with M devices each within the same group
	peers, groupSK := createPeersWithGroup(ctx, t, "/tmp/member_test", memberCount, deviceCount)
	defer dropPeers(t, peers)

	done := make(chan struct{})

	for _, peer := range peers {
		go waitForBertyEventType(ctx, t, peer.GC.MetadataStore(), bertytypes.EventTypeGroupMemberDeviceAdded, len(peers), done)
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

func TestMetadataRendezvousPointLifecycle(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Creates N members with M devices each within the same group
	peers, _ := createPeersWithGroup(ctx, t, "/tmp/member_test", 1, 1)
	defer dropPeers(t, peers)

	ownCG, err := peers[0].DB.OpenAccountGroup(ctx, nil)
	assert.NoError(t, err)

	meta := ownCG.MetadataStore()
	index, ok := meta.Index().(*metadataStoreIndex)
	require.True(t, ok)

	accSK, err := peers[0].DevKS.AccountPrivKey()
	assert.NoError(t, err)
	accPK, err := accSK.GetPublic().Raw()
	assert.NoError(t, err)

	enabled, shareableContact := meta.GetIncomingContactRequestsStatus()
	assert.False(t, enabled)
	assert.Nil(t, shareableContact)

	// reset rdv seed
	_, err = meta.ContactRequestReferenceReset(ctx)
	assert.NoError(t, err)

	// get set shareable contact, not enabled
	enabled, shareableContact = meta.GetIncomingContactRequestsStatus()
	assert.False(t, enabled)
	assert.NotNil(t, shareableContact)
	assert.Equal(t, accPK, shareableContact.PK)
	assert.Equal(t, 32, len(shareableContact.PublicRendezvousSeed))

	// fake not set rdv seed, enable rdv point
	_, err = meta.ContactRequestEnable(ctx)
	assert.NoError(t, err)
	index.contactRequestSeed = nil

	enabled, shareableContact = meta.GetIncomingContactRequestsStatus()
	assert.True(t, enabled)
	assert.Nil(t, shareableContact)

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
	assert.True(t, enabled)
	assert.NotNil(t, shareableContact)
	assert.Equal(t, accPK, shareableContact.PK)
	assert.Equal(t, 32, len(shareableContact.PublicRendezvousSeed))
}

func TestMetadataContactLifecycle(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peersCount := 4

	// Creates N members with M devices each within the same group
	peers, _ := createPeersWithGroup(ctx, t, "/tmp/member_test", peersCount, 1)
	defer dropPeers(t, peers)

	var (
		err      error
		meta     = make([]*metadataStore, peersCount)
		ownCG    = make([]*groupContext, peersCount)
		contacts = make([]*bertytypes.ShareableContact, peersCount)
	)

	for i, p := range peers {
		ownCG[i], err = p.DB.OpenAccountGroup(ctx, nil)
		require.NoError(t, err)

		meta[i] = ownCG[i].MetadataStore()
		_, err = meta[i].ContactRequestReferenceReset(ctx)
		require.NoError(t, err)

		_, contacts[i] = meta[i].GetIncomingContactRequestsStatus()
		require.NotNil(t, contacts[i])
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

	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[0])
	require.Error(t, err)

	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1])
	require.NoError(t, err)

	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1])
	require.NoError(t, err)

	require.Equal(t, len(meta[0].Index().(*metadataStoreIndex).contacts), 1)
	require.NotNil(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)])
	require.Equal(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].state, bertytypes.ContactStateToRequest)
	require.Equal(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].contact.PK, contact2PK)
	require.Equal(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].contact.PublicRendezvousSeed, contact2RDVS)

	contacts[1].PublicRendezvousSeed = nil
	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1])
	require.Error(t, err)

	contacts[1].PublicRendezvousSeed = []byte("too_short")
	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1])
	require.Error(t, err)

	contacts[1].PK = nil
	contacts[1].PublicRendezvousSeed = contact2RDVS
	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1])
	require.Error(t, err)

	contacts[1].PK = []byte("invalid")
	_, err = meta[0].ContactRequestOutgoingEnqueue(ctx, contacts[1])
	require.Error(t, err)

	require.Equal(t, 1, len(meta[0].Index().(*metadataStoreIndex).contacts))
	require.NotNil(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)])
	require.Equal(t, bertytypes.ContactStateToRequest, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].state)
	require.Equal(t, contact2PK, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].contact.PK)
	require.Equal(t, contact2RDVS, meta[0].Index().(*metadataStoreIndex).contacts[string(contact2PK)].contact.PublicRendezvousSeed)

	contacts[1].PK = contact2PK
	contacts[1].PublicRendezvousSeed = contact2RDVS

	// Marking as sent

	_, err = meta[0].ContactRequestOutgoingSent(ctx, nil)
	require.Error(t, err)

	_, err = meta[0].ContactRequestOutgoingSent(ctx, randPK)
	require.Error(t, err)

	_, err = meta[0].ContactRequestOutgoingSent(ctx, ownCG[0].MemberPubKey())
	require.Error(t, err)

	meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].state = bertytypes.ContactStateAdded
	_, err = meta[0].ContactRequestOutgoingSent(ctx, ownCG[1].MemberPubKey())
	require.Error(t, err)

	meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].state = bertytypes.ContactStateToRequest
	_, err = meta[0].ContactRequestOutgoingSent(ctx, ownCG[1].MemberPubKey())
	require.NoError(t, err)

	require.Equal(t, len(meta[0].Index().(*metadataStoreIndex).contacts), 1)
	require.NotNil(t, meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)])
	require.Equal(t, bertytypes.ContactStateAdded, meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].state)
	require.Equal(t, contacts[1].PK, meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].contact.PK)
	require.Equal(t, contacts[1].PublicRendezvousSeed, meta[0].Index().(*metadataStoreIndex).contacts[string(contacts[1].PK)].contact.PublicRendezvousSeed)

	// Marking as received

	_, err = meta[1].ContactRequestIncomingReceived(ctx, &bertytypes.ShareableContact{})
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, &bertytypes.ShareableContact{PK: []byte("invalid"), PublicRendezvousSeed: []byte("invalid")})
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, &bertytypes.ShareableContact{PK: []byte("invalid"), PublicRendezvousSeed: contacts[0].PublicRendezvousSeed})
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, &bertytypes.ShareableContact{PK: contacts[0].PK, PublicRendezvousSeed: []byte("invalid")})
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[1])
	require.Error(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[0])
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 1)
	require.NotNil(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)])
	require.Equal(t, bertytypes.ContactStateReceived, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state)
	require.Equal(t, contacts[0].PK, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.PK)
	require.Equal(t, contacts[0].PublicRendezvousSeed, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.PublicRendezvousSeed)

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
	require.Equal(t, bertytypes.ContactStateAdded, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state)
	require.Equal(t, contacts[0].PK, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.PK)
	require.Equal(t, contacts[0].PublicRendezvousSeed, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].contact.PublicRendezvousSeed)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[0])
	require.Error(t, err)

	// Auto accept when receiving an invitation from a contact you were waiting to send an invitation to

	_, err = meta[1].ContactRequestOutgoingEnqueue(ctx, contacts[3])
	require.NoError(t, err)

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[3])
	require.NoError(t, err)

	require.Equal(t, 2, len(meta[1].Index().(*metadataStoreIndex).contacts))

	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[3].PK)].state, bertytypes.ContactStateAdded)

	// Refuse contact

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[2])
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, bertytypes.ContactStateReceived)

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
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, bertytypes.ContactStateDiscarded)

	// Allow receiving requests again after discarded

	_, err = meta[1].ContactRequestIncomingReceived(ctx, contacts[2])
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, bertytypes.ContactStateReceived)

	_, err = meta[1].ContactRequestOutgoingEnqueue(ctx, contacts[2])
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, bertytypes.ContactStateAdded)

	// Auto accept discarded requests

	meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state = bertytypes.ContactStateDiscarded

	_, err = meta[1].ContactRequestOutgoingEnqueue(ctx, contacts[2])
	require.NoError(t, err)

	require.Equal(t, len(meta[1].Index().(*metadataStoreIndex).contacts), 3)
	require.Equal(t, meta[1].Index().(*metadataStoreIndex).contacts[string(contacts[2].PK)].state, bertytypes.ContactStateAdded)

	// Block contact

	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 0)

	_, err = meta[2].ContactBlock(ctx, ownCG[2].MemberPubKey())
	require.Error(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 0)

	_, err = meta[2].ContactBlock(ctx, ownCG[0].MemberPubKey())
	require.NoError(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, bertytypes.ContactStateBlocked)

	_, err = meta[2].ContactBlock(ctx, ownCG[0].MemberPubKey())
	require.Error(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, bertytypes.ContactStateBlocked)

	// Unblock contact

	_, err = meta[2].ContactUnblock(ctx, ownCG[1].MemberPubKey())
	require.Error(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, bertytypes.ContactStateBlocked)

	_, err = meta[2].ContactUnblock(ctx, ownCG[0].MemberPubKey())
	require.NoError(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, bertytypes.ContactStateRemoved)

	_, err = meta[2].ContactUnblock(ctx, ownCG[0].MemberPubKey())
	require.Error(t, err)
	require.Equal(t, len(meta[2].Index().(*metadataStoreIndex).contacts), 1)
	require.Equal(t, meta[2].Index().(*metadataStoreIndex).contacts[string(contacts[0].PK)].state, bertytypes.ContactStateRemoved)
}

func TestMetadataAliasLifecycle(t *testing.T) {
	testutil.SkipSlow(t)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peersCount := 4

	// Creates N members with M devices each within the same group
	peers, _ := createPeersWithGroup(ctx, t, "/tmp/member_test", peersCount, 1)
	defer dropPeers(t, peers)

	// disclose
	_, err := peers[0].GC.MetadataStore().ContactSendAliasKey(ctx)
	require.Error(t, err)

	sk, err := peers[0].DevKS.ContactGroupPrivKey(peers[1].GC.MemberPubKey())
	require.NoError(t, err)

	g, err := getGroupForContact(sk)
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

	g, err = getGroupForContact(sk)
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
	peers, _ := createPeersWithGroup(ctx, t, "/tmp/member_test", 1, 1)
	defer dropPeers(t, peers)

	ownCG, err := peers[0].DB.OpenAccountGroup(ctx, nil)
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

	_, err = ownCG.MetadataStore().GroupJoin(ctx, &bertytypes.Group{
		PublicKey: []byte("invalid_pk"),
		Secret:    g3.Secret,
		SecretSig: g3.SecretSig,
		GroupType: bertytypes.GroupTypeMultiMember,
	})
	require.Error(t, err)

	groups = ownCG.MetadataStore().ListMultiMemberGroups()
	require.Len(t, groups, 2)

	_, err = ownCG.MetadataStore().GroupJoin(ctx, &bertytypes.Group{
		PublicKey: g3.PublicKey,
		Secret:    nil,
		SecretSig: g3.SecretSig,
		GroupType: bertytypes.GroupTypeMultiMember,
	})
	require.Error(t, err)

	_, err = ownCG.MetadataStore().GroupJoin(ctx, &bertytypes.Group{
		PublicKey: g3.PublicKey,
		Secret:    g3.Secret,
		SecretSig: []byte("invalid_sig"),
		GroupType: bertytypes.GroupTypeMultiMember,
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
