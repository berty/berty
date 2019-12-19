package storemember_test

import (
	"context"
	"encoding/base64"
	"fmt"
	"math/rand"
	"sync"
	"testing"
	"time"

	"berty.tech/go-orbit-db/events"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbittestutil"
	"berty.tech/go/internal/orbitutil/storemember"
)

func TestMemberStore(t *testing.T) {
	testMemberStore(t, 1, 5) // 1 member with 5 devices
	testMemberStore(t, 5, 1) // 5 members with 1 device each
	testMemberStore(t, 5, 5) // 5 members with 5 devices each
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

			// TODO: remove this after debug
			fmt.Println("Peer", peerIndex, "received", eventReceived, "MemberDeviceEvent")
			//////////////////////////////
			wg.Done()
		}(peer, wg, i)
	}

	// Make all peers join the group using invitation
	for i, peer := range peers {
		var invitation *group.Invitation

		if i == 0 {
			invitation = firstInvitation
		} else if i == 1 {
			invitation = orbittestutil.CreateInvitation(t, peers[0].GetGroupContext().GetDevicePrivKey())
		} else {
			// Choose a random peer which has already joined the group as inviter
			inviter := peers[rand.Intn(i-1)]
			invitation = orbittestutil.CreateInvitation(t, inviter.GetGroupContext().GetDevicePrivKey())
		}

		peer.GetGroupContext().GetMemberStore().RedeemInvitation(ctx, invitation)
	}

	// Wait for all events to be received in all peers's member log (or timeout)
	wg.Wait()

	// Test if everything was replicated and indexed correctly
	// TODO: remove this after debug
	fmt.Println("")
	fmt.Println("Peers list:")
	for i, peer := range peers {
		rawm, err := peer.GetGroupContext().GetMemberPrivKey().GetPublic().Raw()
		if err != nil {
			panic(err)
		}
		rawd, err := peer.GetGroupContext().GetDevicePrivKey().GetPublic().Raw()
		if err != nil {
			panic(err)
		}
		fmt.Printf("%d: m(%s) d(%s)\n", i, base64.StdEncoding.EncodeToString(rawm), base64.StdEncoding.EncodeToString(rawd))
	}
	fmt.Println("")
	//////////////////////////////////

	for i, peer := range peers {
		members, err := peer.GetGroupContext().GetMemberStore().ListMembers()
		if err != nil {
			t.Fatalf("unable to initialize group of peer %d, err: %v", i, err)
		}

		// TODO: remove this after debug
		fmt.Println("Peer", i, "member list:")
		for y, member := range members {
			rawm, err := member.Member.Raw()
			if err != nil {
				panic(err)
			}
			rawd, err := member.Device.Raw()
			if err != nil {
				panic(err)
			}
			fmt.Printf("%d: m(%s) d(%s)\n", y, base64.StdEncoding.EncodeToString(rawm), base64.StdEncoding.EncodeToString(rawd))
		}
		fmt.Println("")
		//////////////////////////////////

		if len(members) != len(peers) {
			t.Fatalf("%d device(s) missing from peer %d list (%d/%d)", len(peers)-len(members), i, len(members), len(peers))
		}

		// TODO: check if all peers are in all peers's member list only once
	}
}
