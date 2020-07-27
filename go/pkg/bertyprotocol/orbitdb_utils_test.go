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
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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

func connectPeers(ctx context.Context, t testing.TB, mn mocknet.Mocknet) {
	t.Helper()

	err := mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)
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

func createPeersWithGroup(ctx context.Context, t testing.TB, pathBase string, memberCount int, deviceCount int) ([]*mockedPeer, crypto.PrivKey, func()) {
	t.Helper()

	var devKS DeviceKeystore

	mockedPeers := make([]*mockedPeer, memberCount*deviceCount)

	g, groupSK, err := NewGroupMultiMember()
	if err != nil {
		t.Fatal(err)
	}

	mn := mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	_, cleanuprdvp := ipfsutil.TestingRDVP(ctx, t, rdvp)

	ipfsopts := ipfsutil.TestingAPIOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	}
	deviceIndex := 0

	cls := make([]func(), memberCount)
	for i := 0; i < memberCount; i++ {
		for j := 0; j < deviceCount; j++ {
			ca, cleanupNode := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, &ipfsopts)

			if j == 0 {
				devKS = NewDeviceKeystore(keystore.NewMemKeystore())
			} else {
				accSK, err := devKS.AccountPrivKey()
				require.NoError(t, err, "deviceKeystore private key")

				accProofSK, err := devKS.AccountProofPrivKey()
				require.NoError(t, err, "deviceKeystore private proof key")

				devKS, err = NewWithExistingKeys(keystore.NewMemKeystore(), accSK, accProofSK)
				require.NoError(t, err, "deviceKeystore from existing keys")
			}

			mk, cleanupMessageKeystore := NewInMemMessageKeystore()

			db, err := newBertyOrbitDB(ctx, ca.API(), devKS, mk, nil)
			if err != nil {
				t.Fatal(err)
			}

			gc, err := db.OpenGroup(ctx, g, nil)
			if err != nil {
				t.Fatalf("err: creating new group context, %v", err)
			}

			mp := &mockedPeer{
				CoreAPI: ca,
				DB:      db,
				GC:      gc,
				MKS:     mk,
				DevKS:   devKS,
			}

			// setup cleanup
			cls[i] = func() {
				if ms := mp.GC.MetadataStore(); ms != nil {
					err := ms.Drop()
					assert.NoError(t, err)
				}

				if db := mp.DB; db != nil {
					err := db.Close()
					assert.NoError(t, err)
				}

				cleanupNode()
				cleanupMessageKeystore()
			}

			mockedPeers[deviceIndex] = mp
			deviceIndex++
		}
	}

	connectPeers(ctx, t, ipfsopts.Mocknet)

	return mockedPeers, groupSK, func() {
		for _, cleanup := range cls {
			cleanup()
		}

		cleanuprdvp()

		_ = rdvp.Close()
	}
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
