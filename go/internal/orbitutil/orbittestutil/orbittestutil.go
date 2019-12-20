package orbittestutil

import (
	"context"
	"crypto/rand"
	"fmt"
	"path"
	"testing"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/ipfsutil"
	"berty.tech/go/internal/orbitutil"
	"github.com/libp2p/go-libp2p-core/crypto"
	peer "github.com/libp2p/go-libp2p-core/peer"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

type MockedPeer interface {
	GetCoreAPI() ipfsutil.CoreAPIMock
	SetCoreAPI(ipfsutil.CoreAPIMock)

	GetDB() *orbitutil.BertyOrbitDB
	SetDB(db *orbitutil.BertyOrbitDB)

	GetPeerInfo() peer.AddrInfo

	SetMemberDevices(memberDevices *MemberDevices)
	GetMemberDevices() *MemberDevices
}

type MemberDevices struct {
	MemberPrivKey  crypto.PrivKey
	DevicesPrivKey []crypto.PrivKey
}

func CreateMemberAndDevices(t *testing.T, deviceCount int) *MemberDevices {
	t.Helper()

	ret := &MemberDevices{}

	memberPrivKey, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		t.Fatalf("unable to generate a key %v", err)
	}

	ret.MemberPrivKey = memberPrivKey
	ret.DevicesPrivKey = make([]crypto.PrivKey, deviceCount)
	for i := 0; i < deviceCount; i++ {
		ret.DevicesPrivKey[i], _, err = crypto.GenerateEd25519Key(rand.Reader)
		if err != nil {
			t.Fatalf("unable to generate a key %v", err)
		}
	}

	return ret
}

func MakeDummySigningKey(t *testing.T) crypto.PrivKey {
	t.Helper()

	priv, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}

	return priv
}

func CreateInvitation(t *testing.T, inviter crypto.PrivKey) *group.Invitation {
	t.Helper()

	invitation, err := group.NewInvitation(inviter, &group.Group{PubKey: inviter.GetPublic(), SigningKey: MakeDummySigningKey(t)})
	if err != nil {
		t.Fatalf("err: %v", err)
	}

	return invitation
}

func ConnectPeers(ctx context.Context, t *testing.T, peers []MockedPeer) {
	t.Helper()

	for i := 0; i < len(peers); i++ {
		for j := 0; j < i; j++ {
			if _, err := peers[i].GetCoreAPI().MockNetwork().LinkPeers(peers[i].GetCoreAPI().MockNode().Identity, peers[j].GetCoreAPI().MockNode().Identity); err != nil {
				t.Fatal(err)
			}

			if err := peers[i].GetCoreAPI().Swarm().Connect(ctx, peers[j].GetPeerInfo()); err != nil {
				t.Fatal(err)
			}
		}
	}
}

func SetUpPeer(ctx context.Context, t *testing.T, peer MockedPeer, deviceCount int, mn mocknet.Mocknet) {
	t.Helper()

	if mn != nil {
		peer.SetCoreAPI(ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, mn))
	} else {
		peer.SetCoreAPI(ipfsutil.TestingCoreAPI(ctx, t))
	}

	peer.SetMemberDevices(CreateMemberAndDevices(t, deviceCount))
}

func CreateMonoDeviceMembers(ctx context.Context, t *testing.T, peers []MockedPeer, pathBase string) {
	t.Helper()
	var mn mocknet.Mocknet

	for i, peer := range peers {
		SetUpPeer(ctx, t, peer, 1, mn)

		orbitDBPath := path.Join(pathBase, fmt.Sprintf("%d", i))

		db, err := orbitutil.NewBertyOrbitDB(ctx, peer.GetCoreAPI(), &orbitdb.NewOrbitDBOptions{Directory: &orbitDBPath})
		if err != nil {
			t.Fatal(err)
		}

		peer.SetDB(db)

		mn = peer.GetCoreAPI().MockNetwork()
		peers[i] = peer
	}
}
