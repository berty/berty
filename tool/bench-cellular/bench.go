package main

import (
	"context"
	crand "crypto/rand"
	"flag"
	"fmt"
	"io"
	mrand "math/rand"
	"os"
	"strings"

	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/crypto"
	quict "github.com/libp2p/go-libp2p-quic-transport"
	tcpt "github.com/libp2p/go-tcp-transport"
	ma "github.com/multiformats/go-multiaddr"

	golog "github.com/ipfs/go-log"
	"github.com/peterbourgon/ff/v3/ffcli"
)

const (
	benchDownloadPID = "/bench/download/1.0.0"
	benchUploadPID   = "/bench/upload/1.0.0"
)

type globalOpts struct {
	tcp         bool
	insecure    bool
	seed        int64
	verbose     bool
	veryVerbose bool
}

func globalOptsToLibp2pOpts(gOpts *globalOpts) ([]libp2p.Option, error) {
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
