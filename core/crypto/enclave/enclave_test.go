package enclave

import (
	"runtime"
	"testing"

	"github.com/berty/berty/core/crypto/keypair"
	"github.com/berty/berty/core/crypto/public"
	"github.com/berty/berty/core/crypto/sigchain"
	"github.com/berty/berty/core/test"
	. "github.com/smartystreets/goconvey/convey"
)

func verifyPubKey(pk []byte) error {
	// FIXME: implement
	return nil
}

func TestEnclave(t *testing.T) {
	test.InitLogger()

	Convey("Test enclave library", t, func() {
		Convey("Generated keypairs satisfy keypair.Interface and return valid pubkeys", func() {
			Convey("RSA Hardware keypair", func() {
				kp, err := NewRSAHardwareEnclave(2048)
				switch {
				case runtime.GOOS == "darwin":
					So(err, ShouldNotBeNil)
					return
				default:
					So(true, ShouldBeFalse) // configure the switch for new runtimes
					return
				}

				// the keypair should satisfy keypair.Interface and return a valid pubkey
				sc := sigchain.SigChain{}
				So(sc.Init(kp, "Test1"), ShouldBeNil)
				pub, err := kp.GetPubKey()
				So(err, ShouldBeNil)
				So(verifyPubKey(pub), ShouldBeNil)
			})

			Convey("ECC Hardware keypair", func() {
				kp, err := NewECCHardwareEnclave(256)
				switch {
				case runtime.GOOS == "darwin":
					So(err, ShouldNotBeNil) // Need to build Berty.app first then codesign it to use Secure Enclave
					return
				default:
					So(true, ShouldBeFalse) // configure the switch for new runtimes
					return
				}

				// the keypair should satisfy keypair.Interface and return a valid pubkey
				sc := sigchain.SigChain{}
				So(sc.Init(kp, "Test1"), ShouldBeNil)
				pub, err := kp.GetPubKey()
				So(err, ShouldBeNil)
				So(verifyPubKey(pub), ShouldBeNil)
			})

			Convey("RSA Software keypair", func() {
				kp, err := NewRSASoftwareEnclave(2048)
				So(err, ShouldBeNil)

				// the keypair should satisfy Enclave interface
				So(kp.ID(), ShouldNotBeNil)

				// the keypair should satisfy keypair.Interface and return a valid pubkey
				So(kp.PublicKeyAlgorithm(), ShouldEqual, keypair.PublicKeyAlgorithm_RSA)
				So(kp.SignatureAlgorithm(), ShouldEqual, keypair.SignatureAlgorithm_SHA512_WITH_RSA)
				sc := sigchain.SigChain{}
				So(sc.Init(kp, "Test1"), ShouldBeNil)
				pub, err := kp.GetPubKey()
				So(err, ShouldBeNil)
				So(verifyPubKey(pub), ShouldBeNil)
			})

			Convey("ECC Software keypair", func() {
				_, err := NewECCSoftwareEnclave(2048)
				So(err, ShouldNotBeNil) // software ECC not implemented yet
			})

			Convey("Generic keypair", func() {
				kp, err := New(NewKeyOpts{Algo: RSA, Size: 1024})
				So(err, ShouldBeNil)

				// the keypair should satisfy Enclave interface
				So(kp.ID(), ShouldNotBeNil)

				// the keypair should satisfy keypair.Interface and return a valid pubkey
				So(kp.PublicKeyAlgorithm(), ShouldEqual, keypair.PublicKeyAlgorithm_RSA)
				So(kp.SignatureAlgorithm(), ShouldEqual, keypair.SignatureAlgorithm_SHA512_WITH_RSA)
				sc := sigchain.SigChain{}
				So(sc.Init(kp, "Test1"), ShouldBeNil)
				pub, err := kp.GetPubKey()
				So(err, ShouldBeNil)
				So(verifyPubKey(pub), ShouldBeNil)
			})
		})

		Convey("Test encryption/decryption", func() {
			Convey("RSA Software keypair", func() {
				kp, err := NewRSASoftwareEnclave(2048)
				So(err, ShouldBeNil)

				plaintext := []byte("Test")
				pubkey, err := kp.GetPubKey()
				So(err, ShouldBeNil)
				_ = pubkey
				ciphertext, err := public.Encrypt(plaintext, pubkey)
				So(err, ShouldBeNil)
				decryptedtext, err := kp.Decrypt(ciphertext)
				So(err, ShouldBeNil)
				So(string(plaintext), ShouldEqual, string(decryptedtext))
			})
		})
	})

	/*
		var (
			plainText        = []byte("plainText")
			key1, key2, key3 string
			err              error
		)

				Convey("Initialize keypairs", func() {
					key1, err = NewKeyPair(KeyOpts{
						ID:    "42",
						Type:  RSA2048,
						Store: Software,
					})
					So(err, ShouldBeNil)
					key2, err = NewKeyPair(KeyOpts{
						ID:         "42",
						IDFallback: true,
						Type:       RSA2048,
						Store:      Software,
					})
					So(err, ShouldBeNil)
				})

				Convey("Key generation should succeed if ID requested already exists and fallback is allowed", func() {
					So(err, ShouldBeNil)
					So(key1, ShouldNotEqual, key2)
				})

				Convey("Key generation should fail if ID requested already exists and fallback is disallowed", func() {
					_, err = NewKeyPair(KeyOpts{
						ID:         "42",
						IDFallback: false,
						Type:       RSA2048,
						Store:      Software,
					})
					So(err, ShouldNotBeNil)
				})

				Convey("Key generation should fail if key type/store is not specified in KeyOpts parameter", func() {
					key3, err = NewKeyPair(KeyOpts{
						Store: Software,
					})
					So(err, ShouldNotBeNil)

					key3, err = NewKeyPair(KeyOpts{
						Type: RSA2048,
					})
					So(err, ShouldNotBeNil)
				})

				Convey("Key generation should succeed if software ECC-256 key type is requested (not implemented yet) and fallback is allowed", func() {
					_, err = NewKeyPair(KeyOpts{
						Type:         ECC256,
						TypeFallback: true,
						Store:        Software,
					})
					So(err, ShouldBeNil)
				})

				Convey("Key generation should fail if ECC-256 key type is requested (not implemented yet) and fallback is disallowed", func() {
					_, err = NewKeyPair(KeyOpts{
						Type:  ECC256,
						Store: Software,
					})

					So(err, ShouldNotBeNil)
				})

				if runtime.GOOS == "darwin" {
					Convey("Key generation should succeed if enclave key store is requested and platform is compatible", func() {
						key3, err = NewKeyPair(KeyOpts{
							Type:  ECC256,
							Store: Enclave,
						})
						_ = key3

						So(err, ShouldBeNil)
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
					})

					Convey("Key generation should fail if enclave key store is requested but not available and fallback is disallowed", func() {
						key3, err = NewKeyPair(KeyOpts{
							Type:  RSA2048,
							Store: Enclave,
						})
						_ = key3

						So(err, ShouldNotBeNil)
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
					})
				}

				Convey("Key pair deletion should fail if keyID doesn't exist in keys map", func() {
					err = RemoveFromKeyPairsMap("unknow-id")
					So(err, ShouldNotBeNil)
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
				})

				Convey("Key type/store getter should fail with wrong keyID", func() {
					_, err = WhichKeyType("unknown-id")
					So(err, ShouldNotBeNil)

					_, err = WhichKeyStore("unknown-id")
					So(err, ShouldNotBeNil)
				})
			})

			Convey("Encrypt/Decrypt tests", t, func() {

				cipherText1, err := Encrypt(key1, plainText)
				So(err, ShouldBeNil)
				cipherText2, err := Encrypt(key2, plainText)
				So(err, ShouldBeNil)

				decryptedText1, err := Decrypt(key1, cipherText1)
				So(err, ShouldBeNil)
				decryptedText2, err := Decrypt(key2, cipherText2)
				So(err, ShouldBeNil)

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
					So(err, ShouldNotBeNil)

					_, err = Decrypt("unknown-id", plainText)
					So(err, ShouldNotBeNil)
				})

				if runtime.GOOS == "darwin" {
					Convey("Decrypt with enclave should works as intended on Darwin", func() {
						key3, err = NewKeyPair(KeyOpts{
							Type:  RSA2048,
							Store: Enclave,
						})
						So(err, ShouldBeNil)
						cipherText3, err := Encrypt(key3, plainText)
						So(err, ShouldBeNil)
						decryptedText3, err := Decrypt(key3, cipherText3)
						So(err, ShouldBeNil)

						So(string(cipherText3), ShouldNotEqual, string(decryptedText3))
						So(string(decryptedText3), ShouldEqual, string(plainText))
					})
				}
			})

			Convey("Sign/Verify tests", t, func() {
				signature1, err := Sign(key1, plainText)
				So(err, ShouldBeNil)
				signature2, err := Sign(key2, plainText)
				So(err, ShouldBeNil)

				Convey("Signed text with private key should be verified by corresponding public key", func() {
					verified1, err := Verify(key1, plainText, signature1)
					So(err, ShouldBeNil)
					verified2, err := Verify(key2, plainText, signature2)
					So(err, ShouldBeNil)
					So(verified1, ShouldBeTrue)
					So(verified2, ShouldBeTrue)
				})

				Convey("Signed text with private key should not be verified by not corresponding public key", func() {
					verified1, err := Verify(key1, plainText, signature2)
					So(err, ShouldNotBeNil)
					verified2, err := Verify(key2, plainText, signature1)
					So(err, ShouldNotBeNil)
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
	*/
}
