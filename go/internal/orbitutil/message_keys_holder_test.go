package orbitutil

import (
	"context"
	cryptoRand "crypto/rand"
	"encoding/hex"
	"fmt"
	"math/rand"
	"os"
	"path"
	"testing"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/assert"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

func addDummyMemberInMetadataStore(ctx context.Context, t testing.TB, ms *metadataStore, memberPK crypto.PubKey, join bool) (crypto.PubKey, *bertyprotocol.DeviceSecret) {
	t.Helper()

	mSK, _, err := crypto.GenerateEd25519Key(cryptoRand.Reader)
	assert.NoError(t, err)

	dSK, _, err := crypto.GenerateEd25519Key(cryptoRand.Reader)
	assert.NoError(t, err)

	ds, err := group.NewDeviceSecret()
	assert.NoError(t, err)

	if join {
		_, err = ms.joinGroup(ctx, mSK, dSK)
		assert.NoError(t, err)
	}

	_, err = ms.sendSecret(ctx, dSK, memberPK, ds)
	assert.NoError(t, err)

	return dSK.GetPublic(), ds
}

func mustDeviceSecret(t testing.TB) func(ds *bertyprotocol.DeviceSecret, err error) *bertyprotocol.DeviceSecret {
	return func(ds *bertyprotocol.DeviceSecret, err error) *bertyprotocol.DeviceSecret {
		t.Helper()

		if err != nil {
			t.Fatal(err)
		}

		return ds
	}
}

func Test_ComputeKeysCache(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cachedKeysCount := 100

	groupSecretSeed := make([]byte, 32)

	_, err := rand.Read(groupSecretSeed)
	assert.NoError(t, err)

	g, gSK, err := group.New()
	assert.NoError(t, err)

	_ = gSK

	omd, err := group.NewOwnMemberDevice()
	assert.NoError(t, err)

	ds, err := group.NewDeviceSecret()
	assert.NoError(t, err)

	initialCounter := ds.Counter

	gc := NewGroupContext(g, omd)

	mkh, err := NewInMemoryMessageKeysHolder(ctx, gc, ds)
	assert.NoError(t, err)

	_, err = preComputeKeys(ctx, mkh, gc.GetDevicePrivKey().GetPublic(), ds)
	assert.NoError(t, err)

	dPK, err := convertPubKeyToStringID(omd.Device.GetPublic())
	assert.NoError(t, err)

	assert.Equal(t, 1, len(mkh.cache))
	assert.Equal(t, cachedKeysCount, len(mkh.cache[dPK]))

	assert.NotNil(t, mkh.cache[dPK][initialCounter+1])
	assert.NotNil(t, mkh.cache[dPK][initialCounter+2])
	assert.NotNil(t, mkh.cache[dPK][initialCounter+3])

	assert.NotEqual(t, mkh.cache[dPK][initialCounter+1], mkh.cache[dPK][initialCounter+2])
	assert.NotEqual(t, mkh.cache[dPK][initialCounter+2], mkh.cache[dPK][initialCounter+3])
}

func Test_EncryptMessagePayload(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	g, gSK, err := group.New()
	assert.NoError(t, err)

	_ = gSK

	omd1, err := group.NewOwnMemberDevice()
	assert.NoError(t, err)

	ds1, err := group.NewDeviceSecret()
	assert.NoError(t, err)

	ds2, err := group.NewDeviceSecret()
	assert.NoError(t, err)

	initialCounter := ds1.Counter
	firstSK := append([]byte(nil), ds1.ChainKey...)

	omd2, err := group.NewOwnMemberDevice()
	assert.NoError(t, err)

	gc1 := NewGroupContext(g, omd1)
	gc2 := NewGroupContext(g, omd2)

	mkh1, err := NewInMemoryMessageKeysHolder(ctx, gc1, ds1)
	assert.NoError(t, err)

	mkh2, err := NewInMemoryMessageKeysHolder(ctx, gc2, ds2)
	assert.NoError(t, err)

	dSK := gc1.GetDevicePrivKey()

	payloadRef1 := []byte("ok, this is the first test")
	payloadRef2 := []byte("so, this is a second test")
	payloadRef3 := []byte("this will be posted many times")

	err = RegisterChainKeyForDevice(ctx, mkh2, omd1.Device.GetPublic(), ds1)
	assert.NoError(t, err)

	assert.Equal(t, mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)).ChainKey, firstSK)

	payloadEnc1, _, err := SealPayload(payloadRef1, mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)), dSK, g.PubKey)
	assert.NoError(t, err)

	// Secret is derived by SealEnvelope
	err = DeriveDeviceSecret(ctx, mkh1)
	assert.NoError(t, err)

	assert.NotEqual(t, hex.EncodeToString(payloadRef1), hex.EncodeToString(payloadEnc1))

	// Messages are encrypted with DeviceSecret.Counter
	// uint64 overflows to 0, which is the expected behaviour

	// Test with a wrong counter value
	payloadClr1, err := OpenPayload(ctx, mkh2, cid.Undef, payloadEnc1, omd1.Device.GetPublic(), initialCounter+2)
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr1))

	// Test with a valid counter value, but no CID (so no cache)
	payloadClr1, err = OpenPayload(ctx, mkh2, cid.Undef, payloadEnc1, omd1.Device.GetPublic(), initialCounter+1)
	assert.NoError(t, err)
	assert.Equal(t, string(payloadRef1), string(payloadClr1))

	assert.Equal(t, mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)).Counter, initialCounter+1)
	assert.NotEqual(t, mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)).ChainKey, firstSK)

	payloadEnc2, _, err := SealPayload(payloadRef1, mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)), dSK, g.PubKey)
	assert.NoError(t, err)

	err = DeriveDeviceSecret(ctx, mkh1)
	assert.NoError(t, err)

	// Ensure that encrypted message is not the same as the first message
	assert.NotEqual(t, hex.EncodeToString(payloadRef1), hex.EncodeToString(payloadEnc2))
	assert.NotEqual(t, hex.EncodeToString(payloadEnc1), hex.EncodeToString(payloadEnc2))

	payloadClr2, err := OpenPayload(ctx, mkh2, cid.Undef, payloadEnc2, omd1.Device.GetPublic(), initialCounter+2)
	assert.NoError(t, err)

	assert.Equal(t, string(payloadRef1), string(payloadClr2))

	// Make sure that a message without a CID can't be decrypted twice
	payloadClr2, err = OpenPayload(ctx, mkh2, cid.Undef, payloadEnc2, omd1.Device.GetPublic(), initialCounter+1)
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr2))

	// Make sure that a message a CID can be decrypted twice
	payloadEnc3, _, err := SealPayload(payloadRef2, mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)), dSK, g.PubKey)
	assert.NoError(t, err)

	err = DeriveDeviceSecret(ctx, mkh1)
	assert.NoError(t, err)

	dummyCID1, err := cid.Parse("QmbdQXQh9B2bWZgZJqfbjNPV5jGN2owbQ3vjeYsaDaCDqU")
	assert.NoError(t, err)

	dummyCID2, err := cid.Parse("Qmf8oj9wbfu73prNAA1cRQVDqA52gD5B3ApnYQQjcjffH4")
	assert.NoError(t, err)

	// Not decrypted message yet, wrong counter value
	payloadClr3, err := OpenPayload(ctx, mkh2, dummyCID1, payloadEnc3, omd1.Device.GetPublic(), initialCounter+2)
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr3))

	payloadClr3, err = OpenPayload(ctx, mkh2, dummyCID1, payloadEnc3, omd1.Device.GetPublic(), initialCounter+3)
	assert.NoError(t, err)
	assert.Equal(t, string(payloadRef2), string(payloadClr3))

	payloadClr3, err = OpenPayload(ctx, mkh2, dummyCID1, payloadEnc3, omd1.Device.GetPublic(), initialCounter+3)
	assert.NoError(t, err)
	assert.Equal(t, string(payloadRef2), string(payloadClr3))

	// Wrong CID
	payloadClr3, err = OpenPayload(ctx, mkh2, dummyCID2, payloadEnc3, omd1.Device.GetPublic(), initialCounter+3)
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr3))

	// Reused CID, wrong counter value
	payloadClr3, err = OpenPayload(ctx, mkh2, dummyCID1, payloadEnc3, omd1.Device.GetPublic(), initialCounter+4)
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr3))

	// Test appending 200 messages, to ensure new secrets are generated correctly
	for i := 0; i < 200; i++ {
		payloadEnc, _, err := SealPayload(payloadRef3, mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)), dSK, g.PubKey)
		assert.NoError(t, err)

		err = DeriveDeviceSecret(ctx, mkh1)
		assert.NoError(t, err)

		payloadClr, err := OpenPayload(ctx, mkh2, cid.Undef, payloadEnc, omd1.Device.GetPublic(), mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)).Counter)
		assert.NoError(t, err)
		assert.Equal(t, string(payloadRef3), string(payloadClr))
	}

	assert.Equal(t, initialCounter+203, mustDeviceSecret(t)(gc1.GetDeviceSecret(ctx)).Counter)
}

