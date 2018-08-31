package enclave

import (
	"fmt"

	"github.com/pkg/errors"
	"github.com/teris-io/shortid"
	"go.uber.org/zap"
)

// On init, build cache from generic and platform specific key stores
func init() {
	buildCacheFromPlatformKeyStore()
	buildCacheFromGenericKeyStore()
}

// Cache map that references reserved IDs
var cacheReservedID = make(map[string]string)

// Amount of tries to generate a shortid before returning an error
const timeout = 42

// Checks if key ID is already reserved in cache map
func isKeyIDReserved(keyID string) bool {
	_, exist := cacheReservedID[keyID]
	return exist
}

// Generates an ID and stores it to the cache map
func reserveID(keyStore string) (string, error) {
	var (
		try   int
		keyID string
		err   error
	)

	for try = 0; try < timeout; try++ {
		keyID, err = shortid.Generate()
		if !isKeyIDReserved(keyID) {
			break
		} else if err != nil {
			return "", errors.Wrap(err, "keyID generation failed")
		}
	}
	if try == timeout {
		return "", fmt.Errorf("keyID generation failed (timeout %d)", timeout)
	}

	cacheReservedID[keyID] = keyStore
	logger().Debug("ID has been reserved and added to cache map", zap.String("id", keyID))

	return keyID, nil
}

// Removes ID entry from the cache
func freeID(keyID string) error {
	// Check if keyID exists in cache
	if !isKeyIDReserved(keyID) {
		return errors.New("keyID doesn't exist in cache")
	}

	delete(cacheReservedID, keyID)
	logger().Debug("reserved keyID id has been removed from the cache", zap.String("id", keyID))

	return nil
}
