package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"os"

	p2pcrypto "github.com/libp2p/go-libp2p-crypto"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

var (
	cfgCryptoRaw     bool
	cfgCryptoPubKey  bool
	cfgCryptoKeyType string
)

type KeyType int

const (
	Unknow    KeyType = -1
	RSA       KeyType = p2pcrypto.RSA
	Ed25519   KeyType = p2pcrypto.Ed25519
	Secp256k1 KeyType = p2pcrypto.Secp256k1
)

// var KeyTypesString = map[KeyType]string{
// 	RSA:       "RSA",
// 	Ed25519:   "Ed25519",
// 	Secp256k1: "Secp256k1",
// }

var StringKeyTypes = map[string]KeyType{
	"RSA":       RSA,
	"Ed25519":   Ed25519,
	"Secp256k1": Secp256k1,
}

var r io.Reader = rand.Reader

func getKeyType(t string) (KeyType, error) {
	if v, ok := StringKeyTypes[t]; ok {
		return v, nil
	}

	return Unknow, fmt.Errorf("Unknow key type")
}

func newIdentityCommand() *cobra.Command {
	cryptoKeyGenerateCmd.Flags().BoolVar(&cfgCryptoPubKey, "pub", false, "Also print public key (will only print pubkey if `raw` option is enabled)")
	cryptoKeyGenerateCmd.Flags().BoolVar(&cfgCryptoRaw, "bytes", false, "Print raw key")
	cryptoKeyGenerateCmd.Flags().StringVar(&cfgCryptoKeyType, "key-type", "RSA", "Key types, can be: `RSA`, `Ed25519` or `Secp256k1` ")
	cryptoCmd.AddCommand(cryptoKeyGenerateCmd)
	return cryptoCmd
}

func embedKey(title string, key []byte) string {
	return fmt.Sprintf(
		"-----BEGIN %s-----\n%s\n-----END %s-----",
		title,
		base64.StdEncoding.EncodeToString(key),
		title)
}

var cryptoCmd = &cobra.Command{
	Use:   "identity",
	Short: "identity related cmds",
}

var cryptoKeyGenerateCmd = &cobra.Command{
	Use:   "generate",
	Short: "keys related tools",
	Run: func(cmd *cobra.Command, args []string) {
		// @TODO: handle file output
		w := os.Stdout

		t, err := getKeyType(cfgCryptoKeyType)
		if err != nil {
			zap.L().Fatal("Cannot get key type:", zap.String("type", cfgCryptoKeyType), zap.Error(err))
		}

		priv, pub, err := p2pcrypto.GenerateKeyPairWithReader(int(t), 2048, r)
		if err != nil {
			zap.L().Fatal("Error while generating key pair", zap.Error(err))
		}

		bPriv, err := priv.Bytes()
		if err != nil {
			zap.L().Fatal("Invalid private key", zap.Error(err))
		}

		var bPub []byte = []byte{}
		if cfgCryptoPubKey {
			bPub, err = pub.Bytes()
			if err != nil {
				zap.L().Fatal("Invalid private key", zap.Error(err))
			}
		}

		if cfgCryptoRaw {
			if cfgCryptoPubKey {
				if _, err = w.Write(bPub); err != nil {
					zap.L().Fatal("Error while writing output", zap.Error(err))
				}

				return
			}

			if _, err := w.Write(bPriv); err != nil {
				zap.L().Fatal("Error while writing output", zap.Error(err))
			}

			return
		}

		_, err = w.WriteString(embedKey("PRIVATE KEY", bPriv))
		if err == nil && cfgCryptoPubKey {
			_, err = w.WriteString("\n" + embedKey("PUBLIC KEY", bPub))
		}

		if err != nil {
			zap.L().Fatal("Error while writing output", zap.Error(err))
		}
	},
}
