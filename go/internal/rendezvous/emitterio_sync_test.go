package rendezvous_test

import (
	"context"
	"os"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/libp2p/go-libp2p-core/host"
	rendezvous "github.com/libp2p/go-libp2p-rendezvous"
	db "github.com/libp2p/go-libp2p-rendezvous/db/sqlcipher"
	"github.com/libp2p/go-libp2p-rendezvous/test_utils"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	berty_rendezvous "berty.tech/berty/v2/go/internal/rendezvous"
)

func MakeRendezvousServiceTest(ctx context.Context, host host.Host, path string, rzs ...rendezvous.RendezvousSync) (*rendezvous.RendezvousService, error) {
	dbi, err := db.OpenDB(ctx, path)
	if err != nil {
		return nil, err
	}

	return rendezvous.NewRendezvousService(host, dbi, rzs...), nil
}

func getEmitterRendezvousClients(ctx context.Context, t *testing.T, hosts []host.Host) []rendezvous.RendezvousClient {
	t.Helper()

	clients := make([]rendezvous.RendezvousClient, len(hosts)-1)
	for i, host := range hosts[1:] {
		syncClient := berty_rendezvous.NewEmitterClient(nil)
		t.Cleanup(func() {
			syncClient.Close()
		})
		clients[i] = rendezvous.NewRendezvousClient(host, hosts[0].ID(), syncClient)
	}
	return clients
}

func TestEmitterIOFlow(t *testing.T) {
	// @NOTE(gfanton): see tools/emitter-server to test it
	// TEST_EMITTER_SERVER_ADDR=<addr> TEST_EMITTER_ADMINKEY=<admin_key> go test .

	const topic = "foo1"

	serverAddr := os.Getenv("TEST_EMITTER_SERVER_ADDR")
	adminKey := os.Getenv("TEST_EMITTER_ADMINKEY")
	if adminKey == "" || serverAddr == "" {
		t.Skip("cannot test emitter, no adminKey/serverAddr provided")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Instantiate server and clients
	hosts := test_utils.GetRendezvousHosts(t, ctx, 4)
	for _, h := range hosts {
		t.Cleanup(func() {
			_ = h.Close()
		})
	}

	logger, err := zap.NewDevelopment()
	require.NoError(t, err)

	emitterPubSubSync, err := berty_rendezvous.NewEmitterServer(serverAddr, adminKey, &berty_rendezvous.EmitterOptions{
		Logger: logger.Named("emitter"),
	})
	require.NoError(t, err)
	defer emitterPubSubSync.Close()

	svc, err := MakeRendezvousServiceTest(ctx, hosts[0], ":memory:", emitterPubSubSync)
	require.NoError(t, err)
	defer svc.DB.Close()

	clients := getEmitterRendezvousClients(ctx, t, hosts)

	regFound := int64(0)
	wg := sync.WaitGroup{}

	const announcementCount = 5

	for _, client := range clients[1:] {
		wg.Add(1)
		ctx, cancel := context.WithTimeout(ctx, time.Second*5)
		ch, err := client.DiscoverSubscribe(ctx, topic)
		require.NoError(t, err)

		go func() {
			regFoundForPeer := 0

			defer cancel()
			defer wg.Done()

			for p := range ch {
				if test_utils.CheckPeerInfo(t, p, hosts[2], false) == true {
					regFoundForPeer++
					atomic.AddInt64(&regFound, 1)
				}

				if regFoundForPeer == announcementCount {
					go func() {
						// this allows more events to be received
						time.Sleep(time.Millisecond * 500)
						cancel()
					}()
				}
			}
		}()
	}

	for i := 0; i < announcementCount; i++ {
		_, err = clients[1].Register(ctx, topic, rendezvous.DefaultTTL)
		require.NoError(t, err)
	}

	wg.Wait()
	if regFound != int64(len(clients[1:]))*announcementCount {
		require.FailNowf(t, "number of records doesn't match", "expected %d records to be found got %d", int64(len(clients[1:])), regFound)
	}
}
