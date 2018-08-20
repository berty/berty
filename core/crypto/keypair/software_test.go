package keypair

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"

	"testing"

	"bytes"
)

func TestFlow(t *testing.T) {
	p1, _ := rsa.GenerateKey(rand.Reader, 2048)
	p2, _ := rsa.GenerateKey(rand.Reader, 2048)
	privBytes1, _ := x509.MarshalPKCS8PrivateKey(p1)
	privBytes2, _ := x509.MarshalPKCS8PrivateKey(p2)
	pubBytes2, _ := x509.MarshalPKIXPublicKey(&p2.PublicKey)

	message := []byte("hello universe")

	cryptoImpl1 := InsecureCrypto{}
	cryptoImpl1.SetPrivateKeyData(privBytes1)

	cryptoImpl2 := InsecureCrypto{}
	cryptoImpl2.SetPrivateKeyData(privBytes2)

	encryptedMessage, err := cryptoImpl1.Encrypt(message, pubBytes2)

	if err != nil {
		t.Errorf("unable to encrypt message : %s", err)
	}

	if bytes.Compare(encryptedMessage, message) == 0 {
		t.Errorf("message is not encrypted")
	}

	decryptedMessage, err := cryptoImpl2.Encrypt(message, pubBytes2)

	if err != nil {
		t.Errorf("unable to decrypt message : %s", err)
	}

	if bytes.Compare(decryptedMessage, encryptedMessage) == 0 {
		t.Errorf("returned message is the encrypted one")
	}

	if bytes.Compare(decryptedMessage, message) == 0 {
		t.Errorf("message is not decrypted properly")
	}
}
