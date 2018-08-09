package keypair

import (
	"bytes"
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rsa"
	"crypto/x509"
	"errors"
	"math/big"

	"encoding/binary"
)

type Interface interface {
	SignatureAlgorithm() SignatureAlgorithm
	PublicKeyAlgorithm() PublicKeyAlgorithm

	Sign(message []byte) ([]byte, error)
	Encrypt(message []byte, pubKey []byte) ([]byte, error)
	Decrypt(message []byte) ([]byte, error)
	GetPubKey() ([]byte, error)
}

func (m SignatureAlgorithm) GetHashFunction() (crypto.Hash, error) {
	switch m {
	case SignatureAlgorithm_MD5WithRSA:
		return crypto.MD5, nil
	case SignatureAlgorithm_SHA1WithRSA:
		return crypto.SHA1, nil
	case SignatureAlgorithm_SHA256WithRSA:
		return crypto.SHA256, nil
	case SignatureAlgorithm_SHA384WithRSA:
		return crypto.SHA384, nil
	case SignatureAlgorithm_SHA512WithRSA:
		return crypto.SHA512, nil
	case SignatureAlgorithm_DSAWithSHA1:
		return crypto.SHA1, nil
	case SignatureAlgorithm_DSAWithSHA256:
		return crypto.SHA256, nil
	case SignatureAlgorithm_ECDSAWithSHA1:
		return crypto.SHA1, nil
	case SignatureAlgorithm_ECDSAWithSHA256:
		return crypto.SHA256, nil
	case SignatureAlgorithm_ECDSAWithSHA384:
		return crypto.SHA384, nil
	case SignatureAlgorithm_ECDSAWithSHA512:
		return crypto.SHA384, nil
	case SignatureAlgorithm_SHA256WithRSAPSS:
		return crypto.SHA256, nil
	case SignatureAlgorithm_SHA384WithRSAPSS:
		return crypto.SHA384, nil
	case SignatureAlgorithm_SHA512WithRSAPSS:
		return crypto.SHA384, nil
	}

	return crypto.MD4, errors.New("unsupported hashing function")
}

// GetDataToSign We need to have a predictable way to check a
// certificate/revocation content signature. We could simply use the protobuf
// serialization, but that will lead to the following problem: if we change
// the version, not the same data set would be used, leading to a different
// signing hash. Using a newer version of the schema with an older schema
// will lead to unknown field being used.
func (m *CertificateContent) GetDataToSign() ([]byte, error) {
	return bytes.Join([][]byte{
		m.Extension,
		m.PublicKey,
		IntToBytes(uint64(m.PublicKeyAlgorithm)),
		[]byte(m.Issuer),
		[]byte(m.Subject),
		IntToBytes(uint64(m.NotBefore.UnixNano())),
		IntToBytes(uint64(m.NotAfter.UnixNano())),
	}, []byte("")), nil
}

func (m *RevocationContent) GetDataToSign() ([]byte, error) {
	return bytes.Join([][]byte{
		m.Extension,
		[]byte(m.Issuer),
		[]byte(m.Subject),
		IntToBytes(uint64(m.IssuedOn.UnixNano())),
	}, []byte("")), nil
}

type SignableValue interface {
	GetDataToSign() ([]byte, error)
}

type SignedValue interface {
	GetSignedValue() SignableValue
	GetSignature() *Signature
}

func (m *Certificate) GetSignedValue() SignableValue {
	return m.Content
}

func (m *Revocation) GetSignedValue() SignableValue {
	return m.Content
}

func CheckSignature(signedValue SignedValue, signer *Certificate) error {
	pubKey, err := x509.ParsePKIXPublicKey(signer.Content.PublicKey)

	if err != nil {
		return err
	}

	hashFunc, err := signedValue.GetSignature().SignatureAlgorithm.GetHashFunction()

	if err != nil {
		return err
	}

	signedData, err := signedValue.GetSignedValue().GetDataToSign()

	if err != nil {
		return err
	}

	h := hashFunc.New()
	_, err = h.Write(signedData)

	if err != nil {
		return err
	}

	hash := h.Sum(nil)

	switch pub := pubKey.(type) {
	case *rsa.PublicKey:
		err = rsa.VerifyPKCS1v15(pub, hashFunc, hash, signedValue.GetSignature().Signature)

		if err != nil {
			return err
		}

		return nil

	case *ecdsa.PublicKey:
		signature := EcdsaSignature{}
		err := signature.Unmarshal(signedValue.GetSignature().Signature)

		if err != nil {
			return err
		}

		r := &big.Int{}
		r.SetBytes(signature.R)

		if signature.RNeg == true {
			r = r.Neg(r)
		}

		s := &big.Int{}
		s.SetBytes(signature.S)

		if signature.SNeg == true {
			s = s.Neg(s)
		}

		if ecdsa.Verify(pub, hash, r, s) == false {
			return errors.New("invalid ECDSA signature")
		}

		return nil
	}

	return errors.New("unsupported key")
}

func IntToBytes(input uint64) []byte {
	bs := make([]byte, 8)
	binary.LittleEndian.PutUint64(bs, input)

	return bs
}

func GetHashFuncForKey(pub interface{}) (crypto.Hash, error) {
	switch pub := pub.(type) {
	case *rsa.PublicKey:
		return crypto.SHA256, nil

	case *ecdsa.PublicKey:
		switch pub.Curve {
		case elliptic.P224(), elliptic.P256():
			return crypto.SHA256, nil

		case elliptic.P384():
			return crypto.SHA384, nil

		case elliptic.P521():
			return crypto.SHA512, nil

		default:
			return crypto.Hash(0), errors.New("unknown elliptic curve")
		}

	default:
		return crypto.Hash(0), errors.New("unknown key format")
	}
}

func (m *Certificate) GetPubKey() (interface{}, error) {
	return x509.ParsePKIXPublicKey(m.Content.PublicKey)
}
