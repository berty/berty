package enclave

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"errors"
	"log"
)

// Sign plainText using the function corresponding to the key type and the key store
func Sign(keyID string, plainText []byte) (signature []byte, err error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return []byte{}, errors.New("keyID doesn't exist")
	} else if len(plainText) == 0 {
		return []byte{}, errors.New("plainText is empty")
	}

	// Call the right signing function
	if keyPairs[keyID].keyStore == Software {
		if keyPairs[keyID].keyType == RSA2048 {
			return signRSA(keyID, plainText)
		}
		return signECC(keyID, plainText)
	}

	return signEnclave(keyID, plainText)
}

// Sign plainText using RSA
func signRSA(keyID string, plainText []byte) (signature []byte, err error) {
	// Generate signature for plainText parameter
	privKey, rsaType := keyPairs[keyID].privKey.(*rsa.PrivateKey)
	if rsaType {
		pssh := crypto.SHA512.New()
		_, err = pssh.Write(plainText)
		if err != nil {
			log.Println("Error during plainText hashing:", err)
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
		err = errors.New("can't cast privKey to *rsa.PrivateKey")
	}

	return
}

// Sign plainText using ECC
func signECC(keyID string, plainText []byte) (signature []byte, err error) {
	return []byte{}, errors.New("ECC-256 signing not implemented yet")
}
