package orbitutil

import (
	"context"
	"fmt"
	"sync"
	"testing"

	"berty.tech/berty/v2/go/internal/account"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	orbitdb "berty.tech/go-orbit-db"
	"github.com/ipfs/go-ipfs/keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/peer"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

type MockedPeer struct {
	CoreAPI ipfsutil.CoreAPIMock
	DB      bertyprotocol.BertyOrbitDB
	GC      bertyprotocol.ContextGroup
	MK      bertyprotocol.MessageKeys
	Acc     bertyprotocol.AccountKeys
}

func (m *MockedPeer) PeerInfo() peer.AddrInfo {
	return m.CoreAPI.MockNode().Peerstore.PeerInfo(m.CoreAPI.MockNode().Identity)
}

func ConnectPeers(ctx context.Context, t testing.TB, peers []*MockedPeer) {
	t.Helper()

	for i := 0; i < len(peers); i++ {
		for j := 0; j < i; j++ {
			if _, err := peers[i].CoreAPI.MockNetwork().LinkPeers(peers[i].CoreAPI.MockNode().Identity, peers[j].CoreAPI.MockNode().Identity); err != nil {
				t.Fatal(err)
			}

			if err := peers[i].CoreAPI.Swarm().Connect(ctx, peers[j].PeerInfo()); err != nil {
				t.Fatal(err)
			}
		}
	}
}

func DropPeers(t *testing.T, mockedPeers []*MockedPeer) {
	for _, m := range mockedPeers {
		if ms := m.GC.MetadataStore(); ms != nil {
			if err := ms.Drop(); err != nil {
				t.Fatal(err)
			}
		}

		if db := m.DB; db != nil {
			if err := db.Close(); err != nil {
				t.Fatal(err)
			}
		}

		if ca := m.CoreAPI; ca != nil {
			if err := ca.MockNode().Close(); err != nil {
				t.Fatal(err)
			}
		}
	}
}

func CreatePeersWithGroup(ctx context.Context, t testing.TB, pathBase string, memberCount int, deviceCount int) ([]*MockedPeer, crypto.PrivKey) {
	t.Helper()

	var (
		mn  mocknet.Mocknet
		acc bertyprotocol.AccountKeys
	)

	mockedPeers := make([]*MockedPeer, memberCount*deviceCount)

	g, groupSK, err := bertyprotocol.NewGroupMultiMember()
	if err != nil {
		t.Fatal(err)
	}

	deviceIndex := 0
	for i := 0; i < memberCount; i++ {
		for j := 0; j < deviceCount; j++ {
			var ca ipfsutil.CoreAPIMock

			if mn != nil {
				ca = ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, mn)
			} else {
				ca = ipfsutil.TestingCoreAPI(ctx, t)
				mn = ca.MockNetwork()
			}

			if j == 0 {
				acc = account.New(keystore.NewMemKeystore())
			} else {
				accSK, err := acc.AccountPrivKey()
				if err != nil {
					t.Fatalf("err: account private key, %v", err)
				}

				accProofSK, err := acc.AccountProofPrivKey()
				if err != nil {
					t.Fatalf("err: account private proof key, %v", err)
				}

				acc, err = account.NewWithExistingKeys(keystore.NewMemKeystore(), accSK, accProofSK)
				if err != nil {
					t.Fatalf("err: account from existing keys, %v", err)
				}
			}

			mk := bertyprotocol.NewInMemoryMessageKeys()

			db, err := NewBertyOrbitDB(ctx, ca, acc, mk, &orbitdb.NewOrbitDBOptions{})
			if err != nil {
				t.Fatal(err)
			}

			gc, err := db.OpenGroup(ctx, g, nil)
			if err != nil {
				t.Fatalf("err: creating new group context, %v", err)
			}

			mockedPeers[deviceIndex] = &MockedPeer{
				CoreAPI: ca,
				DB:      db,
				GC:      gc,
				MK:      mk,
				Acc:     acc,
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

	errChan := make(chan error, len(peers))

	for i, p := range peers {
		go func(p *MockedPeer, peerIndex int) {
			ctx, cancel := context.WithCancel(ctx)
			defer cancel()
			eventReceived := 0

			for e := range p.GC.MetadataStore().Subscribe(ctx) {
				switch e.(type) {
				case *bertytypes.GroupMetadataEvent:
					casted, _ := e.(*bertytypes.GroupMetadataEvent)
					if casted.Metadata.EventType != bertytypes.EventTypeGroupMemberDeviceAdded {
						continue
					}

					memdev := &bertytypes.GroupAddMemberDevice{}
					if err := memdev.Unmarshal(casted.Event); err != nil {
						errChan <- err
						wg.Done()
						return
					}

					eventReceived++
					if eventReceived == len(peers) {
						cancel()
					}
				}
			}

			wg.Done()
		}(p, i)
	}

	for i, p := range peers {
		if _, err := p.GC.MetadataStore().AddDeviceToGroup(ctx); err != nil {
			t.Fatal(err)
		}

		if i == 0 {
			if _, err := p.GC.MetadataStore().ClaimGroupOwnership(ctx, groupSK); err != nil {
				t.Fatal(err)
			}
		}
	}

	// Wait for all events to be received in all peers's member log (or timeout)
	wg.Wait()
	close(errChan)

	for err := range errChan {
		t.Fatal(err)
	}
}

func WaitForBertyEventType(ctx context.Context, t *testing.T, ms bertyprotocol.MetadataStore, eventType bertytypes.EventType, eventCount int, done chan struct{}) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	handledEvents := map[string]struct{}{}

	for evt := range ms.Subscribe(ctx) {
		switch evt.(type) {
		case *bertytypes.GroupMetadataEvent:
			if evt.(*bertytypes.GroupMetadataEvent).Metadata.EventType != eventType {
				continue
			}

			eID := string(evt.(*bertytypes.GroupMetadataEvent).EventContext.ID)

			if _, ok := handledEvents[eID]; ok {
				continue
			}

			handledEvents[eID] = struct{}{}

			e := &bertytypes.GroupAddDeviceSecret{}
			if err := e.Unmarshal(evt.(*bertytypes.GroupMetadataEvent).Event); err != nil {
				t.Fatalf(" err: %+v\n", err.Error())
			}

			fmt.Println(string(e.DevicePK), string(e.DestMemberPK))

			eventCount--
			if eventCount == 0 {
				done <- struct{}{}
			} else {
				fmt.Println(eventCount, "more to go")
			}
		}
	}
}
