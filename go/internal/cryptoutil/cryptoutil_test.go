package cryptoutil

import (
	"crypto/aes"
	"crypto/rand"
	"testing"

	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/pkg/errcode"
)

func TestSeedFromEd25519PrivateKey(t *testing.T) {
	priv, _, _ := crypto.GenerateECDSAKeyPair(rand.Reader)
	_, err := SeedFromEd25519PrivateKey(priv)
	if err != errcode.ErrInvalidInput {
		t.Error("Should fail with ErrInvalidInput")
	}
	priv, _, _ = crypto.GenerateEd25519Key(rand.Reader)
	_, err = SeedFromEd25519PrivateKey(priv)
	if err != nil {
		t.Error(err)
	}
}

func TestEdwardsToMontgomeryPub(t *testing.T) {
	_, pub, _ := crypto.GenerateEd25519Key(rand.Reader)
	_, err := EdwardsToMontgomeryPub(pub)
	if err != nil {
		t.Error(err)
	}
	_, pub, _ = crypto.GenerateECDSAKeyPair(rand.Reader)
	_, err = EdwardsToMontgomeryPub(pub)
	if err != errcode.ErrInvalidInput {
		t.Error("Should fail with ErrInvalidInput")
	}
}

func TestEdwardsToMontgomeryPriv(t *testing.T) {
	priv, _, _ := crypto.GenerateEd25519Key(rand.Reader)
	_, err := EdwardsToMontgomeryPriv(priv)
	if err != nil {
		t.Error(err)
	}
	priv, _, _ = crypto.GenerateECDSAKeyPair(rand.Reader)
	_, err = EdwardsToMontgomeryPriv(priv)
	if err != errcode.ErrInvalidInput {
		t.Error("Should fail with ErrInvalidInput")
	}
}

func TestDeriveKey(t *testing.T) {
	cases := []struct {
		passphrase []byte
		salt       []byte
	}{
		{nil, nil},
		{[]byte{0x42}, []byte{0x42}},
		{nil, []byte{0x42}},
		{[]byte{0x42}, nil},
		{[]byte("hello world"), []byte("hello world")},
		{[]byte("morethan32bytes.................."), []byte("hello world")},
		{[]byte("hello world"), []byte("morethan32bytes..................")},
		{[]byte("morethan32bytes.................."), []byte("morethan32bytes..................")},
	}
	for _, tc := range cases {
		t.Run("", func(t *testing.T) {
			key, salt, err := DeriveKey(tc.passphrase, tc.salt)
			require.NoError(t, err)
			require.Equal(t, ScryptKeyLen, len(key))
			if tc.salt != nil {
				require.Equal(t, tc.salt, salt)
			}
			require.NotEqual(t, tc.passphrase, key)
		})
	}
}

func TestAESGCMEncryptDecrypt(t *testing.T) {
	var (
		passphrase = []byte("my priv4te k3y")
		salt       = []byte("my sup3r s3lt")
		message    = []byte("12345678901234567890123456789012")
	)
	key, salt, err := DeriveKey(passphrase, salt)
	require.NoError(t, err)
	require.Equal(t, salt, salt)
	require.NotEqual(t, passphrase, key)
	require.Equal(t, ScryptKeyLen, len(key))

	enc, err := AESGCMEncrypt(key, message)
	require.NoError(t, err)
	require.NotEqual(t, message, enc)

	dec, err := AESGCMDecrypt(key, enc)
	require.NoError(t, err)
	require.Equal(t, message, dec)
}

func TestAESCTRStream(t *testing.T) {
	var (
		passphrase = []byte("my priv4te k3y")
		message1   = []byte("hello world!")
		message2   = []byte("hi planet!")
		enc1       = make([]byte, len(message1))
		enc2       = make([]byte, len(message2))
	)

	// generate nonce with AES' blocksize
	nonce, err := GenerateNonceSize(aes.BlockSize)
	require.NoError(t, err)
	require.NotNil(t, nonce)

	// derive key for AES
	key, salt, err := DeriveKey(passphrase, nonce)
	require.NoError(t, err)
	require.NotNil(t, key)
	require.Equal(t, nonce, salt)

	// encrypt
	{
		stream, err := AESCTRStream(key, nonce)
		require.NoError(t, err)
		stream.XORKeyStream(enc1, message1)
		stream.XORKeyStream(enc2, message2)
		require.NotEqual(t, enc1, message1)
		require.NotEqual(t, enc2, message2)
		require.Equal(t, len(enc1), len(message1))
		require.Equal(t, len(enc2), len(message2))
	}

	// decrypt
	{
		var (
			dec1 = make([]byte, len(message1))
			dec2 = make([]byte, len(message2))
		)
		stream, err := AESCTRStream(key, nonce)
		require.NoError(t, err)
		stream.XORKeyStream(dec1, enc1)
		stream.XORKeyStream(dec2, enc2)
		require.Equal(t, dec1, message1)
		require.Equal(t, dec2, message2)
	}

	// silently failing invalid decrypt
	{
		invalidKey, _, err := DeriveKey([]byte("invalid passphrase"), nonce)
		var (
			dec1 = make([]byte, len(message1))
			dec2 = make([]byte, len(message2))
		)
		require.NoError(t, err)
		require.NotNil(t, invalidKey)
		stream, err := AESCTRStream(invalidKey, nonce)
		require.NoError(t, err)
		stream.XORKeyStream(dec1, enc1)
		stream.XORKeyStream(dec2, enc2)
		require.NotEqual(t, dec1, message1)
		require.NotEqual(t, dec2, message2)
		require.NotEqual(t, dec1, enc1)
		require.NotEqual(t, dec2, enc2)
		require.Equal(t, len(dec1), len(enc1))
		require.Equal(t, len(dec2), len(enc2))
	}
}
