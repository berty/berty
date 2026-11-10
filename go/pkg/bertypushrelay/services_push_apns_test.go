package bertypushrelay

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	crand "crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"math/big"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/sideshow/apns2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/pushtypes"
)

// writeTestAuthKey writes a P-256 key in the PKCS#8 PEM format of an APNs .p8 key.
func writeTestAuthKey(t *testing.T) (string, *ecdsa.PrivateKey) {
	t.Helper()

	key, err := ecdsa.GenerateKey(elliptic.P256(), crand.Reader)
	require.NoError(t, err)

	der, err := x509.MarshalPKCS8PrivateKey(key)
	require.NoError(t, err)

	path := filepath.Join(t.TempDir(), "AuthKey_TESTKEYID1.p8")
	require.NoError(t, os.WriteFile(path, pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: der}), 0o600))

	return path, key
}

func TestPushDispatcherLoadAPNSAuthKey_Disabled(t *testing.T) {
	dispatchers, err := PushDispatcherLoadAPNSAuthKey(zap.NewNop(), APNSAuthKeyConfig{})
	require.NoError(t, err)
	require.Empty(t, dispatchers)
}

func TestPushDispatcherLoadAPNSAuthKey_InvalidConfig(t *testing.T) {
	keyPath, _ := writeTestAuthKey(t)

	invalidKeyPath := filepath.Join(t.TempDir(), "invalid.p8")
	require.NoError(t, os.WriteFile(invalidKeyPath, []byte("not a key"), 0o600))

	valid := APNSAuthKeyConfig{
		KeyPath:             keyPath,
		KeyID:               "TESTKEYID1",
		TeamID:              "TESTTEAMID",
		ProductionBundleIDs: []string{"tech.berty.ios"},
	}

	cases := map[string]func(c *APNSAuthKeyConfig){
		"missing key path":       func(c *APNSAuthKeyConfig) { c.KeyPath = "" },
		"missing key ID":         func(c *APNSAuthKeyConfig) { c.KeyID = "" },
		"missing team ID":        func(c *APNSAuthKeyConfig) { c.TeamID = "" },
		"no bundle ID":           func(c *APNSAuthKeyConfig) { c.ProductionBundleIDs = nil },
		"key file not found":     func(c *APNSAuthKeyConfig) { c.KeyPath = filepath.Join(t.TempDir(), "missing.p8") },
		"invalid key file":       func(c *APNSAuthKeyConfig) { c.KeyPath = invalidKeyPath },
		"empty bundle ID":        func(c *APNSAuthKeyConfig) { c.ProductionBundleIDs = []string{""} },
		"duplicated bundle ID":   func(c *APNSAuthKeyConfig) { c.SandboxBundleIDs = []string{"tech.berty.ios"} },
		"bundle ID listed twice": func(c *APNSAuthKeyConfig) { c.ProductionBundleIDs = []string{"a", "a"} },
	}

	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			cfg := valid
			mutate(&cfg)

			dispatchers, err := PushDispatcherLoadAPNSAuthKey(zap.NewNop(), cfg)
			require.Error(t, err)
			require.Nil(t, dispatchers)
		})
	}
}

func TestPushDispatcherLoadAPNSAuthKey_Dispatchers(t *testing.T) {
	keyPath, _ := writeTestAuthKey(t)

	dispatchers, err := PushDispatcherLoadAPNSAuthKey(zap.NewNop(), APNSAuthKeyConfig{
		KeyPath:             keyPath,
		KeyID:               "TESTKEYID1",
		TeamID:              "TESTTEAMID",
		ProductionBundleIDs: []string{"tech.berty.ios", "tech.berty.ios.staff"},
		SandboxBundleIDs:    []string{"tech.berty.ios.debug"},
	})
	require.NoError(t, err)
	require.Len(t, dispatchers, 3)

	hosts := map[string]string{}
	for _, d := range dispatchers {
		assert.Equal(t, pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService, d.TokenType())
		apnsDispatcher, ok := d.(*pushDispatcherAPNS)
		require.True(t, ok)
		require.NotNil(t, apnsDispatcher.client.Token, "expected a token-based client")
		hosts[d.BundleID()] = apnsDispatcher.client.Host
	}

	assert.Equal(t, map[string]string{
		"tech.berty.ios":       apns2.HostProduction,
		"tech.berty.ios.staff": apns2.HostProduction,
		"tech.berty.ios.debug": apns2.HostDevelopment,
	}, hosts)

	// the dispatchers can be registered alongside each other
	_, supported, err := PushServiceGenerateDispatchers(dispatchers)
	require.NoError(t, err)
	require.Len(t, supported, 3)
}

