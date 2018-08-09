package test

import (
	"fmt"
	"log"
	"runtime"
	"testing"

	"github.com/berty/berty/core/crypto/enclave"

	. "github.com/smartystreets/goconvey/convey"
)

func TestEnclave(t *testing.T) {

	setupTestLogging()

	/* Key generation options
	type KeyOpts struct {
		ID            string 		// Optional
		IDFallback    bool   		// Optional - false by default - Ignored if ID not specified
		Type          KeyType 	// Mandatory
		TypeFallback  bool 			// Optional - false by default
		Store         KeyStore 	// Mandatory
		StoreFallback bool 			// Optional - false by default
	}
	*/

	separator := "-------------------------------------------------------------"
	plainText := "plainText"

	key1, _ := enclave.NewKeyPair(enclave.KeyOpts{
		ID:    "42",
		Type:  enclave.RSA2048,
		Store: enclave.Software,
	})
	key2, err := enclave.NewKeyPair(enclave.KeyOpts{
		ID:         "42",
		IDFallback: true,
		Type:       enclave.RSA2048,
		Store:      enclave.Software,
	})
	fmt.Println(separator)
	var key3 string

	Convey("Key pair generation tests", t, func() {

		Convey("Key generation should succeed if ID requested already exists and fallback is allowed", func() {
			So(err, ShouldBeNil)
			So(key1, ShouldNotEqual, key2)
		})

		Convey("Key generation should fail if ID requested already exists and fallback is disallowed", func() {
			key3, err = enclave.NewKeyPair(enclave.KeyOpts{
				ID:         "42",
				IDFallback: false,
				Type:       enclave.RSA2048,
				Store:      enclave.Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		Convey("Key generation should fail if key type/store is not specified in KeyOpts parameter", func() {
			key3, err = enclave.NewKeyPair(enclave.KeyOpts{
				Store: enclave.Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)

			key3, err = enclave.NewKeyPair(enclave.KeyOpts{
				Type: enclave.RSA2048,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		Convey("Key generation should succeed if software ECC-256 key type is requested (not implemented yet) and fallback is allowed", func() {
			key3, err = enclave.NewKeyPair(enclave.KeyOpts{
				Type:         enclave.ECC256,
				TypeFallback: true,
				Store:        enclave.Software,
			})
			_ = key3

			So(err, ShouldBeNil)
			fmt.Println(separator)
		})

		Convey("Key generation should fail if ECC-256 key type is requested (not implemented yet) and fallback is disallowed", func() {
			key3, err = enclave.NewKeyPair(enclave.KeyOpts{
				Type:  enclave.ECC256,
				Store: enclave.Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		if runtime.GOOS == "darwin" {
			Convey("Key generation should succeed if enclave key store is requested and platform is compatible", func() {
				key3, err = enclave.NewKeyPair(enclave.KeyOpts{
					Type:  enclave.ECC256,
					Store: enclave.Enclave,
				})
				_ = key3

				So(err, ShouldBeNil)
				fmt.Println(separator)
			})
		} else {
			Convey("Key generation should succeed if enclave key store is requested but not available and fallback is allowed", func() {
				key3, err = enclave.NewKeyPair(enclave.KeyOpts{
					Type:          enclave.RSA2048,
					Store:         enclave.Enclave,
					StoreFallback: true,
				})
				_ = key3

				So(err, ShouldBeNil)
				fmt.Println(separator)
			})

			Convey("Key generation should fail if enclave key store is requested but not available and fallback is disallowed", func() {
				key3, err = enclave.NewKeyPair(enclave.KeyOpts{
					Type:  enclave.RSA2048,
					Store: enclave.Enclave,
				})
				_ = key3

				log.Println(err.Error())
				So(err, ShouldNotBeNil)
				fmt.Println(separator)
			})
		}
	})

	Convey("Key pair management tests", t, func() {

		Convey("Key pair deletion should succeed if keyID exists in keys map", func() {
			key3, err = enclave.NewKeyPair(enclave.KeyOpts{
				Type:  enclave.RSA2048,
				Store: enclave.Software,
			})
			_ = key3

			err = enclave.RemoveFromKeyPairsMap(key3)
			So(err, ShouldBeNil)
			fmt.Println(separator)
		})

		if runtime.GOOS == "darwin" {
			Convey("Key pair deletion should succeed if keyID exists in keys map and in keychain (darwin)", func() {
				key3, err = enclave.NewKeyPair(enclave.KeyOpts{
					Type:  enclave.RSA2048,
					Store: enclave.Enclave,
				})
				_ = key3

				err = enclave.RemoveFromKeyPairsMap(key3)
				So(err, ShouldBeNil)
				fmt.Println(separator)
			})
		}

		Convey("Key pair deletion should fail if keyID doesn't exist in keys map", func() {
			err = enclave.RemoveFromKeyPairsMap("unknow-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		Convey("Key type/store getters should return the right value", func() {
			var keyType enclave.KeyType = enclave.RSA2048
			var retType enclave.KeyType
			var keyStore enclave.KeyStore = enclave.Software
			var retStore enclave.KeyStore
			key3, err = enclave.NewKeyPair(enclave.KeyOpts{
				Type:  keyType,
				Store: keyStore,
			})
			_ = err

			retType, err = enclave.WhichKeyType(key3)
			retStore, err = enclave.WhichKeyStore(key3)
			So(keyType, ShouldEqual, retType)
			So(keyStore, ShouldEqual, retStore)
			fmt.Println(separator)
		})

		Convey("Key type/store getter should fail with wrong keyID", func() {
			_, err = enclave.WhichKeyType("unknown-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)

			_, err = enclave.WhichKeyStore("unknown-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})
	})

	Convey("Encrypt/Decrypt tests", t, func() {

		cipherText1Label1, _ := enclave.Encrypt(key1, plainText, []byte("label1"))
		cipherText1Label2, _ := enclave.Encrypt(key1, plainText, []byte("label2"))
		cipherText2Label1, _ := enclave.Encrypt(key2, plainText, []byte("label1"))
		cipherText2Label2, _ := enclave.Encrypt(key2, plainText, []byte("label2"))

		decryptedText1Label1, _ := enclave.Decrypt(key1, cipherText1Label1, []byte("label1"))
		decryptedText1Label2, _ := enclave.Decrypt(key1, cipherText1Label2, []byte("label2"))
		decryptedText2Label1, _ := enclave.Decrypt(key2, cipherText2Label1, []byte("label1"))
		decryptedText2Label2, _ := enclave.Decrypt(key2, cipherText2Label2, []byte("label2"))

		Convey("Plain text and ciphertext should be different", func() {
			So(plainText, ShouldNotEqual, cipherText1Label1)
			So(plainText, ShouldNotEqual, cipherText1Label2)
			So(plainText, ShouldNotEqual, cipherText2Label1)
			So(plainText, ShouldNotEqual, cipherText2Label2)
		})

		Convey("Each ciphertext should be different", func() {
			So(cipherText1Label1, ShouldNotEqual, cipherText1Label2)
			So(cipherText2Label1, ShouldNotEqual, cipherText2Label2)
			So(cipherText1Label1, ShouldNotEqual, cipherText2Label1)
			So(cipherText1Label2, ShouldNotEqual, cipherText2Label2)
		})

		Convey("Decrypted text and plain text encrypted/decrypted with the same label should match", func() {
			So(decryptedText1Label1, ShouldEqual, plainText)
			So(decryptedText1Label2, ShouldEqual, plainText)
			So(decryptedText2Label1, ShouldEqual, plainText)
			So(decryptedText2Label2, ShouldEqual, plainText)
		})

		Convey("Encrypt/Decrypt function should fail with a wrong keyID", func() {
			_, err = enclave.Encrypt("unknown-id", plainText, []byte{})
			log.Println(err.Error())
			So(err, ShouldNotBeNil)

			_, err = enclave.Decrypt("unknown-id", plainText, []byte{})
			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		Convey("Decrypted text and plain text encrypted/decrypted with the different label should mismatch", func() {
			decryptedText1Label1Mismatch, err1Label1 := enclave.Decrypt(key1, cipherText1Label1, []byte("label2"))
			decryptedText1Label2Mismatch, err1Label2 := enclave.Decrypt(key1, cipherText1Label2, []byte("label1"))
			decryptedText2Label1Mismatch, err2Label1 := enclave.Decrypt(key2, cipherText2Label1, []byte("label2"))
			decryptedText2Label2Mismatch, err2Label2 := enclave.Decrypt(key2, cipherText2Label2, []byte("label1"))

			So(decryptedText1Label1Mismatch, ShouldNotEqual, plainText)
			So(decryptedText1Label2Mismatch, ShouldNotEqual, plainText)
			So(decryptedText2Label1Mismatch, ShouldNotEqual, plainText)
			So(decryptedText2Label2Mismatch, ShouldNotEqual, plainText)
			So(err1Label1, ShouldNotBeNil)
			So(err1Label2, ShouldNotBeNil)
			So(err2Label1, ShouldNotBeNil)
			So(err2Label2, ShouldNotBeNil)
			fmt.Println(separator)
		})
	})

	Convey("Sign/Verify tests", t, func() {
		signature1, _ := enclave.Sign(key1, plainText)
		signature2, _ := enclave.Sign(key2, plainText)

		Convey("Signed text with private key should be verified by corresponding public key", func() {
			verified1, _ := enclave.Verify(key1, plainText, signature1)
			verified2, _ := enclave.Verify(key2, plainText, signature2)
			So(verified1, ShouldBeTrue)
			So(verified2, ShouldBeTrue)
		})

		Convey("Signed text with private key should not be verified by not corresponding public key", func() {
			verified1, _ := enclave.Verify(key1, plainText, signature2)
			verified2, _ := enclave.Verify(key2, plainText, signature1)
			So(verified1, ShouldBeFalse)
			So(verified2, ShouldBeFalse)
		})
	})

	Convey("Key pair persistency tests", t, func() {
		Convey("TODO: Check if key pairs are restored correctly", FailureHalts, nil)
		Convey("TODO: Check if key pairs are saved correctly", FailureHalts, nil)
	})
}
