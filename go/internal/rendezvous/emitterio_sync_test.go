package rendezvous_test

import (
	"context"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/libp2p/go-libp2p-core/host"
	rendezvous "github.com/libp2p/go-libp2p-rendezvous"
	db "github.com/libp2p/go-libp2p-rendezvous/db/sqlcipher"
	"github.com/libp2p/go-libp2p-rendezvous/test_utils"
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

func getRendezvousClients(ctx context.Context, t *testing.T, hosts []host.Host) []rendezvous.RendezvousClient {
	t.Helper()

	ctx, _ = context.WithTimeout(context.Background(), time.Second*10)

	clients := make([]rendezvous.RendezvousClient, len(hosts)-1)
	for i, host := range hosts[1:] {
		syncClient := berty_rendezvous.NewEmitterClient(ctx, nil)
		clients[i] = rendezvous.NewRendezvousClient(host, hosts[0].ID(), syncClient)
	}
	return clients
}

func TestEmitterIOFlow(t *testing.T) {
	t.Skip()

	const serverAddr = "tcp://127.0.0.1:8080"
	const adminKey = "Llo99jIV4vmN0BqJJO1Z5Y055DsPHnIS"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Instantiate server and clients
	hosts := test_utils.GetRendezvousHosts(t, ctx, 4)

	logger, err := zap.NewDevelopment()
	if err != nil {
		t.Fatal(err)
	}

	emitterPubSubSync, err := berty_rendezvous.NewEmitterServer(serverAddr, adminKey, &berty_rendezvous.EmitterOptions{
		Logger: logger,
	})
	if err != nil {
		t.Fatal(err)
	}

	svc, err := MakeRendezvousServiceTest(ctx, hosts[0], ":memory:", emitterPubSubSync)
	if err != nil {
		t.Fatal(err)
	}
	defer svc.DB.Close()

	clients := getRendezvousClients(ctx, t, hosts)

	regFound := int64(0)
	wg := sync.WaitGroup{}

	const announcementCount = 5

	for _, client := range clients[1:] {
		wg.Add(1)
		ctx, cancel := context.WithTimeout(ctx, time.Second*5)
		ch, err := client.DiscoverSubscribe(ctx, "foo1")
		if err != nil {
			t.Fatal(err)
		}

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
		_, err = clients[1].Register(ctx, "foo1", rendezvous.DefaultTTL)
		if err != nil {
			t.Fatal(err)
		}
	}

	wg.Wait()
	if regFound != int64(len(clients[1:]))*announcementCount {
		t.Fatalf("expected %d records to be found got %d", int64(len(clients[1:])), regFound)
	}
}