func Test_EncryptMessageEnvelope(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	g, gSK, err := group.New()
	assert.NoError(t, err)

	_ = gSK

	omd1, err := group.NewOwnMemberDevice()
	assert.NoError(t, err)
	gc1 := NewGroupContext(g, omd1)

	ds1, err := group.NewDeviceSecret()
	assert.NoError(t, err)

	_, err = NewInMemoryMessageKeysHolder(ctx, gc1, ds1)
	assert.NoError(t, err)

	omd2, err := group.NewOwnMemberDevice()
	assert.NoError(t, err)
	gc2 := NewGroupContext(g, omd2)

	ds2, err := group.NewDeviceSecret()
	assert.NoError(t, err)

	payloadRef1 := []byte("Test payload 1")

	mkh2, err := NewInMemoryMessageKeysHolder(ctx, gc2, ds2)
	assert.NoError(t, err)

	err = RegisterChainKeyForDevice(ctx, mkh2, omd1.Device.GetPublic(), ds1)
	assert.NoError(t, err)

	env1, err := sealEnvelope(payloadRef1, ds1, omd1.Device, g)
	assert.NoError(t, err)

	headers, payloadClr1, err := OpenEnvelope(ctx, env1, cid.Undef, mkh2)
	assert.NoError(t, err)

	devRaw, err := omd1.Device.GetPublic().Raw()
	assert.Equal(t, headers.DevicePK, devRaw)
	assert.Equal(t, payloadRef1, payloadClr1)
}

