package handshake

import (
	"context"
	"crypto/rand"
	"testing"

	"berty.tech/berty/go/internal/crypto"
	"berty.tech/berty/go/pkg/errcode"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/assert"
)

func createNewIdentity(ctx context.Context, t *testing.T) (crypto.Manager, p2pcrypto.PrivKey) {
	t.Helper()

	c, privateKey, err := crypto.InitNewIdentity(ctx, nil)
	checkErr(t, err, "can't create new identity")

	return c, privateKey
}

func createTwoDevices(ctx context.Context, t *testing.T) (*handshakeSession, crypto.Manager, *handshakeSession, crypto.Manager) {
	t.Helper()

	c1, pk1 := createNewIdentity(ctx, t)
	c2, pk2 := createNewIdentity(ctx, t)

	accountPublicKey, err := c2.GetAccountPublicKey()
	checkErr(t, err, "can't get public key for account")

	hss1, err := newCryptoRequest(pk1, c1.GetSigChain(), accountPublicKey, nil)
	checkErr(t, err, "can't get crypto request for c1")
	assert.NotNil(t, hss1)

	sign, box := hss1.GetPublicKeys()

	hss2, err := newCryptoResponse(pk2, c2.GetSigChain(), nil)
	checkErr(t, err, "can't get crypto request for c2")
	assert.NotNil(t, hss2)

	err = hss2.SetOtherKeys(sign, box)
	checkErr(t, err, "can't set other keys on hss2")

	sign, box = hss2.GetPublicKeys()
	err = hss1.SetOtherKeys(sign, box)
	checkErr(t, err, "can't set other keys on hss1")

	return hss1, c1, hss2, c2
}

func TestNewHandshakeModule(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	manager, privKey := createNewIdentity(ctx, t)
	assert.NotNil(t, manager)
	assert.NotNil(t, privKey)
}

func TestModule_NewRequest(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c1, pk1 := createNewIdentity(ctx, t)
	c2, _ := createNewIdentity(ctx, t)

	accountPubKey, err := c2.GetAccountPublicKey()
	checkErr(t, err, "can't get account public key for c2")

	hss, err := newCryptoRequest(pk1, c1.GetSigChain(), accountPubKey, nil)
	checkErr(t, err, "can't get initiate crypto handshake request")
	assert.NotNil(t, hss)
}

func TestModule_NewResponse(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c1, pk1 := createNewIdentity(ctx, t)
	c2, pk2 := createNewIdentity(ctx, t)

	accountPubKey, err := c2.GetAccountPublicKey()
	checkErr(t, err)

	hss1, err := newCryptoRequest(pk1, c1.GetSigChain(), accountPubKey, nil)
	checkErr(t, err)

	sign, box := hss1.GetPublicKeys()

	hss2, err := newCryptoResponse(pk2, c2.GetSigChain(), nil)
	checkErr(t, err)

	err = hss2.SetOtherKeys(sign, box)
	checkErr(t, err)
}

func TestHandshakeSession_SetOtherKeys(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(ctx, t)
	sign, box := hss2.GetPublicKeys()
	err := hss1.SetOtherKeys(sign, box)
	assert.NoError(t, err)

	err = hss1.SetOtherKeys(sign, box[0:3])
	assert.NotNil(t, err)

	_, badSigningPubKey, err := p2pcrypto.GenerateSecp256k1Key(rand.Reader)
	assert.NoError(t, err)

	err = hss1.SetOtherKeys(badSigningPubKey, box)
	assert.NotNil(t, err)
}

func TestHandshakeSession_GetPublicKeys(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, _, _ := createTwoDevices(ctx, t)
	sign, box := hss1.GetPublicKeys()

	assert.Equal(t, SupportedKeyType, int(sign.Type()))
	assert.Len(t, box, 32)
}

func TestHandshakeSession_ProveOtherKey_CheckOwnKeyProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(ctx, t)
	proof, err := hss1.ProveOtherKey()
	checkErr(t, err)

	err = hss2.CheckOwnKeyProof(proof)
	checkErr(t, err)

	err = hss2.CheckOwnKeyProof([]byte("oops"))
	testSameErrcodes(t, errcode.ErrHandshakeInvalidSignature, err)
}

func TestHandshakeSession_ProveOwnDeviceKey_CheckOtherKeyProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, c1, hss2, c2 := createTwoDevices(ctx, t)
	proof, err := hss1.ProveOwnDeviceKey()
	checkErr(t, err)

	// Correct
	err = hss2.CheckOtherKeyProof(proof, c1.GetSigChain(), c1.GetDevicePublicKey())
	checkErr(t, err)

	// Wrong signature
	err = hss2.CheckOtherKeyProof([]byte("oops"), c1.GetSigChain(), c1.GetDevicePublicKey())
	testSameErrcodes(t, errcode.ErrHandshakeInvalidSignature, err)

	// Wrong sig chain
	err = hss2.CheckOtherKeyProof(proof, c2.GetSigChain(), c1.GetDevicePublicKey())
	testSameErrcodes(t, errcode.ErrHandshakeInvalidSignature, err)

	// Key not found in sig chain
	err = hss1.CheckOtherKeyProof(proof, c1.GetSigChain(), c1.GetDevicePublicKey())
	testSameErrcodes(t, errcode.ErrHandshakeInvalidSignature, err)
}

func TestHandshakeSession_ProveOtherKnownAccount_CheckOwnKnownAccountProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, c1, hss2, _ := createTwoDevices(ctx, t)
	proof, err := hss1.ProveOtherKnownAccount()
	checkErr(t, err, "can't prove other known account")

	err = hss2.CheckOwnKnownAccountProof(c1.GetDevicePublicKey(), proof)
	checkErr(t, err, "can't check self account proof")
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
	checkErr(t, err)
	assert.NotEmpty(t, encrypted)
	assert.NotEqual(t, testData1, encrypted)

	// Should decode the message properly
	decrypted, err := hss2.Decrypt(encrypted)
	checkErr(t, err)
	assert.Equal(t, testData1, decrypted)

	// Should not decode the message twice
	decrypted, err = hss2.Decrypt(encrypted)
	assert.Equal(t, errcode.ErrHandshakeDecrypt, err)
	assert.Empty(t, decrypted)

	// Should not decode a random string
	decrypted, err = hss2.Decrypt([]byte("blahblah"))
	testSameErrcodes(t, errcode.ErrHandshakeDecrypt, err)
	assert.Empty(t, decrypted)

	// Should be able to encode a second message
	encrypted2, err := hss1.Encrypt(testData2)
	assert.NoError(t, err)
	assert.NotEmpty(t, encrypted2)
	assert.NotEqual(t, testData2, encrypted2)

	// Should decode the second message properly
	decrypted, err = hss2.Decrypt(encrypted2)
	assert.NoError(t, err)
	assert.Equal(t, testData2, decrypted)

	// Should be able to encode a message from second peer
	encrypted3, err := hss2.Encrypt(testData3)
	assert.NoError(t, err)
	assert.NotEmpty(t, encrypted3)
	assert.NotEqual(t, testData3, encrypted3)

	// Should decode the third message properly
	decrypted, err = hss1.Decrypt(encrypted3)
	assert.NoError(t, err)
	assert.Equal(t, testData3, decrypted)
}

func TestHandshakeSession_Close(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(ctx, t)
	err := hss1.Close()
	checkErr(t, err)

	err = hss2.Close()
	checkErr(t, err)
}
