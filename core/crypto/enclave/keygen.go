package enclave

import (
	"crypto/rand"
	"crypto/rsa"
	"errors"
	"log"
)

// Not exported outside the package. Caller only interact using ID
type keyPair struct {
	privKey  interface{}
	pubKey   interface{}
	keyType  KeyType
	keyStore KeyStore
}

// KeyOpts is a struct that hold options for key generation, by default, all fallbacks are disallowed
type KeyOpts struct {
	ID            string   // Optional
	IDFallback    bool     // Optional - false by default - Ignored if ID's not specified
	Type          KeyType  // Mandatory
	TypeFallback  bool     // Optional - false by default
	Store         KeyStore // Mandatory
	StoreFallback bool     // Optional - false by default
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
func NewKeyPair(options KeyOpts) (keyID string, err error) {
	// Check if type and store parameters are correct
	if options.Store != Enclave && options.Store != Software {
		return "", errors.New("Error: wrong KeyOpts.Store parameter")
	} else if options.Type != RSA2048 && options.Type != ECC256 {
		return "", errors.New("Error: wrong KeyOpts.Type parameter")
	}

	// Try to generate enclave key pair if requested
	if options.Store == Enclave {
		keyID, err = newKeyPairEnclave(options)
	}

	// Try to generate software key pair if requested or
	// if enclave generation failed and fallback is allowed
	if options.Store == Software || (err != nil && options.StoreFallback) {
		if err != nil {
			log.Println(err.Error())
			log.Println("Fallback to software key pair generation")
		}
		keyID, err = newKeyPairSoftware(options)
	}

	return
}

// Generate software key pair using the function corresponding to the key type (ECC or RSA)
func newKeyPairSoftware(options KeyOpts) (keyID string, err error) {
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
func newKeyPairSoftwareRSA(options KeyOpts) (keyID string, err error) {
	// Generate a random RSA-2048 key pair
	keyPairRSA, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		log.Println("Error during key pair generation:", err)
		return
	}
	log.Println("Software RSA-2048 key pair generated successfully")

	// Set keyPair struct fields
	var keyPair keyPair
	keyPair.privKey = keyPairRSA
	keyPair.pubKey = &keyPairRSA.PublicKey
	keyPair.keyType = RSA2048
	keyPair.keyStore = Software

	// Append generated keyPair to the map
	return storeInKeyPairsMap(options, keyPair)
}

// Generate a random ECC-256 key pair then return the corresponding ID
func newKeyPairSoftwareECC(options KeyOpts) (keyID string, err error) {
	return "", errors.New("Error: ECC-256 key generation not implemented yet")
}
