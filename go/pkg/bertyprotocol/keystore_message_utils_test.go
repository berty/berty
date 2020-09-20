package bertyprotocol

import (
	"context"
	"encoding/hex"
	"fmt"
	"os"
	"path"
	"testing"

	cid "github.com/ipfs/go-cid"
	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
)

func addDummyMemberInMetadataStore(ctx context.Context, t testing.TB, ms *metadataStore, g *bertytypes.Group, memberPK crypto.PubKey, join bool) (crypto.PubKey, *bertytypes.DeviceSecret) {
	t.Helper()

	acc := NewDeviceKeystore(keystore.NewMemKeystore())
	md, err := acc.MemberDeviceForGroup(g)
	assert.NoError(t, err)

	ds, err := newDeviceSecret()
	assert.NoError(t, err)

	if join {
		_, err = metadataStoreAddDeviceToGroup(ctx, ms, g, md)
		assert.NoError(t, err)
	}

	_, err = metadataStoreSendSecret(ctx, ms, g, md, memberPK, ds)
	assert.NoError(t, err)

	return md.device.GetPublic(), ds
}

func mustDeviceSecret(t testing.TB) func(ds *bertytypes.DeviceSecret, err error) *bertytypes.DeviceSecret {
	return func(ds *bertytypes.DeviceSecret, err error) *bertytypes.DeviceSecret {
		t.Helper()

		if err != nil {
			t.Fatal(err)
		}

		return ds
	}
}

func mustMessageHeaders(t testing.TB, pk crypto.PubKey, counter uint64) *bertytypes.MessageHeaders {
	t.Helper()

	pkB, err := pk.Raw()
	if err != nil {
		t.Fatal(err)
	}

	return &bertytypes.MessageHeaders{
		Counter:  counter,
		DevicePK: pkB,
		Sig:      nil,
	}
}

