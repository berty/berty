// +build !android,!darwin,!linux,!windows

package enclave

import (
	"errors"

	"go.uber.org/zap"
)

// Generates RSA enclave key pair using platform specific API
func generateEnclaveKeypairRSA(size uint16) (*RSAHardwareEnclave, error) {
	return nil, errors.Wrap(ErrNotImplemented, "RSA enclave keypair generation on this platform")
}

// Generates ECC enclave key pair using platform specific API
func generateEnclaveKeypairECC(size uint16) (*ECCHardwareEnclave, error) {
	return nil, errors.Wrap(ErrNotImplemented, "ECC enclave keypair generation on this platform")
}

// Decrypts ciphertext using specific platform API
func decryptUsingEnclave(keyID string, ciphertext []byte, algo KeyAlgo) ([]byte, error) {
	return nil, errors.Wrap(ErrNotImplemented, "enclave decryption on this platform")
}

// Signs text using platform specific API
func signUsingEnclave(keyID string, plaintext []byte, algo KeyAlgo) ([]byte, error) {
	return nil, errors.Wrap(ErrNotImplemented, "enclave signin on this platform")
}

// Loads all reserved IDs from platform specific key store
func buildCacheFromPlatformKeyStore() {
	zap.L().Debug("buildCacheFromPlatformKeyStore not implemented yet")
}

// Loads key pair from platform specific key store
func loadFromPlatformKeyStore(keyID string, keyAlgo KeyAlgo) (Keypair, error) {
	if keyAlgo == RSA {
		_, err := getRSAPubKeyPKIXFromPlatformKeyStore(keyID)
		if err == nil {
			return &RSAHardwareEnclave{id: keyID}, nil
		}
		return nil, errors.New("can't retrieve this key pair from this platform key store")
	} else {
		_, err := getECCPubKeyPKIXFromPlatformKeyStore(keyID)
		if err == nil {
			return &ECCHardwareEnclave{id: keyID}, nil
		}
		return nil, errors.New("can't retrieve this key pair from this platform key store")
	}
}

// Retrieves RSA public key PKIX representation from generic key store
func getRSAPubKeyPKIXFromPlatformKeyStore(keyID string) ([]byte, error) {
	return nil, errors.Wrap(ErrNotImplementable, "RSA key generation within this platform")
}

// Retrieves ECC public key PKIX representation from generic key store
func getECCPubKeyPKIXFromPlatformKeyStore(keyID string) ([]byte, error) {
	return nil, errors.Wrap(ErrNotImplementable, "ECC key generation within this platform")
}

// Removes key pair from platform specific key store
func removeFromPlatformKeyStore(keyID string) error {
	return errors.Wrap(ErrNotImplemented, "key store on this platform")
}
