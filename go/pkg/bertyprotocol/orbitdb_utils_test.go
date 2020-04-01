package bertyprotocol

import (
	"context"
	"fmt"
	"sync"
	"testing"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/ipfs/go-ipfs/keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/peer"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

type mockedPeer struct {
	CoreAPI ipfsutil.CoreAPIMock
	DB      *bertyOrbitDB
	GC      *groupContext
	MKS     *MessageKeystore
	DevKS   DeviceKeystore
}

func (m *mockedPeer) PeerInfo() peer.AddrInfo {
	return m.CoreAPI.MockNode().Peerstore.PeerInfo(m.CoreAPI.MockNode().Identity)
}

func connectPeers(ctx context.Context, t testing.TB, peers []*mockedPeer) {
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

func dropPeers(t *testing.T, mockedPeers []*mockedPeer) {
	t.Helper()

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

func createPeersWithGroup(ctx context.Context, t testing.TB, pathBase string, memberCount int, deviceCount int) ([]*mockedPeer, crypto.PrivKey) {
	t.Helper()

	var (
		mn    mocknet.Mocknet
		devKS DeviceKeystore
	)

	mockedPeers := make([]*mockedPeer, memberCount*deviceCount)

	g, groupSK, err := NewGroupMultiMember()
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
				devKS = NewDeviceKeystore(keystore.NewMemKeystore())
			} else {
				accSK, err := devKS.AccountPrivKey()
				if err != nil {
					t.Fatalf("err: deviceKeystore private key, %v", err)
				}

				accProofSK, err := devKS.AccountProofPrivKey()
				if err != nil {
					t.Fatalf("err: deviceKeystore private proof key, %v", err)
				}

				devKS, err = NewWithExistingKeys(keystore.NewMemKeystore(), accSK, accProofSK)
				if err != nil {
					t.Fatalf("err: deviceKeystore from existing keys, %v", err)
				}
			}

			mk := NewInMemMessageKeystore()

			db, err := newBertyOrbitDB(ctx, ca, devKS, mk, nil, nil)
			if err != nil {
				t.Fatal(err)
			}

			gc, err := db.OpenGroup(ctx, g, nil)
			if err != nil {
				t.Fatalf("err: creating new group context, %v", err)
			}

			mockedPeers[deviceIndex] = &mockedPeer{
				CoreAPI: ca,
				DB:      db,
				GC:      gc,
				MKS:     mk,
				DevKS:   devKS,
			}

			deviceIndex++
		}
	}

	connectPeers(ctx, t, mockedPeers)

	return mockedPeers, groupSK
}

func inviteAllPeersToGroup(ctx context.Context, t *testing.T, peers []*mockedPeer, groupSK crypto.PrivKey) {
	t.Helper()

	wg := sync.WaitGroup{}
	wg.Add(len(peers))

	errChan := make(chan error, len(peers))

	for i, p := range peers {
		go func(p *mockedPeer, peerIndex int) {
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

func waitForBertyEventType(ctx context.Context, t *testing.T, ms *metadataStore, eventType bertytypes.EventType, eventCount int, done chan struct{}) {
	t.Helper()

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
