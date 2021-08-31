package cryptoutil

import (
	"crypto/aes"
	"crypto/cipher"
	crand "crypto/rand"
	"crypto/sha256"
	"fmt"

	cconv "github.com/agl/ed25519/extra25519"
	"github.com/libp2p/go-libp2p-core/crypto"
	pb "github.com/libp2p/go-libp2p-core/crypto/pb"
	"golang.org/x/crypto/ed25519"
	"golang.org/x/crypto/scrypt"

	"berty.tech/berty/v2/go/pkg/errcode"
)

const (
	KeySize          = 32 // Key size required by box
	NonceSize        = 24 // Nonce size required by box
	ScryptIterations = 1 << 15
	ScryptR          = 8
	ScryptP          = 1
	ScryptKeyLen     = 32
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

func GenerateNonceSize(size int) ([]byte, error) {
	nonce := make([]byte, size)

	readSize, err := crand.Read(nonce)
	if readSize != size {
		err = fmt.Errorf("size read: %d (required %d)", readSize, size)
	}
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	return nonce, nil
}

func NonceSliceToArray(nonceSlice []byte) (*[NonceSize]byte, error) {
	var nonceArray [NonceSize]byte

	if l := len(nonceSlice); l != NonceSize {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid nonce size, expected %d bytes, got %d", NonceSize, l))
	}
	copy(nonceArray[:], nonceSlice)

	return &nonceArray, nil
}

func KeySliceToArray(keySlice []byte) (*[KeySize]byte, error) {
	var keyArray [KeySize]byte

	if l := len(keySlice); l != KeySize {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("unable to convert slice to array, unexpected slice size: %d (expected %d)", l, KeySize))
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

// EdwardsToMontgomery converts ed25519 priv/pub keys to X25519 keys.
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

// EdwardsToMontgomeryPub converts ed25519 pub key to X25519 pub key.
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

// EdwardsToMontgomeryPriv converts ed25519 priv key to X25519 priv key.
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

// AESGCMEncrypt use AES+GCM to encrypt plaintext data.
//
// The generated output will be longer than the original plaintext input.
func AESGCMEncrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, err
	}

	nonce, err := GenerateNonceSize(gcm.NonceSize())
	if err != nil {
		return nil, err
	}

	ciphertext := gcm.Seal(nonce, nonce, data, nil)

	return ciphertext, nil
}

// AESGCMDecrypt uses AES+GCM to decrypt plaintext data.
func AESGCMDecrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, err
	}

	nonce, ciphertext := data[:gcm.NonceSize()], data[gcm.NonceSize():]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

// AESCTRStream returns a CTR stream that can be used to produce ciphertext without padding.
func AESCTRStream(key, iv []byte) (cipher.Stream, error) {
	if key == nil || iv == nil {
		return nil, errcode.ErrInvalidInput
	}

	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	stream := cipher.NewCTR(blockCipher, iv)

	return stream, nil
}

// DeriveKey takes a passphrase of any length and returns a key of fixed size.
//
// If no salt is provided, a new one will be created and returned.
func DeriveKey(passphrase, salt []byte) ([]byte, []byte, error) {
	if salt == nil {
		var err error
		salt, err = GenerateNonceSize(ScryptKeyLen)
		if err != nil {
			return nil, nil, err
		}
	}

	key, err := scrypt.Key(passphrase, salt, ScryptIterations, ScryptR, ScryptP, ScryptKeyLen)
	if err != nil {
		return nil, nil, err
	}

	return key, salt, nil
}
