package public

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/rsa"
	"crypto/x509"

	"github.com/pkg/errors"
)

func Verify(plaintext []byte, signature []byte, pubKeyBytes []byte) error {
	err := verifyUsingHardware(plaintext, signature, pubKeyBytes)
	if err == errors.Wrap(ErrNotImplemented, "hardware verification on this platform") {
		err = verifyUsingSoftware(plaintext, signature, pubKeyBytes)
	}

	return err
}

func verifyUsingHardware(plaintext []byte, signature []byte, pubKeyBytes []byte) error {
	return errors.Wrap(ErrNotImplemented, "hardware verification on this platform")
}

func verifyUsingSoftware(plaintext []byte, signature []byte, pubKeyBytes []byte) error {
	pubKey, err := x509.ParsePKIXPublicKey(pubKeyBytes)
	if err != nil {
		return errors.Wrap(err, "can't parse public key from bytes")
	}

	switch pubKey := pubKey.(type) {
	case *rsa.PublicKey:
		return verifyUsingSoftwareRSA(plaintext, signature, pubKey)
	case *ecdsa.PublicKey:
		return errors.Wrap(ErrNotImplemented, "verification using ECDSA")
	default:
		return ErrUnsupportedKeyAlgo
	}
}

func verifyUsingSoftwareRSA(plaintext []byte, signature []byte, pubKey *rsa.PublicKey) error {
	pssh := crypto.SHA512.New()

	_, err := pssh.Write(plaintext)
	if err != nil {
		return errors.Wrap(err, "plaintext hashing failed")
	}

	hashed := pssh.Sum(nil)

	return rsa.VerifyPSS(
		pubKey,
		crypto.SHA512,
		hashed,
		signature,
		nil,
	)
}
