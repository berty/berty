package enclave

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"errors"
	"log"
)

// Encrypt plain text using the function corresponding to the key type (ECC or RSA)
func Encrypt(keyID string, plainText string, label []byte) (cipherText string, err error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return "", errors.New("Error: keyID doesn't exist")
	}

	// Call the right encryption function
	if keyPairs[keyID].keyType == RSA2048 {
		return encryptRSA(keyID, plainText, label)
	}
	return encryptECC(keyID, plainText, label)
}

// Encrypt plain text using RSA
func encryptRSA(keyID string, plainText string, label []byte) (cipherText string, err error) {
	// Encrypt plain text using public key
	var bytes []byte
	bytes, err = rsa.EncryptOAEP(
		sha512.New(),
		rand.Reader,
		keyPairs[keyID].pubKey,
		[]byte(plainText),
		label,
	)
	if err != nil {
		log.Println("Error during plain text encryption:", err)
		return
	}

	cipherText = string(bytes)

	return

}

// Encrypt plain text using ECC
func encryptECC(keyID string, plainText string, label []byte) (cipherText string, err error) {
	return "", errors.New("Error: ECC-256 encryption not implemented yet")
}
