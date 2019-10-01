package cryptohandshake_test

import (
	"context"
	"crypto/rand"
	"testing"

	"berty.tech/go/internal/cryptohandshake"

	"berty.tech/go/pkg/iface"

	p2pCrypto "github.com/libp2p/go-libp2p-core/crypto"

	"github.com/stretchr/testify/assert"

	"berty.tech/go/internal/crypto"
)

func createNewIdentity(t *testing.T, ctx context.Context) (iface.Crypto, p2pCrypto.PrivKey) {
	// TODO
	ds := &struct{ TODO int }{}

	c, privateKey, err := crypto.InitNewIdentity(ctx, ds)
	assert.Nil(t, err)

	return c, privateKey
}

func createTwoDevices(t *testing.T, ctx context.Context) (iface.HandshakeSession, iface.Crypto, iface.HandshakeSession, iface.Crypto) {
	c1, pk1 := createNewIdentity(t, ctx)
	c2, pk2 := createNewIdentity(t, ctx)

	accountPublicKey, err := c2.GetAccountPublicKey()
	assert.Nil(t, err)

	hss1, err := cryptohandshake.NewRequest(pk1, c1.GetSigChain(), accountPublicKey)
	assert.Nil(t, err)
	assert.NotNil(t, hss1)

	sign, box := hss1.GetPublicKeys()
	signBytes, err := sign.Bytes()
	assert.Nil(t, err)

	hss2, err := cryptohandshake.NewResponse(pk2, c2.GetSigChain(), signBytes, box)
	assert.Nil(t, err)
	assert.NotNil(t, hss2)

	sign, box = hss2.GetPublicKeys()
	err = hss1.SetOtherKeys(sign, box)
	assert.Nil(t, err)

	return hss1, c1, hss2, c2
}

func TestNewHandshakeModule(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	_, _ = createNewIdentity(t, ctx)
}

func TestModule_NewRequest(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c1, pk1 := createNewIdentity(t, ctx)
	c2, _ := createNewIdentity(t, ctx)

	accountPubKey, err := c2.GetAccountPublicKey()
	assert.Nil(t, err)

	hss, err := cryptohandshake.NewRequest(pk1, c1.GetSigChain(), accountPubKey)
	assert.Nil(t, err)
	assert.NotNil(t, hss)
}

func TestModule_NewResponse(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c1, pk1 := createNewIdentity(t, ctx)
	c2, pk2 := createNewIdentity(t, ctx)

	accountPubKey, err := c2.GetAccountPublicKey()
	assert.Nil(t, err)

	hss1, err := cryptohandshake.NewRequest(pk1, c1.GetSigChain(), accountPubKey)
	assert.Nil(t, err)
	assert.NotNil(t, hss1)

	sign, box := hss1.GetPublicKeys()
	signBytes, err := sign.Bytes()
	assert.Nil(t, err)

	hss2, err := cryptohandshake.NewResponse(pk2, c2.GetSigChain(), signBytes, box)
	assert.Nil(t, err)
	assert.NotNil(t, hss2)
}

func TestHandshakeSession_SetOtherKeys(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(t, ctx)
	sign, box := hss2.GetPublicKeys()
	err := hss1.SetOtherKeys(sign, box)
	assert.Nil(t, err)

	err = hss1.SetOtherKeys(sign, box[0:3])
	assert.NotNil(t, err)

	_, badSigningPubKey, err := p2pCrypto.GenerateSecp256k1Key(rand.Reader)
	assert.Nil(t, err)

	err = hss1.SetOtherKeys(badSigningPubKey, box)
	assert.NotNil(t, err)
}

func TestHandshakeSession_GetPublicKeys(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, _, _ := createTwoDevices(t, ctx)
	sign, box := hss1.GetPublicKeys()

	assert.Equal(t, int(sign.Type()), cryptohandshake.SupportedKeyType)
	assert.Len(t, box, 32)
}