func TestPushDispatcherLoadAPNSAuthKey_Dispatch(t *testing.T) {
	keyPath, key := writeTestAuthKey(t)
	deviceToken := []byte{0xde, 0xad, 0xbe, 0xef}

	type received struct {
		path, topic, pushType, authorization string
		payload                              map[string]interface{}
	}
	requests := make(chan received, 1)

	server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]interface{}
		_ = json.NewDecoder(r.Body).Decode(&payload)
		requests <- received{
			path:          r.URL.Path,
			topic:         r.Header.Get("apns-topic"),
			pushType:      r.Header.Get("apns-push-type"),
			authorization: r.Header.Get("authorization"),
			payload:       payload,
		}
		w.WriteHeader(http.StatusOK)
	}))
	server.EnableHTTP2 = true
	server.StartTLS()
	defer server.Close()

	dispatchers, err := PushDispatcherLoadAPNSAuthKey(zap.NewNop(), APNSAuthKeyConfig{
		KeyPath:             keyPath,
		KeyID:               "TESTKEYID1",
		TeamID:              "TESTTEAMID",
		ProductionBundleIDs: []string{"tech.berty.ios"},
	})
	require.NoError(t, err)
	require.Len(t, dispatchers, 1)

	dispatcher := dispatchers[0].(*pushDispatcherAPNS)
	dispatcher.client.Host = server.URL
	dispatcher.client.HTTPClient = server.Client()

	require.NoError(t, dispatcher.Dispatch([]byte("encrypted payload"), &pushtypes.PushServiceReceiver{
		TokenType:          pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
		BundleId:           "tech.berty.ios",
		Token:              deviceToken,
		RecipientPublicKey: nil,
	}))

	req := <-requests
	assert.Equal(t, "/3/device/"+hex.EncodeToString(deviceToken), req.path)
	assert.Equal(t, "tech.berty.ios", req.topic)
	assert.Equal(t, "alert", req.pushType)
	assert.Equal(t, base64.RawURLEncoding.EncodeToString([]byte("encrypted payload")), req.payload[pushtypes.ServicePushPayloadKey])

	// the bearer token is an ES256 JWT signed with the .p8 key, identifying the key and the team
	require.True(t, strings.HasPrefix(req.authorization, "bearer "), req.authorization)
	parts := strings.Split(strings.TrimPrefix(req.authorization, "bearer "), ".")
	require.Len(t, parts, 3)

	var header, claims map[string]interface{}
	decodeJWTPart(t, parts[0], &header)
	decodeJWTPart(t, parts[1], &claims)
	assert.Equal(t, "ES256", header["alg"])
	assert.Equal(t, "TESTKEYID1", header["kid"])
	assert.Equal(t, "TESTTEAMID", claims["iss"])

	sig, err := base64.RawURLEncoding.DecodeString(parts[2])
	require.NoError(t, err)
	require.Len(t, sig, 64)
	digest := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
	r, s := new(big.Int).SetBytes(sig[:32]), new(big.Int).SetBytes(sig[32:])
	assert.True(t, ecdsa.Verify(&key.PublicKey, digest[:], r, s), "JWT not signed with the .p8 key")
}

func decodeJWTPart(t *testing.T, part string, out interface{}) {
	t.Helper()

	raw, err := base64.RawURLEncoding.DecodeString(part)
	require.NoError(t, err)
	require.NoError(t, json.Unmarshal(raw, out))
}
