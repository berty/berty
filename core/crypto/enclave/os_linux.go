// +build linux

package enclave

import "errors"

// Generate enclave key pair using platform specific API
func newKeyPairEnclave(options KeyOpts) (keyID string, err error) {
	return "", errors.New("Error: enclave key generation not implemented yet for Linux")
}

// Decrypt ciphertext using specific platform API
func decryptEnclave(keyID string, cipherText []byte) (plainText []byte, err error) {
	return []byte{}, errors.New("Error: enclave decryption not implemented yet for Linux")
}

// Sign text using platform specific API
func signEnclave(keyID string, plainText []byte) (signature []byte, err error) {
	return []byte{}, errors.New("Error: enclave signing not implemented yet for Linux")
}

// Remove key pair from platform specific key store
func removeFromEnclave(keyID string) error {
	return errors.New("Error: enclave signing not implemented yet for Linux")
}
