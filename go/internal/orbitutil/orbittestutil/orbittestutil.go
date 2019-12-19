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
	peerstore "github.com/libp2p/go-libp2p-peerstore"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

type MockedPeer struct {
	coreapi ipfsutil.CoreAPIMock
	pi      *peerstore.PeerInfo
	db      *orbitutil.BertyOrbitDB
	gc      *orbitutil.GroupContext
}

func (m *MockedPeer) GetPeerInfo() peerstore.PeerInfo {
	return peerstore.PeerInfo{ID: m.coreapi.MockNode().Identity, Addrs: m.coreapi.MockNode().PeerHost.Addrs()}
}

func (m *MockedPeer) GetCoreAPI() ipfsutil.CoreAPIMock {
	return m.coreapi
}

func (m *MockedPeer) SetPeerInfo(pi *peerstore.PeerInfo) {
	m.pi = pi
}

func (m *MockedPeer) SetCoreAPI(api ipfsutil.CoreAPIMock) {
	m.coreapi = api
}

func (m *MockedPeer) GetDB() *orbitutil.BertyOrbitDB {
	return m.db
}

func (m *MockedPeer) SetDB(db *orbitutil.BertyOrbitDB) {
	m.db = db
}

func (m *MockedPeer) GetGroupContext() *orbitutil.GroupContext {
	return m.gc
}

func (m *MockedPeer) SetGroupContext(gc *orbitutil.GroupContext) {
	m.gc = gc
}

// func CreateMemberAndDevices(t *testing.T, deviceCount int) *MemberDevices {
// 	t.Helper()
//
// 	ret := &MemberDevices{}
// 	ret.DevicesPrivKey = make([]crypto.PrivKey, deviceCount)
// 	ret.DevicesSecret = make([]*group.DeviceSecret, deviceCount)
//
// 	for i := 0; i < deviceCount; i++ {
// 		memberDervice, err := group.NewOwnMemberDevice()
// 		if err != nil {
// 			t.Fatalf("unable to generate a key %v", err)
// 		}
// 		if i == 0 {
// 			ret.MemberPrivKey = memberDervice.Member
// 		}
// 		ret.DevicesPrivKey[i] = memberDervice.Device
// 		ret.DevicesSecret[i] = memberDervice.Secret
// 	}
//
// 	return ret
// }
//
// func SetUpPeer(ctx context.Context, t *testing.T, peer MockedPeer, deviceCount int, mn mocknet.Mocknet) {
// 	t.Helper()
//
// 	if mn != nil {
// 		peer.SetCoreAPI(ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, mn))
// 	} else {
// 		peer.SetCoreAPI(ipfsutil.TestingCoreAPI(ctx, t))
// 	}
//
// 	peer.SetMemberDevices(CreateMemberAndDevices(t, deviceCount))
// }
//
// func CreateMonoDeviceMembers(ctx context.Context, t *testing.T, peers []MockedPeer, pathBase string) {
// 	t.Helper()
// 	var mn mocknet.Mocknet
//
// 	for i, peer := range peers {
// 		SetUpPeer(ctx, t, peer, 1, mn)
//
// 		orbitDBPath := path.Join(pathBase, fmt.Sprintf("%d", i))
//
// 		db, err := orbitutil.NewBertyOrbitDB(ctx, peer.GetCoreAPI(), &orbitdb.NewOrbitDBOptions{Directory: &orbitDBPath})
// 		if err != nil {
// 			t.Fatal(err)
// 		}
//
// 		peer.SetDB(db)
//
// 		mn = peer.GetCoreAPI().MockNetwork()
// 		peers[i] = peer
// 	}
// }

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

func createGroupContext(g *group.Group, member crypto.PrivKey, t *testing.T) *orbitutil.GroupContext {
	memberDevice, err := group.NewOwnMemberDevice()
	if err != nil {
		t.Fatal(err)
	}

	if member != nil {
		memberDevice.Member = member
	}

	return orbitutil.NewGroupContext(g, memberDevice)
}

func createPeers(ctx context.Context, t *testing.T, pathBase string, count int, mn mocknet.Mocknet) []MockedPeer {
	mockedPeers := make([]MockedPeer, count)

	for i, mockedPeer := range mockedPeers {
		if mn != nil {
			mockedPeer.SetCoreAPI(ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, mn))
		} else {
			mockedPeer.SetCoreAPI(ipfsutil.TestingCoreAPI(ctx, t))
		}

		orbitDBPath := path.Join(pathBase, fmt.Sprintf("%d", i))

		db, err := orbitutil.NewBertyOrbitDB(ctx, mockedPeer.GetCoreAPI(), &orbitdb.NewOrbitDBOptions{Directory: &orbitDBPath})
		if err != nil {
			t.Fatal(err)
		}

		mockedPeer.SetDB(db)

		mn = mockedPeer.GetCoreAPI().MockNetwork()
		mockedPeers[i] = mockedPeer
	}

	return mockedPeers
}

func DropPeers(mockedPeers []MockedPeer) {
	for _, mockedPeer := range mockedPeers {
		if gc := mockedPeer.GetGroupContext(); gc != nil {
			if ms := gc.GetMemberStore(); ms != nil {
				ms.Drop()
			}
			if sgs := gc.GetSettingStore(); sgs != nil {
				sgs.Drop()
			}
			if scs := gc.GetSecretStore(); scs != nil {
				scs.Drop()
			}
		}

		if db := mockedPeer.GetDB(); db != nil {
			db.Close()
		}

		if ca := mockedPeer.GetCoreAPI(); ca != nil {
			ca.MockNode().Close()
		}
	}
}

func CreatePeersWithGroup(ctx context.Context, t *testing.T, pathBase string, memberCount int, deviceCount int, withLogs bool) ([]MockedPeer, *group.Invitation) {
	t.Helper()

	mockedPeers := createPeers(ctx, t, pathBase, memberCount*deviceCount, nil)

	g, invitation, err := group.New()
	if err != nil {
		t.Fatal(err)
	}

	for i := 0; i < memberCount; i++ {
		memberPrivKey, _, err := crypto.GenerateEd25519Key(rand.Reader)
		if err != nil {
			t.Fatal(err)
		}

		for j := 0; j < deviceCount; j++ {
			groupContext := createGroupContext(g, memberPrivKey, t)
			mockedPeers[i+j].SetGroupContext(groupContext)

			if withLogs {
				mockedPeers[i+j].GetDB().InitStoresForGroup(ctx, groupContext, nil)
			}
		}
	}

	ConnectPeers(ctx, t, mockedPeers)

	return mockedPeers, invitation
}
