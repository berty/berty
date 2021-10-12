package bertyauth

import (
	"crypto/ed25519"
	crand "crypto/rand"
	"testing"

	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/cryptoutil"
)

func HelperGenerateTokenIssuerSecrets(t *testing.T) ([]byte, ed25519.PublicKey, ed25519.PrivateKey) {
	t.Helper()

	pk, sk, err := ed25519.GenerateKey(crand.Reader)
	require.NoError(t, err)

	secret := make([]byte, cryptoutil.KeySize)
	_, err = crand.Read(secret)
	require.NoError(t, err)

	return secret, pk, sk
}
