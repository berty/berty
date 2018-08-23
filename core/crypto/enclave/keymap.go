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

// Try to generate a shortid <timeout> times before returning error
func getAnAvailableID() (keyID string, err error) {
	for try := 0; try < timeout; try++ {
		keyID, err = shortid.Generate()
		// If ID is available or if an error has occurred, return
		if !isKeyIDAlreadyExist(keyID) || err != nil {
			return
		}
	}

	return "", errors.New("can't find an available ID in keyPairs map (timeout " + strconv.Itoa(timeout) + ")")
}

// Try to store key pair in keys map using potentially specified ID or try generate a new one
func storeInKeyPairsMap(options KeyOpts, keypair keyPair) (keyID string, err error) {
	// Return error if specified ID already exists and fallback isn't allowed
	if options.ID != "" && isKeyIDAlreadyExist(options.ID) && !options.IDFallback {
		return "", errors.New("keyID " + options.ID + " not available and fallback is disallowed")
	} else if options.ID != "" && !isKeyIDAlreadyExist(options.ID) {
		// If specified ID is available, use it
		keyID = options.ID
	} else {
		// If no ID is specified or ID isn't available, generate an available random shortid
		keyID, err = getAnAvailableID()
	}

	if err == nil {
		keyPairs[keyID] = keypair
		log.Println("Key pair added to keys map with ID:", keyID)
	}

	return
}

// RemoveFromKeyPairsMap removes key pair with keyID from the keys map
func RemoveFromKeyPairsMap(keyID string) (err error) {
	// Check if keyID exists in keyPairs map
	if !isKeyIDAlreadyExist(keyID) {
		return errors.New("keyID doesn't exist")
	}

	// If the key pair is stored in a platform specific key storage, remove it
	if keyPairs[keyID].keyStore == Enclave {
		err = removeFromEnclave(keyID)
	}
	delete(keyPairs, keyID)
	log.Println("Key pair with ID", keyID, "has been removed from the keys map")

	return
}
