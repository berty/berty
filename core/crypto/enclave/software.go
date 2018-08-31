package enclave

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"crypto/x509"
	"fmt"

	"github.com/pkg/errors"
)

func generateSoftwareKeypairRSA(size uint16) (*RSASoftwareEnclave, error) {
	// Generate a random RSA key pair
	keyPairRSA, err := rsa.GenerateKey(rand.Reader, int(size))
	if err != nil {
		return nil, errors.Wrap(err, "key pair generation failed")
	}
	logger().Debug(fmt.Sprintf("software RSA-%d key pair generated successfully", size))

	_, err = x509.MarshalPKIXPublicKey(&keyPairRSA.PublicKey)
	if err != nil {
		return nil, errors.Wrap(err, "public key marshalling failed")
	}

	keyID, err := saveToGenericKeyStore(RSA, x509.MarshalPKCS1PrivateKey(keyPairRSA))
	if err != nil {
		return nil, err
	}

	return &RSASoftwareEnclave{id: keyID}, nil
}

func decryptUsingSoftwareRSA(ciphertext []byte, keyID string) ([]byte, error) {
	privKey, err := getRSAPrivKeyFromGenericKeyStore(keyID)
	if err != nil {
		return nil, err
	}

	plaintext, err := rsa.DecryptOAEP(
		sha512.New(),
		rand.Reader,
		privKey,
		ciphertext,
		nil,
	)
	if err != nil {
		return nil, errors.Wrap(err, "ciphertext decryption failed")
	}

	return plaintext, nil
}

func signUsingSoftwareRSA(plaintext []byte, keyID string) ([]byte, error) {
	privKey, err := getRSAPrivKeyFromGenericKeyStore(keyID)
	if err != nil {
		return nil, err
	}

	pssh := crypto.SHA512.New()

	_, err = pssh.Write(plaintext)
	if err != nil {
		return nil, errors.Wrap(err, "plaintext hashing failed")
	}

	signature, err := rsa.SignPSS(
		rand.Reader,
		privKey,
		crypto.SHA512,
		pssh.Sum(nil),
		&rsa.PSSOptions{},
	)
	if err != nil {
		return nil, errors.Wrap(err, "plaintext signing failed")
	}

	return signature, nil
}

//

func generateSoftwareKeypairECC(size uint16) (*ECCSoftwareEnclave, error) {
	return nil, errors.Wrap(ErrNotImplemented, "software ECC keypair generation")
}

func decryptUsingSoftwareECC(ciphertext []byte, keyID string) ([]byte, error) {
	return nil, errors.Wrap(ErrNotImplemented, "software ECC decryption")
}

func signUsingSoftwareECC(plaintext []byte, keyID string) ([]byte, error) {
	return nil, errors.Wrap(ErrNotImplemented, "software ECC signature generation")
}
