package enclave

import "errors"

// Load key pairs from persistent memory (keychain, keystore, encrypted container, etc...)
func init() {
}

// MakeKeyPairPersistent saves key pair to a persistent memory (keychain, keystore, encrypted container, etc...)
func MakeKeyPairPersistent(keyID string) error {

	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return errors.New("Error: keyID doesn't exist")
	}

	return errors.New("Error: persistence not implemented yet")
}