func Test_EncryptMessagePayload(t *testing.T) {
	g, gSK, err := NewGroupMultiMember()
	assert.NoError(t, err)

	_ = gSK

	acc1 := NewDeviceKeystore(keystore.NewMemKeystore())

	omd1, err := acc1.MemberDeviceForGroup(g)
	assert.NoError(t, err)

	ds1, err := newDeviceSecret()
	assert.NoError(t, err)

	ds2, err := newDeviceSecret()
	assert.NoError(t, err)

	initialCounter := ds1.Counter
	firstSK := append([]byte(nil), ds1.ChainKey...)

	acc2 := NewDeviceKeystore(keystore.NewMemKeystore())

	omd2, err := acc2.MemberDeviceForGroup(g)

	mkh1, cleanup := NewInMemMessageKeystore()
	defer cleanup()

	mkh2, cleanup := NewInMemMessageKeystore()
	defer cleanup()

	gc1 := newContextGroup(g, nil, nil, mkh1, omd1, nil)
	gc2 := newContextGroup(g, nil, nil, mkh2, omd2, nil)

	err = mkh1.RegisterChainKey(g, gc1.DevicePubKey(), ds1, true)
	assert.NoError(t, err)

	err = mkh2.RegisterChainKey(g, gc2.DevicePubKey(), ds2, true)
	assert.NoError(t, err)

	payloadRef1 := []byte("ok, this is the first test")
	payloadRef2 := []byte("so, this is a second test")
	payloadRef3 := []byte("this will be posted many times")

	err = mkh2.RegisterChainKey(g, omd1.device.GetPublic(), ds1, false)
	assert.NoError(t, err)

	gPK, err := g.GetPubKey()
	assert.NoError(t, err)

	assert.Equal(t, mustDeviceSecret(t)(mkh1.getDeviceChainKey(gPK, omd1.device.GetPublic())).ChainKey, firstSK)

	payloadEnc1, _, err := sealPayload(payloadRef1, mustDeviceSecret(t)(mkh1.getDeviceChainKey(gPK, omd1.device.GetPublic())), omd1.device, g)
	assert.NoError(t, err)

	// secret is derived by SealEnvelope
	err = mkh1.deriveDeviceSecret(g, omd1.device)
	assert.NoError(t, err)

	assert.NotEqual(t, hex.EncodeToString(payloadRef1), hex.EncodeToString(payloadEnc1))

	// Messages are encrypted with DeviceSecret.Counter
	// uint64 overflows to 0, which is the expected behaviour

	// Test with a wrong counter value
	payloadClr1, decryptInfo, err := mkh2.openPayload(cid.Undef, gPK, payloadEnc1, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+2))
	assert.Error(t, err)
	assert.Nil(t, decryptInfo)
	assert.Equal(t, "", string(payloadClr1))

	// Test with a valid counter value, but no CID (so no cache)
	payloadClr1, decryptInfo, err = mkh2.openPayload(cid.Undef, gPK, payloadEnc1, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+1))
	assert.NoError(t, err)
	assert.Equal(t, string(payloadRef1), string(payloadClr1))

	err = mkh2.postDecryptActions(decryptInfo, g, omd2.device.GetPublic(), mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+1))
	assert.NoError(t, err)

	ds, err := mkh1.getDeviceChainKey(gPK, omd1.device.GetPublic())
	assert.NoError(t, err)

	assert.Equal(t, ds.Counter, initialCounter+1)
	assert.NotEqual(t, ds.ChainKey, firstSK)

	payloadEnc2, _, err := sealPayload(payloadRef1, ds, omd1.device, g)
	assert.NoError(t, err)

	err = mkh1.deriveDeviceSecret(g, omd1.device)
	assert.NoError(t, err)

	// Ensure that encrypted message is not the same as the first message
	assert.NotEqual(t, hex.EncodeToString(payloadRef1), hex.EncodeToString(payloadEnc2))
	assert.NotEqual(t, hex.EncodeToString(payloadEnc1), hex.EncodeToString(payloadEnc2))

	payloadClr2, decryptInfo, err := mkh2.openPayload(cid.Undef, gPK, payloadEnc2, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+2))
	assert.NoError(t, err)

	err = mkh2.postDecryptActions(decryptInfo, g, omd2.device.GetPublic(), mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+2))
	assert.NoError(t, err)

	assert.Equal(t, string(payloadRef1), string(payloadClr2))

	// Make sure that a message without a CID can't be decrypted twice
	payloadClr2, decryptInfo, err = mkh2.openPayload(cid.Undef, gPK, payloadEnc2, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+1))
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr2))

	ds, err = mkh1.getDeviceChainKey(gPK, omd1.device.GetPublic())
	assert.NoError(t, err)

	// Make sure that a message a CID can be decrypted twice
	payloadEnc3, _, err := sealPayload(payloadRef2, ds, omd1.device, g)
	assert.NoError(t, err)

	err = mkh1.deriveDeviceSecret(g, omd1.device)
	assert.NoError(t, err)

	dummyCID1, err := cid.Parse("QmbdQXQh9B2bWZgZJqfbjNPV5jGN2owbQ3vjeYsaDaCDqU")
	assert.NoError(t, err)

	dummyCID2, err := cid.Parse("Qmf8oj9wbfu73prNAA1cRQVDqA52gD5B3ApnYQQjcjffH4")
	assert.NoError(t, err)

	// Not decrypted message yet, wrong counter value
	payloadClr3, decryptInfo, err := mkh2.openPayload(dummyCID1, gPK, payloadEnc3, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+2))
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr3))

	payloadClr3, decryptInfo, err = mkh2.openPayload(dummyCID1, gPK, payloadEnc3, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+3))
	assert.NoError(t, err)
	assert.Equal(t, string(payloadRef2), string(payloadClr3))

	err = mkh2.postDecryptActions(decryptInfo, g, omd2.device.GetPublic(), mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+3))
	assert.NoError(t, err)

	payloadClr3, decryptInfo, err = mkh2.openPayload(dummyCID1, gPK, payloadEnc3, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+3))
	assert.NoError(t, err)
	assert.Equal(t, string(payloadRef2), string(payloadClr3))

	err = mkh2.postDecryptActions(decryptInfo, g, omd2.device.GetPublic(), mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+3))
	assert.NoError(t, err)

	// Wrong CID
	payloadClr3, decryptInfo, err = mkh2.openPayload(dummyCID2, gPK, payloadEnc3, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+3))
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr3))

	// Reused CID, wrong counter value
	payloadClr3, decryptInfo, err = mkh2.openPayload(dummyCID1, gPK, payloadEnc3, mustMessageHeaders(t, omd1.device.GetPublic(), initialCounter+4))
	assert.Error(t, err)
	assert.Equal(t, "", string(payloadClr3))

	massExpected := uint64(200)

	// Test appending 200 messages, to ensure new secrets are generated correctly
	for i := uint64(0); i < massExpected; i++ {
		ds, err = mkh1.getDeviceChainKey(gPK, omd1.device.GetPublic())
		assert.NoError(t, err)

		payloadEnc, _, err := sealPayload(payloadRef3, ds, omd1.device, g)
		assert.NoError(t, err)

		err = mkh1.deriveDeviceSecret(g, omd1.device)
		assert.NoError(t, err)

		ds, err = mkh1.getDeviceChainKey(gPK, omd1.device.GetPublic())
		assert.NoError(t, err)

		counter := ds.Counter

		payloadClr, decryptInfo, err := mkh2.openPayload(cid.Undef, gPK, payloadEnc, mustMessageHeaders(t, omd1.device.GetPublic(), counter))
		if !assert.NoError(t, err) {
			t.Fatalf("failed at i = %d", i)
		}

		err = mkh2.postDecryptActions(decryptInfo, g, omd2.device.GetPublic(), mustMessageHeaders(t, omd1.device.GetPublic(), counter))
		assert.NoError(t, err)

		assert.Equal(t, string(payloadRef3), string(payloadClr))
	}

	ds, err = mkh1.getDeviceChainKey(gPK, omd1.device.GetPublic())
	assert.NoError(t, err)

	assert.Equal(t, initialCounter+massExpected+3, ds.Counter)
}

