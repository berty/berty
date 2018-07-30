package enclave

import (
	"errors"
	"log"
	"strconv"

	"github.com/teris-io/shortid"
)

var keyPairs = make(map[string]keyPair)

// Amount of tries to generate a shortid before returning an error
const timeout = 42

// Check if key ID already exists in keyPairs map
func isKeyIDAlreadyExist(keyID string) bool {
	if _, exist := keyPairs[keyID]; exist {
		return true
	}
	return false
}

// Try to store key pair in keys map using potentially specified ID or try generate a new one
func storeInKeyPairsMap(options Opts, keypair keyPair) (keyID string, err error) {
	if options.ID != "" {
		// Return error if specified ID already exists and fallback isn't allowed
		if isKeyIDAlreadyExist(options.ID) && !options.IDFallback {
			return "", errors.New("Error: keyID " + options.ID + " not available and fallback is disallowed")
		}
		keyID = options.ID
	}

	// Try to generate a shortid <timeout> times before returning error
	for try := 0; try < timeout; try++ {
		// If ID is available, reserve it then return
		if keyID != "" && !isKeyIDAlreadyExist(keyID) {
			keyPairs[keyID] = keypair
			log.Println("Key pair added to keys map with ID:", keyID)
			return
		}
		keyID, err = shortid.Generate()
		if err != nil {
			return
		}
	}

	return "", errors.New("Error: can't find an available ID in keyPairs map (timeout " + strconv.Itoa(timeout) + ")")
}

// RemoveFromKeyPairsMap removes key pair with keyID from the keys map
func RemoveFromKeyPairsMap(keyID string) error {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return errors.New("Error: keyID doesn't exist")
	}

	delete(keyPairs, keyID)
	log.Println("Key pair with ID", keyID, "has been removed from the keys map")

	return nil
}
