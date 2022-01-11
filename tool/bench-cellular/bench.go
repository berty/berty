package main

import (
	"context"
	crand "crypto/rand"
	"flag"
	"fmt"
	"io"
	"log"
	mrand "math/rand"
	"os"
	"strings"
	"time"

	"github.com/libp2p/go-libp2p"
	p2pcircuit "github.com/libp2p/go-libp2p-circuit"
	connmgr "github.com/libp2p/go-libp2p-connmgr"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	routing "github.com/libp2p/go-libp2p-core/routing"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	quict "github.com/libp2p/go-libp2p-quic-transport"
	p2pping "github.com/libp2p/go-libp2p/p2p/protocol/ping"
	tcpt "github.com/libp2p/go-tcp-transport"

	golog "github.com/ipfs/go-log"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/peterbourgon/ff/v3/ffcli"
)

const (
	benchDownloadPID = "/bench/download/1.0.0"
	benchUploadPID   = "/bench/upload/1.0.0"
)

type globalOpts struct {
	tcp         bool
	dht         bool
	limit       int
	insecure    bool
	seed        int64
	verbose     bool
	veryVerbose bool
}

func monitorConnsCount(h host.Host, limit int) {
	type connsState struct {
		notconnected  int
		connected     int
		canConnect    int
		cannotConnect int
	}

	getConnsCount := func() connsState {
		conns := connsState{}
		for _, conn := range h.Network().Conns() {
			switch h.Network().Connectedness(conn.RemotePeer()) {
			case network.NotConnected:
				conns.notconnected++
			case network.Connected:
				conns.connected++
			case network.CanConnect:
				conns.canConnect++
			case network.CannotConnect:
				conns.cannotConnect++
			}
		}
		return conns
	}

	go func() {
		eventReceiver, err := h.EventBus().Subscribe(new(event.EvtPeerConnectednessChanged))
		if err != nil {
			log.Fatalf("can't subscribe to local addresses updated events: %v", err)
		}
		defer eventReceiver.Close()

		for range eventReceiver.Out() {
			connsCount := getConnsCount()
			time.Sleep(300 * time.Millisecond)

			if limit > 0 && connsCount.connected > limit {
				// Purge connections
				for _, conn := range h.Network().Conns() {
					if getConnsCount().connected <= limit {
						break
					}

					toKill := false
					for _, stream := range conn.GetStreams() {
						proto := string(stream.Protocol())
						if proto != "" && (strings.HasPrefix(proto, p2pcircuit.ProtoID) || strings.HasPrefix(proto, p2pping.ID) || strings.HasPrefix(proto, benchDownloadPID) || strings.HasPrefix(proto, benchUploadPID)) {
							fmt.Println("Saved stream with protocol:", proto)
							toKill = false
							break
						} else {
							fmt.Println("Not saved stream with protocol:", proto)
							toKill = true
						}
					}

					if toKill {
						fmt.Println("PeerID connection closing: ", conn.RemotePeer())
						conn.Close()
					}
				}

				fmt.Println("Purge -> Connections:", getConnsCount())
			} else {
				fmt.Println(
					"Connections: (notConnected)", connsCount.notconnected,
					"/ (connected)", connsCount.connected,
					"/ (canConnect)", connsCount.canConnect,
					"/ (cannotConnect)", connsCount.cannotConnect,
				)
			}
		}
	}()
}

func globalOptsToLibp2pOpts(ctx context.Context, gOpts *globalOpts) ([]libp2p.Option, error) {
	var (
		r    io.Reader
		opts []libp2p.Option
	)

	if gOpts.seed == 0 {
		r = crand.Reader
	} else {
		r = mrand.New(mrand.NewSource(gOpts.seed))
	}

	priv, _, err := crypto.GenerateKeyPairWithReader(crypto.RSA, crypto.MinRsaKeyBits, r)
	if err != nil {
		return nil, err
	}
	opts = append(opts, libp2p.Identity(priv))

	if gOpts.tcp {
		opts = append(opts, libp2p.Transport(tcpt.NewTCPTransport))
	} else {
		opts = append(opts, libp2p.Transport(quict.NewTransport))
	}

	if gOpts.insecure {
		opts = append(opts, libp2p.NoSecurity)
	}

	if gOpts.dht {
		opts = append(
			opts,
			libp2p.Routing(func(h host.Host) (routing.PeerRouting, error) {
				return dht.New(ctx, h, dht.Mode(dht.ModeClient), dht.BootstrapPeers(dht.GetDefaultBootstrapPeerAddrInfos()...) /*, dht.DisableAutoRefresh()*/)
			}),
		)
	}

	if gOpts.limit > 0 {
		opts = append(
			opts,
			libp2p.ConnectionManager(connmgr.NewConnManager(
				gOpts.limit,
				gOpts.limit,
				time.Millisecond,
			)),
		)
	}

	return opts, nil
}

