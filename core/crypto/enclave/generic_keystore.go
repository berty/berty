package enclave

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"

	"github.com/pkg/errors"
)

// Loads all reserved IDs from generic key store
func buildCacheFromGenericKeyStore() {
	buildCacheFromUnsafeTMPGenericKeyStore()
}

// Saves private key to generic key store
func saveToGenericKeyStore(keyAlgo KeyAlgo, privKeyBytes []byte) (string, error) {
	var keyType string
	if keyAlgo == RSA {
		keyType = "rsa:unsafe"
	} else {
		keyType = "ecc:unsafe"
	}

	keyID, err := reserveID(keyType)
	if err != nil {
		return "", err
	}

	err = saveToUnsafeTMPGenericKeystore(keyID, keyAlgo, privKeyBytes)
	if err != nil {
		_ = freeID(keyID)
		return "", err
	}

	return keyID, nil
}

// Loads key pair from generic key store
func loadFromGenericKeyStore(keyID string, keyAlgo KeyAlgo) (Keypair, error) {
	if keyAlgo == RSA {
		_, err := getRSAPubKeyPKIXFromGenericKeyStore(keyID)
		if err == nil {
			return &RSASoftwareEnclave{id: keyID}, nil
		}
		return nil, errors.New("can't retrieve this key pair from generic key store")
	}
	_, err := getECCPubKeyPKIXFromGenericKeyStore(keyID)
	if err == nil {
		return &ECCSoftwareEnclave{id: keyID}, nil
	}
	return nil, errors.New("can't retrieve this key pair from generic key store")
}

// Removes key pair from generic key store
func removeFromGenericKeyStore(keyID string) error {
	// Check if keyID exists in cache
	if !isKeyIDReserved(keyID) {
		return errors.New("keyID doesn't exist")
	}

	err := removeFromUnsafeTMPGenericKeystore(keyID)
	if err == nil {
		return freeID(keyID)
	}

	return err
}

// Retrieves RSA private key from generic key store
func getRSAPrivKeyFromGenericKeyStore(keyID string) (*rsa.PrivateKey, error) {
	// Get RSA private key bytes from generic key store
	privKeyBytes, err := loadFromUnsafeTMPGenericKeyStore(keyID)
	if err != nil {
		return nil, errors.Wrap(err, "can't retrieve keypair")
	}

	// Parse RSA private key bytes
	privKey, err := x509.ParsePKCS1PrivateKey(privKeyBytes)
	if err != nil {
		return nil, errors.Wrap(err, "can't parse keypair from bytes")
	}

	return privKey, nil
}

// Retrieves RSA public key PKIX representation from generic key store
func getRSAPubKeyPKIXFromGenericKeyStore(keyID string) ([]byte, error) {
	privKey, err := getRSAPrivKeyFromGenericKeyStore(keyID)
	if err != nil {
		return nil, err
	}

	pubKeyPKIX, err := x509.MarshalPKIXPublicKey(&privKey.PublicKey)
	if err != nil {
		return nil, errors.Wrap(err, "can't marshal public key")
	}

	return pubKeyPKIX, nil
}

// Retrieves ECC private key PKIX representation from generic key store
func getECCPrivKeyPKIXFromGenericKeyStore(keyID string) ([]byte, error) {
	return nil, ErrNotImplemented
}

// Retrieves ECC public key PKIX representation from generic key store
func getECCPubKeyPKIXFromGenericKeyStore(keyID string) ([]byte, error) {
	return getECCPrivKeyPKIXFromGenericKeyStore(keyID)
}

////////// TMP functions - Totally UNSAFE - Only for testing purpose /////////
const storeFolder = "/tmp/berty-unsafe-test"

func buildCacheFromUnsafeTMPGenericKeyStore() {
	if _, err := os.Stat(storeFolder); err == nil {
		err := filepath.Walk(storeFolder, func(fullpath string, info os.FileInfo, err error) error {
			if !info.IsDir() {
				entry, err := ioutil.ReadFile(fullpath)
				if err != nil {
					return err
				}

				var keyType string
				if entry[0] == '1' {
					keyType = "rsa:unsafe"
				} else {
					keyType = "ecc:unsafe"
				}

				cacheReservedID[path.Base(fullpath)] = keyType
			}
			return nil
		})

		if err != nil {
			fmt.Println("build cache from generic keystore failed")
		}
	}
}

func saveToUnsafeTMPGenericKeystore(keyID string, keyAlgo KeyAlgo, privKeyBytes []byte) error {
	err := os.MkdirAll(storeFolder, 0700)
	if err != nil {
		return err
	}

	keyFile := path.Join(storeFolder, keyID)
	keyEntry := []byte(fmt.Sprintf("%d:%s", keyAlgo, base64.StdEncoding.EncodeToString(privKeyBytes)))

	err = ioutil.WriteFile(keyFile, keyEntry, 0600)
	if err != nil {
		return err
	}

	return nil
}

func loadFromUnsafeTMPGenericKeyStore(keyID string) ([]byte, error) {
	keyFile := path.Join(storeFolder, keyID)

	entry, err := ioutil.ReadFile(keyFile)
	if err != nil {
		return nil, err
	}

	bytes, err := base64.StdEncoding.DecodeString(string(entry[2:]))
	if err != nil {
		return nil, err
	}

	return bytes, nil
}

func removeFromUnsafeTMPGenericKeystore(keyID string) error {
	return os.Remove(path.Join(storeFolder, keyID))
}
