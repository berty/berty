package storemember_test

import (
	"context"
	"math/rand"
	"sync"
	"testing"
	"time"

	"berty.tech/go-orbit-db/events"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbittestutil"
	"berty.tech/go/internal/orbitutil/storemember"
	crypto "github.com/libp2p/go-libp2p-crypto"
)

func TestMemberStore(t *testing.T) {
	testMemberStore(t, 1, 1) // 1 member with 1 device
	testMemberStore(t, 1, 3) // 1 member with 3 devices
	testMemberStore(t, 3, 1) // 3 members with 1 device each
	testMemberStore(t, 3, 3) // 3 members with 3 devices each
}

func testMemberStore(t *testing.T, memberCount, deviceCount int) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Creates N members with M devices each within the same group
	peers, firstInvitation := orbittestutil.CreatePeersWithGroup(ctx, t, "/tmp/member_test", memberCount, deviceCount, true)
	defer orbittestutil.DropPeers(peers)

	// Listen for events and count them on every peer's member log
	wg := &sync.WaitGroup{}
	wg.Add(len(peers))

	for i, peer := range peers {
		go func(peer orbittestutil.MockedPeer, wg *sync.WaitGroup, peerIndex int) {
			ctxEvent, ctxEventCancel := context.WithTimeout(ctx, time.Duration(10*time.Second))
			eventReceived := 0

			peer.GetGroupContext().GetMemberStore().Subscribe(ctxEvent, func(e events.Event) {
				switch e.(type) {
				case *storemember.EventNewMemberDevice:
					eventReceived++
					if eventReceived == len(peers) {
						ctxEventCancel()
					}
				}
			})

			if eventReceived != len(peers) {
				t.Fatalf("%d event(s) missing from peer %d list (%d/%d)", len(peers)-eventReceived, peerIndex, eventReceived, len(peers))
			}

			wg.Done()
		}(peer, wg, i)
	}

	// Make all peers join the group using invitation
	inviters := map[string]struct{}{}

	for i, peer := range peers {
		var invitation *group.Invitation

		if i == 0 {
			invitation = firstInvitation
		} else if i == 1 {
			invitation = orbittestutil.CreateInvitation(t, peers[0].GetGroupContext().GetMemberPrivKey())
		} else {
			// Choose a random peer which has already joined the group as inviter
			inviter := peers[rand.Intn(i-1)]
			invitation = orbittestutil.CreateInvitation(t, inviter.GetGroupContext().GetMemberPrivKey())
		}

		peer.GetGroupContext().GetMemberStore().RedeemInvitation(ctx, invitation)
		inviters[string(invitation.InviterMemberPubKey)] = struct{}{}
	}

	// Wait for all events to be received in all peers's member log (or timeout)
	wg.Wait()

	// Test if everything was replicated and indexed correctly
	for i, peer := range peers {
		ms := peer.GetGroupContext().GetMemberStore()

		// Test count functions
		storeMemberCount, err := ms.MemberCount()
		if err != nil {
			t.Fatalf(err.Error())
		}
		if storeMemberCount != memberCount {
			t.Fatalf("%d member(s) missing from peer %d member count (%d/%d)", memberCount-storeMemberCount, i, storeMemberCount, memberCount)
		}

		storeDeviceCount, err := ms.DeviceCount()
		if err != nil {
			t.Fatalf(err.Error())
		}
		if storeDeviceCount != memberCount*deviceCount {
			t.Fatalf("%d device(s) missing from peer %d device count (%d/%d)", memberCount*deviceCount-storeDeviceCount, i, storeDeviceCount, memberCount*deviceCount)
		}

		storeInviterCount, err := ms.InviterCount()
		if err != nil {
			t.Fatalf(err.Error())
		}
		if storeInviterCount != len(inviters) {
			t.Fatalf("%d inviter(s) missing from peer %d inviter count (%d/%d)", len(inviters)-storeInviterCount, i, storeInviterCount, len(inviters))
		}

		// Test list functions (only length, checking all entries would be too long)
		memberList, err := ms.ListMembers()
		if err != nil {
			t.Fatalf(err.Error())
		}
		if len(memberList) != memberCount {
			t.Fatalf("%d member(s) missing from peer %d member list (%d/%d)", memberCount-len(memberList), i, len(memberList), memberCount)
		}

		deviceList, err := ms.ListDevices()
		if err != nil {
			t.Fatalf(err.Error())
		}
		if len(deviceList) != memberCount*deviceCount {
			t.Fatalf("%d device(s) missing from peer %d device list (%d/%d)", memberCount*deviceCount-len(deviceList), i, len(deviceList), memberCount*deviceCount)
		}

		inviterList, err := ms.ListInviters()
		if err != nil {
			t.Fatalf(err.Error())
		}
		if len(inviterList) != len(inviters) {
			t.Fatalf("%d inviter(s) missing from peer %d inviter list (%d/%d)", len(inviters)-len(inviterList), i, len(inviterList), len(inviters))
		}

		// Test entries getter functions
		for j, peerDev := range peers {
			if _, err := ms.GetEntryByMember(peerDev.GetGroupContext().GetMemberPrivKey().GetPublic()); err != nil {
				t.Fatalf("member of peer %d is missing from peer %d member map: %v", j, i, err)
			}
			if _, err := ms.GetEntryByDevice(peerDev.GetGroupContext().GetDevicePrivKey().GetPublic()); err != nil {
				t.Fatalf("device of peer %d is missing from peer %d device map: %v", j, i, err)
			}
		}

		// TODO: add more tests for inviters relationship
		for inviter, _ := range inviters {
			inviterPubKey, err := crypto.UnmarshalEd25519PublicKey([]byte(inviter))
			if err != nil {
				t.Fatalf(err.Error())
			}
			if _, err := ms.GetEntriesByInviter(inviterPubKey); err != nil {
				t.Fatalf("an inviter is missing from peer %d inviter map: %v", i, err)
			}
		}
	}
}
