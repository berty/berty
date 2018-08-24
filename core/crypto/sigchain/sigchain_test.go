package sigchain

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"testing"

	"berty.tech/core/crypto/keypair"
)

func TestFlow(t *testing.T) {
	p, err := rsa.GenerateKey(rand.Reader, 2048)

	if err != nil {
		t.Errorf("unable to generate a RSA key : %s", err)
	}

	p2, err := rsa.GenerateKey(rand.Reader, 2048)

	if err != nil {
		t.Errorf("unable to generate a RSA key : %s", err)
	}

	pubBytes2, err := x509.MarshalPKIXPublicKey(&p2.PublicKey)

	if err != nil {
		t.Errorf("unable to marshal a RSA pubkey : %s", err)
	}

	cryptoImpl := keypair.InsecureCrypto{}

	privByte, err := x509.MarshalPKCS8PrivateKey(p)

	if err != nil {
		t.Errorf("unable to marshal a RSA privkey : %s", err)
	}

	err = cryptoImpl.SetPrivateKeyData(privByte)

	if err != nil {
		t.Errorf("error setting RSA privkey : %s", err)
	}

	sc := SigChain{}
	err = sc.Init(&cryptoImpl, "Test1")

	if err != nil {
		t.Errorf("unable to init sigchain : %s", err)
	}

	err = sc.AddDevice(&cryptoImpl, "Test1", "Test2", pubBytes2)

	if err != nil {
		t.Errorf("unable to add device %s", err)
	}

	err = sc.RemoveDevice(&cryptoImpl, "Test1", "Test2")

	if err != nil {
		t.Errorf("unable to remove device %s", err)
	}

	devices, err := sc.CheckSigChain()

	if err != nil {
		t.Errorf("unable to verify sigchain %s", err)
	}

	if len(devices) != 1 {
		t.Errorf("wrong number of devices %d expected %d received", 1, len(devices))
	}
}

func TestInit(t *testing.T) {
	firstDevice := "Test1"

	p, _ := rsa.GenerateKey(rand.Reader, 2048)
	privBytes, _ := x509.MarshalPKCS8PrivateKey(p)
	pubBytes, _ := x509.MarshalPKIXPublicKey(p.Public())

	cryptoImpl := keypair.InsecureCrypto{}
	cryptoImpl.SetPrivateKeyData(privBytes)

	sc := SigChain{}
	sc.Init(&cryptoImpl, firstDevice)
	devices, _ := sc.CheckSigChain()

	if len(devices) != 1 {
		t.Errorf("wrong number of devices %d expected %d received", len(devices), 1)
	}

	if devices[firstDevice].Content.Issuer != firstDevice {
		t.Errorf("issuer is not self device received: %s expected %s", devices[firstDevice].Content.Issuer, firstDevice)
	}

	if devices[firstDevice].Content.Subject != firstDevice {
		t.Errorf("subject is not self device received: %s expected %s", devices[firstDevice].Content.Subject, firstDevice)
	}

	if bytes.Compare(devices[firstDevice].Content.PublicKey, pubBytes) != 0 {
		t.Errorf("public key not included in certificate")
	}
}

func TestAdd(t *testing.T) {
	firstDevice := "Test1"
	secondDevice := "Test2"

	p, _ := rsa.GenerateKey(rand.Reader, 2048)
	privByte, _ := x509.MarshalPKCS8PrivateKey(p)

	p2, _ := rsa.GenerateKey(rand.Reader, 2048)
	pub2Byte, _ := x509.MarshalPKIXPublicKey(p2.PublicKey)

	cryptoImpl := keypair.InsecureCrypto{}
	cryptoImpl.SetPrivateKeyData(privByte)

	sc := SigChain{}
	sc.Init(&cryptoImpl, firstDevice)
	sc.AddDevice(&cryptoImpl, firstDevice, secondDevice, pub2Byte)

	devices, _ := sc.CheckSigChain()

	if len(devices) != 2 {
		t.Errorf("wrong number of devices %d expected %d received", len(devices), 2)
	}

	if devices[secondDevice].Content.Issuer != firstDevice {
		t.Errorf("issuer is not self device received: %s expected %s", devices[secondDevice].Content.Issuer, firstDevice)
	}

	if devices[secondDevice].Content.Subject != secondDevice {
		t.Errorf("subject is not self device received: %s expected %s", devices[secondDevice].Content.Subject, secondDevice)
	}

	if bytes.Compare(devices[secondDevice].Content.PublicKey, pub2Byte) != 0 {
		t.Errorf("public key not included in certificate")
	}
}

func TestRemove(t *testing.T) {
	firstDevice := "Test1"
	secondDevice := "Test2"

	p, _ := rsa.GenerateKey(rand.Reader, 2048)
	privByte, _ := x509.MarshalPKCS8PrivateKey(p)

	p2, _ := rsa.GenerateKey(rand.Reader, 2048)
	pub2Byte, _ := x509.MarshalPKIXPublicKey(p2.PublicKey)

	cryptoImpl := keypair.InsecureCrypto{}
	cryptoImpl.SetPrivateKeyData(privByte)

	sc := SigChain{}
	sc.Init(&cryptoImpl, firstDevice)
	sc.AddDevice(&cryptoImpl, firstDevice, secondDevice, pub2Byte)
	sc.RemoveDevice(&cryptoImpl, firstDevice, secondDevice)

	devices, _ := sc.CheckSigChain()

	if len(devices) != 1 {
		t.Errorf("wrong number of devices %d expected %d received", len(devices), 1)
	}

	if _, ok := devices[secondDevice]; ok == true {
		t.Errorf("second device should not be present")
	}
}

func TestCertificateCheckSignature(t *testing.T) {
	firstDevice := "Test1"

	p, _ := rsa.GenerateKey(rand.Reader, 2048)
	privBytes, _ := x509.MarshalPKCS8PrivateKey(p)

	cryptoImpl := keypair.InsecureCrypto{}
	cryptoImpl.SetPrivateKeyData(privBytes)

	sc := SigChain{}
	sc.Init(&cryptoImpl, firstDevice)

	c := &keypair.Certificate{}
	c.Unmarshal(sc.Events[0].Payload)

	if err := keypair.CheckSignature(c, c); err != nil {
		t.Errorf("signature should be valid")
	}

	c.Signature.Signature = []byte("oops")

	if err := keypair.CheckSignature(c, c); err == nil {
		t.Errorf("signature should not be valid")
	}
}

func TestRevocationCheckSignature(t *testing.T) {
	firstDevice := "Test1"

	p, _ := rsa.GenerateKey(rand.Reader, 2048)
	privBytes, _ := x509.MarshalPKCS8PrivateKey(p)

	cryptoImpl := keypair.InsecureCrypto{}
	cryptoImpl.SetPrivateKeyData(privBytes)

	sc := SigChain{}
	sc.Init(&cryptoImpl, firstDevice)
	sc.RemoveDevice(&cryptoImpl, firstDevice, firstDevice)

	c := &keypair.Certificate{}
	c.Unmarshal(sc.Events[0].Payload)

	r := &keypair.Revocation{}
	r.Unmarshal(sc.Events[1].Payload)

	if err := keypair.CheckSignature(r, c); err != nil {
		t.Errorf("signature should be valid")
	}

	r.Signature.Signature = []byte("oops")

	if err := keypair.CheckSignature(r, c); err == nil {
		t.Errorf("signature should not be valid")
	}
}
