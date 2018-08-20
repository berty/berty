package enclave

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"errors"
	"log"
)

// Sign text using the function corresponding to the key type and the key store
func Sign(keyID string, text string) (signature []byte, err error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return []byte{}, errors.New("Error: keyID doesn't exist")
	} else if text == "" {
		return []byte{}, errors.New("Error: text is empty")
	}

	// Call the right signing function
	if keyPairs[keyID].keyStore == Software {
		if keyPairs[keyID].keyType == RSA2048 {
			return signRSA(keyID, text)
		}
		return signECC(keyID, text)
	}
	return signEnclave(keyID, text)
}

// Sign text using RSA
func signRSA(keyID string, text string) (signature []byte, err error) {
	// Generate signature for text parameter
	privKey, rsaType := keyPairs[keyID].privKey.(*rsa.PrivateKey)
	if rsaType {
		pssh := crypto.SHA512.New()
		_, err = pssh.Write([]byte(text))
		if err != nil {
			log.Println("Error during text hashing:", err)
			return
		}
		hashed := pssh.Sum(nil)

		signature, err = rsa.SignPSS(
			rand.Reader,
			privKey,
			crypto.SHA512,
			hashed,
			&rsa.PSSOptions{},
		)

		if err != nil {
			log.Println("Error during authentification code signing:", err)
		}
	} else {
		err = errors.New("Error: can't cast privKey to *rsa.PrivateKey")
	}

	return
}

// Sign text using ECC
func signECC(keyID string, text string) (signature []byte, err error) {
	return []byte{}, errors.New("Error: ECC-256 signing not implemented yet")
}
