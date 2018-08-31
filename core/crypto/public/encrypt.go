package public

import (
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"crypto/x509"

	"github.com/pkg/errors"
)

func Encrypt(plaintext []byte, pubKeyBytes []byte) (ciphertext []byte, err error) {
	ciphertext, err = encryptUsingHardware(plaintext, pubKeyBytes)
	if err != nil {
		ciphertext, err = encryptUsingSoftware(plaintext, pubKeyBytes)
		if err != nil {
			return nil, err
		}
	}

	return ciphertext, nil
}

func encryptUsingHardware(plaintext []byte, pubKeyBytes []byte) (ciphertext []byte, err error) {
	return nil, errors.Wrap(ErrNotImplemented, "hardware encryption on this platform")
}

func encryptUsingSoftware(plaintext []byte, pubKeyBytes []byte) (ciphertext []byte, err error) {
	pubKey, err := x509.ParsePKIXPublicKey(pubKeyBytes)
	if err != nil {
		return nil, errors.Wrap(err, "can't parse public key from bytes")
	}

	switch pubKey := pubKey.(type) {
	case *rsa.PublicKey:
		return encryptUsingSoftwareRSA(plaintext, pubKey)
	case *ecdsa.PublicKey:
		return nil, errors.Wrap(ErrNotImplementable, "encryption using ECDSA")
	default:
		return nil, ErrUnsupportedKeyAlgo
	}
}

func encryptUsingSoftwareRSA(plaintext []byte, pubKey *rsa.PublicKey) (ciphertext []byte, err error) {
	ciphertext, err = rsa.EncryptOAEP(
		sha512.New(),
		rand.Reader,
		pubKey,
		plaintext,
		nil,
	)
	if err != nil {
		return nil, errors.Wrap(err, "RSA encryption failed")
	}

	return ciphertext, nil
}