func Test_EncryptMessageEnvelopeAndDerive(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	g, gSK, err := group.New()
	assert.NoError(t, err)

	_ = gSK

	omd1, err := group.NewOwnMemberDevice()
	assert.NoError(t, err)
	gc1 := NewGroupContext(g, omd1)

	ds1, err := group.NewDeviceSecret()
	assert.NoError(t, err)

	mkh1, err := NewInMemoryMessageKeysHolder(ctx, gc1, ds1)
	assert.NoError(t, err)

	omd2, err := group.NewOwnMemberDevice()
	assert.NoError(t, err)
	gc2 := NewGroupContext(g, omd2)

	ds2, err := group.NewDeviceSecret()
	assert.NoError(t, err)

	mkh2, err := NewInMemoryMessageKeysHolder(ctx, gc2, ds2)
	assert.NoError(t, err)

	err = RegisterChainKeyForDevice(ctx, mkh2, omd1.Device.GetPublic(), ds1)
	assert.NoError(t, err)

	initialCounter := ds1.Counter

	for i := 0; i < 1000; i++ {
		payloadRef := []byte(fmt.Sprintf("Test payload %d", i))
		envEncrypted, err := SealEnvelope(ctx, payloadRef, mkh1)
		assert.NoError(t, err)

		ds, err := mkh1.GetOwnDeviceChainKey(ctx)
		assert.NoError(t, err)
		assert.Equal(t, ds.Counter, initialCounter+uint64(i+1))

		headers, payloadClr, err := OpenEnvelope(ctx, envEncrypted, cid.Undef, mkh2)
		assert.NoError(t, err)
		if assert.NotNil(t, headers) && assert.NotNil(t, payloadClr) {
			devRaw, err := omd1.Device.GetPublic().Raw()
			assert.NoError(t, err)

			assert.Equal(t, headers.DevicePK, devRaw)
			assert.Equal(t, payloadRef, payloadClr)
		} else {
			break
		}
	}
}

