package enclave

import (
	"fmt"
	"log"
	"runtime"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestEnclave(t *testing.T) {
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
	plainText := []byte("plainText")

	key1, _ := NewKeyPair(KeyOpts{
		ID:    "42",
		Type:  RSA2048,
		Store: Software,
	})
	key2, err := NewKeyPair(KeyOpts{
		ID:         "42",
		IDFallback: true,
		Type:       RSA2048,
		Store:      Software,
	})
	fmt.Println(separator)
	var key3 string

	Convey("Key pair generation tests", t, func() {

		Convey("Key generation should succeed if ID requested already exists and fallback is allowed", func() {
			So(err, ShouldBeNil)
			So(key1, ShouldNotEqual, key2)
		})

		Convey("Key generation should fail if ID requested already exists and fallback is disallowed", func() {
			key3, err = NewKeyPair(KeyOpts{
				ID:         "42",
				IDFallback: false,
				Type:       RSA2048,
				Store:      Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		Convey("Key generation should fail if key type/store is not specified in KeyOpts parameter", func() {
			key3, err = NewKeyPair(KeyOpts{
				Store: Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)

			key3, err = NewKeyPair(KeyOpts{
				Type: RSA2048,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		Convey("Key generation should succeed if software ECC-256 key type is requested (not implemented yet) and fallback is allowed", func() {
			key3, err = NewKeyPair(KeyOpts{
				Type:         ECC256,
				TypeFallback: true,
				Store:        Software,
			})
			_ = key3

			So(err, ShouldBeNil)
			fmt.Println(separator)
		})

		Convey("Key generation should fail if ECC-256 key type is requested (not implemented yet) and fallback is disallowed", func() {
			key3, err = NewKeyPair(KeyOpts{
				Type:  ECC256,
				Store: Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		if runtime.GOOS == "darwin" {
			Convey("Key generation should succeed if enclave key store is requested and platform is compatible", func() {
				key3, err = NewKeyPair(KeyOpts{
					Type:  ECC256,
					Store: Enclave,
				})
				_ = key3

				log.Println("Processing1")
				So(err, ShouldBeNil)
				fmt.Println(separator)
			})
		} else {
			Convey("Key generation should succeed if enclave key store is requested but not available and fallback is allowed", func() {
				key3, err = NewKeyPair(KeyOpts{
					Type:          RSA2048,
					Store:         Enclave,
					StoreFallback: true,
				})
				_ = key3

				So(err, ShouldBeNil)
				fmt.Println(separator)
			})

			Convey("Key generation should fail if enclave key store is requested but not available and fallback is disallowed", func() {
				key3, err = NewKeyPair(KeyOpts{
					Type:  RSA2048,
					Store: Enclave,
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
			key3, err = NewKeyPair(KeyOpts{
				Type:  RSA2048,
				Store: Software,
			})
			_ = key3

			err = RemoveFromKeyPairsMap(key3)
			So(err, ShouldBeNil)
			fmt.Println(separator)
		})

		if runtime.GOOS == "darwin" {
			Convey("Key pair deletion should succeed if keyID exists in keys map and in keychain (darwin)", func() {
				key3, err = NewKeyPair(KeyOpts{
					Type:  RSA2048,
					Store: Enclave,
				})
				_ = key3

				err = RemoveFromKeyPairsMap(key3)
				So(err, ShouldBeNil)
				fmt.Println(separator)
			})
		}

		Convey("Key pair deletion should fail if keyID doesn't exist in keys map", func() {
			err = RemoveFromKeyPairsMap("unknow-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		Convey("Key type/store getters should return the right value", func() {
			var keyType KeyType = RSA2048
			var retType KeyType
			var keyStore KeyStore = Software
			var retStore KeyStore
			key3, err = NewKeyPair(KeyOpts{
				Type:  keyType,
				Store: keyStore,
			})
			_ = err

			retType, err = WhichKeyType(key3)
			retStore, err = WhichKeyStore(key3)
			So(keyType, ShouldEqual, retType)
			So(keyStore, ShouldEqual, retStore)
			fmt.Println(separator)
		})

		Convey("Key type/store getter should fail with wrong keyID", func() {
			_, err = WhichKeyType("unknown-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)

			_, err = WhichKeyStore("unknown-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})
	})

	Convey("Encrypt/Decrypt tests", t, func() {

		cipherText1, _ := Encrypt(key1, plainText)
		cipherText2, _ := Encrypt(key2, plainText)

		decryptedText1, _ := Decrypt(key1, cipherText1)
		decryptedText2, _ := Decrypt(key2, cipherText2)

		Convey("Plain text and ciphertext should be different", func() {
			So(string(plainText), ShouldNotEqual, string(cipherText1))
			So(string(plainText), ShouldNotEqual, string(cipherText2))
		})

		Convey("Each ciphertext should be different", func() {
			So(string(cipherText1), ShouldNotEqual, string(cipherText2))
		})

		Convey("Decrypted text and plain text encrypted/decrypted with the same label should match", func() {
			So(string(decryptedText1), ShouldEqual, string(plainText))
			So(string(decryptedText2), ShouldEqual, string(plainText))
		})

		Convey("Encrypt/Decrypt function should fail with a wrong keyID", func() {
			_, err = Encrypt("unknown-id", plainText)
			log.Println(err.Error())
			So(err, ShouldNotBeNil)

			_, err = Decrypt("unknown-id", plainText)
			log.Println(err.Error())
			So(err, ShouldNotBeNil)
			fmt.Println(separator)
		})

		if runtime.GOOS == "darwin" {
			Convey("Decrypt with enclave should works as intended on Darwin", func() {
				key3, _ = NewKeyPair(KeyOpts{
					Type:  RSA2048,
					Store: Enclave,
				})
				cipherText3, _ := Encrypt(key3, plainText)
				decryptedText3, _ := Decrypt(key3, cipherText3)

				So(string(cipherText3), ShouldNotEqual, string(decryptedText3))
				So(string(decryptedText3), ShouldEqual, string(plainText))
			})
		}
	})

	Convey("Sign/Verify tests", t, func() {
		signature1, _ := Sign(key1, plainText)
		signature2, _ := Sign(key2, plainText)

		Convey("Signed text with private key should be verified by corresponding public key", func() {
			verified1, _ := Verify(key1, plainText, signature1)
			verified2, _ := Verify(key2, plainText, signature2)
			So(verified1, ShouldBeTrue)
			So(verified2, ShouldBeTrue)
		})

		Convey("Signed text with private key should not be verified by not corresponding public key", func() {
			verified1, _ := Verify(key1, plainText, signature2)
			verified2, _ := Verify(key2, plainText, signature1)
			So(verified1, ShouldBeFalse)
			So(verified2, ShouldBeFalse)
		})
	})

	Convey("Key pair persistency tests", t, func() {
		Convey("TODO: Check if key pairs are restored correctly", FailureHalts, nil)
		Convey("TODO: Check if key pairs are saved correctly", FailureHalts, nil)
	})

	Convey("Benchmark comparison between algorithm and software/hardware", t, func() {
		// Check https://golang.org/pkg/testing/#hdr-Benchmarks
		Convey("TODO: Check performance difference between ECC and RSA", FailureHalts, nil)
		Convey("TODO: Check performance difference software and hardware", FailureHalts, nil)
	})
}
