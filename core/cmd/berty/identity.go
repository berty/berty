package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
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

var r = rand.Reader

func getKeyType(t string) (KeyType, error) {
	if v, ok := StringKeyTypes[t]; ok {
		return v, nil
	}

	return Unknow, fmt.Errorf("unknow key type")
}

func newIdentityCommand() *cobra.Command {
	cryptoKeyGenerateCmd.Flags().BoolVar(&cfgCryptoPubKey, "pub", false, "Also print public key (will only print pubkey if `raw` option is enabled)")
	cryptoKeyGenerateCmd.Flags().BoolVar(&cfgCryptoRaw, "bytes", false, "Print raw key")
	cryptoKeyGenerateCmd.Flags().StringVar(&cfgCryptoKeyType, "key-type", "RSA", "Key types, can be: `RSA`, `Ed25519` or `Secp256k1` ")
	cryptoCmd.AddCommand(cryptoKeyGenerateCmd)
	cryptoCmd.AddCommand(cryptoSwarmKey)
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

var cryptoSwarmKey = &cobra.Command{
	Use:   "swarm-key",
	Short: "Generate a swarm key",
	Run: func(cmd *cobra.Command, args []string) {
		key := make([]byte, 32)
		_, err := rand.Read(key)
		if err != nil {
			logger().Fatal("While trying to read random source", zap.Error(err))
		}

		fmt.Println("/key/swarm/psk/1.0.0/")
		fmt.Println("/base16/")
		fmt.Print(hex.EncodeToString(key))
	},
}

var cryptoKeyGenerateCmd = &cobra.Command{
	Use:   "generate",
	Short: "keys related tools",
	Run: func(cmd *cobra.Command, args []string) {
		// @TODO: handle file output
		w := os.Stdout
		defer w.Close()

		t, err := getKeyType(cfgCryptoKeyType)
		if err != nil {
			logger().Fatal("cannot get key type:", zap.String("type", cfgCryptoKeyType), zap.Error(err))
		}

		priv, pub, err := p2pcrypto.GenerateKeyPairWithReader(int(t), 2048, r)
		if err != nil {
			logger().Fatal("error while generating key pair", zap.Error(err))
		}

		bPriv, err := priv.Bytes()
		if err != nil {
			logger().Fatal("invalid private key", zap.Error(err))
		}

		var bPub []byte = []byte{}
		if cfgCryptoPubKey {
			bPub, err = pub.Bytes()
			if err != nil {
				logger().Fatal("invalid private key", zap.Error(err))
			}
		}

		if cfgCryptoRaw {
			if cfgCryptoPubKey {
				if _, err = w.Write(bPub); err != nil {
					logger().Fatal("error while writing output", zap.Error(err))
				}

				return
			}

			if _, err := w.Write(bPriv); err != nil {
				logger().Fatal("error while writing output", zap.Error(err))
			}

			return
		}

		_, err = w.WriteString(embedKey("PRIVATE KEY", bPriv))
		if err == nil && cfgCryptoPubKey {
			_, err = w.WriteString("\n" + embedKey("PUBLIC KEY", bPub))
		}

		if err != nil {
			logger().Fatal("error while writing output", zap.Error(err))
		}
	},
}
