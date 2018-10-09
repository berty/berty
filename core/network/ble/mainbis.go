package ble

/*
*
* The MIT License (MIT)
*
* Copyright (c) 2014 Juan Batiz-Benet
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*
* This program demonstrate a simple chat application using p2p communication.
*
 */

// package main

// import (
// 	"bufio"
// 	mrand "math/rand"

// 	"context"
// 	"crypto/rand"
// 	"flag"
// 	"fmt"
// 	"io"
// 	"log"
// 	"os"

// 	"github.com/satori/go.uuid"

// 	"github.com/libp2p/go-libp2p"

// 	"github.com/libp2p/go-libp2p-crypto"
// 	"github.com/libp2p/go-libp2p-host"
// 	"github.com/libp2p/go-libp2p-net"
// 	"github.com/libp2p/go-libp2p-peer"
// 	"github.com/libp2p/go-libp2p-peerstore"
// 	ma "github.com/multiformats/go-multiaddr"
// 	"github.com/multiformats/go-multiaddr/trestt/ble"
// )

// /*
//  * addAddrToPeerstore parses a peer multiaddress and adds
//  * it to the given host's peerstore, so it knows how to
//  * contact it. It returns the peer ID of the remote peer.
//  * @credit examples/http-proxy/proxy.go
//  */
// func addAddrToPeerstore(h host.Host, addr string) peer.ID {
// 	// The following code extracts target's the peer ID from the
// 	// given multiaddress
// 	ipfsaddr, err := ma.NewMultiaddr(addr)
// 	if err != nil {
// 		log.Fatalln(err)
// 	}
// 	pid, err := ipfsaddr.ValueForProtocol(ma.P_IPFS)
// 	if err != nil {
// 		log.Fatalln(err)
// 	}

// 	peerid, err := peer.IDB58Decode(pid)
// 	if err != nil {
// 		log.Fatalln(err)
// 	}

// 	// Decapsulate the /ipfs/<peerID> part from the target
// 	// /ip4/<a.b.c.d>/ipfs/<peer> becomes /ip4/<a.b.c.d>
// 	targetPeerAddr, _ := ma.NewMultiaddr(
// 		fmt.Sprintf("/ipfs/%s", peer.IDB58Encode(peerid)))
// 	targetAddr := ipfsaddr.Decapsulate(targetPeerAddr)

// 	// We have a peer ID and a targetAddr so we add
// 	// it to the peerstore so LibP2P knows how to contact it
// 	h.Peerstore().AddAddr(peerid, targetAddr, peerstore.PermanentAddrTTL)
// 	return peerid
// }

// func handleStream(s net.Stream) {
// 	log.Println("Got a new stream!")

// 	// Create a buffer stream for non blocking read and write.
// 	rw := bufio.NewReadWriter(bufio.NewReader(s), bufio.NewWriter(s))

// 	go readData(rw)
// 	go writeData(rw)

// 	// stream 's' will stay open until you close it (or the other side closes it).
// }
// func readData(rw *bufio.ReadWriter) {
// 	for {
// 		str, _ := rw.ReadString('\n')

// 		if str == "" {
// 			return
// 		}
// 		if str != "\n" {
// 			// Green console colour: 	\x1b[32m
// 			// Reset console colour: 	\x1b[0m
// 			fmt.Printf("\x1b[32m%s\x1b[0m> ", str)
// 		}

// 	}
// }

// func writeData(rw *bufio.ReadWriter) {
// 	stdReader := bufio.NewReader(os.Stdin)

// 	for {
// 		fmt.Print("> ")
// 		sendData, err := stdReader.ReadString('\n')

// 		if err != nil {
// 			panic(err)
// 		}

// 		rw.WriteString(fmt.Sprintf("%s\n", sendData))
// 		rw.Flush()
// 	}

// }

// func main() {
// 	// ma.AddProtocol(ble.ProtoBLE)
// 	TEST()
// 	<-make(chan struct{})
// }

// func TEST() {
// 	id, err := uuid.NewV4()
// 	if err != nil {
// 		panic(err)
// 	}

// 	// 0.0.0.0 will listen on any interface device
// 	sourceMultiAddr, err := ma.NewMultiaddr(fmt.Sprintf("/ble/%s", id.String()))
// 	go func() {
// 		// sourcePort := flag.Int("sp", 0, "Source port number")
// 		dest := flag.String("d", "", "Dest MultiAddr String")
// 		help := flag.Bool("help", false, "Display Help")
// 		debug := flag.Bool("debug", false, "Debug generated same node id on every execution.")

