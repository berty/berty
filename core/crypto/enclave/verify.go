package enclave

import (
	"crypto"
	"crypto/rsa"
	"errors"
	"log"
)

// Verify signature using the function corresponding to the key type (ECC or RSA)
func Verify(keyID string, text string, signature []byte) (verified bool, err error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return false, errors.New("Error: keyID doesn't exist")
	}

	// Call the right verification function
	if keyPairs[keyID].keyType == RSA2048 {
		return verifyRSA(keyID, text, signature)
	}
	return verifyECC(keyID, text, signature)
}

// Verify signature using RSA
func verifyRSA(keyID string, text string, signature []byte) (verified bool, err error) {
	// Verify signature using signature and text parameters
	pssh := crypto.SHA512.New()
	_, err = pssh.Write([]byte(text))
	if err != nil {
		log.Println("Error during text hashing:", err)
		return
	}
	hashed := pssh.Sum(nil)

	err = rsa.VerifyPSS(
		keyPairs[keyID].pubKey,
		crypto.SHA512,
		hashed,
		signature,
		&rsa.PSSOptions{},
	)

	if err != nil {
		verified = false
	} else {
		verified = true
	}

	return
}

// Verify signature using ECC
func verifyECC(keyID string, text string, signature []byte) (verified bool, err error) {
	return false, errors.New("Error: ECC-256 verification not implemented yet")
}
