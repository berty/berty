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

type UnsecureCrypto struct {
	privateKey *interface{}
}

func (c *UnsecureCrypto) SignatureAlgorithm() SignatureAlgorithm {
	switch priv := (*c.privateKey).(type) {
	case *rsa.PrivateKey:
		return SignatureAlgorithm_SHA256WithRSA

	case *ecdsa.PrivateKey:
		switch priv.Curve {
		case elliptic.P224(), elliptic.P256():
			return SignatureAlgorithm_ECDSAWithSHA256

		case elliptic.P384():
			return SignatureAlgorithm_ECDSAWithSHA384

		case elliptic.P521():
			return SignatureAlgorithm_ECDSAWithSHA512

		}
	}

	panic("unknown signature algorithm")
}

func (c *UnsecureCrypto) PublicKeyAlgorithm() PublicKeyAlgorithm {
	switch (*c.privateKey).(type) {
	case *rsa.PublicKey:
		return PublicKeyAlgorithm_RSA

	case *ecdsa.PublicKey:
		return PublicKeyAlgorithm_ECDSA
	}

	return PublicKeyAlgorithm_UnknownPublicKeyAlgorithm
}

func (c *UnsecureCrypto) Sign(message []byte) ([]byte, error) {
	//var hashFunc crypto.Hash
	var publicKey crypto.PublicKey
	var key crypto.Signer
	var ok bool

	switch priv := (*c.privateKey).(type) {
	case *rsa.PrivateKey:
		publicKey = priv.Public()
		key, ok = (*c.privateKey).(crypto.Signer)
		if !ok {
			return nil, errors.New("couldn't cast rsa to signer interface")
		}
	case *ecdsa.PrivateKey:
		publicKey = priv.Public()
		key, ok = (*c.privateKey).(crypto.Signer)
		if !ok {
			return nil, errors.New("couldn't cast ecdsa to signer interface")
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

func (c *UnsecureCrypto) Encrypt(message []byte, pubKeyBytes []byte) ([]byte, error) {
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

func (c *UnsecureCrypto) Decrypt(message []byte) ([]byte, error) {
	privateKey, ok := (*c.privateKey).(rsa.PrivateKey)

	if ok != true {
		return nil, errors.New("unable to use RSA key")
	}

	return rsa.DecryptPKCS1v15(rand.Reader, &privateKey, message)
}

func (c *UnsecureCrypto) GetPubKey() ([]byte, error) {
	switch priv := (*c.privateKey).(type) {
	case *rsa.PrivateKey:
		pubBytes, err := x509.MarshalPKIXPublicKey(priv.Public())

		return pubBytes, err

	case *ecdsa.PrivateKey:
		pubBytes, err := x509.MarshalPKIXPublicKey(priv.Public())

		return pubBytes, err
	default:
		return nil, errors.New("only RSA and ECDSA public keys supported")
	}
}

func (c *UnsecureCrypto) SetPrivateKeyData(privateKeyBytes []byte) error {
	key, err := x509.ParsePKCS8PrivateKey(privateKeyBytes)

	if err != nil {
		return err
	}

	c.privateKey = &key

	return nil
}
