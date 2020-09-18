package cryptoutil

import (
	"crypto/rand"
	"testing"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/errcode"
)

func TestSeedFromEd25519PrivateKey(t *testing.T) {
	priv, _, _ := crypto.GenerateECDSAKeyPair(rand.Reader)
	_, err := SeedFromEd25519PrivateKey(priv)
	if err != errcode.ErrInvalidInput {
		t.Error("Should fail with ErrInvalidInput")
	}
	priv, _, _ = crypto.GenerateEd25519Key(rand.Reader)
	_, err = SeedFromEd25519PrivateKey(priv)
	if err != nil {
		t.Error(err)
	}
}

func TestEdwardsToMontgomeryPub(t *testing.T) {
	_, pub, _ := crypto.GenerateEd25519Key(rand.Reader)
	_, err := EdwardsToMontgomeryPub(pub)
	if err != nil {
		t.Error(err)
	}
	_, pub, _ = crypto.GenerateECDSAKeyPair(rand.Reader)
	_, err = EdwardsToMontgomeryPub(pub)
	if err != errcode.ErrInvalidInput {
		t.Error("Should fail with ErrInvalidInput")
	}
}

func TestEdwardsToMontgomeryPriv(t *testing.T) {
	priv, _, _ := crypto.GenerateEd25519Key(rand.Reader)
	_, err := EdwardsToMontgomeryPriv(priv)
	if err != nil {
		t.Error(err)
	}
	priv, _, _ = crypto.GenerateECDSAKeyPair(rand.Reader)
	_, err = EdwardsToMontgomeryPriv(priv)
	if err != errcode.ErrInvalidInput {
		t.Error("Should fail with ErrInvalidInput")
	}
}
