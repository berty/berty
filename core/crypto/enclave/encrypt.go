package enclave

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"errors"
	"log"
)

// Encrypt plain text using the function corresponding to the key type (ECC or RSA)
func Encrypt(keyID string, plainText []byte) (cipherText []byte, err error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return []byte{}, errors.New("keyID doesn't exist")
	} else if len(plainText) == 0 {
		return []byte{}, errors.New("plainText is empty")
	}

	// Call the right encryption function
	if keyPairs[keyID].keyType == RSA2048 {
		return encryptRSA(keyID, plainText)
	}
	return encryptECC(keyID, plainText)
}

// Encrypt plain text using RSA
func encryptRSA(keyID string, plainText []byte) (cipherText []byte, err error) {
	// Encrypt plain text using public key
	pubKey, rsaType := keyPairs[keyID].pubKey.(*rsa.PublicKey)
	if rsaType {
		cipherText, err = rsa.EncryptOAEP(
			sha512.New(),
			rand.Reader,
			pubKey,
			plainText,
			[]byte{},
		)
		if err != nil {
			log.Println("Error during plain text encryption:", err)
			return
		}

	} else {
		err = errors.New("can't cast pubKey to *rsa.PublicKey")
	}

	return

}

// Encrypt plain text using ECC
func encryptECC(keyID string, plainText []byte) (cipherText []byte, err error) {
	return []byte{}, errors.New("ECC-256 encryption not implemented yet")
}
