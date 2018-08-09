// +build android

package enclave

import "errors"

// Generate enclave key pair using platform specific API
func newKeyPairEnclave(options KeyOpts) (keyID string, err error) {
	return "", errors.New("Error: enclave key generation not implemented yet for Android")
}

// Decrypt ciphertext using specific platform API
func decryptEnclave(keyID string, cipherText string, label []byte) (plainText string, err error) {
	return "", errors.New("Error: enclave decryption not implemented yet for Android")
}

// Sign text using platform specific API
func signEnclave(keyID string, text string) (signature []byte, err error) {
	return []byte{}, errors.New("Error: enclave signing not implemented yet for Android")
}

// Remove key pair from platform specific key store
func removeFromEnclave(keyID string) error {
	return errors.New("Error: enclave signing not implemented yet for Android")
}