func TestMessageKeyHolderCatchUp(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	expectedNewDevices := 10

	dir := path.Join(os.TempDir(), string(os.Getpid()), "MessageKeyHolderCatchUp")
	defer os.RemoveAll(dir)

	peers, _ := CreatePeersWithGroup(ctx, t, dir, 1, 1, true)
	peer := peers[0]

	mkh1 := peer.GetGroupContext().GetMessageKeysHolder()
	ms1, ok := peer.GetGroupContext().GetMetadataStore().(*metadataStore)
	if !ok {
		t.Fatalf("expected metadata store to be *metadataStore")
	}

	devicesPK := make([]crypto.PubKey, expectedNewDevices)
	deviceSecrets := make([]*bertyprotocol.DeviceSecret, expectedNewDevices)

	for i := 0; i < expectedNewDevices; i++ {
		devicesPK[i], deviceSecrets[i] = addDummyMemberInMetadataStore(ctx, t, ms1, peer.GetGroupContext().GetMemberPrivKey().GetPublic(), true)
	}

	err := FillMessageKeysHolderUsingPreviousData(ctx, mkh1, ms1)
	assert.NoError(t, err)

	for i, dPK := range devicesPK {
		ds, err := mkh1.GetDeviceChainKey(ctx, dPK)
		if assert.NoError(t, err) {
			assert.Equal(t, deviceSecrets[i].Counter+uint64(mkh1.GetPrecomputedKeyExpectedCount()), ds.Counter)
			// Not testing chain key value as we need to derive it from the generated value
		} else {
			t.Fatalf("failed at iteration %d", i)
		}
	}
}

func TestMessageKeyHolderSubscription(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	expectedNewDevices := 10

	dir := path.Join(os.TempDir(), string(os.Getpid()), "MessageKeyHolderSubscription")
	defer os.RemoveAll(dir)

	peers, _ := CreatePeersWithGroup(ctx, t, dir, 1, 1, true)
	peer := peers[0]

	mkh1 := peer.GetGroupContext().GetMessageKeysHolder()
	ms1, ok := peer.GetGroupContext().GetMetadataStore().(*metadataStore)
	if !ok {
		t.Fatalf("expected metadata store to be *metadataStore")
	}

	devicesPK := make([]crypto.PubKey, expectedNewDevices)
	deviceSecrets := make([]*bertyprotocol.DeviceSecret, expectedNewDevices)

	go FillMessageKeysHolderUsingNewData(ctx, peer.GetGroupContext())

	for i := 0; i < expectedNewDevices; i++ {
		devicesPK[i], deviceSecrets[i] = addDummyMemberInMetadataStore(ctx, t, ms1, peer.GetGroupContext().GetMemberPrivKey().GetPublic(), true)
	}

	<-time.After(time.Millisecond * 100)

	for i, dPK := range devicesPK {
		ds, err := mkh1.GetDeviceChainKey(ctx, dPK)
		if assert.NoError(t, err) {
			assert.Equal(t, deviceSecrets[i].Counter+uint64(mkh1.GetPrecomputedKeyExpectedCount()), ds.Counter)
			// Not testing chain key value as we need to derive it from the generated value
		}
	}
}