func Test_EncryptMessageEnvelope(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	g, _, err := NewGroupMultiMember()
	assert.NoError(t, err)

	acc1 := NewDeviceKeystore(keystore.NewMemKeystore())
	mkh1, cleanup := NewInMemMessageKeystore()
	defer cleanup()

	omd1, err := acc1.MemberDeviceForGroup(g)
	assert.NoError(t, err)

	gc1 := newContextGroup(g, nil, nil, mkh1, omd1, nil)

	ds1, err := newDeviceSecret()
	assert.NoError(t, err)

	err = mkh1.RegisterChainKey(g, gc1.DevicePubKey(), ds1, true)
	assert.NoError(t, err)

	acc2 := NewDeviceKeystore(keystore.NewMemKeystore())
	mkh2, cleanup := NewInMemMessageKeystore()
	defer cleanup()

	omd2, err := acc2.MemberDeviceForGroup(g)
	assert.NoError(t, err)

	ds2, err := newDeviceSecret()
	assert.NoError(t, err)

	payloadRef1 := []byte("Test payload 1")

	err = mkh2.RegisterChainKey(g, omd2.device.GetPublic(), ds2, true)
	assert.NoError(t, err)

	err = mkh2.RegisterChainKey(g, omd1.device.GetPublic(), ds1, false)
	assert.NoError(t, err)

	env1, err := sealEnvelopeInternal(ctx, payloadRef1, ds1, omd1.device, g)
	assert.NoError(t, err)

	headers, payloadClr1, err := mkh2.OpenEnvelope(ctx, g, omd2.device.GetPublic(), env1, cid.Undef)
	assert.NoError(t, err)

	devRaw, err := omd1.device.GetPublic().Raw()
	assert.Equal(t, headers.DevicePK, devRaw)
	assert.Equal(t, payloadRef1, payloadClr1)
}

func Test_EncryptMessageEnvelopeAndDerive(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	g, _, err := NewGroupMultiMember()
	assert.NoError(t, err)

	acc1 := NewDeviceKeystore(keystore.NewMemKeystore())
	acc2 := NewDeviceKeystore(keystore.NewMemKeystore())

	omd1, err := acc1.MemberDeviceForGroup(g)
	assert.NoError(t, err)

	omd2, err := acc2.MemberDeviceForGroup(g)
	assert.NoError(t, err)

	ds1, err := newDeviceSecret()
	assert.NoError(t, err)

	mkh1, cleanup := NewInMemMessageKeystore()
	defer cleanup()

	mkh2, cleanup := NewInMemMessageKeystore()
	defer cleanup()

	err = mkh1.RegisterChainKey(g, omd1.device.GetPublic(), ds1, true)
	assert.NoError(t, err)

	gPK, err := g.GetPubKey()
	assert.NoError(t, err)

	gc1 := newContextGroup(g, nil, nil, mkh1, omd1, nil)

	ds2, err := newDeviceSecret()
	assert.NoError(t, err)

	err = mkh2.RegisterChainKey(g, omd2.device.GetPublic(), ds2, true)
	assert.NoError(t, err)

	err = mkh2.RegisterChainKey(g, omd1.device.GetPublic(), ds1, false)
	assert.NoError(t, err)

	initialCounter := ds1.Counter

	for i := 0; i < 1000; i++ {
		payloadRef := []byte(fmt.Sprintf("Test payload %d", i))
		envEncrypted, err := mkh1.SealEnvelope(ctx, g, omd1.device, payloadRef)
		assert.NoError(t, err)

		ds, err := mkh1.getDeviceChainKey(gPK, gc1.DevicePubKey())
		if !assert.NoError(t, err) {
			t.Fatalf("failed at i = %d", i)
		}
		assert.Equal(t, ds.Counter, initialCounter+uint64(i+1))

		headers, payloadClr, err := mkh2.OpenEnvelope(ctx, g, omd2.device.GetPublic(), envEncrypted, cid.Undef)
		if !assert.NoError(t, err) {
			t.Fatalf("failed at i = %d", i)
		}

		if assert.NotNil(t, headers) && assert.NotNil(t, payloadClr) {
			devRaw, err := omd1.device.GetPublic().Raw()
			assert.NoError(t, err)

			assert.Equal(t, headers.DevicePK, devRaw)
			assert.Equal(t, payloadRef, payloadClr)
		} else {
			break
		}
	}
}

