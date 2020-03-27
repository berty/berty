package cryptoutil

import (
	crand "crypto/rand"
	"crypto/sha256"
	"fmt"

	"berty.tech/berty/v2/go/pkg/errcode"

	cconv "github.com/agl/ed25519/extra25519"
	"github.com/libp2p/go-libp2p-core/crypto"
	pb "github.com/libp2p/go-libp2p-core/crypto/pb"
	"golang.org/x/crypto/ed25519"
)

const (
	KeySize   = 32 // Key size required by box
	NonceSize = 24 // Nonce size required by box
)

func ConcatAndHashSha256(slices ...[]byte) *[sha256.Size]byte {
	var concat []byte

	for _, slice := range slices {
		concat = append(concat, slice...)
	}
	checksum := sha256.Sum256(concat)

	return &checksum
}

func GenerateNonce() (*[NonceSize]byte, error) {
	var nonce [NonceSize]byte

	size, err := crand.Read(nonce[:])
	if size != NonceSize {
		err = fmt.Errorf("size read: %d (required %d)", size, NonceSize)
	}
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	return &nonce, nil
}

func NonceSliceToArray(nonceSlice []byte) (*[NonceSize]byte, error) {
	var nonceArray [NonceSize]byte

	if len(nonceSlice) != NonceSize {
		return nil, errcode.ErrInvalidInput
	}
	copy(nonceArray[:], nonceSlice)

	return &nonceArray, nil
}

func KeySliceToArray(keySlice []byte) (*[KeySize]byte, error) {
	var keyArray [KeySize]byte

	if len(keySlice) != KeySize {
		return nil, errcode.ErrInvalidInput
	}
	copy(keyArray[:], keySlice)

	return &keyArray, nil
}

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

// EdwardsToMontgomery converts ed25519 priv/pub keys to X25519 keys
func EdwardsToMontgomery(privKey crypto.PrivKey, pubKey crypto.PubKey) (*[32]byte, *[32]byte, error) {
	mongPriv, err := EdwardsToMontgomeryPriv(privKey)
	if err != nil {
		return nil, nil, err
	}

	mongPub, err := EdwardsToMontgomeryPub(pubKey)
	if err != nil {
		return nil, nil, err
	}

	return mongPriv, mongPub, nil
}

// EdwardsToMontgomeryPub converts ed25519 pub key to X25519 pub key
func EdwardsToMontgomeryPub(pubKey crypto.PubKey) (*[KeySize]byte, error) {
	var edPub, mongPub [KeySize]byte

	if pubKey.Type() != pb.KeyType_Ed25519 {
		return nil, errcode.ErrInvalidInput
	}

	pubKeyBytes, err := pubKey.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	} else if len(pubKeyBytes) != KeySize {
		return nil, errcode.ErrInvalidInput
	}

	copy(edPub[:], pubKeyBytes)

	if !cconv.PublicKeyToCurve25519(&mongPub, &edPub) {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	return &mongPub, nil
}

// EdwardsToMontgomeryPriv converts ed25519 priv key to X25519 priv key
func EdwardsToMontgomeryPriv(privKey crypto.PrivKey) (*[KeySize]byte, error) {
	var edPriv [64]byte
	var mongPriv [KeySize]byte

	if privKey.Type() != pb.KeyType_Ed25519 {
		return nil, errcode.ErrInvalidInput
	}

	privKeyBytes, err := privKey.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	} else if len(privKeyBytes) != 64 {
		return nil, errcode.ErrInvalidInput
	}

	copy(edPriv[:], privKeyBytes)

	cconv.PrivateKeyToCurve25519(&mongPriv, &edPriv)

	return &mongPriv, nil
}
