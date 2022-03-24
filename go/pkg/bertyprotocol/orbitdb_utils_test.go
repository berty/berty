package bertyprotocol

import (
	"context"
	"sync"
	"testing"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

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

			for e := range p.GC.MetadataStore().Subscribe(ctx) { // nolint:staticcheck
				switch e.(type) {
				case *protocoltypes.GroupMetadataEvent:
					casted, _ := e.(*protocoltypes.GroupMetadataEvent)
					if casted.Metadata.EventType != protocoltypes.EventTypeGroupMemberDeviceAdded {
						continue
					}

					memdev := &protocoltypes.GroupAddMemberDevice{}
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

func waitForBertyEventType(ctx context.Context, t *testing.T, ms *MetadataStore, eventType protocoltypes.EventType, eventCount int, done chan struct{}) {
	t.Helper()

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	handledEvents := map[string]struct{}{}

	for evt := range ms.Subscribe(ctx) { // nolint:staticcheck
		switch evt.(type) {
		case *protocoltypes.GroupMetadataEvent:
			if evt.(*protocoltypes.GroupMetadataEvent).Metadata.EventType != eventType {
				continue
			}

			eID := string(evt.(*protocoltypes.GroupMetadataEvent).EventContext.ID)

			if _, ok := handledEvents[eID]; ok {
				continue
			}

			handledEvents[eID] = struct{}{}

			e := &protocoltypes.GroupAddDeviceSecret{}
			if err := e.Unmarshal(evt.(*protocoltypes.GroupMetadataEvent).Event); err != nil {
				t.Fatalf(" err: %+v\n", err.Error())
			}

			// fmt.Println(string(e.DevicePK), string(e.DestMemberPK))

			eventCount--
			if eventCount == 0 {
				done <- struct{}{}
			} else {
				// fmt.Println(eventCount, "more to go")
			}
		}
	}
}
