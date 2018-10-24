package enclave

import (
	"runtime"
	"testing"

	"berty.tech/core/testrunner"

	"berty.tech/core/crypto/keypair"
	"berty.tech/core/crypto/public"
	"berty.tech/core/crypto/sigchain"
	. "github.com/smartystreets/goconvey/convey"
)

func verifyPubKey(pk []byte) error {
	// FIXME: implement
	return nil
}

func TestEnclave(t *testing.T) {
	testrunner.InitLogger()

	Convey("Test enclave library", t, func() {
		Convey("Generated keypairs satisfy keypair.Interface and return valid pubkeys", func() {
			Convey("RSA Hardware keypair", func() {
				kp, err := NewRSAHardwareEnclave(2048)
				switch {
				case runtime.GOOS == "darwin":
					So(err, ShouldNotBeNil)
					return
				default:
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
}
