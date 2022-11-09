package main

import (
	"bufio"
	"context"
	crand "crypto/rand"
	"encoding/base64"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"os"

	libp2p_ci "github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/peterbourgon/ff/v3/ffcli"
)

const (
	DefaultP2PKeySize = 2048
	DefaultP2PKeyType = "Ed25519"
)

func p2pIdentityGenerateCommand() *ffcli.Command {
	var (
		path    string
		noprint bool
		kind    string
		size    int
	)

	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty p2p generate-id [falgs] <path>", flag.ExitOnError)
		fs.BoolVar(&noprint, "noprint", false, "do no print anything")

		fs.StringVar(&kind, "type", DefaultP2PKeyType, "specify the type of key")
		fs.IntVar(&size, "size", DefaultP2PKeySize, "for RSA key only, specfy the bit size of the key")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "generate-id",
		ShortUsage:     "berty p2p generate-id [flags] [path]",
		ShortHelp:      "helper to generate a key identity for libp2p service",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			switch len(args) {
			case 1:
				path = args[0]
			case 0:
			default:
				return flag.ErrHelp
			}

			var output io.Writer = os.Stdout
			var stderr io.Writer = os.Stderr
			if noprint {
				output = ioutil.Discard
				stderr = ioutil.Discard
			} else {
				o, _ := os.Stdout.Stat()
				if (o.Mode() & os.ModeCharDevice) != os.ModeCharDevice {
					// if redirect to a pipe discard stderr
					stderr = ioutil.Discard
				}
			}

			priv, err := generateNewKeyPair(kind, size, crand.Reader)
			if err != nil {
				return fmt.Errorf("unable to generate key pair: %w", err)
			}

			peer, err := peer.IDFromPrivateKey(priv)
			if err != nil {
				return fmt.Errorf("unable to get peer from private key: %w", err)
			}

			kbyte, err := libp2p_ci.MarshalPrivateKey(priv)
			if err != nil {
				return fmt.Errorf("unable to marshal private key: %w", err)
			}

			if path != "" {
				if err := os.WriteFile(path, kbyte, 0o600); err != nil {
					return fmt.Errorf("unable to write file `%s`: %w", path, err)
				}

				fmt.Fprintf(stderr, "generated %s key in: %s\n", priv.Type().String(), path)
				fmt.Fprintf(stderr, "peer id: ")
				fmt.Fprint(output, peer.String())
				fmt.Fprintln(stderr)
			} else {
				encoded := base64.StdEncoding.EncodeToString(kbyte)
				fmt.Fprintln(stderr, "generated base64 encoded key:")
				fmt.Fprint(output, encoded)
				fmt.Fprintln(stderr)
			}

			return nil
		},
	}
}

func p2pIdentityLoadCommand() *ffcli.Command {
	var path string

	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty p2p load-id [path]", flag.ExitOnError)
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "load-id",
		ShortUsage:     "berty p2p load-id [path]",
		ShortHelp:      "helper to display peerid or related information from libp2p key from path or stdin",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			switch len(args) {
			case 1:
				path = args[0]
			case 0:
			default:
				return flag.ErrHelp
			}

			var output io.Writer = os.Stdout
			var stderr io.Writer = os.Stderr
			o, _ := os.Stdout.Stat()
			if (o.Mode() & os.ModeCharDevice) != os.ModeCharDevice {
				// if redirect to a pipe discard stderr
				stderr = ioutil.Discard
			}

			// load raw key data
			var data string
			if path != "" {
				file, err := os.ReadFile(path)
				if err != nil {
					return fmt.Errorf("unable to read file `%s`: %w", path, err)
				}

				data = string(file)
			} else {
				scanner := bufio.NewScanner(os.Stdin)
				scanner.Scan()
				data = scanner.Text()
			}

			// decode base64 data if needed
			var kbyte []byte
			if bdata, err := base64.StdEncoding.DecodeString(data); err == nil {
				kbyte = bdata
			} else {
				kbyte = []byte(data)
			}

			priv, err := libp2p_ci.UnmarshalPrivateKey(kbyte)
			if err != nil {
				return fmt.Errorf("unable to unmarshal private key: %w", err)
			}

			peer, err := peer.IDFromPrivateKey(priv)
			if err != nil {
				return fmt.Errorf("unable to get peer from private key: %w", err)
			}

			fmt.Fprintf(stderr, "type: %s\n", priv.Type().String())
			fmt.Fprintf(stderr, "peer id: ")
			fmt.Fprint(output, peer.String())
			fmt.Fprintln(stderr)
			return nil
		},
	}
}

func p2pCommand() *ffcli.Command {
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty p2p [command]", flag.ExitOnError)
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "p2p",
		ShortUsage:     "berty p2p [command]",
		ShortHelp:      "helper around libp2p",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			return flag.ErrHelp
		},
		Subcommands: []*ffcli.Command{
			p2pIdentityGenerateCommand(),
			p2pIdentityLoadCommand(),
		},
	}
}
