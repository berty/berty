package handshake

import (
	"context"
	"crypto/rand"
	"testing"

	"berty.tech/go/internal/crypto"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

func createNewIdentity(ctx context.Context, t *testing.T) (crypto.Manager, p2pcrypto.PrivKey) {
	t.Helper()

	c, privateKey, err := crypto.InitNewIdentity(ctx, nil)
	if err != nil {
		t.Fatalf("can't create new identity")
	}

	return c, privateKey
}

func createTwoDevices(ctx context.Context, t *testing.T) (*handshakeSession, crypto.Manager, *handshakeSession, crypto.Manager) {
	t.Helper()

	c1, pk1 := createNewIdentity(ctx, t)
	c2, pk2 := createNewIdentity(ctx, t)

	accountPublicKey, err := c2.GetAccountPublicKey()
	if err != nil {
		t.Fatalf("can't get public key for account")
	}

	hss1, err := newCryptoRequest(pk1, c1.GetSigChain(), accountPublicKey, nil)
	if err != nil || hss1 == nil {
		t.Fatalf("can't get crypto request for c1")
	}

	sign, box := hss1.GetPublicKeys()

	hss2, err := newCryptoResponse(pk2, c2.GetSigChain(), nil)
	if err != nil || hss2 == nil {
		t.Fatalf("can't get crypto request for c2")
	}

	err = hss2.SetOtherKeys(sign, box)
	if err != nil {
		t.Fatalf("can't set other keys on hss2")
	}

	sign, box = hss2.GetPublicKeys()
	err = hss1.SetOtherKeys(sign, box)
	if err != nil {
		t.Fatalf("can't set other keys on hss1")
	}

	return hss1, c1, hss2, c2
}

func TestNewHandshakeModule(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	_, _ = createNewIdentity(ctx, t)
}

func TestModule_NewRequest(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c1, pk1 := createNewIdentity(ctx, t)
	c2, _ := createNewIdentity(ctx, t)

	accountPubKey, err := c2.GetAccountPublicKey()
	if err != nil {
		t.Fatalf("can't get account public key for c2")
	}

	hss, err := newCryptoRequest(pk1, c1.GetSigChain(), accountPubKey, nil)
	if err != nil || hss == nil {
		t.Fatalf("can't get initiate crypto handshake request")
	}
}

func TestModule_NewResponse(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c1, pk1 := createNewIdentity(ctx, t)
	c2, pk2 := createNewIdentity(ctx, t)

	accountPubKey, err := c2.GetAccountPublicKey()
	if err != nil {
		t.Fatalf("err should be nil")
	}

	hss1, err := newCryptoRequest(pk1, c1.GetSigChain(), accountPubKey, nil)
	if err != nil || hss1 == nil {
		t.Fatalf("err should be nil")
	}

	sign, box := hss1.GetPublicKeys()

	hss2, err := newCryptoResponse(pk2, c2.GetSigChain(), nil)
	if err != nil || hss2 == nil {
		t.Fatalf("err should be nil")
	}

	err = hss2.SetOtherKeys(sign, box)
	if err != nil {
		t.Fatalf("err should be nil")
	}
}

func TestHandshakeSession_SetOtherKeys(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(ctx, t)
	sign, box := hss2.GetPublicKeys()
	err := hss1.SetOtherKeys(sign, box)
	if err != nil {
		t.Fatalf("err should be nil")
	}

	err = hss1.SetOtherKeys(sign, box[0:3])
	if err == nil {
		t.Fatalf("err should not be nil")
	}

	_, badSigningPubKey, err := p2pcrypto.GenerateSecp256k1Key(rand.Reader)
	if err != nil {
		t.Fatalf("err should be nil")
	}

	err = hss1.SetOtherKeys(badSigningPubKey, box)
	if err == nil {
		t.Fatalf("err should not be nil")
	}
}

func TestHandshakeSession_GetPublicKeys(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, _, _ := createTwoDevices(ctx, t)
	sign, box := hss1.GetPublicKeys()

	if int(sign.Type()) != SupportedKeyType || len(box) != 32 {
		t.Fatalf("public keys seems improperly returned")
	}
}

func TestHandshakeSession_ProveOtherKey_CheckOwnKeyProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(ctx, t)
	proof, err := hss1.ProveOtherKey()

	if err != nil {
		t.Fatalf("err should be nil")
	}

	err = hss2.CheckOwnKeyProof(proof)

	if err != nil {
		t.Fatalf("err should be nil")
	}

	err = hss2.CheckOwnKeyProof([]byte("oops"))

	if err == nil {
		t.Fatalf("err should not be nil")
	}
}

