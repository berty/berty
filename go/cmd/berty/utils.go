package main

import (
	"fmt"
	"io"
	"strings"

	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto"
)

func generateNewKeyPair(kind string, size int, src io.Reader) (libp2p_ci.PrivKey, error) {
	var typ int
	switch strings.ToUpper(kind) {
	case "RSA":
		typ = libp2p_ci.RSA
	case "ED25519":
		typ = libp2p_ci.Ed25519
	case "SECP256K1":
		typ = libp2p_ci.Secp256k1
	case "ECDSA":
		typ = libp2p_ci.ECDSA
	default:
		return nil, fmt.Errorf("unknown key type `%s`: %w", kind, libp2p_ci.ErrBadKeyType)
	}

	priv, _, err := libp2p_ci.GenerateKeyPairWithReader(typ, size, src)
	return priv, err
}
