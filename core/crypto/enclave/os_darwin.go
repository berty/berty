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
	"crypto/rsa"
	"crypto/x509"
	"errors"
	"log"
	"unsafe"
)

// Convert NSData* from objective-c to golang []byte
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

// Convert []byte from golang to objective-c NSData*
func byteSliceToNSData(data []byte) *C.NSData {
	return C.convertBytesToNSData(unsafe.Pointer(&data[0]), C.int(len(data)))
}

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
	var pubKey []byte

	// Generate a key pair within the keychain within the enclave
	if options.Type == ECC256 || options.TypeFallback {
		pubKey = byteSliceFromNSData(C.generateKeyPairWithinEnclave(cString))
		if len(pubKey) > 0 {
			keyPair.keyType = ECC256
			log.Println("Key pair generation within the Darwin Secure Enclave succeeded")
		}
	}

	// Generate a key pair within the keychain without the enclave
	if len(pubKey) == 0 {
		pubKey = byteSliceFromNSData(C.generateKeyPairWithoutEnclave(cString, C.int(options.Type)))
		if len(pubKey) > 0 {
			keyPair.keyType = options.Type
			log.Println("Key pair generation within the Darwin keychain succeeded")
		} else {
			err = RemoveFromKeyPairsMap(keyID)
			return "", errors.New("error during key generation with Darwin API: " + err.Error())
		}
	}

	if keyPair.keyType == RSA2048 {
		var rsaPubKey *rsa.PublicKey
		rsaPubKey, err = x509.ParsePKCS1PublicKey(pubKey)
		if err != nil {
			err = RemoveFromKeyPairsMap(keyID)
			return "", errors.New("error during key generation with Darwin API: " + err.Error())
		}
		keyPair.pubKey = rsaPubKey
	}
	keyPair.keyStore = Enclave
	keyPairs[keyID] = keyPair

	return
}

// Decrypt ciphertext using specific platform API
func decryptEnclave(keyID string, cipherText []byte) (plainText []byte, err error) {
	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Convert Golang byte slice cipherText to NSData* then defer freeing it
	cData := byteSliceToNSData(cipherText)
	defer C.freeData(cData)

	// Call objective-c function to decrypt using safely stored private key
	plainText = byteSliceFromNSData(C.decryptCiphertextUsingPrivateKey(cString, cData, C.int(keyPairs[keyID].keyType)))

	if len(plainText) == 0 {
		err = errors.New("error during text decryption using Darwin API")
	}

	return
}

// Sign text using platform specific API
func signEnclave(keyID string, plainText []byte) (signature []byte, err error) {
	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Convert Golang byte slice plainText to NSData* then defer freeing it
	cData := byteSliceToNSData(plainText)
	defer C.freeData(cData)

	// Call objective-c function to decrypt using safely stored private key
	signature = byteSliceFromNSData(C.signDataUsingPrivateKey(cString, cData, C.int(keyPairs[keyID].keyType)))

	if len(plainText) == 0 {
		err = errors.New("error during text decryption using Darwin API")
	}

	return
}

// Remove key pair from keychain
func removeFromEnclave(keyID string) error {
	// Convert Golang string keyID to a C string then defer freeing it
	cString := C.CString(keyID)
	defer C.free(unsafe.Pointer(cString))

	// Delete key pair from keychain
	if C.deleteKeyPairFromKeychain(cString) != C.bool(true) {
		return errors.New("error during keychain deletion")
	}

	return nil
}
