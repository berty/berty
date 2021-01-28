package main

import (
	"bufio"
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"strings"
	"time"

	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-peer"
	peerstore "github.com/libp2p/go-libp2p-peerstore"
	p2pping "github.com/libp2p/go-libp2p/p2p/protocol/ping"
	ma "github.com/multiformats/go-multiaddr"
)

const (
	pingRequestType     = "ping"
	uploadRequestType   = "upload"
	downloadRequestType = "download"
)

type clientOpts struct {
	dest    string
	request string
	reco    bool
	size    int
}

func createClientHost(ctx context.Context, gOpts *globalOpts) (host.Host, error) {
	opts, err := globalOptsToLibp2pOpts(gOpts) // Get identity and transport
	if err != nil {
		return nil, err
	}

	opts = append(
		opts,
		libp2p.ListenAddrs(), // On client mode, set no listener
	)

	return libp2p.New(ctx, opts...) // Create host
}

func addDestToPeerstore(h host.Host, dest string) (peer.ID, error) {
	maddr, err := ma.NewMultiaddr(dest)
	if err != nil {
		return "", err
	}

	var pid string
	if _, err := maddr.ValueForProtocol(ma.P_CIRCUIT); err == nil {
		first := true
		// Get the second peerid (target), the first being the relay peerid
		ma.ForEach(maddr, func(c ma.Component) bool {
			if c.Protocol().Code == ma.P_IPFS {
				if first {
					first = false
				} else {
					pid = c.Value()
					return false
				}
			}
			return true
		})
	} else {
		pid, err = maddr.ValueForProtocol(ma.P_IPFS)
		if err != nil {
			return "", err
		}
	}

	peerid, err := peer.IDB58Decode(pid)
	if err != nil {
		return "", err
	}

	if _, err := maddr.ValueForProtocol(ma.P_CIRCUIT); err != nil {
		targetAddr, _ := ma.NewMultiaddr(fmt.Sprintf("/ipfs/%s", pid))
		maddr = maddr.Decapsulate(targetAddr)
	}

	h.Peerstore().AddAddr(peerid, maddr, peerstore.PermanentAddrTTL)

	return peerid, nil
}

func ping(ctx context.Context, h host.Host, peerid peer.ID) error {
	var (
		timeout            = 30 * time.Second
		timeoutCtx, cancel = context.WithTimeout(ctx, timeout)
		resultOccured      = 0
		resultRequired     = 8
		start              = time.Now()
	)
	defer cancel()

	log.Printf("New ping started with timeout: %v", timeout)

	for result := range p2pping.Ping(timeoutCtx, h, peerid) {
		if result.Error != nil {
			return fmt.Errorf("ping error: %v", result.Error)
		}
		log.Printf("\tPing RTT: %v", result.RTT)

		resultOccured++
		if resultOccured >= resultRequired {
			break
		}
	}

	if resultOccured < resultRequired {
		return fmt.Errorf("ping request timeouted after %v: %d/%d (RTT done/required)", timeout, resultOccured, resultRequired)
	}
	log.Printf("Ping request with %d RTT took: %v", resultOccured, time.Since(start))

	return nil
}

func upload(ctx context.Context, h host.Host, peerid peer.ID, cOpts *clientOpts) error {
	start := time.Now()
	su, err := h.NewStream(ctx, peerid, benchUploadPID)
	if err != nil {
		return fmt.Errorf("new upload stream failed: %v", err)
	}

	reader := bufio.NewReader(su)
	if _, err = reader.ReadString('\n'); err != nil {
		return fmt.Errorf("read error during stream opened ack: %v", err)
	}
	log.Printf("New upload stream took: %v", time.Since(start))

	data := make([]byte, cOpts.size)
	rand.Read(data)

	start = time.Now()
	if _, err = su.Write(data); err != nil {
		return fmt.Errorf("write error during upload: %v", err)
	}
	su.CloseWrite()

	if _, err = reader.ReadString('\n'); err != nil {
		return fmt.Errorf("read error during uploaded ack: %v", err)
	}
	log.Printf("Data (%d bytes) upload took: %v", cOpts.size, time.Since(start))

	su.CloseRead()

	return nil
}

func download(ctx context.Context, h host.Host, peerid peer.ID, cOpts *clientOpts) error {
	start := time.Now()
	sd, err := h.NewStream(ctx, peerid, benchDownloadPID)
	if err != nil {
		return fmt.Errorf("new download stream failed: %v", err)
	}

	reader := bufio.NewReader(sd)
	if _, err = reader.ReadString('\n'); err != nil {
		return fmt.Errorf("read error during stream opened ack: %v", err)
	}
	log.Printf("New download stream took: %v", time.Since(start))

	// Send size to download
	sizeStr := fmt.Sprintf("%d\n", cOpts.size)
	if _, err = sd.Write([]byte(sizeStr)); err != nil {
		return fmt.Errorf("write size error during download: %v", err)
	}

	start = time.Now()
	if _, err = ioutil.ReadAll(sd); err != nil {
		return err
	}
	log.Printf("Data (%d bytes) download took: %v", cOpts.size, time.Since(start))

	sd.Close()

	return nil
}

func runClient(ctx context.Context, gOpts *globalOpts, cOpts *clientOpts) error {
	h, err := createClientHost(ctx, gOpts)
	if err != nil {
		return fmt.Errorf("client host creation failed: %v", err)
	}

	log.Println("Local peerID:", h.ID().Pretty())

	peerid, err := addDestToPeerstore(h, cOpts.dest)
	if err != nil {
		return err
	}

	requestList := strings.Split(cOpts.request, ",")
	for i, request := range requestList {
		requestList[i] = strings.TrimSpace(request)
	}

	for {
		log.Printf("Playing request list: %q", requestList)
		start := time.Now()
		for _, request := range requestList {
			switch request {
			case pingRequestType:
				err = ping(ctx, h, peerid)
			case uploadRequestType:
				err = upload(ctx, h, peerid, cOpts)
			case downloadRequestType:
				err = download(ctx, h, peerid, cOpts)
			}

			if err != nil {
				return err
			}
		}
		log.Printf("Playing request list took: %v", time.Since(start))

		if cOpts.reco {
			cOpts.reco = false
			reader := bufio.NewReader(os.Stdin)
			fmt.Printf("%s Reconnection test: switch connection then press enter... ", time.Now().Format("2006/01/02 15:04:05"))
			_, _ = reader.ReadString('\n')
			log.Print("Reconnection test: replay request list using new connection")
			continue
		}

		break
	}

	return nil
}
