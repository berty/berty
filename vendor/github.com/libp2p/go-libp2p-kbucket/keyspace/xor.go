package keyspace

import (
	"bytes"
	"crypto/sha256"
	"math/big"
	"math/bits"

	u "github.com/ipfs/go-ipfs-util"
)

// XORKeySpace is a KeySpace which:
// - normalizes identifiers using a cryptographic hash (sha256)
// - measures distance by XORing keys together
var XORKeySpace = &xorKeySpace{}
var _ KeySpace = XORKeySpace // ensure it conforms

type xorKeySpace struct{}

// Key converts an identifier into a Key in this space.
func (s *xorKeySpace) Key(id []byte) Key {
	hash := sha256.Sum256(id)
	key := hash[:]
	return Key{
		Space:    s,
		Original: id,
		Bytes:    key,
	}
}

// Equal returns whether keys are equal in this key space
func (s *xorKeySpace) Equal(k1, k2 Key) bool {
	return bytes.Equal(k1.Bytes, k2.Bytes)
}

// Distance returns the distance metric in this key space
func (s *xorKeySpace) Distance(k1, k2 Key) *big.Int {
	// XOR the keys
	k3 := u.XOR(k1.Bytes, k2.Bytes)

	// interpret it as an integer
	dist := big.NewInt(0).SetBytes(k3)
	return dist
}

// Less returns whether the first key is smaller than the second.
func (s *xorKeySpace) Less(k1, k2 Key) bool {
	return bytes.Compare(k1.Bytes, k2.Bytes) < 0
}

// ZeroPrefixLen returns the number of consecutive zeroes in a byte slice.
func ZeroPrefixLen(id []byte) int {
	for i, b := range id {
		if b != 0 {
			return i*8 + bits.LeadingZeros8(uint8(b))
		}
	}
	return len(id) * 8
}