// 		flag.Parse()

// 		if *help {
// 			fmt.Printf("This program demonstrates a simple p2p chat application using libp2p\n\n")
// 			fmt.Printf("Usage: Run './chat -sp <SOURCE_PORT>' where <SOURCE_PORT> can be any port number. Now run './chat -d <MULTIADDR>' where <MULTIADDR> is multiaddress of previous listener host.\n")

// 			os.Exit(0)
// 		}

// 		// If debug is enabled used constant random source else cryptographic randomness.
// 		var r io.Reader
// 		if *debug {
// 			fmt.Printf("ICI ICI\n")
// 			sourceMultiAddr, err = ma.NewMultiaddr("/ble/745379ea-82df-47f4-b8ca-8e48632e8204")
// 			// Constant random source. This will always generate the same host ID on multiple execution.
// 			// Don't do this in production code.
// 			r = mrand.New(mrand.NewSource(int64(0)))
// 		} else {
// 			r = rand.Reader
// 		}

// 		// Creates a new RSA key pair for this host
// 		prvKey, _, err := crypto.GenerateKeyPairWithReader(crypto.RSA, 2048, r)

// 		if err != nil {
// 			panic(err)
// 		}

// 		// libp2p.New constructs a new libp2p Host.
// 		// Other options can be added here.
// 		fmt.Printf("sourceMulti %+v %+v\n", sourceMultiAddr, err)
// 		fun := ble.NewBLETransport(id.String(), sourceMultiAddr)
// 		if *debug {
// 			fun = ble.NewBLETransport("745379ea-82df-47f4-b8ca-8e48632e8204", sourceMultiAddr)
// 		}
// 		defaultTransports := libp2p.ChainOptions(
// 			libp2p.Transport(fun),
// 		)
// 		host, err := libp2p.New(
// 			context.Background(),
// 			libp2p.ListenAddrs(sourceMultiAddr),
// 			defaultTransports,
// 			libp2p.Identity(prvKey),
// 		)

// 		if err != nil {
// 			panic(err)
// 		}

// 		if *dest == "" {
// 			// Set a function as stream handler.
// 			// This function  is called when a peer initiate a connection and starts a stream with this peer.
// 			// Only applicable on the receiving side.
// 			host.SetStreamHandler("/chat/1.0.0", handleStream)

// 			fmt.Printf("Run './chat -d %s/ipfs/%s' on another console.\n You can replace 127.0.0.1 with public IP as well.\n", sourceMultiAddr.String(), host.ID().Pretty())

// 			fmt.Printf("\nWaiting for incoming connection\n\n")
// 			// fmt.Printf("\nSource multi %s\n\n", ma.String())
// 			// Hang forever
// 			fmt.Printf("\nHANNNNGING\n\n")
// 			fmt.Printf("\nHANNNNGING\n\n")
// 			<-make(chan struct{})

// 		} else {

// 			// Add destination peer multiaddress in the peerstore.
// 			// This will be used during connection and stream creation by libp2p.
// 			peerID := addAddrToPeerstore(host, *dest)

// 			fmt.Println("This node's multiaddress: ")
// 			// IP will be 0.0.0.0 (listen on any interface) and port will be 0 (choose one for me).
// 			// Although this node will not listen for any connection. It will just initiate a connect with
// 			// one of its peer and use that stream to communicate.
// 			fmt.Printf("%s/ipfs/%s\n", sourceMultiAddr, host.ID().Pretty())

// 			// Start a stream with peer with peer Id: 'peerId'.
// 			// Multiaddress of the destination peer is fetched from the peerstore using 'peerId'.
// 			s, err := host.NewStream(context.Background(), peerID, "/chat/1.0.0")

// 			if err != nil {
// 				panic(err)
// 			}

// 			// Create a buffered stream so that read and writes are non blocking.
// 			rw := bufio.NewReadWriter(bufio.NewReader(s), bufio.NewWriter(s))

// 			// Create a thread to read and write data.
// 			go writeData(rw)
// 			go readData(rw)

// 			// Hang forever.
// 			select {}

// 		}
// 	}()
// }