func testMessageKeyHolderCatchUp(t *testing.T, expectedNewDevices int, isSlow bool) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if isSlow {
		testutil.FilterSpeed(t, testutil.Slow)
	}

	dir := path.Join(os.TempDir(), fmt.Sprintf("%d", os.Getpid()), "MessageKeyHolderCatchUp")
	defer os.RemoveAll(dir)

	peers, _, cleanup := createPeersWithGroup(ctx, t, dir, 1, 1)
	defer cleanup()

	peer := peers[0]

	mkh1 := peer.MKS
	ms1 := peer.GC.MetadataStore()

	devicesPK := make([]crypto.PubKey, expectedNewDevices)
	deviceSecrets := make([]*bertytypes.DeviceSecret, expectedNewDevices)

	for i := 0; i < expectedNewDevices; i++ {
		devicesPK[i], deviceSecrets[i] = addDummyMemberInMetadataStore(ctx, t, ms1, peer.GC.Group(), peer.GC.MemberPubKey(), true)
	}

	for range FillMessageKeysHolderUsingPreviousData(ctx, peer.GC) {
	}

	gPK, err := peer.GC.Group().GetPubKey()
	require.NoError(t, err)

	for i, dPK := range devicesPK {
		ds, err := mkh1.getDeviceChainKey(gPK, dPK)
		if assert.NoError(t, err) {
			assert.Equal(t, deviceSecrets[i].Counter+uint64(mkh1.getPrecomputedKeyExpectedCount()), ds.Counter)
			// Not testing chain key value as we need to derive it from the generated value
		} else {
			t.Fatalf("failed at iteration %d", i)
		}
	}
}

func TestMessageKeyHolderCatchUp(t *testing.T) {
	for _, testCase := range []struct {
		expectedNewDevices int
		slow               bool
	}{
		{
			expectedNewDevices: 2,
			slow:               false,
		},
		{
			expectedNewDevices: 10,
			slow:               true,
		},
	} {
		testMessageKeyHolderCatchUp(t, testCase.expectedNewDevices, testCase.slow)
	}
}

func testMessageKeyHolderSubscription(t *testing.T, expectedNewDevices int, isSlow bool) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if isSlow {
		testutil.FilterSpeed(t, testutil.Slow)
	}

	dir := path.Join(os.TempDir(), fmt.Sprintf("%d", os.Getpid()), "MessageKeyHolderSubscription")
	defer os.RemoveAll(dir)

	peers, gSK, cleanup := createPeersWithGroup(ctx, t, dir, 1, 1)
	defer cleanup()

	peer := peers[0]

	mkh1 := peer.MKS
	ms1 := peer.GC.MetadataStore()

	devicesPK := make([]crypto.PubKey, expectedNewDevices)
	deviceSecrets := make([]*bertytypes.DeviceSecret, expectedNewDevices)

	subCtx, subCancel := context.WithCancel(ctx)
	ch := FillMessageKeysHolderUsingNewData(subCtx, peer.GC)

	for i := 0; i < expectedNewDevices; i++ {
		devicesPK[i], deviceSecrets[i] = addDummyMemberInMetadataStore(ctx, t, ms1, peer.GC.Group(), peer.GC.MemberPubKey(), true)
	}

	i := 0
	for range ch {
		i++
		if i == expectedNewDevices {
			subCancel()
			break
		}
	}

	for i, dPK := range devicesPK {
		ds, err := mkh1.getDeviceChainKey(gSK.GetPublic(), dPK)
		if assert.NoError(t, err) {
			assert.Equal(t, deviceSecrets[i].Counter+uint64(mkh1.getPrecomputedKeyExpectedCount()), ds.Counter)
			// Not testing chain key value as we need to derive it from the generated value
		}
	}
}

func TestMessageKeyHolderSubscription(t *testing.T) {
	for _, testCase := range []struct {
		expectedNewDevices int
		slow               bool
	}{
		{
			expectedNewDevices: 2,
			slow:               false,
		},
		{
			expectedNewDevices: 10,
			slow:               true,
		},
	} {
		testMessageKeyHolderSubscription(t, testCase.expectedNewDevices, testCase.slow)
	}
}
