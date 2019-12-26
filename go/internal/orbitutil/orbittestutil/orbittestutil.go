package orbittestutil

import (
	"context"
	"crypto/rand"
	"fmt"
	"path"
	"sync"
	"testing"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/internal/orbitutil/storemember"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"github.com/libp2p/go-libp2p-core/crypto"
	peer "github.com/libp2p/go-libp2p-core/peer"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

type MockedPeer struct {
	coreapi ipfsutil.CoreAPIMock
	db      *orbitutil.BertyOrbitDB
	gc      *orbitutil.GroupContext
}

func (m *MockedPeer) GetPeerInfo() peer.AddrInfo {
	return m.coreapi.MockNode().Peerstore.PeerInfo(m.coreapi.MockNode().Identity)
}

func (m *MockedPeer) GetCoreAPI() ipfsutil.CoreAPIMock {
	return m.coreapi
}

func (m *MockedPeer) GetDB() *orbitutil.BertyOrbitDB {
	return m.db
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

func ConnectPeers(ctx context.Context, t *testing.T, peers []*MockedPeer) {
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

func createPeers(ctx context.Context, t *testing.T, pathBase string, count int, mn mocknet.Mocknet) []*MockedPeer {
	mockedPeers := make([]*MockedPeer, count)

	for i := range mockedPeers {
		var ca ipfsutil.CoreAPIMock

		if mn != nil {
			ca = ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, mn)
		} else {
			ca = ipfsutil.TestingCoreAPI(ctx, t)
			mn = ca.MockNetwork()
		}

		orbitDBPath := path.Join(pathBase, fmt.Sprintf("%d", i))

		db, err := orbitutil.NewBertyOrbitDB(ctx, ca, &orbitdb.NewOrbitDBOptions{Directory: &orbitDBPath})
		if err != nil {
			t.Fatal(err)
		}

		mockedPeers[i] = &MockedPeer{
			coreapi: ca,
			db:      db,
		}
	}

	return mockedPeers
}

func DropPeers(t *testing.T, mockedPeers []*MockedPeer) {
	for _, mockedPeer := range mockedPeers {
		if gc := mockedPeer.GetGroupContext(); gc != nil {
			if ms := gc.GetMemberStore(); ms != nil {
				if err := ms.Drop(); err != nil {
					t.Fatal(err)
				}
			}
			if sgs := gc.GetSettingStore(); sgs != nil {
				if err := sgs.Drop(); err != nil {
					t.Fatal(err)
				}
			}
			if scs := gc.GetSecretStore(); scs != nil {
				if err := scs.Drop(); err != nil {
					t.Fatal(err)
				}
			}
		}

		if db := mockedPeer.GetDB(); db != nil {
			if err := db.Close(); err != nil {
				t.Fatal(err)
			}
		}

		if ca := mockedPeer.GetCoreAPI(); ca != nil {
			if err := ca.MockNode().Close(); err != nil {
				t.Fatal(err)
			}
		}
	}
}

func CreatePeersWithGroup(ctx context.Context, t *testing.T, pathBase string, memberCount int, deviceCount int, initDBStores bool) ([]*MockedPeer, *group.Invitation) {
	t.Helper()

	mockedPeers := createPeers(ctx, t, pathBase, memberCount*deviceCount, nil)

	g, invitation, err := group.New()
	if err != nil {
		t.Fatal(err)
	}

	deviceIndex := 0
	for i := 0; i < memberCount; i++ {
		memberPrivKey, _, err := crypto.GenerateEd25519Key(rand.Reader)
		if err != nil {
			t.Fatal(err)
		}

		for j := 0; j < deviceCount; j++ {
			groupContext := createGroupContext(g, memberPrivKey, t)
			mockedPeers[deviceIndex].SetGroupContext(groupContext)

			if initDBStores {
				if err := mockedPeers[deviceIndex].GetDB().InitStoresForGroup(ctx, groupContext, nil); err != nil {
					t.Fatal(err)
				}
			}
			deviceIndex++
		}
	}

	ConnectPeers(ctx, t, mockedPeers)

	return mockedPeers, invitation
}

func InviteAllPeersToGroup(ctx context.Context, t *testing.T, peers []*MockedPeer, invitation *group.Invitation) {
	t.Helper()

	wg := sync.WaitGroup{}
	wg.Add(len(peers))

	for i, p := range peers {
		go func(p *MockedPeer, peerIndex int) {
			ctxRepl, cancel := context.WithCancel(ctx)
			eventReceived := 0

			p.GetGroupContext().GetMemberStore().Subscribe(ctxRepl, func(e events.Event) {
				switch e.(type) {
				case *storemember.EventNewMemberDevice:
					eventReceived++
					if eventReceived == len(peers) {
						cancel()
					}
				}
			})

			wg.Done()

			if eventReceived != len(peers) {
				t.Logf("%d event(s) missing from peer %d list (%d/%d)", len(peers)-eventReceived, peerIndex, eventReceived, len(peers))
			}
		}(p, i)
	}

	for i, p := range peers {
		if i > 0 {
			invitation = CreateInvitation(t, peers[0].GetGroupContext().GetMemberPrivKey())
		}

		_, err := p.GetGroupContext().GetMemberStore().RedeemInvitation(ctx, invitation)
		if err != nil {
			t.Fatal(err)
		}
	}

	// Wait for all events to be received in all peers's member log (or timeout)
	wg.Wait()
}
