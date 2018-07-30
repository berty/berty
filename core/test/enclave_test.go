package test

import (
	"log"
	"testing"

	"github.com/berty/berty/core/crypto/enclave"

	. "github.com/smartystreets/goconvey/convey"
)

func TestEnclave(t *testing.T) {

	setupTestLogging()

	/* Key generation options
	type Opts struct {
		ID            string // Optional
		IDFallback    bool   // Optional - false by default
		Type          KeyType
		TypeFallback  bool // Optional - false by default
		Store         KeyStore
		StoreFallback bool // Optional - false by default
	}
	*/

	key1, _ := enclave.NewKeyPair(enclave.Opts{
		ID:    "42",
		Type:  enclave.RSA2048,
		Store: enclave.Software,
	})
	key2, err := enclave.NewKeyPair(enclave.Opts{
		ID:         "42",
		IDFallback: true,
		Type:       enclave.RSA2048,
		Store:      enclave.Software,
	})
	var key3 string

	Convey("Key pair generation tests", t, func() {

		Convey("Key generation should succeed if ID requested already exists and fallback is allowed", func() {
			So(err, ShouldBeNil)
			So(key1, ShouldNotEqual, key2)
		})

		Convey("Key generation should fail if ID requested already exists and fallback is disallowed", func() {
			key3, err = enclave.NewKeyPair(enclave.Opts{
				ID:         "42",
				IDFallback: false,
				Type:       enclave.RSA2048,
				Store:      enclave.Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
		})

		Convey("Key generation should fail if key type is not specified in Opts parameter", func() {
			key3, err = enclave.NewKeyPair(enclave.Opts{
				Store: enclave.Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
		})

		Convey("Key generation should fail if key store is not specified in Opts parameter", func() {
			key3, err = enclave.NewKeyPair(enclave.Opts{
				Type: enclave.RSA2048,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
		})

		Convey("Key generation should succeed if ECC-256 key type is requested (not implemented yet) and fallback is allowed", func() {
			key3, err = enclave.NewKeyPair(enclave.Opts{
				Type:         enclave.ECC256,
				TypeFallback: true,
				Store:        enclave.Software,
			})
			_ = key3

			So(err, ShouldBeNil)
		})

		Convey("Key generation should fail if ECC-256 key type is requested (not implemented yet) and fallback is disallowed", func() {
			key3, err = enclave.NewKeyPair(enclave.Opts{
				Type:  enclave.ECC256,
				Store: enclave.Software,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
		})

		Convey("Key generation should succeed if enclave key store is requested but not available and fallback is allowed", func() {
			key3, err = enclave.NewKeyPair(enclave.Opts{
				Type:          enclave.RSA2048,
				Store:         enclave.Enclave,
				StoreFallback: true,
			})
			_ = key3

			So(err, ShouldBeNil)
		})

		Convey("Key generation should fail if enclave key store is requested but not available and fallback is disallowed", func() {
			key3, err = enclave.NewKeyPair(enclave.Opts{
				Type:  enclave.RSA2048,
				Store: enclave.Enclave,
			})
			_ = key3

			log.Println(err.Error())
			So(err, ShouldNotBeNil)
		})
	})

	Convey("Key pair management tests", t, func() {

		Convey("Key pair deletion should succeed if keyID exists in keys map", func() {
			key3, err = enclave.NewKeyPair(enclave.Opts{
				Type:  enclave.RSA2048,
				Store: enclave.Software,
			})
			_ = key3

			err = enclave.RemoveFromKeyPairsMap(key3)
			So(err, ShouldBeNil)
		})

		Convey("Key pair deletion should fail if keyID doesn't exist in keys map", func() {
			err = enclave.RemoveFromKeyPairsMap("unknow-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)
		})

		Convey("Key type/store getters should return the right value", func() {
			var keyType enclave.KeyType = enclave.RSA2048
			var retType enclave.KeyType
			var keyStore enclave.KeyStore = enclave.Software
			var retStore enclave.KeyStore
			key3, err = enclave.NewKeyPair(enclave.Opts{
				Type:  keyType,
				Store: keyStore,
			})
			_ = err

			retType, err = enclave.WhichKeyType(key3)
			retStore, err = enclave.WhichKeyStore(key3)
			So(keyType, ShouldEqual, retType)
			So(keyStore, ShouldEqual, retStore)
		})

		Convey("Key type/store getter should fail with wrong keyID", func() {
			_, err = enclave.WhichKeyType("unknown-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)

			_, err = enclave.WhichKeyStore("unknown-id")
			log.Println(err.Error())
			So(err, ShouldNotBeNil)
		})
	})

	Convey("Key pair persistency tests", t, func() {
		Convey("TODO: Check if key pair are restored correctly", FailureHalts, nil)
		Convey("TODO: Check if key pair are saved correctly", FailureHalts, nil)
	})
}

// 	keyPair1, _ := NewKeypair(Opts{
// 		RandSeed:  42,
// 		KeyLength: 1024,
// 		HashSign:  crypto.SHA512,
// 	})
// 	keyPair2, _ := NewKeypair(Opts{})
// 	plainText := "Ceci est un test"
//
// 	Convey("Create two keypairs with different options", t, func() {
// 		Convey("Public keys should be different", func() {
// 			So(keyPair1.PubKey, ShouldNotEqual, keyPair2.PubKey)
// 		})
// 		Convey("First keypair index should be 0", func() {
// 			So(keyPair1.Index, ShouldEqual, 0)
// 		})
// 		Convey("Second keypair index should be 1", func() {
// 			So(keyPair2.Index, ShouldEqual, 1)
// 		})
// 		Convey("First keypair key length should be 1024", func() {
// 			So(keyPair1.Opts.KeyLength, ShouldEqual, 1024)
// 		})
// 		Convey("Second keypair key length should be 2048 (default)", func() {
// 			So(keyPair2.Opts.KeyLength, ShouldEqual, 2048)
// 		})
// 		Convey("First hashsign function should be SHA512", func() {
// 			So(keyPair1.Opts.HashSign, ShouldEqual, crypto.SHA512)
// 		})
// 		Convey("Second hashsign function should be SHA256 (default)", func() {
// 			So(keyPair2.Opts.HashSign, ShouldEqual, crypto.SHA256)
// 		})
// 	})
//
// 	Convey("Encrypt/Decrypt functions test", t, func() {
// 		cipherText1Label1, _ := Encrypt(0, plainText, []byte("label1"))
// 		cipherText1Label2, _ := Encrypt(0, plainText, []byte("label2"))
// 		cipherText2Label1, _ := Encrypt(1, plainText, []byte("label1"))
// 		cipherText2Label2, _ := Encrypt(1, plainText, []byte("label2"))
//
// 		Convey("Plain text and ciphertext should be different", func() {
// 			So(plainText, ShouldNotEqual, cipherText1Label1)
// 			So(plainText, ShouldNotEqual, cipherText1Label2)
// 			So(plainText, ShouldNotEqual, cipherText2Label1)
// 			So(plainText, ShouldNotEqual, cipherText2Label2)
// 		})
// 		Convey("Each ciphertext should be different", func() {
// 			So(cipherText1Label1, ShouldNotEqual, cipherText1Label2)
// 			So(cipherText2Label1, ShouldNotEqual, cipherText2Label2)
// 			So(cipherText1Label1, ShouldNotEqual, cipherText2Label1)
// 			So(cipherText1Label2, ShouldNotEqual, cipherText2Label2)
// 		})
//
// 		decryptedText1Label1, err1Label1 := Decrypt(0, cipherText1Label1, []byte("label1"))
// 		decryptedText1Label2, err1Label2 := Decrypt(0, cipherText1Label2, []byte("label2"))
// 		decryptedText2Label1, err2Label1 := Decrypt(1, cipherText2Label1, []byte("label1"))
// 		decryptedText2Label2, err2Label2 := Decrypt(1, cipherText2Label2, []byte("label2"))
// 		Convey("Decrypted text and plain text encrypted/decrypted with the same label should match", func() {
// 			So(decryptedText1Label1, ShouldEqual, plainText)
// 			So(decryptedText1Label2, ShouldEqual, plainText)
// 			So(decryptedText2Label1, ShouldEqual, plainText)
// 			So(decryptedText2Label2, ShouldEqual, plainText)
// 		})
// 		Convey("Error should be nil for each decryption", func() {
// 			So(err1Label1, ShouldBeNil)
// 			So(err1Label2, ShouldBeNil)
// 			So(err2Label1, ShouldBeNil)
// 			So(err2Label2, ShouldBeNil)
// 		})
//
// 		decryptedText1Label1Mismatch, err1Label1 := Decrypt(0, cipherText1Label1, []byte("label2"))
// 		decryptedText1Label2Mismatch, err1Label2 := Decrypt(0, cipherText1Label2, []byte("label1"))
// 		decryptedText2Label1Mismatch, err2Label1 := Decrypt(1, cipherText2Label1, []byte("label2"))
// 		decryptedText2Label2Mismatch, err2Label2 := Decrypt(1, cipherText2Label2, []byte("label1"))
// 		Convey("Decrypted text and plain text encrypted/decrypted with the different label should mismatch", func() {
// 			So(decryptedText1Label1Mismatch, ShouldNotEqual, plainText)
// 			So(decryptedText1Label2Mismatch, ShouldNotEqual, plainText)
// 			So(decryptedText2Label1Mismatch, ShouldNotEqual, plainText)
// 			So(decryptedText2Label2Mismatch, ShouldNotEqual, plainText)
// 		})
// 		Convey("Error should not be nil for each decryption", func() {
// 			So(err1Label1, ShouldNotBeNil)
// 			So(err1Label2, ShouldNotBeNil)
// 			So(err2Label1, ShouldNotBeNil)
// 			So(err2Label2, ShouldNotBeNil)
// 		})
// 	})
//
// 	Convey("Sign/Verify functions test", t, func() {
// 		signature1, _ := Sign(0, plainText)
// 		signature2, _ := Sign(1, plainText)
//
// 		Convey("Signed text with private key should be verified by corresponding public key", func() {
// 			verified1, _ := Verify(0, plainText, signature1)
// 			verified2, _ := Verify(1, plainText, signature2)
// 			So(verified1, ShouldBeTrue)
// 			So(verified2, ShouldBeTrue)
// 		})
// 		Convey("Signed text with private key should not be verified by not corresponding public key", func() {
// 			verified1, _ := Verify(0, plainText, signature2)
// 			verified2, _ := Verify(1, plainText, signature1)
// 			So(verified1, ShouldBeFalse)
// 			So(verified2, ShouldBeFalse)
// 		})
// 	})
