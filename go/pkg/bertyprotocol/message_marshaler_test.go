package bertyprotocol

import (
	"context"
	"testing"
	"time"

	keystore "github.com/ipfs/go-ipfs-keystore"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/go-ipfs-log/enc"
	"berty.tech/go-ipfs-log/entry"
	"berty.tech/go-orbit-db/iface"
)

var (
	testSeed1 = []byte("secretsecretsecretsecretsecretse") // 32 bytes seed
	testSeed2 = []byte("badbadbadbadbadbadbadbadbadbadba") // 32 bytes seed
)

func TestRotationMessageMarshaler(t *testing.T) {
	key, err := enc.NewSecretbox(testSeed1)
	require.NoError(t, err)

	msg := &iface.MessageExchangeHeads{
		Address: "address_1",
		Heads:   []*entry.Entry{},
	}

	mn := mocknet.New(context.Background())
	p, err := mn.GenPeer()
	require.NoError(t, err)

	// generate keystore
	ks1 := keystore.NewMemKeystore()
	acc1 := cryptoutil.NewDeviceKeystore(ks1, nil)

	rp := rendezvous.NewStaticRotationInterval()
	m := NewOrbitDBMessageMarshaler(p.ID(), acc1, rp)

	g, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	m.RegisterGroup(msg.Address, g)

	rp.RegisterRotation(time.Now(), msg.Address, testSeed1)
	m.RegisterSharedKeyForTopic(msg.Address, key)

	// marshal with register topic, should succeed
	payload, err := m.Marshal(msg)
	require.NoError(t, err)
	require.NotNil(t, payload)

	ret := iface.MessageExchangeHeads{}
	err = m.Unmarshal(payload, &ret)
	require.NoError(t, err)

	assert.Equal(t, msg.Address, ret.Address)
}

func TestRotationMessageMarshalUnknownTopic(t *testing.T) {
	mn := mocknet.New(context.Background())
	msg := &iface.MessageExchangeHeads{
		Address: "address_1",
		Heads:   []*entry.Entry{},
	}

	p, err := mn.GenPeer()
	require.NoError(t, err)

	// generate keystore
	ks := keystore.NewMemKeystore()
	acc := cryptoutil.NewDeviceKeystore(ks, nil)

	rp := rendezvous.NewStaticRotationInterval()
	m := NewOrbitDBMessageMarshaler(p.ID(), acc, rp)

	// marshal without register topic, should fail
	payload, err := m.Marshal(msg)
	require.Error(t, err)
	require.Nil(t, payload)
}

func TestRotationMessageUnmarshalUnknownTopic(t *testing.T) {
	mn := mocknet.New(context.Background())
	msg := &iface.MessageExchangeHeads{
		Address: "address_1",
		Heads:   []*entry.Entry{},
	}
	key1, err := enc.NewSecretbox(testSeed1)
	require.NoError(t, err)

	key2, err := enc.NewSecretbox(testSeed2)
	require.NoError(t, err)

	p1, err := mn.GenPeer()
	require.NoError(t, err)

	p2, err := mn.GenPeer()
	require.NoError(t, err)

	// generate keystore
	ks1 := keystore.NewMemKeystore()
	acc1 := cryptoutil.NewDeviceKeystore(ks1, nil)

	ks2 := keystore.NewMemKeystore()
	acc2 := cryptoutil.NewDeviceKeystore(ks2, nil)

	g1, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	g2, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	rp1 := rendezvous.NewStaticRotationInterval()
	rp1.RegisterRotation(time.Now(), msg.Address, testSeed1)

	rp2 := rendezvous.NewStaticRotationInterval()

	m1 := NewOrbitDBMessageMarshaler(p1.ID(), acc1, rp1)
	m1.RegisterSharedKeyForTopic(msg.Address, key1)

	m1.RegisterGroup(msg.Address, g1)

	payload, err := m1.Marshal(msg)
	require.NoError(t, err)

	m2 := NewOrbitDBMessageMarshaler(p2.ID(), acc2, rp2)
	m2.RegisterSharedKeyForTopic(msg.Address, key2)

	m2.RegisterGroup(msg.Address, g2)

	var ret iface.MessageExchangeHeads

	// marshal with wrong key should fail
	err = m2.Unmarshal(payload, &ret)
	require.Error(t, err)
	assert.NotEqual(t, ret.Address, msg.Address)
}

func TestRotationMessageMarshalWrongKey(t *testing.T) {
	mn := mocknet.New(context.Background())
	msg := &iface.MessageExchangeHeads{
		Address: "address_1",
		Heads:   []*entry.Entry{},
	}

	key1, err := enc.NewSecretbox(testSeed1)
	require.NoError(t, err)

	key2, err := enc.NewSecretbox(testSeed2)
	require.NoError(t, err)

	p1, err := mn.GenPeer()
	require.NoError(t, err)

	p2, err := mn.GenPeer()
	require.NoError(t, err)

	g1, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	g2, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	// generate keystore
	ks1 := keystore.NewMemKeystore()
	acc1 := cryptoutil.NewDeviceKeystore(ks1, nil)

	ks2 := keystore.NewMemKeystore()
	acc2 := cryptoutil.NewDeviceKeystore(ks2, nil)

	rp1 := rendezvous.NewStaticRotationInterval()
	rp1.RegisterRotation(time.Now(), msg.Address, testSeed1)
	rp2 := rendezvous.NewStaticRotationInterval()
	rp2.RegisterRotation(time.Now(), msg.Address, testSeed2)

	m1 := NewOrbitDBMessageMarshaler(p1.ID(), acc1, rp1)
	m1.RegisterSharedKeyForTopic(msg.Address, key1)
	m1.RegisterGroup(msg.Address, g1)

	payload, err := m1.Marshal(msg)
	require.NoError(t, err)

	m2 := NewOrbitDBMessageMarshaler(p2.ID(), acc2, rp2)
	m2.RegisterSharedKeyForTopic(msg.Address, key2)
	m2.RegisterGroup(msg.Address, g2)

	var ret iface.MessageExchangeHeads

	// marshal with wrong key should fail
	err = m2.Unmarshal(payload, &ret)
	require.Error(t, err)
	assert.NotEqual(t, ret.Address, msg.Address)

	// marshal with good key should succeed
	err = m1.Unmarshal(payload, &ret)
	require.NoError(t, err)
	assert.Equal(t, ret.Address, msg.Address)
}
