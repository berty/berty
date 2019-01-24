package keypair

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"errors"
)

type InsecureCrypto struct {
	privateKey crypto.PrivateKey
}

func (c *InsecureCrypto) SignatureAlgorithm() SignatureAlgorithm {
	switch private := (c.privateKey).(type) {
	case *rsa.PrivateKey:
		return SignatureAlgorithm_SHA256_WITH_RSA

	case *ecdsa.PrivateKey:
		switch private.Curve {
		case elliptic.P224(), elliptic.P256():
			return SignatureAlgorithm_ECDSA_WITH_SHA256

		case elliptic.P384():
			return SignatureAlgorithm_ECDSA_WITH_SHA384

		case elliptic.P521():
			return SignatureAlgorithm_ECDSA_WITH_SHA512

		}
	}

	panic("unknown signature algorithm")
}

func (c *InsecureCrypto) PublicKeyAlgorithm() PublicKeyAlgorithm {
	switch (c.privateKey).(type) {
	case *rsa.PublicKey:
		return PublicKeyAlgorithm_RSA

	case *ecdsa.PublicKey:
		return PublicKeyAlgorithm_ECDSA
	}

	return PublicKeyAlgorithm_UNKNOWN_PUBLIC_KEY_ALGORITHM
}

func (c *InsecureCrypto) Sign(message []byte) ([]byte, error) {
	var publicKey crypto.PublicKey
	var key crypto.Signer
	var ok bool

	switch private := (c.privateKey).(type) {
	case *rsa.PrivateKey:
		publicKey = private.Public()
		key, ok = (c.privateKey).(crypto.Signer)
		if !ok {
			return nil, errors.New("couldn't cast RSA to signer interface")
		}
	case *ecdsa.PrivateKey:
		publicKey = private.Public()
		key, ok = (c.privateKey).(crypto.Signer)
		if !ok {
			return nil, errors.New("couldn't cast ECDSA to signer interface")
		}

	default:
		return nil, errors.New("unrecognised private key type️")
	}

	hashFunc, err := GetHashFuncForKey(publicKey)

	if err != nil {
		return nil, err
	}

	h := hashFunc.New()
	_, err = h.Write(message)

	if err != nil {
		return nil, err
	}

	digest := h.Sum(nil)

	signature, err := key.Sign(rand.Reader, digest, hashFunc)

	if err != nil {
		return nil, err
	}

	return signature, nil
}

func /*(c *InsecureCrypto)*/ Encrypt(message []byte, pubKeyBytes []byte) ([]byte, error) {
	pubKey, err := x509.ParsePKIXPublicKey(pubKeyBytes)

	if err != nil {
		return nil, err
	}

	switch pub := (pubKey).(type) {
	case *rsa.PublicKey:
		return rsa.EncryptPKCS1v15(rand.Reader, pub, message)

	default:
		return nil, errors.New("only RSA public keys supported")
	}
}

func (c *InsecureCrypto) Decrypt(message []byte) ([]byte, error) {
	privateKey, ok := (c.privateKey).(*rsa.PrivateKey)

	if ok != true {
		return nil, errors.New("unable to use RSA key")
	}

	return rsa.DecryptPKCS1v15(rand.Reader, privateKey, message)
}

func (c *InsecureCrypto) GetPubKey() ([]byte, error) {
	switch private := (c.privateKey).(type) {
	case *rsa.PrivateKey:
		pubBytes, err := x509.MarshalPKIXPublicKey(private.Public())

		return pubBytes, err

	case *ecdsa.PrivateKey:
		pubBytes, err := x509.MarshalPKIXPublicKey(private.Public())

		return pubBytes, err
	default:
		return nil, errors.New("only RSA and ECDSA public keys supported")
	}
}

func (c *InsecureCrypto) SetPrivateKeyData(privateKeyBytes []byte) error {
	key, err := x509.ParsePKCS8PrivateKey(privateKeyBytes)

	if err != nil {
		return err
	}

	c.privateKey = key

	return nil
}
