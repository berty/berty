package main

import (
	"context"
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"io"
	"math"
	"math/rand"
	"runtime"
	"strconv"
	"sync"
	"time"

	"github.com/denisbrodbeck/machineid"
	p2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p/p2p/protocol/ping"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
	"moul.io/srand"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tinder"
)

const timeRounding = time.Microsecond * 10

func testRDVPs(ctx context.Context, gwg *sync.WaitGroup, addrs []string) {
	defer (*gwg).Done()

	// Isolate each server
	var pis []peer.AddrInfo
	{
		isolator := make(map[peer.ID][]ma.Multiaddr)
		for _, addr := range addrs {
			maddr, err := ma.NewMultiaddr(addr)
			if err != nil {
				newErrorS("Error parsing maddr: %q %s", addr, err)
				continue
			}

			pi, err := peer.AddrInfoFromP2pAddr(maddr)
			if err != nil {
				newErrorS("Error creating PeerInfo: %q %s", maddr, err)
				continue
			}
			isolator[pi.ID] = append(isolator[pi.ID], pi.Addrs...)
		}

		for id, addrs := range isolator {
			if len(addrs) == 0 {
				newErrorS("No address found for %s", id)
				continue
			}
			pis = append(pis, peer.AddrInfo{ID: id, Addrs: addrs})
		}

		if len(pis) == 0 {
			newError("No server found")
			return
		}
	}

	// Resolve each server
	var errs []*discServerReturn
	{
		lenPis := len(pis)
		errs = make([]*discServerReturn, lenPis)
		var wg sync.WaitGroup
		wg.Add(lenPis)
		for lenPis > 0 {
			lenPis--
			// Start a goroutine per server.
			go func(j int) {
				defer wg.Done()
				pi := pis[j]
				idMaddr, err := ma.NewMultiaddr(fmt.Sprintf("/p2p/%s", pi.ID))
				if err != nil {
					newErrorS(`Can't parse "/p2p/%s" %s`, pi.ID, err)
					return
				}

				lenAddrs := len(pi.Addrs)
				lerrs := make([]*discReturn, lenAddrs)
				defer func() {
					rtr := discServerReturn{
						id:    pi.ID,
						addrs: lerrs,
					}
					for _, v := range lerrs {
						if v.success {
							rtr.success = true
							break
						}
					}
					errs[j] = &rtr
				}()
				var lwg sync.WaitGroup
				lwg.Add(lenAddrs)
				for lenAddrs > 0 {
					lenAddrs--
					// Start a goroutine per addr
					go func(j int) {
						defer lwg.Done()
						tgtMaddr := pi.Addrs[j]
						rtr := discReturn{
							target: tgtMaddr,
						}
						lerrs[j] = &rtr
						tgtPi, err := ipfsutil.ParseAndResolveIpfsAddr(ctx, tgtMaddr.Encapsulate(idMaddr).String())
						if err != nil {
							rtr.message = fmt.Sprintf("Can't resolve addr %q", tgtMaddr)
							return
						}

						// Setup host
						host, err := p2p.New(
							p2p.DisableRelay(),
							p2p.ListenAddrStrings("/ip4/127.0.0.1/tcp/0"),
							p2p.UserAgent("Berty Doctor"),
							p2p.DefaultTransports,
						)
						if err != nil {
							rtr.message = fmt.Sprintf("Error creating host: %s", err)
							return
						}

						// Check if that particular addr is fine.
						host.Peerstore().AddAddrs(tgtPi.ID, tgtPi.Addrs, peerstore.PermanentAddrTTL)

						// Ping if we are in verbose
						if verbose {
							pingChan := ping.Ping(ctx, host, tgtPi.ID)

							defer func() {
								rtr.ping = <-pingChan
							}()
						}

						// Setup discovery
						disc := tinder.NewRendezvousDiscovery(
							zap.NewNop(),
							host,
							tgtPi.ID,
							rand.New(rand.NewSource(srand.SafeFast())), //nolint:gosec
						)

						// Generate a good key (mostly avoid collision with concurrent `make doctor` runs across the network).
						var key string
						{
							// Using sha256 as this is not critical, probably still fast on most arch.
							h := sha256.New()
							buf := make([]byte, 8)
							binary.LittleEndian.PutUint64(buf, uint64(srand.SafeFast()))
							doWriteOnHash(h, buf)
							id, err := machineid.ID()
							if err == nil {
								doWriteOnHash(h, []byte(id))
							}
							doWriteOnHash(h, []byte("Berty Doctor"))
							buf = make([]byte, 8)
							binary.LittleEndian.PutUint64(buf, uint64(runtime.NumCPU()))
							doWriteOnHash(h, buf)
							doWriteOnHash(h, []byte(runtime.Version()))
							key = strconv.FormatUint(binary.LittleEndian.Uint64(h.Sum(nil)), 36)
						}

						// Advertise
						{
							start := time.Now()
							duration, err := disc.Advertise(ctx, key, discovery.TTL(timeout))
							if err != nil {
								rtr.message = fmt.Sprintf("Error advertising on %q: %s", tgtMaddr, err)
								return
							}
							// We want at least an Hour of time from the RDVP, else our timeout is fine.
							if duration < timeout || duration >= time.Hour {
								rtr.message = fmt.Sprintf("Wrong time (%d) while advertising on %q", duration, tgtMaddr)
								_ = disc.Unregister(ctx, key)
								return
							}
							rtr.t.advertise = time.Since(start)
						}

						// FindPeers
						hid := host.ID()
						{
							start := time.Now()
							// ReturnChannel
							rc, err := disc.FindPeers(ctx, key)
							if err != nil {
								rtr.message = fmt.Sprintf("Error finding peers on %q: %s", tgtMaddr, err)
								_ = disc.Unregister(ctx, key)
								return
							}

							for v := range rc {
								if hid == v.ID {
									// Success !
									rtr.t.fetch = time.Since(start)
									goto TryingCheckUnregister
								}
							}
							// Error we weren't able to find us
							rtr.message = fmt.Sprintf("Wasn't able to find us on maddr %q", tgtMaddr)
							_ = disc.Unregister(ctx, key)
							return
						}

					TryingCheckUnregister:
						// Unregister
						{
							start := time.Now()
							err = disc.Unregister(ctx, key)
							if err != nil {
								rtr.message = fmt.Sprintf("Error unregistering us on %q: %s", tgtMaddr, err)
								return
							}
							rtr.t.unregister = time.Since(start)
						}

						// FindPeers again but this time we shouldn't be there.
						{
							start := time.Now()
							// ReturnChannel
							rc, err := disc.FindPeers(ctx, key)
							if err != nil {
								rtr.message = fmt.Sprintf("Error finding peers after unregister on %q: %s", tgtMaddr, err)
								return
							}

							for v := range rc {
								if hid == v.ID {
									rtr.message = fmt.Sprintf("Finding us after unregister on %q", tgtMaddr)
									return
								}
							}
							rtr.t.fetchUnregistered = time.Since(start)
						}
						rtr.success = true
					}(lenAddrs)
				}
				// Waiting for defers.
				lwg.Wait()
			}(lenPis)
		}
		wg.Wait()
	}

	// Checking for results
	{
		// Does at least one were successful ?
		var successCount uint
		advertiseFetchRTTMinimal := time.Duration(math.MaxInt64)
		for _, v := range errs {
			if v.success {
				successCount++
				for _, w := range v.addrs {
					if w.success {
						wrtt := w.t.advertise + w.t.fetch
						if wrtt < advertiseFetchRTTMinimal {
							advertiseFetchRTTMinimal = wrtt
						}
					}
				}
			}
		}
		if verbose || successCount == 0 {
			talkLock.Lock()
			for _, server := range errs {
				if server.success {
					fmt.Printf("[+] %s     ", green("OK"))
				} else {
					if successCount == 0 {
						fmt.Printf("[-] %s  ", red("ERROR"))
						errc++
					} else {
						fmt.Printf("[-] %s   ", yellow("WARN"))
						warnc++
					}
				}
				fmt.Printf("RDVP %s:\n", server.id)
				for _, addr := range server.addrs {
					if addr.success {
						fmt.Printf("   [%s]     %q (A: %s, F: %s, U: %s, FU: %s",
							green("+"),
							addr.target,
							addr.t.advertise.Round(timeRounding).String(),
							addr.t.fetch.Round(timeRounding).String(),
							addr.t.unregister.Round(timeRounding).String(),
							addr.t.fetchUnregistered.Round(timeRounding).String(),
						)
						if addr.ping.Error == nil {
							fmt.Printf(", P: %s", addr.ping.RTT.Round(timeRounding).String())
						}
						fmt.Print(")\n")
					} else {
						fmt.Printf("   [%s]     %q: %s\n", red("-"), addr.target, addr.message)
					}
				}
			}
			talkLock.Unlock()
		} else {
			newOkS("RDVP (%d/%d, min A+F: %s)", successCount, len(errs), advertiseFetchRTTMinimal.Round(timeRounding).String())
		}
	}
}

type discServerReturn struct {
	success bool
	id      peer.ID
	addrs   []*discReturn
}

type discReturn struct {
	success bool
	target  ma.Multiaddr
	message string
	ping    ping.Result
	t       struct {
		advertise         time.Duration
		fetch             time.Duration
		unregister        time.Duration
		fetchUnregistered time.Duration
	}
}

func doWriteOnHash(h io.Writer, buf []byte) {
	toWrite := len(buf)
	written := 0
	for written < toWrite {
		// hash.Hash never returns an error.
		n, _ := h.Write(buf[written:])
		written += n
	}
}
