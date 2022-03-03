package bertyprotocol

import (
	"context"
	"sync"
	"testing"

	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func inviteAllPeersToGroup(ctx context.Context, t *testing.T, peers []*mockedPeer, groupSK crypto.PrivKey) {
	t.Helper()

	wg := sync.WaitGroup{}
	wg.Add(len(peers))

	errChan := make(chan error, len(peers))

	for i, p := range peers {
		sub, err := p.GC.MetadataStore().EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
		require.NoError(t, err)
		go func(p *mockedPeer, peerIndex int) {
			defer sub.Close()
			defer wg.Done()

			eventReceived := 0

			for e := range sub.Out() {
				evt := e.(protocoltypes.GroupMetadataEvent)
				if evt.Metadata.EventType != protocoltypes.EventTypeGroupMemberDeviceAdded {
					continue
				}

				memdev := &protocoltypes.GroupAddMemberDevice{}
				if err := memdev.Unmarshal(evt.Event); err != nil {
					errChan <- err
					return
				}

				eventReceived++
				if eventReceived == len(peers) {
					return
				}
			}
		}(p, i)
	}

	for i, p := range peers {
		_, err := p.GC.MetadataStore().AddDeviceToGroup(ctx)
		require.NoError(t, err)

		if i == 0 {
			_, err := p.GC.MetadataStore().ClaimGroupOwnership(ctx, groupSK)
			require.NoError(t, err)
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

	sub, err := ms.EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
	require.NoError(t, err)
	defer sub.Close()

	for {
		var e interface{}

		select {
		case e = <-sub.Out():
		case <-ctx.Done():
			return
		}

		switch evt := e.(type) {
		case protocoltypes.GroupMetadataEvent:
			if evt.Metadata.EventType != eventType {
				continue
			}

			eID := string(evt.EventContext.ID)

			if _, ok := handledEvents[eID]; ok {
				continue
			}

			handledEvents[eID] = struct{}{}

			e := &protocoltypes.GroupAddDeviceSecret{}
			if err := e.Unmarshal(evt.Event); err != nil {
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
