package ipfsutil

import (
	"bytes"
	"context"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	mrand "math/rand"
	"testing"
	"time"

	p2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/pnet"
	tcp "github.com/libp2p/go-tcp-transport"
	"moul.io/srand"
)

const closeTestPid = "/testing/close/0.1.0"

// TestFullClose creates 2 hosts (a and b). a will dial b and will then try to close the connection using FullClose.
// b will play various scenario to check that it's working fine.
func TestFullClose(t *testing.T) {
	// Creating ctx
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var a, b host.Host
	{
		// Creating a private network
		seed, err := srand.Secure()
		if err != nil {
			t.Fatalf("failed to fetch secure source: %s", err)
		}

		prov := mrand.New(mrand.NewSource(seed))

		pskKey := make([]byte, 32)
		// math/rand#Rand.Read can't ever fail nor return an n != len(buf)
		_, _ = prov.Read(pskKey)

		// Generating PSK key, pulled from https://github.com/Kubuxu/go-ipfs-swarm-key-gen/blob/0ee739ec6d322bc1892999882e4738270e97b181/ipfs-swarm-key-gen/main.go#L15-L17
		psk, err := pnet.DecodeV1PSK(bytes.NewReader([]byte("/key/swarm/psk/1.0.0/\n/base16/\n" + hex.EncodeToString(pskKey))))
		if err != nil {
			t.Fatalf("failed to create PSK: %s", err)
		}

		// Creating the hosts
		priv, _, err := crypto.GenerateEd25519Key(prov)
		if err != nil {
			t.Fatalf("failed to generate A's private key: %s", err)
		}

		a, err = p2p.New(p2p.DisableRelay(),
			p2p.Transport(tcp.NewTCPTransport),
			p2p.Identity(priv),
			p2p.PrivateNetwork(psk),
			p2p.ListenAddrStrings("/ip4/127.0.0.1/tcp/0"),
		)
		if err != nil {
			t.Fatalf("failed to create host A: %s", err)
		}
		priv, _, err = crypto.GenerateEd25519Key(prov)
		if err != nil {
			t.Fatalf("failed to generate B's private key: %s", err)
		}

		b, err = p2p.New(p2p.DisableRelay(),
			p2p.Transport(tcp.NewTCPTransport),
			p2p.Identity(priv),
			p2p.PrivateNetwork(psk),
			p2p.ListenAddrStrings("/ip4/127.0.0.1/tcp/0"),
		)
		if err != nil {
			t.Fatalf("failed to create host B: %s", err)
		}
	}

	// Adding the hosts together
	a.Peerstore().SetAddrs(b.ID(), b.Addrs(), peerstore.PermanentAddrTTL)
	b.Peerstore().SetAddrs(a.ID(), a.Addrs(), peerstore.PermanentAddrTTL)

	// First scenario, regular close
	{
		errcb := make(chan error)

		b.SetStreamHandler(closeTestPid, func(s network.Stream) {
			n, err := s.Read([]byte{0})  // Trying to read, should io.EOF
			if n == 0 && err == io.EOF { // Good
				err = s.Close() // Trying to close ourself
				if err == nil {
					errcb <- io.EOF // Perfect
					return
				}
				errcb <- fmt.Errorf("error closing after EOF: %w", err)
				return
			}
			if err != nil {
				errcb <- fmt.Errorf("error not EOF while reading: %w", err)
				return
			}
			// n > 0
			errcb <- errors.New("n > 0, expected EOF")
			return
		})

		errca := make(chan error)
		// Dialing, we expect a fast close.
		go func() {
			s, err := a.NewStream(ctx, b.ID(), closeTestPid)
			if err != nil {
				errca <- fmt.Errorf("failed to create stream: %w", err)
				return
			}
			errca <- FullClose(s)
		}()

		timec := time.After(DefaultCloseTimeout / 2) // Fast close must resolve in max half of the timeout time.
		var done uint = 2
		for done > 0 {
			select {
			case err := <-errca:
				if err == nil || err == io.EOF {
					done--
					continue
				}
				t.Fatalf("error for A while fast close: %s", err)
			case err := <-errcb:
				if err == nil || err == io.EOF {
					done--
					continue
				}
				t.Fatalf("error for B while fast close: %s", err)
			case <-timec:
				t.Fatal("fast close took too long.")
			}
		}
	}

	// Second scenario, regular timeout
	{
		errcb := make(chan error)

		var gs network.Stream // Prevent running the terminator
		b.SetStreamHandler(closeTestPid, func(s network.Stream) {
			gs = s // Thread unsafe if we have concurrent streams incoming, shouldn't happen thx to the pnet.
			_, err := s.Read([]byte{0})
			errcb <- err
		})

		errca := make(chan error)
		// Dialing, we expect a timeout.
		go func() {
			s, err := a.NewStream(ctx, b.ID(), closeTestPid)
			if err != nil {
				errca <- fmt.Errorf("failed to create stream: %w", err)
				return
			}
			errca <- FullClose(s)
		}()

		timec := time.After(DefaultCloseTimeout + time.Second) // Timeout must resolve in timeout time + 1s.
		var done uint = 2
		for done > 0 {
			select {
			case err := <-errca:
				// i/o deadline reached must be checked msg.
				if err == nil || err.Error() == "i/o deadline reached" {
					done--
					continue
				}
				t.Fatalf("error for A while slow close: %s", err)
			case err := <-errcb:
				if err == nil || err == io.EOF {
					done--
					continue
				}
				t.Fatalf("error for B while slow close: %s", err)
			case <-timec:
				t.Fatal("slow close took too long.")
			}
		}
		_ = gs // Prevent running the GC Terminator.
	}
}
