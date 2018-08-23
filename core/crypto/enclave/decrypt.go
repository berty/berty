package enclave

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"errors"
	"log"
)

// Decrypt plain text using the function corresponding to the key type and the key store
func Decrypt(keyID string, cipherText []byte) (plainText []byte, err error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return []byte{}, errors.New("keyID doesn't exist")
	} else if len(cipherText) == 0 {
		return []byte{}, errors.New("cipherText is empty")
	}

	// Call the right decryption function
	if keyPairs[keyID].keyStore == Software {
		if keyPairs[keyID].keyType == RSA2048 {
			return decryptRSA(keyID, cipherText)
		}
		return decryptECC(keyID, cipherText)
	}

	return decryptEnclave(keyID, cipherText)
}

// Decrypt ciphertext using RSA
func decryptRSA(keyID string, cipherText []byte) (plainText []byte, err error) {
	// Decrypt ciphertext using private keys
	privKey, rsaType := keyPairs[keyID].privKey.(*rsa.PrivateKey)
	if rsaType {
		plainText, err = rsa.DecryptOAEP(
			sha512.New(),
			rand.Reader,
			privKey,
			cipherText,
			[]byte{},
		)

		if err != nil {
			log.Println("Error during cipher text decryption:", err)
			return
		}
	} else {
		err = errors.New("can't cast privKey to *rsa.PrivateKey")
	}

	return
}

// Decrypt ciphertext using ECC
func decryptECC(keyID string, cipherText []byte) (plainText []byte, err error) {
	return []byte{}, errors.New("ECC-256 decryption not implemented yet")
}
