package main

import (
	"context"
	"crypto/ed25519"
	crand "crypto/rand"
	"encoding/base64"
	"flag"
	"fmt"

	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func serviceKeyCommand() *ffcli.Command {
	sk := ""

	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty service-key [flags] [command]", flag.ExitOnError)
		fs.StringVar(&sk, "auth.sk", "", "base64 encoded ed25519 private key to convert to a public key")
		return fs, nil
	}

	c := &ffcli.Command{
		Name:           "service-key",
		ShortUsage:     "berty service-key [flags] [command]",
		ShortHelp:      "helper to generate a key for managed services",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) == 0 {
				return flag.ErrHelp
			}

			mode := args[0]

			switch mode {
			case "convert":
				skSlice, err := base64.RawStdEncoding.DecodeString(sk)
				if err != nil {
					return errcode.ErrDeserialization.Wrap(err)
				}

				if l := len(skSlice); l != cryptoutil.KeySize {
					return errcode.ErrInvalidInput.Wrap(fmt.Errorf("key length should be %d bytes, received %d bytes", cryptoutil.KeySize, l))
				}

				stdPrivKey := ed25519.NewKeyFromSeed(skSlice)
				_, pubKey, err := crypto.KeyPairFromStdKey(&stdPrivKey)
				if err != nil {
					return errcode.ErrInternal.Wrap(err)
				}

				pubKeyRaw, err := pubKey.Raw()
				if err != nil {
					return errcode.ErrDeserialization.Wrap(err)
				}

				fmt.Printf("%s\n", base64.RawStdEncoding.EncodeToString(pubKeyRaw))

			case "generate":
				privKey, _, err := crypto.GenerateEd25519Key(crand.Reader)
				if err != nil {
					return errcode.ErrCryptoKeyGeneration.Wrap(err)
				}

				seed, err := cryptoutil.SeedFromEd25519PrivateKey(privKey)
				if err != nil {
					return errcode.ErrSerialization.Wrap(err)
				}

				fmt.Printf("%s\n", base64.RawStdEncoding.EncodeToString(seed))

			default:
				return flag.ErrHelp
			}

			return nil
		},
	}

	return c
}
