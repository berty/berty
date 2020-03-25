package cryptoutil

import (
	"berty.tech/berty/v2/go/pkg/errcode"
	cconv "github.com/agl/ed25519/extra25519"
	"github.com/libp2p/go-libp2p-core/crypto"
	pb "github.com/libp2p/go-libp2p-core/crypto/pb"
	"golang.org/x/crypto/ed25519"
)

func SeedFromEd25519PrivateKey(key crypto.PrivKey) ([]byte, error) {
	// Similar to (*ed25519).Seed()
	if key.Type() != pb.KeyType_Ed25519 {
		return nil, errcode.ErrInvalidInput
	}

	r, err := key.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	if len(r) != ed25519.PrivateKeySize {
		return nil, errcode.ErrInvalidInput
	}

	return r[:ed25519.PrivateKeySize-ed25519.PublicKeySize], nil
}

// EdwardsToMontgomery converts ed25519 keys to curve25519 keys
func EdwardsToMontgomery(privKey crypto.PrivKey, pubKey crypto.PubKey) (*[32]byte, *[32]byte, error) {
	var edPriv [64]byte
	var edPub, mongPriv, mongPub [32]byte

	if privKey.Type() != pb.KeyType_Ed25519 || pubKey.Type() != pb.KeyType_Ed25519 {
		return nil, nil, errcode.ErrInvalidInput
	}

	privKeyBytes, err := privKey.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	} else if len(privKeyBytes) != 64 {
		return nil, nil, errcode.ErrInvalidInput
	}

	pubKeyBytes, err := pubKey.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	} else if len(pubKeyBytes) != 32 {
		return nil, nil, errcode.ErrInvalidInput
	}

	copy(edPriv[:], privKeyBytes)
	copy(edPub[:], pubKeyBytes)

	cconv.PrivateKeyToCurve25519(&mongPriv, &edPriv)
	if !cconv.PublicKeyToCurve25519(&mongPub, &edPub) {
		return nil, nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	return &mongPriv, &mongPub, nil
}
