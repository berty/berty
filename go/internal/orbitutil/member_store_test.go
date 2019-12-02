package orbitutil

import (
	"context"
	"crypto/rand"
	"os"
	"testing"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/ipfsutil"
	"berty.tech/go/internal/testutil"
	"github.com/libp2p/go-libp2p-core/crypto"
	peerstore "github.com/libp2p/go-libp2p-peerstore"
)

type memberDevices struct {
	privKey crypto.PrivKey
	devices []crypto.PrivKey
}

func createMemberAndDevices(t *testing.T, deviceCount int) *memberDevices {
	ret := &memberDevices{}

	memberPrivKey, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		t.Fatalf("unable to generate a key %v", err)
	}

	ret.privKey = memberPrivKey
	ret.devices = make([]crypto.PrivKey, deviceCount)
	for i := 0; i < deviceCount; i++ {
		ret.devices[i], _, err = crypto.GenerateEd25519Key(rand.Reader)
		if err != nil {
			t.Fatalf("unable to generate a key %v", err)
		}
	}

	return ret
}

func makeDummySigningKey() crypto.PrivKey {
	priv, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		panic(err)
	}

	return priv
}

func createInvitation(t *testing.T, inviter crypto.PrivKey) *group.Invitation {
	invitation, err := group.NewInvitation(inviter, &group.Group{PubKey: inviter.GetPublic(), SigningKey: makeDummySigningKey()})
	if err != nil {
		t.Fatalf("err: %v", err)
	}

	return invitation
}

func TestMemberStore(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	groupHolder, err := NewGroupHolder()
	if err != nil {
		t.Fatal(err)
	}

	memberA := createMemberAndDevices(t, 2)

	ipfsMock := ipfsutil.TestingCoreAPI(ctx, t)

	odb, err := orbitdb.NewOrbitDB(ctx, ipfsMock, nil)
	if err != nil {
		t.Fatalf("unable to init orbitdb")
	}

	g, invitation, err := group.New()

	store, err := groupHolder.NewMemberStore(ctx, odb, g, nil)
	defer store.Drop()

	if err != nil {
		t.Fatalf("unable to initialize store, err: %v", err)
	}

	_, err = store.RedeemInvitation(ctx, memberA.privKey, memberA.devices[0], invitation)
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

	if !members[0].Member.Equals(memberA.privKey.GetPublic()) {
		t.Fatalf("member A should be listed")
	}

	if !members[0].Device.Equals(memberA.devices[0].GetPublic()) {
		t.Fatalf("device A1 should be listed")
	}

	invitation = createInvitation(t, memberA.devices[0])

	_, err = store.RedeemInvitation(ctx, memberA.privKey, memberA.devices[1], invitation)
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

	if !members[0].Member.Equals(memberA.privKey.GetPublic()) {
		t.Fatalf("member A should be listed")
	}

	if !members[1].Member.Equals(memberA.privKey.GetPublic()) {
		t.Fatalf("member A should be listed")
	}

	if !members[0].Device.Equals(memberA.devices[0].GetPublic()) {
		t.Fatalf("device A1 should be listed")
	}

	if !members[1].Device.Equals(memberA.devices[1].GetPublic()) {
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

	groupHolder, err := NewGroupHolder()
	if err != nil {
		t.Fatal(err)
	}

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

	memberA := createMemberAndDevices(t, 2)

	peerInfo1 := peerstore.PeerInfo{ID: ipfsMock1.MockNode().Identity, Addrs: ipfsMock1.MockNode().PeerHost.Addrs()}
	if err := ipfsMock2.Swarm().Connect(ctx, peerInfo1); err != nil {
		t.Fatal(err)
	}

	orbitdb1, err := orbitdb.NewOrbitDB(ctx, ipfsMock1, &orbitdb.NewOrbitDBOptions{Directory: &dbPath1})
	if err != nil {
		t.Fatal(err)
	}

	orbitdb2, err := orbitdb.NewOrbitDB(ctx, ipfsMock2, &orbitdb.NewOrbitDBOptions{Directory: &dbPath2})
	if err != nil {
		t.Fatal(err)
	}

	db1, err := groupHolder.NewMemberStore(ctx, orbitdb1, g, &orbitdb.CreateDBOptions{
		Directory: &dbPath1,
	})
	if err != nil {
		t.Fatal(err)
	}

	defer db1.Drop()

	_, err = db1.RedeemInvitation(ctx, memberA.privKey, memberA.devices[0], invitation)
	if err != nil {
		t.Fatal(err)
	}

	db2, err := groupHolder.NewMemberStore(ctx, orbitdb2, g, &orbitdb.CreateDBOptions{
		Directory: &dbPath2,
	})

	if err != nil {
		t.Fatal(err)
	}

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
		memberB := createMemberAndDevices(t, 2)

		invitation, err := group.NewInvitation(memberA.devices[0], g)
		if err != nil {
			t.Fatal(err)
		}

		_, err = db2.RedeemInvitation(ctx, memberB.privKey, memberB.devices[0], invitation)
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
