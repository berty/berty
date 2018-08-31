// +build darwin

package enclave

/*
#cgo CFLAGS: -x objective-c -Wno-incompatible-pointer-types
#cgo LDFLAGS: -framework Foundation -framework Security
#import "platform_api/darwin/DarwinInterface.m"

// Functions used to bind NSData* with golang
const void *dataPointer(NSData *data) { return [data bytes]; }
int dataLength(NSData *data) { return [data length]; }
void freeData(NSData *data) { [data release]; }

// Functions used to bind golang with NSData*
NSData *convertBytesToNSData(void *bytes, int length) { return [NSData dataWithBytes:bytes length:length]; }
*/
import "C"
import (
	"unsafe"

	"github.com/pkg/errors"

	"go.uber.org/zap"
)

// Converts NSData* from objective-c to golang []byte
func byteSliceFromNSData(data *C.NSData) []byte {
	if data == nil {
		return []byte{}
	}

	length := int(C.dataLength(data))
	dataCast := (*[1 << 30]byte)(C.dataPointer(data))[0:length]
	goData := make([]byte, length)

	copy(goData, dataCast)
	C.freeData(data)

	return goData
}

// Converts []byte from golang to objective-c NSData*
func byteSliceToNSData(data []byte) *C.NSData {
	return C.convertBytesToNSData(unsafe.Pointer(&data[0]), C.int(len(data)))
}

// Generates RSA enclave key pair using platform specific API
func generateEnclaveKeypairRSA(size uint16) (*RSAHardwareEnclave, error) {
	return nil, errors.Wrap(ErrNotImplementable, "RSA key generation within Darwin Secure Enclave")
}

// Generates ECC enclave key pair using platform specific API
func generateEnclaveKeypairECC(size uint16) (*ECCHardwareEnclave, error) {
	// Reserve keyID in cache
	keyID, err := reserveID("ecc:safe")
	if err != nil {
		return nil, err
	}

	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Try to generate a key pair within the enclave
	if C.generateKeyPairWithinEnclave(cString) == C.bool(true) {
		zap.L().Debug("key pair generation within the Darwin Secure Enclave succeeded")
		return &ECCHardwareEnclave{id: keyID}, nil
	}

	// If generation failed, free reserved ID
	err = freeID(keyID)
	if err != nil {
		return nil, errors.Wrap(err, "key generation within Darwin Secure Enclave failed")
	}

	return nil, errors.New("key generation within Darwin Secure Enclave failed")
}

// Decrypts ciphertext using specific platform API
func decryptUsingEnclave(keyID string, ciphertext []byte, algo KeyAlgo) ([]byte, error) {
	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Convert Golang byte slice ciphertext to NSData* then defer freeing it
	cData := byteSliceToNSData(ciphertext)
	defer C.freeData(cData)

	// Call objective-c function to decrypt using safely stored private key
	plaintext := byteSliceFromNSData(C.decryptCiphertextUsingPrivateKey(cString, cData))

	if len(plaintext) == 0 {
		return nil, errors.New("text decryption using Darwin Secure Enclave failed")
	}

	return plaintext, nil
}

// Signs text using platform specific API
func signUsingEnclave(keyID string, plaintext []byte, algo KeyAlgo) ([]byte, error) {
	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Convert Golang byte slice plaintext to NSData* then defer freeing it
	cData := byteSliceToNSData(plaintext)
	defer C.freeData(cData)

	// Call objective-c function to decrypt using safely stored private key
	signature := byteSliceFromNSData(C.signDataUsingPrivateKey(cString, cData))

	if len(signature) == 0 {
		return nil, errors.New("signature verification using Darwin Secure Enclave failed")
	}

	return signature, nil
}

// Loads all reserved IDs from platform specific key store
func buildCacheFromPlatformKeyStore() {
	zap.L().Debug("buildCacheFromPlatformKeyStore not implemented yet")
}

// Retrieves RSA public key PKIX representation from generic key store
func getRSAPubKeyPKIXFromPlatformKeyStore(keyID string) ([]byte, error) {
	// Technically we could stores RSA key pair inside the keychain,
	// but since RSA is incompatible with Secure Enclave, we wont do it
	return nil, errors.Wrap(ErrNotImplementable, "RSA key generation within Darwin Secure Enclave")
}

// Retrieves ECC public key PKIX representation from generic key store
func getECCPubKeyPKIXFromPlatformKeyStore(keyID string) ([]byte, error) {
	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Check if public key with specified keyID exists in keychain
	pubKey := byteSliceFromNSData(C.getPublicKeyX963Representation(cString))
	if len(pubKey) == 0 {
		return nil, errors.New("can't retrieve this keyID in keychain")
	}

	return pubKey, nil
}

// Loads key pair from platform specific key store
func loadFromPlatformKeyStore(keyID string, keyAlgo KeyAlgo) (Keypair, error) {
	if keyAlgo == RSA {
		_, err := getRSAPubKeyPKIXFromPlatformKeyStore(keyID)
		if err == nil {
			return &RSAHardwareEnclave{id: keyID}, nil
		}
		return nil, errors.New("can't retrieve this key pair from Darwin key store")
	}
	_, err := getECCPubKeyPKIXFromPlatformKeyStore(keyID)
	if err == nil {
		return &ECCHardwareEnclave{id: keyID}, nil
	}
	return nil, errors.New("can't retrieve this key pair from Darwin key store")
}

// Removes key pair from platform specific key store
func removeFromPlatformKeyStore(keyID string) error {
	// Check if keyID exists in cache
	if !isKeyIDReserved(keyID) {
		return errors.New("keyID doesn't exist")
	}

	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Delete key pair from keychain
	if C.deleteKeyPairFromKeychain(cString) != C.bool(true) {
		return errors.New("keychain deletion failed")
	}

	return freeID(keyID)
}
