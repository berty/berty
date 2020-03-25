package handshake

import (
	"crypto/rand"
	"testing"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createNewIdentity(t *testing.T) crypto.PrivKey {
	t.Helper()

	sk, _, err := crypto.GenerateEd25519Key(rand.Reader)
	require.NoError(t, err, "can't create new identity")

	return sk
}

func createTwoDevices(t *testing.T) (*handshakeSession, *handshakeSession) {
	t.Helper()

	sk1 := createNewIdentity(t)
	sk2 := createNewIdentity(t)

	hss1, err := newCryptoRequest(sk1, sk2.GetPublic())
	require.NoError(t, err, "can't get crypto request for c1")
	assert.NotNil(t, hss1)

	sign, box := hss1.GetPublicKeys()

	hss2, err := newCryptoResponse(sk2)
	require.NoError(t, err, "can't get crypto request for c2")
	assert.NotNil(t, hss2)

	err = hss2.SetOtherKeys(sign, box)
	require.NoError(t, err, "can't set other keys on hss2")

	sign, box = hss2.GetPublicKeys()
	err = hss1.SetOtherKeys(sign, box)
	require.NoError(t, err, "can't set other keys on hss1")

	return hss1, hss2
}

func TestNewHandshakeModule(t *testing.T) {
	sk := createNewIdentity(t)
	assert.NotNil(t, sk)
}

func TestModule_NewRequest(t *testing.T) {
	sk1 := createNewIdentity(t)
	sk2 := createNewIdentity(t)

	hss, err := newCryptoRequest(sk1, sk2.GetPublic())
	require.NoError(t, err, "can't get initiate crypto handshake request")
	assert.NotNil(t, hss)
}

func TestModule_NewResponse(t *testing.T) {
	sk1 := createNewIdentity(t)
	sk2 := createNewIdentity(t)

	hss1, err := newCryptoRequest(sk1, sk2.GetPublic())
	require.NoError(t, err)

	sign, box := hss1.GetPublicKeys()

	hss2, err := newCryptoResponse(sk2)
	require.NoError(t, err)

	err = hss2.SetOtherKeys(sign, box)
	require.NoError(t, err)
}

func TestHandshakeSession_SetOtherKeys(t *testing.T) {
	hss1, hss2 := createTwoDevices(t)
	sign, box := hss2.GetPublicKeys()
	err := hss1.SetOtherKeys(sign, box)
	assert.NoError(t, err)

	err = hss1.SetOtherKeys(sign, box[0:3])
	assert.NotNil(t, err)

	_, badSigningPubKey, err := crypto.GenerateSecp256k1Key(rand.Reader)
	assert.NoError(t, err)

	err = hss1.SetOtherKeys(badSigningPubKey, box)
	assert.NotNil(t, err)
}

func TestHandshakeSession_GetPublicKeys(t *testing.T) {
	hss1, _ := createTwoDevices(t)
	sign, box := hss1.GetPublicKeys()

	assert.Equal(t, SupportedKeyType, int(sign.Type()))
	assert.Len(t, box, 32)
}

func TestHandshakeSession_ProveOtherKey_CheckOwnKeyProof(t *testing.T) {
	hss1, hss2 := createTwoDevices(t)
	proof, err := hss1.ProveOtherKey()
	require.NoError(t, err)

	err = hss2.CheckOwnKeyProof(proof)
	require.NoError(t, err)

	err = hss2.CheckOwnKeyProof([]byte("oops"))
	testSameErrcodes(t, errcode.ErrHandshakeInvalidSignature, err)
}

func TestHandshakeSession_ProveOwnDeviceKey_CheckOtherKeyProof(t *testing.T) {
	hss1, hss2 := createTwoDevices(t)
	proof, err := hss1.ProveOwnAccountKey()
	require.NoError(t, err)

	// Correct
	err = hss2.CheckOtherKeyProof(proof, hss1.ownAccountSK.GetPublic())
	require.NoError(t, err)

	// Wrong signature
	err = hss2.CheckOtherKeyProof([]byte("oops"), hss1.ownAccountSK.GetPublic())
	testSameErrcodes(t, errcode.ErrHandshakeInvalidSignature, err)

	// Key not found in sig chain
	err = hss1.CheckOtherKeyProof(proof, hss1.ownAccountSK.GetPublic())
	testSameErrcodes(t, errcode.ErrHandshakeInvalidSignature, err)
}

func TestHandshakeSession_Encrypt_Decrypt(t *testing.T) {
	testData1 := []byte("test1")
	testData2 := []byte("test2")
	testData3 := []byte("test3")

	hss1, hss2 := createTwoDevices(t)

	// Should be able to encode the message
	encrypted, err := hss1.Encrypt(testData1)
	require.NoError(t, err)
	assert.NotEmpty(t, encrypted)
	assert.NotEqual(t, testData1, encrypted)

	// Should decode the message properly
	decrypted, err := hss2.Decrypt(encrypted)
	require.NoError(t, err)
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
	hss1, hss2 := createTwoDevices(t)
	err := hss1.Close()
	require.NoError(t, err)

	err = hss2.Close()
	require.NoError(t, err)
}
