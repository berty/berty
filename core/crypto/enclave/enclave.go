package enclave

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"

	"github.com/berty/berty/core/crypto/keypair"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

// KeyOpts is a struct that hold options for key generation
type KeyOpts struct {
	Type KeyType // Mandatory
	Size uint32
}

// KeyType can be either RSA-2048 or ECC-256
type KeyType int

// Pseudo-enum with different KeyType
const (
	UnknownKeyType KeyType = iota
	RSA2048
	ECC256
)

// KeyStore define if key pair is managed through software or platform specific API (such as Apple Secure Enclave)
type KeyStore int

// Pseudo-enum with different KeyStore
const (
	UnknownKeyStore KeyStore = iota
	Hardware
	Software
)

type Enclave interface {
	keypair.Interface
	ID() string
}

// New returns an instance that implements keypair.Interface
func New(opts KeyOpts) (keypair.Interface, error) {
	if opts.Size == 0 {
		opts.Size = 4096 // default value
	}
	if opts.Type == UnknownKeyType {
		opts.Type = RSA2048
	}

	switch opts.Type {
	case ECC256:
		driver, err := NewECCHardwareEnclave(opts.Size)
		if err == nil {
			return driver, nil
		}
		return NewECCSoftwareEnclave(opts.Size)
	case RSA2048:
		driver, err := NewRSAHardwareEnclave(opts.Size)
		if err == nil {
			return driver, nil
		}
		return NewRSASoftwareEnclave(opts.Size)
	default:
		return nil, ErrUnsupportedKeyType
	}
}

//

type RSAHardwareEnclave struct{}

func NewRSAHardwareEnclave(size uint32) (*RSAHardwareEnclave, error) { return nil, ErrNotImplemented }

func (e *RSAHardwareEnclave) ID() string { return "42" }

func (e *RSAHardwareEnclave) SignatureAlgorithm() keypair.SignatureAlgorithm {
	return keypair.SignatureAlgorithm_SHA256_WITH_RSA
}
func (e *RSAHardwareEnclave) PublicKeyAlgorithm() keypair.PublicKeyAlgorithm {
	return keypair.PublicKeyAlgorithm_RSA
}

func (e *RSAHardwareEnclave) Sign(message []byte) ([]byte, error) { return nil, ErrNotImplemented }
func (e *RSAHardwareEnclave) Encrypt(message []byte, pubKey []byte) ([]byte, error) {
	return nil, ErrNotImplemented
}
func (e *RSAHardwareEnclave) Decrypt(message []byte) ([]byte, error) { return nil, ErrNotImplemented }
func (e *RSAHardwareEnclave) GetPubKey() ([]byte, error)             { return nil, ErrNotImplemented }

//

type ECCHardwareEnclave struct{}

func NewECCHardwareEnclave(size uint32) (*ECCHardwareEnclave, error) { return nil, ErrNotImplemented }

func (e *ECCHardwareEnclave) ID() string { return "42" }

func (e *ECCHardwareEnclave) SignatureAlgorithm() keypair.SignatureAlgorithm {
	return keypair.SignatureAlgorithm_ECDSA_WITH_SHA256
}
func (e *ECCHardwareEnclave) PublicKeyAlgorithm() keypair.PublicKeyAlgorithm {
	return keypair.PublicKeyAlgorithm_ECDSA
}

func (e *ECCHardwareEnclave) Sign(message []byte) ([]byte, error) { return nil, ErrNotImplemented }
func (e *ECCHardwareEnclave) Encrypt(message []byte, pubKey []byte) ([]byte, error) {
	return nil, ErrNotImplemented
}
func (e *ECCHardwareEnclave) Decrypt(message []byte) ([]byte, error) { return nil, ErrNotImplemented }
func (e *ECCHardwareEnclave) GetPubKey() ([]byte, error)             { return nil, ErrNotImplemented }

//

type RSASoftwareEnclave struct {
	privKey *rsa.PrivateKey
	id      string
}

func NewRSASoftwareEnclave(size uint32) (*RSASoftwareEnclave, error) {
	// Generate a random RSA key pair
	keyPairRSA, err := rsa.GenerateKey(rand.Reader, int(size))
	if err != nil {
		return nil, errors.Wrap(err, "error during key pair generation")
	}
	zap.L().Debug("software RSA-2048 key pair generated successfully")

	kp := &RSASoftwareEnclave{
		privKey: keyPairRSA,
	}

	keyId, err := storeInKeyPairsMap(kp)
	if err != nil {
		return nil, err
	}
	kp.id = keyId

	return kp, nil
}

func (e *RSASoftwareEnclave) ID() string { return "42" }

func (e *RSASoftwareEnclave) SignatureAlgorithm() keypair.SignatureAlgorithm {
	return keypair.SignatureAlgorithm_SHA256_WITH_RSA
}
func (e *RSASoftwareEnclave) PublicKeyAlgorithm() keypair.PublicKeyAlgorithm {
	return keypair.PublicKeyAlgorithm_RSA
}

func (e *RSASoftwareEnclave) Sign(message []byte) ([]byte, error) { return nil, ErrNotImplemented }
func (e *RSASoftwareEnclave) Encrypt(message []byte, pubKey []byte) ([]byte, error) {
	return nil, ErrNotImplemented
}
func (e *RSASoftwareEnclave) Decrypt(message []byte) ([]byte, error) { return nil, ErrNotImplemented }
func (e *RSASoftwareEnclave) GetPubKey() ([]byte, error) {
	return x509.MarshalPKIXPublicKey(e.privKey.Public())
}

//

type ECCSoftwareEnclave struct{}

func NewECCSoftwareEnclave(size uint32) (*ECCSoftwareEnclave, error) { return nil, ErrNotImplemented }

func (e *ECCSoftwareEnclave) ID() string { return "42" }

func (e *ECCSoftwareEnclave) SignatureAlgorithm() keypair.SignatureAlgorithm {
	return keypair.SignatureAlgorithm_ECDSA_WITH_SHA256
}
func (e *ECCSoftwareEnclave) PublicKeyAlgorithm() keypair.PublicKeyAlgorithm {
	return keypair.PublicKeyAlgorithm_ECDSA
}

func (e *ECCSoftwareEnclave) Sign(message []byte) ([]byte, error) { return nil, ErrNotImplemented }
func (e *ECCSoftwareEnclave) Encrypt(message []byte, pubKey []byte) ([]byte, error) {
	return nil, ErrNotImplemented
}
func (e *ECCSoftwareEnclave) Decrypt(message []byte) ([]byte, error) { return nil, ErrNotImplemented }
func (e *ECCSoftwareEnclave) GetPubKey() ([]byte, error)             { return nil, ErrNotImplemented }
