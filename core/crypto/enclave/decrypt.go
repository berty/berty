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
	} else if cipherText == "" {
		return "", errors.New("Error: cipherText is empty")
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
	privKey, rsaType := keyPairs[keyID].privKey.(*rsa.PrivateKey)
	if rsaType {
		bytes, err = rsa.DecryptOAEP(
			sha512.New(),
			rand.Reader,
			privKey,
			[]byte(cipherText),
			label,
		)

		if err != nil {
			log.Println("Error during cipher text decryption:", err)
			return
		}

		plainText = string(bytes)
	} else {
		err = errors.New("Error: can't cast privKey to *rsa.PrivateKey")
	}
	return
}

// Decrypt ciphertext using ECC
func decryptECC(keyID string, cipherText string, label []byte) (plainText string, err error) {
	return "", errors.New("Error: ECC-256 decryption not implemented yet")
}
