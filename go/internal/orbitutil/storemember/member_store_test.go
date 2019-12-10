package storemember_test

import (
	"context"
	"os"
	"testing"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/ipfsutil"
	"berty.tech/go/internal/orbitutil"
	"berty.tech/go/internal/orbitutil/orbittestutil"
	"berty.tech/go/internal/testutil"

	peerstore "github.com/libp2p/go-libp2p-peerstore"
)

func TestMemberStore(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	memberA := orbittestutil.CreateMemberAndDevices(t, 2)

	ipfsMock := ipfsutil.TestingCoreAPI(ctx, t)

	odb, err := orbitutil.NewBertyOrbitDB(ctx, ipfsMock, nil)
	if err != nil {
		t.Fatal(err)
	}

	g, invitation, err := group.New()
	if err != nil {
		t.Fatalf("unable to init group")
	}

	gc, err := odb.InitStoresForGroup(ctx, g, nil, nil, nil)
	if err != nil {
		t.Fatalf("unable to init groupContext, %v", err)
	}
	store := gc.GetMemberStore()
	defer store.Drop()

	_, err = store.RedeemInvitation(ctx, memberA.MemberPrivKey, memberA.DevicesPrivKey[0], invitation)
	if err != nil {
		t.Fatalf("unable to initialize group, err: %v", err)
	}

	members, err := store.ListMembers()
	if err != nil {
		t.Fatalf("unable to initialize group, err: %v", err)
	}

	if len(members) != 1 {
		t.Fatalf("1 device should be listed")
	}

	if !members[0].Member.Equals(memberA.MemberPrivKey.GetPublic()) {
		t.Fatalf("member A should be listed")
	}

	if !members[0].Device.Equals(memberA.DevicesPrivKey[0].GetPublic()) {
		t.Fatalf("device A1 should be listed")
	}

	invitation = orbittestutil.CreateInvitation(t, memberA.DevicesPrivKey[0])

	_, err = store.RedeemInvitation(ctx, memberA.MemberPrivKey, memberA.DevicesPrivKey[1], invitation)
	if err != nil {
		t.Fatalf("unable to redeem invitation, err: %v", err)
	}

	members, err = store.ListMembers()
	if err != nil {
		t.Fatalf("unable to list members, err: %v", err)
	}

	if len(members) != 2 {
		t.Fatalf("2 devices should be listed")
	}

	if !members[0].Member.Equals(memberA.MemberPrivKey.GetPublic()) {
		t.Fatalf("member A should be listed")
	}

	if !members[1].Member.Equals(memberA.MemberPrivKey.GetPublic()) {
		t.Fatalf("member A should be listed")
	}

	if !members[0].Device.Equals(memberA.DevicesPrivKey[0].GetPublic()) {
		t.Fatalf("device A1 should be listed")
	}

	if !members[1].Device.Equals(memberA.DevicesPrivKey[1].GetPublic()) {
		t.Fatalf("device A2 should be listed")
	}
}

func TestMemberReplicateStore(t *testing.T) {
	testutil.SkipSlow(t)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	dbPath1 := "./orbitdb/tests/replicate-automatically/1"
	dbPath2 := "./orbitdb/tests/replicate-automatically/2"

	defer os.RemoveAll("./orbitdb/")

	ipfsMock1 := ipfsutil.TestingCoreAPI(ctx, t)
	ipfsMock2 := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsMock1.MockNetwork())

	if _, err := ipfsMock1.MockNetwork().LinkPeers(ipfsMock1.MockNode().Identity, ipfsMock2.MockNode().Identity); err != nil {
		t.Fatal(err)
	}

	peerInfo2 := peerstore.PeerInfo{ID: ipfsMock2.MockNode().Identity, Addrs: ipfsMock2.MockNode().PeerHost.Addrs()}
	if err := ipfsMock1.Swarm().Connect(ctx, peerInfo2); err != nil {
		t.Fatal(err)
	}

	g, invitation, err := group.New()
	if err != nil {
		t.Fatal(err)
	}

	memberA := orbittestutil.CreateMemberAndDevices(t, 2)

	peerInfo1 := peerstore.PeerInfo{ID: ipfsMock1.MockNode().Identity, Addrs: ipfsMock1.MockNode().PeerHost.Addrs()}
	if err := ipfsMock2.Swarm().Connect(ctx, peerInfo1); err != nil {
		t.Fatal(err)
	}

	orbitdb1, err := orbitutil.NewBertyOrbitDB(ctx, ipfsMock1, &orbitdb.NewOrbitDBOptions{Directory: &dbPath1})
	if err != nil {
		t.Fatal(err)
	}

	orbitdb2, err := orbitutil.NewBertyOrbitDB(ctx, ipfsMock2, &orbitdb.NewOrbitDBOptions{Directory: &dbPath2})
	if err != nil {
		t.Fatal(err)
	}

	gc1, err := orbitdb1.InitStoresForGroup(ctx, g, nil, nil, &orbitdb.CreateDBOptions{
		Directory: &dbPath1,
	})
	if err != nil {
		t.Fatal(err)
	}
	db1 := gc1.GetMemberStore()
	defer db1.Drop()

	_, err = db1.RedeemInvitation(ctx, memberA.MemberPrivKey, memberA.DevicesPrivKey[0], invitation)
	if err != nil {
		t.Fatal(err)
	}

	gc2, err := orbitdb2.InitStoresForGroup(ctx, g, nil, nil, &orbitdb.CreateDBOptions{
		Directory: &dbPath2,
	})

	if err != nil {
		t.Fatal(err)
	}
	db2 := gc2.GetMemberStore()
	defer db2.Drop()

	{
		ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()

		hasAllResults := false
		go db2.Subscribe(ctx, func(evt events.Event) {
			switch evt.(type) {
			case *stores.EventReplicated:
				result1, err := db1.ListMembers()
				if err != nil {
					t.Fatal(err)
				}

				result2, err := db2.ListMembers()
				if err != nil {
					t.Fatal(err)
				}

				if len(result1) != 1 || len(result2) != 1 {
					return
				}

				hasAllResults = true
				cancel()
			}
		})

		<-ctx.Done()
		if !hasAllResults {
			t.Fatalf("all results should be listed")
		}
	}

	{
		memberB := orbittestutil.CreateMemberAndDevices(t, 2)

		invitation, err := group.NewInvitation(memberA.DevicesPrivKey[0], g)
		if err != nil {
			t.Fatal(err)
		}

		_, err = db2.RedeemInvitation(ctx, memberB.MemberPrivKey, memberB.DevicesPrivKey[0], invitation)
		if err != nil {
			t.Fatal(err)
		}

		ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()

		hasAllResults := false
		go db1.Subscribe(ctx, func(evt events.Event) {
			switch evt.(type) {
			case *stores.EventReplicated:
				result1, err := db1.ListMembers()
				if err != nil {
					t.Fatal(err)
				}

				result2, err := db2.ListMembers()
				if err != nil {
					t.Fatal(err)
				}

				if len(result1) != 2 || len(result2) != 2 {
					return
				}

				hasAllResults = true
				cancel()
			}
		})

		<-ctx.Done()
		if !hasAllResults {
			t.Fatalf("all results should be listed")
		}
	}
}
