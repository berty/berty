package enclave

import "errors"

// WhichKeyStore returns KeyStore for a given key pair
func WhichKeyStore(keyID string) (KeyStore, error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return 0, errors.New("keyID doesn't exist")
	}

	return keyPairs[keyID].keyStore, nil
}

// WhichKeyType returns KeyType for a given key pair
func WhichKeyType(keyID string) (KeyType, error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return 0, errors.New("keyID doesn't exist")
	}

	return keyPairs[keyID].keyType, nil
}