func main() {
	var (
		ctx   = context.Background()
		gOpts = &globalOpts{}
		sOpts = &serverOpts{}
		cOpts = &clientOpts{}
	)

	var serverCommand *ffcli.Command
	{
		serverFs := flag.NewFlagSet("server", flag.ExitOnError)
		serverFs.IntVar(&sOpts.port, "port", 0, "port to listen on (default: random)")
		serverFs.BoolVar(&sOpts.ip6, "ip6", false, "use ipv6 instead of ipv4")
		serverFs.StringVar(&sOpts.relay, "relay", staticBertyRelayMode, fmt.Sprintf("set relay mode, possible values: '%s', '%s', '%s' or '%s'", staticBertyRelayMode, staticIPFSRelayMode, discoveryRelayMode, disabledRelayMode))

		serverCommand = &ffcli.Command{
			Name:       "server",
			ShortUsage: "bench server [flags]",
			ShortHelp:  "run a benchmark server that listen for client request",
			FlagSet:    serverFs,
			Exec: func(ctx context.Context, args []string) error {
				if len(args) > 0 {
					return flag.ErrHelp
				}
				if sOpts.relay != staticBertyRelayMode && sOpts.relay != staticIPFSRelayMode && sOpts.relay != discoveryRelayMode && sOpts.relay != disabledRelayMode {
					fmt.Fprintf(os.Stderr, "error: invalid value for -relay flag: %s\n\n", sOpts.relay)
					return flag.ErrHelp
				}

				if gOpts.verbose {
					golog.SetAllLoggers(golog.LevelError)
					golog.SetLogLevel("autorelay", "debug")
					golog.SetLogLevel("autonat", "debug")
					golog.SetLogLevel("basichost", "debug")
					golog.SetLogLevel("swarm2", "debug")
				}
				if gOpts.veryVerbose {
					golog.SetAllLoggers(golog.LevelDebug)
				}

				return runServer(ctx, gOpts, sOpts)
			},
		}
	}

	var clientCommand *ffcli.Command
	{
		const megabyte = 1048576

		clientFs := flag.NewFlagSet("client", flag.ExitOnError)
		clientFs.StringVar(&cOpts.dest, "dest", "", "server multiaddr to dial")
		clientFs.StringVar(&cOpts.request, "request", fmt.Sprintf("%s,%s,%s", pingRequestType, uploadRequestType, downloadRequestType), fmt.Sprintf("comma separated list of request type to send, possible values: '%s', '%s' and '%s'", pingRequestType, uploadRequestType, downloadRequestType))
		clientFs.BoolVar(&cOpts.reco, "reco", false, "test reconnection to server")
		clientFs.IntVar(&cOpts.size, "size", megabyte, "size (in bytes) of data to upload / download (default: 1MB)")

		clientCommand = &ffcli.Command{
			Name:       "client",
			ShortUsage: "bench client [flags]",
			ShortHelp:  "run a benchmark client that send request to server",
			FlagSet:    clientFs,
			Exec: func(ctx context.Context, args []string) error {
				if len(args) > 0 {
					return flag.ErrHelp
				}

				requestTypes := strings.Split(cOpts.request, ",")
				if len(requestTypes) == 0 {
					fmt.Fprintf(os.Stderr, "error: at least one request type must be specified using -request flag\n\n")
					return flag.ErrHelp
				}
				for _, requestType := range requestTypes {
					trimed := strings.TrimSpace(requestType)
					if trimed != pingRequestType && trimed != uploadRequestType && trimed != downloadRequestType {
						fmt.Fprintf(os.Stderr, "error: invalid request type specified using -request flag: '%s'\n\n", trimed)
						return flag.ErrHelp
					}
				}

				if cOpts.dest == "" {
					fmt.Fprintf(os.Stderr, "error: a server multiaddr must be specified using -dest flag\n\n")
					return flag.ErrHelp
				}
				if _, err := ma.NewMultiaddr(cOpts.dest); err != nil {
					fmt.Fprintf(os.Stderr, "error: invalid multiaddr specified using -dest flag: %v\n\n", err)
					return flag.ErrHelp
				}
				if cOpts.size <= 0 {
					fmt.Fprintf(os.Stderr, "error: a positive bytes amount must be set using -size flag (default 1MB)\n\n")
					return flag.ErrHelp
				}

				if gOpts.verbose {
					golog.SetAllLoggers(golog.LevelError)
					golog.SetLogLevel("basichost", "debug")
					golog.SetLogLevel("swarm2", "debug")
				}
				if gOpts.veryVerbose {
					golog.SetAllLoggers(golog.LevelDebug)
				}

				return runClient(ctx, gOpts, cOpts)
			},
		}
	}

	var rootCommand *ffcli.Command
	{
		rootFs := flag.NewFlagSet("root", flag.ExitOnError)
		rootFs.BoolVar(&gOpts.tcp, "tcp", false, "use TCP instead of QUIC")
		rootFs.BoolVar(&gOpts.dht, "dht", false, "enable DHT routing")
		rootFs.IntVar(&gOpts.limit, "limit", 0, "limit the number of connections")
		rootFs.BoolVar(&gOpts.insecure, "insecure", false, "use an unencrypted connection")
		rootFs.Int64Var(&gOpts.seed, "seed", 0, "set random seed for id generation")
		rootFs.BoolVar(&gOpts.verbose, "v", false, "verbose mode: print debug level for relevant libp2p loggers")
		rootFs.BoolVar(&gOpts.veryVerbose, "vv", false, "very verbose mode: print debug level for all libp2p loggers")

		rootCommand = &ffcli.Command{
			ShortUsage: "bench [flags] <subcommand> [subcommand_flags]",
			FlagSet:    rootFs,
			Exec:       func(context.Context, []string) error { return flag.ErrHelp },
			Subcommands: []*ffcli.Command{
				serverCommand,
				clientCommand,
			},
		}
	}

	err := rootCommand.ParseAndRun(ctx, os.Args[1:])
	if err == flag.ErrHelp {
		os.Exit(1)
	} else if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(2)
	}
}
