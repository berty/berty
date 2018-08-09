// +build darwin

package enclave

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Foundation -framework Security
#import "platform_api/darwin/DarwinInterface.m"
*/
import "C"

import (
	"errors"
	"log"
	"unsafe"
)

// Generate enclave key pair using platform specific API
func newKeyPairEnclave(options KeyOpts) (keyID string, err error) {
	// Reserve keyID in keyPairs map
	keyID, err = storeInKeyPairsMap(options, keyPair{})
	if err != nil {
		return
	}

	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Generate a key pair according to the options parameter (within enclave or keychain)
	var keyPair keyPair
	if (options.Type == ECC256 || options.TypeFallback) && C.generateKeyPairWithinEnclave(cString) == C.bool(true) {
		keyPair.keyStore = Enclave
		keyPair.keyType = ECC256
		log.Println("Key pair generation within the Darwin Secure Enclave succeeded")
	} else if C.generateKeyPairWithoutEnclave(cString, C.int(options.Type)) == C.bool(true) {
		keyPair.keyStore = Enclave
		keyPair.keyType = options.Type
		log.Println("Key pair generation within the Darwin keychain succeeded")
	} else {
		RemoveFromKeyPairsMap(keyID)
		return "", errors.New("Error during key generation with Darwin API")
	}

	keyPairs[keyID] = keyPair
	return
}

// Decrypt ciphertext using specific platform API
func decryptEnclave(keyID string, cipherText string, label []byte) (plainText string, err error) {
	return "", errors.New("Error: enclave decryption not implemented yet for Darwin")
}

// Sign text using platform specific API
func signEnclave(keyID string, text string) (signature []byte, err error) {
	return []byte{}, errors.New("Error: enclave signing not implemented yet for Darwin")
}

// Remove key pair from keychain
func removeFromEnclave(keyID string) error {
	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Delete key pair from keychain
	if C.deleteKeyPairFromKeychain(cString) != C.bool(true) {
		return errors.New("Error during keychain deletion")
	}

	return nil
}
