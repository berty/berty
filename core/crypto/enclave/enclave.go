package enclave

import (
	"fmt"
	"strings"

	"berty.tech/core/crypto/keypair"
	"github.com/pkg/errors"
)

// NewKeyOpts is a struct that hold options for key generation
type NewKeyOpts struct {
	Algo KeyAlgo
	Size uint16
}

// KeyAlgo can be either RSA or ECC
type KeyAlgo uint8

// Pseudo-enum containing all KeyAlgo values
const (
	UnknownKeyAlgo KeyAlgo = iota
	RSA
	ECC
)

// Keypair interface extends keypair.Interface methods
type Keypair interface {
	keypair.Interface
	ID() string   // id used to load the enclave keypair without knowing its private key content
	IsSafe() bool // is it safe against private key retrieval
}

// New returns an instance that implements Enclave interface
func New(opts NewKeyOpts) (Keypair, error) {
	// Set default values
	if opts.Algo == UnknownKeyAlgo {
		opts.Algo = RSA
	}
	if opts.Size == 0 && opts.Algo == RSA {
		opts.Size = 4096
	} else if opts.Size == 0 && opts.Algo == ECC {
		opts.Size = 256
	}

	switch opts.Algo {
	case ECC:
		driver, err := NewECCHardwareEnclave(opts.Size)
		if err == nil {
			return driver, nil
		}
		return NewECCSoftwareEnclave(opts.Size)
	case RSA:
		driver, err := NewRSAHardwareEnclave(opts.Size)
		if err == nil {
			return driver, nil
		}
		return NewRSASoftwareEnclave(opts.Size)
	default:
		return nil, ErrUnsupportedKeyAlgo
	}
}

// Checks if keyID is valid and return fields slice
func splitKeyID(keyID string) []string {
	fields := strings.Split(keyID, ":")
	if len(fields) == 3 {
		if (fields[0] == "rsa" || fields[0] == "ecc") &&
			(fields[1] == "safe" || fields[1] == "unsafe") {
			return fields
		}
	}

	return nil
}

// Load loads an Enclave using keyID
func Load(keyID string) (Keypair, error) {
	fields := splitKeyID(keyID)
	if fields == nil {
		return nil, errors.New("wrong keyID format")
	}

	if fields[0] == "rsa" {
		if fields[1] == "safe" {
			return loadFromPlatformKeyStore(fields[3], RSA)
		}
		return loadFromGenericKeyStore(fields[3], RSA)
	}
	if fields[1] == "safe" {
		return loadFromPlatformKeyStore(fields[3], ECC)
	}
	return loadFromGenericKeyStore(fields[3], ECC)
}

// Remove removes an Enclave using keyID
func Remove(keyID string) error {
	fields := splitKeyID(keyID)
	if fields == nil {
		return errors.New("wrong keyID format")
	}

	if fields[1] == "safe" {
		return removeFromPlatformKeyStore(keyID)
	}
	return removeFromGenericKeyStore(keyID)
}

//

type RSAHardwareEnclave struct {
	id string
}

func NewRSAHardwareEnclave(size uint16) (*RSAHardwareEnclave, error) {
	return generateEnclaveKeypairRSA(size)
}

func (e *RSAHardwareEnclave) ID() string   { return fmt.Sprintf("rsa:safe:%s", e.id) }
func (e *RSAHardwareEnclave) IsSafe() bool { return true }
func (e *RSAHardwareEnclave) PublicKeyAlgorithm() keypair.PublicKeyAlgorithm {
	return keypair.PublicKeyAlgorithm_RSA
}
func (e *RSAHardwareEnclave) SignatureAlgorithm() keypair.SignatureAlgorithm {
	return keypair.SignatureAlgorithm_SHA512_WITH_RSA
}
func (e *RSAHardwareEnclave) GetPubKey() ([]byte, error) {
	return getRSAPubKeyPKIXFromPlatformKeyStore(e.id)
}