func TestHandshakeSession_ProveOtherKey_CheckOwnKeyProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(t, ctx)
	proof, err := hss1.ProveOtherKey()

	assert.Nil(t, err)

	err = hss2.CheckOwnKeyProof(proof)

	assert.Nil(t, err)

	err = hss2.CheckOwnKeyProof([]byte("oops"))

	assert.NotNil(t, err)
}

func TestHandshakeSession_ProveOwnDeviceKey_CheckOtherKeyProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, c1, hss2, c2 := createTwoDevices(t, ctx)
	proof, err := hss1.ProveOwnDeviceKey()

	assert.Nil(t, err)

	// Correct
	err = hss2.CheckOtherKeyProof(proof, c1.GetSigChain(), c1.GetDevicePublicKey())
	assert.Nil(t, err)

	// Wrong signature
	err = hss2.CheckOtherKeyProof([]byte("oops"), c1.GetSigChain(), c1.GetDevicePublicKey())
	assert.NotNil(t, err)

	// Wrong sig chain
	err = hss2.CheckOtherKeyProof(proof, c2.GetSigChain(), c1.GetDevicePublicKey())
	assert.NotNil(t, err)

	// Key not found in sig chain
	err = hss1.CheckOtherKeyProof(proof, c1.GetSigChain(), c1.GetDevicePublicKey())
	assert.NotNil(t, err)
}

func TestHandshakeSession_ProveOtherKnownAccount_CheckOwnKnownAccountProof(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, c1, hss2, _ := createTwoDevices(t, ctx)
	proof, err := hss1.ProveOtherKnownAccount()

	assert.Nil(t, err)

	err = hss2.CheckOwnKnownAccountProof(c1.GetDevicePublicKey(), proof)
	assert.Nil(t, err)
}

func TestHandshakeSession_Encrypt_Decrypt(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	testData1 := []byte("test1")
	testData2 := []byte("test2")
	testData3 := []byte("test3")

	hss1, _, hss2, _ := createTwoDevices(t, ctx)

	// Should be able to encode the message
	encrypted, err := hss1.Encrypt(testData1)
	assert.Nil(t, err)
	assert.NotNil(t, encrypted)
	assert.NotEmpty(t, encrypted)

	// Should decode the message properly
	decrypted, err := hss2.Decrypt(encrypted)
	assert.Nil(t, err)
	assert.Equal(t, string(testData1), string(decrypted))

	// Should not decode the message twice
	decrypted, err = hss2.Decrypt(encrypted)
	assert.NotNil(t, err)
	assert.NotEqual(t, string(testData1), string(decrypted))

	// Should not decode a random string
	decrypted, err = hss2.Decrypt([]byte("blahblah"))
	assert.NotNil(t, err)
	assert.NotEqual(t, string(testData1), string(decrypted))

	// Should be able to encode a second message
	encrypted2, err := hss1.Encrypt(testData2)
	assert.Nil(t, err)
	assert.NotNil(t, encrypted)
	assert.NotEmpty(t, encrypted)
	assert.NotEqual(t, string(encrypted), string(encrypted2))

	// Should decode the second message properly
	decrypted, err = hss2.Decrypt(encrypted2)
	assert.Nil(t, err)
	assert.Equal(t, string(testData2), string(decrypted))

	// Should be able to encode a message from second peer
	encrypted3, err := hss2.Encrypt(testData3)
	assert.Nil(t, err)
	assert.NotNil(t, encrypted2)
	assert.NotEmpty(t, encrypted2)
	assert.NotEqual(t, string(encrypted2), string(encrypted3))

	// Should decode the third message properly
	decrypted, err = hss1.Decrypt(encrypted3)
	assert.Nil(t, err)
	assert.Equal(t, string(testData3), string(decrypted))

}

func TestHandshakeSession_Close(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hss1, _, hss2, _ := createTwoDevices(t, ctx)
	assert.Nil(t, hss1.Close())
	assert.Nil(t, hss2.Close())
}
