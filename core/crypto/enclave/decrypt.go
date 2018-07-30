package enclave

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"errors"
	"log"
)

// Decrypt plain text using the function corresponding to the key type and the key store
func Decrypt(keyID string, cipherText string, label []byte) (plainText string, err error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return "", errors.New("Error: keyID doesn't exist")
	}

	// Call the right decryption function
	if keyPairs[keyID].keyStore == Software {
		if keyPairs[keyID].keyType == RSA2048 {
			return decryptRSA(keyID, cipherText, label)
		}
		return decryptECC(keyID, cipherText, label)
	}
	return decryptEnclave(keyID, cipherText, label)
}

// Decrypt ciphertext using RSA
func decryptRSA(keyID string, cipherText string, label []byte) (plainText string, err error) {
	// Decrypt ciphertext using private keys
	var bytes []byte
	bytes, err = rsa.DecryptOAEP(
		sha512.New(),
		rand.Reader,
		keyPairs[keyID].privKey,
		[]byte(cipherText),
		label,
	)

	if err != nil {
		log.Println("Error during cipher text decryption:", err)
		return
	}

	plainText = string(bytes)
	return
}

// Decrypt ciphertext using ECC
func decryptECC(keyID string, cipherText string, label []byte) (plainText string, err error) {
	return "", errors.New("Error: ECC-256 decryption not implemented yet")
}

// Decrypt ciphertext using specific platform API
func decryptEnclave(keyID string, cipherText string, label []byte) (plainText string, err error) {
	return "", errors.New("Error: enclave decryption not implemented yet")
}
