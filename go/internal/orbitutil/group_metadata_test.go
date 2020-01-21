package orbitutil

import (
	"context"
	"fmt"
	"math/rand"
	"testing"
	"time"

	ipfs_log "github.com/ipfs/go-log"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"

	"berty.tech/berty/go/internal/testutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

func init() {
	//zaptest.Level(zapcore.DebugLevel)
	//config := zap.NewDevelopmentConfig()
	//config.OutputPaths = []string{"stdout"}
	//logger, _ := config.Build()
	//zap.ReplaceGlobals(logger)
	//
	// import ipfs_log "github.com/ipfs/go-log"
	ipfs_log.SetDebugLogging()
}

func TestMetadataStoreSecret_Basic(t *testing.T) {
	t.Skip("skipping as we don't care about this code now")

	// TODO: handle more cases (more members, more devices...)
	memberCount := 2
	deviceCount := 1

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peers, groupSK := CreatePeersWithGroup(ctx, t, "/tmp/secrets_test", memberCount, deviceCount, true)
	defer DropPeers(t, peers)

	secretsAdded := make(chan struct{})

	go WatchNewMembersAndSendSecrets(ctx, zap.L(), peers[0].GetGroupContext())
	go WatchNewMembersAndSendSecrets(ctx, zap.L(), peers[1].GetGroupContext())
	go WaitForBertyEventType(ctx, t, peers[0], bertyprotocol.EventTypeGroupDeviceSecretAdded, 2, secretsAdded)
	go WaitForBertyEventType(ctx, t, peers[1], bertyprotocol.EventTypeGroupDeviceSecretAdded, 2, secretsAdded)
	InviteAllPeersToGroup(ctx, t, peers, groupSK)

	msA := peers[0].GetGroupContext().GetMetadataStore()
	msB := peers[1].GetGroupContext().GetMetadataStore()

	devPkA := peers[0].GetGroupContext().GetDevicePrivKey().GetPublic()
	devPkB := peers[1].GetGroupContext().GetDevicePrivKey().GetPublic()

	<-secretsAdded
	<-secretsAdded

	secretAForB, err := msB.GetDeviceSecret(devPkA)
	assert.NoError(t, err)

	secretBForA, err := msA.GetDeviceSecret(devPkB)
	assert.NoError(t, err)

	secretAForA := peers[0].GetGroupContext().GetDeviceSecret()
	secretBForB := peers[1].GetGroupContext().GetDeviceSecret()

	assert.Equal(t, secretAForA.ChainKey, secretAForB.ChainKey)
	assert.Equal(t, secretAForA.Counter, secretAForB.Counter)

	assert.Equal(t, secretBForB.ChainKey, secretBForA.ChainKey)
	assert.Equal(t, secretBForB.Counter, secretBForA.Counter)
}

func TestMetadataStoreMember(t *testing.T) {
	t.Skip("skipping as we don't care about this code now")

	// If seed is not set, it will default to 1, explicitly setting it and displaying it if the test fails
	seed := time.Now().UTC().UnixNano()
	rand.Seed(seed)

	for _, tc := range []struct {
		memberCount int
		deviceCount int
		slow        bool
	}{
		{memberCount: 1, deviceCount: 1, slow: false},
		{memberCount: 1, deviceCount: 3, slow: false},
		{memberCount: 3, deviceCount: 1, slow: false},
		// TODO: fix pubsub issues
		//{memberCount: 3, deviceCount: 3, slow: false},
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
	peers, groupSK := CreatePeersWithGroup(ctx, t, "/tmp/member_test", memberCount, deviceCount, true)
	defer DropPeers(t, peers)

	done := make(chan struct{})

	for _, peer := range peers {
		go WaitForBertyEventType(ctx, t, peer, bertyprotocol.EventTypeGroupMemberDeviceAdded, len(peers), done)
	}

	for i, peer := range peers {
		if _, err := peer.GetGroupContext().GetMetadataStore().JoinGroup(ctx); err != nil {
			t.Fatal(err)
		}

		if i == 0 {
			if _, err := peer.GetGroupContext().GetMetadataStore().ClaimGroupOwnership(ctx, groupSK); err != nil {
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
		ms := peer.GetGroupContext().GetMetadataStore()

		// Test count functions
		storeMemberCount := ms.MemberCount()
		if storeMemberCount != memberCount {
			t.Fatalf("%d member(s) missing from peer %d member count (%d/%d)", memberCount-storeMemberCount, i, storeMemberCount, memberCount)
		}

		storeDeviceCount := ms.DeviceCount()
		if storeDeviceCount != memberCount*deviceCount {
			t.Fatalf("%d device(s) missing from peer %d device count (%d/%d)", memberCount*deviceCount-storeDeviceCount, i, storeDeviceCount, memberCount*deviceCount)
		}

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
			if _, err := ms.GetDevicesForMember(peerDev.GetGroupContext().GetMemberPrivKey().GetPublic()); err != nil {
				t.Fatalf("member of peer %d is missing from peer %d member map: %v", j, i, err)
			}
			if _, err := ms.GetMemberByDevice(peerDev.GetGroupContext().GetDevicePrivKey().GetPublic()); err != nil {
				t.Fatalf("device of peer %d is missing from peer %d device map: %v", j, i, err)
			}
		}
	}
}
