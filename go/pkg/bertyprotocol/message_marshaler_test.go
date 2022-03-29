package bertyprotocol

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

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

	rp := rendezvous.NewStaticRotationInterval()
	m := NewRotationMessageMarshaler(rp)

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
	msg := &iface.MessageExchangeHeads{
		Address: "address_1",
		Heads:   []*entry.Entry{},
	}

	rp := rendezvous.NewStaticRotationInterval()
	m := NewRotationMessageMarshaler(rp)

	// marshal without register topic, should fail
	payload, err := m.Marshal(msg)
	require.Error(t, err)
	require.Nil(t, payload)
}

func TestRotationMessageUnmarshalUnknownTopic(t *testing.T) {
	msg := &iface.MessageExchangeHeads{
		Address: "address_1",
		Heads:   []*entry.Entry{},
	}

	key1, err := enc.NewSecretbox(testSeed1)
	require.NoError(t, err)

	rp := rendezvous.NewStaticRotationInterval()
	m := NewRotationMessageMarshaler(rp)
	rp.RegisterRotation(time.Now(), msg.Address, testSeed1)
	m.RegisterSharedKeyForTopic(msg.Address, key1)

	// marshal without register topic, should fail
	payload, err := m.Marshal(msg)
	require.NoError(t, err)
	require.NotNil(t, payload)

	rp2 := rendezvous.NewStaticRotationInterval()
	m2 := NewRotationMessageMarshaler(rp2)

	var ret iface.MessageExchangeHeads

	// marshal with wrong key should fail
	err = m2.Unmarshal(payload, &ret)
	require.Error(t, err)
	assert.NotEqual(t, ret.Address, msg.Address)
}

func TestRotationMessageMarshalWrongKey(t *testing.T) {
	msg := &iface.MessageExchangeHeads{
		Address: "address_1",
		Heads:   []*entry.Entry{},
	}

	key1, err := enc.NewSecretbox(testSeed1)
	require.NoError(t, err)

	key2, err := enc.NewSecretbox(testSeed2)
	require.NoError(t, err)

	rp1 := rendezvous.NewStaticRotationInterval()
	rp1.RegisterRotation(time.Now(), msg.Address, testSeed1)
	m1 := NewRotationMessageMarshaler(rp1)
	m1.RegisterSharedKeyForTopic(msg.Address, key1)

	payload, err := m1.Marshal(msg)
	require.NoError(t, err)

	rp2 := rendezvous.NewStaticRotationInterval()
	rp2.RegisterRotation(time.Now(), msg.Address, testSeed2)
	m2 := NewRotationMessageMarshaler(rp2)
	m2.RegisterSharedKeyForTopic(msg.Address, key2)

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
