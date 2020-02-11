package orbitutil

import (
	"context"
	"crypto/rand"
	"fmt"
	"path"
	"sync"
	"testing"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/pkg/bertyprotocol"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/peer"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

type MockedPeer struct {
	coreapi ipfsutil.CoreAPIMock
	db      BertyOrbitDB
	gc      GroupContext
}

func (m *MockedPeer) GetPeerInfo() peer.AddrInfo {
	return m.coreapi.MockNode().Peerstore.PeerInfo(m.coreapi.MockNode().Identity)
}

func (m *MockedPeer) GetCoreAPI() ipfsutil.CoreAPIMock {
	return m.coreapi
}

func (m *MockedPeer) GetDB() BertyOrbitDB {
	return m.db
}

func (m *MockedPeer) GetGroupContext() GroupContext {
	return m.gc
}

func (m *MockedPeer) SetGroupContext(gc GroupContext) {
	m.gc = gc
}

func ConnectPeers(ctx context.Context, t testing.TB, peers []*MockedPeer) {
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

func createGroupContext(g *group.Group, member crypto.PrivKey, t testing.TB) GroupContext {
	memberDevice, err := group.NewOwnMemberDevice()
	if err != nil {
		t.Fatal(err)
	}

	memberDevice.Member = member

	return NewGroupContext(g, memberDevice)
}

func createPeers(ctx context.Context, t testing.TB, pathBase string, count int, mn mocknet.Mocknet) []*MockedPeer {
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

		db, err := NewBertyOrbitDB(ctx, ca, &orbitdb.NewOrbitDBOptions{Directory: &orbitDBPath})
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
			if ms := gc.GetMetadataStore(); ms != nil {
				if err := ms.Drop(); err != nil {
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

func CreatePeersWithGroup(ctx context.Context, t testing.TB, pathBase string, memberCount int, deviceCount int, initDBStores bool) ([]*MockedPeer, crypto.PrivKey) {
	t.Helper()

	mockedPeers := createPeers(ctx, t, pathBase, memberCount*deviceCount, nil)

	g, groupSK, err := group.New()
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

			ds, err := group.NewDeviceSecret()
			if err != nil {
				t.Fatal(err)
			}

			if _, err = NewInMemoryMessageKeysHolder(ctx, groupContext, ds); err != nil {
				t.Fatal(err)
			}

			if initDBStores {
				if err := mockedPeers[deviceIndex].GetDB().InitStoresForGroup(ctx, groupContext, nil); err != nil {
					t.Fatal(err)
				}
			}
			deviceIndex++
		}
	}

	ConnectPeers(ctx, t, mockedPeers)

	return mockedPeers, groupSK
}

func InviteAllPeersToGroup(ctx context.Context, t *testing.T, peers []*MockedPeer, groupSK crypto.PrivKey) {
	t.Helper()

	wg := sync.WaitGroup{}
	wg.Add(len(peers))

	for i, p := range peers {
		go func(p *MockedPeer, peerIndex int) {
			ctxRepl, cancel := context.WithCancel(ctx)
			eventReceived := 0

			p.GetGroupContext().GetMetadataStore().Subscribe(ctxRepl, func(e events.Event) {
				switch e.(type) {
				case *bertyprotocol.GroupMetadataEvent:
					casted, _ := e.(*bertyprotocol.GroupMetadataEvent)
					if casted.Metadata.EventType != bertyprotocol.EventTypeGroupMemberDeviceAdded {
						return
					}

					memdev := &bertyprotocol.GroupAddMemberDevice{}
					err := memdev.Unmarshal(casted.Event)
					if err != nil {
						t.Fatal(err)
					}

					eventReceived++
					if eventReceived == len(peers) {
						cancel()
					}
				}
			})

			wg.Done()
			cancel()
		}(p, i)
	}

	for i, p := range peers {
		if _, err := p.GetGroupContext().GetMetadataStore().JoinGroup(ctx); err != nil {
			t.Fatal(err)
		}

		if i == 0 {
			if _, err := p.GetGroupContext().GetMetadataStore().ClaimGroupOwnership(ctx, groupSK); err != nil {
				t.Fatal(err)
			}
		}
	}

	// Wait for all events to be received in all peers's member log (or timeout)
	wg.Wait()
}

func WaitForBertyEventType(ctx context.Context, t *testing.T, peer *MockedPeer, eventType bertyprotocol.EventType, eventCount int, done chan struct{}) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	ms := peer.GetGroupContext().GetMetadataStore()
	handledEvents := map[string]struct{}{}

	ms.Subscribe(ctx, func(evt events.Event) {
		switch evt.(type) {
		case *bertyprotocol.GroupMetadataEvent:
			if evt.(*bertyprotocol.GroupMetadataEvent).Metadata.EventType != eventType {
				return
			}

			eID := string(evt.(*bertyprotocol.GroupMetadataEvent).EventContext.ID)

			if _, ok := handledEvents[eID]; ok {
				return
			}

			handledEvents[eID] = struct{}{}

			e := &bertyprotocol.GroupAddDeviceSecret{}
			err := e.Unmarshal(evt.(*bertyprotocol.GroupMetadataEvent).Event)
			if err != nil {
				t.Fatalf(" err: %+v\n", err.Error())
				return
			}

			eventCount--
			if eventCount == 0 {
				done <- struct{}{}
			}
		}
	})
}