func TestHandshakeSession_ProveOwnDeviceKey_CheckOtherKeyProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, c1, hss2, c2 := createTwoDevices(ctx, t)
	proof, err := hss1.ProveOwnDeviceKey()

	if err != nil {
		t.Fatalf("err should be nil")
	}

	// Correct
	err = hss2.CheckOtherKeyProof(proof, c1.GetSigChain(), c1.GetDevicePublicKey())
	if err != nil {
		t.Fatalf("err should be nil")
	}

	// Wrong signature
	err = hss2.CheckOtherKeyProof([]byte("oops"), c1.GetSigChain(), c1.GetDevicePublicKey())
	if err == nil {
		t.Fatalf("err should not be nil")
	}

	// Wrong sig chain
	err = hss2.CheckOtherKeyProof(proof, c2.GetSigChain(), c1.GetDevicePublicKey())
	if err == nil {
		t.Fatalf("err should not be nil")
	}

	// Key not found in sig chain
	err = hss1.CheckOtherKeyProof(proof, c1.GetSigChain(), c1.GetDevicePublicKey())
	if err == nil {
		t.Fatalf("err should not be nil")
	}
}

func TestHandshakeSession_ProveOtherKnownAccount_CheckOwnKnownAccountProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, c1, hss2, _ := createTwoDevices(ctx, t)
	proof, err := hss1.ProveOtherKnownAccount()

	if err != nil {
		t.Fatalf("can't prove other known account")
	}

	err = hss2.CheckOwnKnownAccountProof(c1.GetDevicePublicKey(), proof)
	if err != nil {
		t.Fatalf("can't check self account proof")
	}
}

func TestHandshakeSession_Encrypt_Decrypt(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	testData1 := []byte("test1")
	testData2 := []byte("test2")
	testData3 := []byte("test3")

	hss1, _, hss2, _ := createTwoDevices(ctx, t)

	// Should be able to encode the message
	encrypted, err := hss1.Encrypt(testData1)
	if err != nil || len(encrypted) == 0 || string(testData1) == string(encrypted) {
		t.Fatalf("err should be nil and encrypted should not be empty, encrypted value should not be clear text")
	}

	// Should decode the message properly
	decrypted, err := hss2.Decrypt(encrypted)
	if err != nil || string(testData1) != string(decrypted) {
		t.Fatalf("err should be nil and decrypted should equal testData1")
	}

	// Should not decode the message twice
	decrypted, err = hss2.Decrypt(encrypted)
	if err != ErrDecrypt || string(decrypted) != "" {
		t.Fatalf("err should be ErrDecrypt and decrypted should be empty")
	}

	// Should not decode a random string
	decrypted, err = hss2.Decrypt([]byte("blahblah"))
	if err != ErrDecrypt || string(decrypted) != "" {
		t.Fatalf("err should be ErrDecrypt and decrypted should be empty")
	}

	// Should be able to encode a second message
	encrypted2, err := hss1.Encrypt(testData2)
	if err != nil || len(encrypted2) == 0 || string(testData2) == string(encrypted2) {
		t.Fatalf("err should be nil and encrypted2 should not be empty, encrypted2 value should not be clear text")
	}

	// Should decode the second message properly
	decrypted, err = hss2.Decrypt(encrypted2)
	if err != nil || string(testData2) != string(decrypted) {
		t.Fatalf("err should be nil and decrypted should equal testData2")
	}

	// Should be able to encode a message from second peer
	encrypted3, err := hss2.Encrypt(testData3)
	if err != nil || len(encrypted3) == 0 || string(testData3) == string(encrypted3) {
		t.Fatalf("err should be nil and encrypted3 should not be empty, encrypted3 value should not be clear text")
	}

	// Should decode the third message properly
	decrypted, err = hss1.Decrypt(encrypted3)
	if err != nil || string(testData3) != string(decrypted) {
		t.Fatalf("err should be nil and decrypted should equal testData3")
	}
}

func TestHandshakeSession_Close(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(ctx, t)
	if err := hss1.Close(); err != nil {
		t.Fatalf("can't close hss1 properly")
	}

	if err := hss2.Close(); err != nil {
		t.Fatalf("can't close hss2 properly")
	}
}
