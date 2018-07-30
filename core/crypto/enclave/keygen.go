package enclave

import (
	"crypto/rand"
	"crypto/rsa"
	"errors"
	"log"
)

// Not exported outside the package. Caller only interact using ID
type keyPair struct {
	privKey  *rsa.PrivateKey
	pubKey   *rsa.PublicKey
	keyType  KeyType
	keyStore KeyStore
}

// Opts is a struct that hold options for key generation, by default, all fallback are disallowed
type Opts struct {
	ID            string // Optional
	IDFallback    bool   // Optional - false by default
	Type          KeyType
	TypeFallback  bool // Optional - false by default
	Store         KeyStore
	StoreFallback bool // Optional - false by default
}

// KeyType can be either RSA-2048 or ECC-256
type KeyType int

// Pseudo-enum with different KeyType
const (
	RSA2048 KeyType = 1
	ECC256  KeyType = 2
)

// KeyStore define if key pair is managed through software or platform specific API (such as Apple Secure Enclave)
type KeyStore int

// Pseudo-enum with different KeyStore
const (
	Enclave  KeyStore = 1
	Software KeyStore = 2
)

// NewKeyPair generate software or enclave key pair according to the parameters
func NewKeyPair(options Opts) (keyID string, err error) {
	// Check if store parameter is correct
	if options.Store != Enclave && options.Store != Software {
		return "", errors.New("Error: wrong Opts.Store parameter")
	} else if options.Type != RSA2048 && options.Type != ECC256 {
		return "", errors.New("Error: wrong Opts.Type parameter")
	}

	// Try to generate enclave key pair if asked
	if options.Store == Enclave {
		keyID, err = newKeyPairEnclave(options)
	}

	// Try to generate software key pair if asked or
	// if enclave generation failed and fallback is allowed
	if options.Store == Software || (err != nil && options.StoreFallback) {
		keyID, err = newKeyPairSoftware(options)
	}

	return
}

// Generate enclave key pair using platform specific API
func newKeyPairEnclave(options Opts) (keyID string, err error) {
	return "", errors.New("Error: enclave key generation not implemented yet")
}

// Generate software key pair using the function corresponding to the key type (ECC or RSA)
func newKeyPairSoftware(options Opts) (keyID string, err error) {
	if options.Type == RSA2048 {
		keyID, err = newKeyPairSoftwareRSA(options)
		if err != nil && options.TypeFallback {
			log.Println(err.Error())
			log.Println("Fallback to ECC-256 key pair generation")
			keyID, err = newKeyPairSoftwareECC(options)
		}
	} else {
		keyID, err = newKeyPairSoftwareECC(options)
		if err != nil && options.TypeFallback {
			log.Println(err.Error())
			log.Println("Fallback to RSA-2048 key pair generation")
			keyID, err = newKeyPairSoftwareRSA(options)
		}
	}

	return
}

// Generate a random RSA-2048 key pair then return the corresponding ID
func newKeyPairSoftwareRSA(options Opts) (keyID string, err error) {
	// Generate a random RSA-2048 key pair
	var keypair keyPair
	keypair.privKey, err = rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		log.Println("Error during key pair generation:", err)
		return
	}
	log.Println("Software RSA-2048 key pair generated successfully")

	// Set remaining keyPair fields
	keypair.pubKey = &keypair.privKey.PublicKey
	keypair.keyType = RSA2048
	keypair.keyStore = Software

	// Append generated keyPair to the map
	return storeInKeyPairsMap(options, keypair)
}

// Generate a random ECC-256 key pair then return the corresponding ID
func newKeyPairSoftwareECC(options Opts) (keyID string, err error) {
	return "", errors.New("Error: ECC-256 key generation not implemented yet")
}
