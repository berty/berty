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
	} else if text == "" {
		return false, errors.New("Error: text is empty")
	} else if len(signature) == 0 {
		return false, errors.New("Error: signature is empty")
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
	pubKey, rsaType := keyPairs[keyID].pubKey.(*rsa.PublicKey)
	if rsaType {
		pssh := crypto.SHA512.New()
		_, err = pssh.Write([]byte(text))
		if err != nil {
			log.Println("Error during text hashing:", err)
			return
		}
		hashed := pssh.Sum(nil)

		err = rsa.VerifyPSS(
			pubKey,
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
	} else {
		err = errors.New("Error: can't cast pubKey to *rsa.PublicKey")
	}

	return
}

// Verify signature using ECC
func verifyECC(keyID string, text string, signature []byte) (verified bool, err error) {
	return false, errors.New("Error: ECC-256 verification not implemented yet")
}