func (e *RSAHardwareEnclave) Decrypt(ciphertext []byte) ([]byte, error) {
	return decryptUsingEnclave(e.id, ciphertext, RSA)
}
func (e *RSAHardwareEnclave) Sign(plaintext []byte) ([]byte, error) {
	return signUsingEnclave(e.id, plaintext, RSA)
}

//

type ECCHardwareEnclave struct {
	id string
}

func NewECCHardwareEnclave(size uint16) (*ECCHardwareEnclave, error) {
	return generateEnclaveKeypairECC(size)
}

func (e *ECCHardwareEnclave) ID() string   { return fmt.Sprintf("ecc:safe:%s", e.id) }
func (e *ECCHardwareEnclave) IsSafe() bool { return true }
func (e *ECCHardwareEnclave) PublicKeyAlgorithm() keypair.PublicKeyAlgorithm {
	return keypair.PublicKeyAlgorithm_ECDSA
}
func (e *ECCHardwareEnclave) SignatureAlgorithm() keypair.SignatureAlgorithm {
	return keypair.SignatureAlgorithm_ECDSA_WITH_SHA512
}
func (e *ECCHardwareEnclave) GetPubKey() ([]byte, error) {
	return getECCPubKeyPKIXFromPlatformKeyStore(e.id)
}

func (e *ECCHardwareEnclave) Decrypt(ciphertext []byte) ([]byte, error) {
	return decryptUsingEnclave(e.id, ciphertext, ECC)
}
func (e *ECCHardwareEnclave) Sign(plaintext []byte) ([]byte, error) {
	return signUsingEnclave(e.id, plaintext, ECC)
}

//

type RSASoftwareEnclave struct {
	id string
}

func NewRSASoftwareEnclave(size uint16) (*RSASoftwareEnclave, error) {
	return generateSoftwareKeypairRSA(size)
}

func (e *RSASoftwareEnclave) ID() string   { return fmt.Sprintf("rsa:unsafe:%s", e.id) }
func (e *RSASoftwareEnclave) IsSafe() bool { return false }
func (e *RSASoftwareEnclave) PublicKeyAlgorithm() keypair.PublicKeyAlgorithm {
	return keypair.PublicKeyAlgorithm_RSA
}
func (e *RSASoftwareEnclave) SignatureAlgorithm() keypair.SignatureAlgorithm {
	return keypair.SignatureAlgorithm_SHA512_WITH_RSA
}
func (e *RSASoftwareEnclave) GetPubKey() ([]byte, error) {
	return getRSAPubKeyPKIXFromGenericKeyStore(e.id)
}

func (e *RSASoftwareEnclave) Decrypt(ciphertext []byte) ([]byte, error) {
	return decryptUsingSoftwareRSA(ciphertext, e.id)
}

func (e *RSASoftwareEnclave) Sign(plaintext []byte) ([]byte, error) {
	return signUsingSoftwareRSA(plaintext, e.id)
}

//

type ECCSoftwareEnclave struct {
	id string
}

func NewECCSoftwareEnclave(size uint16) (*ECCSoftwareEnclave, error) {
	return generateSoftwareKeypairECC(size)
}

func (e *ECCSoftwareEnclave) ID() string   { return fmt.Sprintf("ecc:unsafe:%s", e.id) }
func (e *ECCSoftwareEnclave) IsSafe() bool { return false }
func (e *ECCSoftwareEnclave) PublicKeyAlgorithm() keypair.PublicKeyAlgorithm {
	return keypair.PublicKeyAlgorithm_ECDSA
}
func (e *ECCSoftwareEnclave) SignatureAlgorithm() keypair.SignatureAlgorithm {
	return keypair.SignatureAlgorithm_ECDSA_WITH_SHA512
}
func (e *ECCSoftwareEnclave) GetPubKey() ([]byte, error) {
	return getECCPubKeyPKIXFromGenericKeyStore(e.id)
}

func (e *ECCSoftwareEnclave) Decrypt(ciphertext []byte) ([]byte, error) {
	return decryptUsingSoftwareECC(ciphertext, e.id)
}
func (e *ECCSoftwareEnclave) Sign(plaintext []byte) ([]byte, error) {
	return signUsingSoftwareECC(plaintext, e.id)
}
