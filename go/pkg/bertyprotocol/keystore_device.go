package bertyprotocol

import (
	"crypto/ed25519"
	crand "crypto/rand"
	"encoding/hex"
	"strings"
	"sync"

	"math"
	"math/big"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/aead/ecdh"
	"github.com/ipfs/go-ipfs/keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type DeviceKeystore interface {
	AccountPrivKey() (crypto.PrivKey, error)
	AccountProofPrivKey() (crypto.PrivKey, error)
	DevicePrivKey() (crypto.PrivKey, error)
	ContactGroupPrivKey(pk crypto.PubKey) (crypto.PrivKey, error)
	MemberDeviceForGroup(g *bertytypes.Group) (*ownMemberDevice, error)
}

type deviceKeystore struct {
	ks keystore.Keystore
	mu sync.Mutex
}

const (
	keyAccount      = "accountSK"
	keyAccountProof = "accountProofSK"
	keyDevice       = "deviceSK"
	keyMemberDevice = "memberDeviceSK"
	keyMember       = "memberSK"
	keyContactGroup = "contactGroupSK"
)

// AccountPrivKey returns the private key associated with the current account
func (a *deviceKeystore) AccountPrivKey() (crypto.PrivKey, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	return a.getOrGenerateNamedKey(keyAccount)
}

// AccountProofPrivKey returns the private key associated with the current account
func (a *deviceKeystore) AccountProofPrivKey() (crypto.PrivKey, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	return a.getOrGenerateNamedKey(keyAccountProof)
}

// DevicePrivKey returns the current device private key
func (a *deviceKeystore) DevicePrivKey() (crypto.PrivKey, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	return a.getOrGenerateNamedKey(keyDevice)
}

// ContactGroupPrivKey retrieves the deviceKeystore signing key associated with the supplied contact pub key
func (a *deviceKeystore) ContactGroupPrivKey(pk crypto.PubKey) (crypto.PrivKey, error) {
	accountSK, err := a.AccountPrivKey()
	if err != nil {
		return nil, err
	}

	return a.getOrComputeECDH(keyContactGroup, pk, accountSK)
}

// memberDeviceForMultiMemberGroup retrieves the device signing key associated with the supplied group pub key
func (a *deviceKeystore) memberDeviceForMultiMemberGroup(groupPK crypto.PubKey) (*ownMemberDevice, error) {
	memberSK, err := a.getOrComputeDeviceKeyForGroupMember(groupPK)
	if err != nil {
		return nil, err
	}

	deviceSK, err := a.getOrGenerateDeviceKeyForGroupDevice(groupPK)
	if err != nil {
		return nil, err
	}

	return &ownMemberDevice{
		member: memberSK,
		device: deviceSK,
	}, nil
}

func (a *deviceKeystore) MemberDeviceForGroup(g *bertytypes.Group) (*ownMemberDevice, error) {
	pk, err := g.GetPubKey()
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	switch g.GroupType {
	case bertytypes.GroupTypeAccount, bertytypes.GroupTypeContact:
		memberSK, err := a.AccountPrivKey()
		if err != nil {
			return nil, err
		}

		deviceSK, err := a.DevicePrivKey()
		if err != nil {
			return nil, err
		}

		return &ownMemberDevice{
			member: memberSK,
			device: deviceSK,
		}, nil

	case bertytypes.GroupTypeMultiMember:
		return a.memberDeviceForMultiMemberGroup(pk)
	}

	return nil, errcode.ErrInvalidInput
}

func (a *deviceKeystore) getOrGenerateNamedKey(name string) (crypto.PrivKey, error) {
	sk, err := a.ks.Get(name)
	if err == nil {
		return sk, nil
	} else if err.Error() != keystore.ErrNoSuchKey.Error() {
		return nil, err
	}

	sk, _, err = crypto.GenerateEd25519Key(crand.Reader)
	if err != nil {
		return nil, err
	}

	if err := a.ks.Put(name, sk); err != nil {
		return nil, err
	}

	return sk, nil
}

func (a *deviceKeystore) getOrGenerateDeviceKeyForGroupDevice(pk crypto.PubKey) (crypto.PrivKey, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	groupPKRaw, err := pk.Raw()
	if err != nil {
		return nil, err
	}

	name := strings.Join([]string{keyMemberDevice, hex.EncodeToString(groupPKRaw)}, "_")

	return a.getOrGenerateNamedKey(name)
}

func (a *deviceKeystore) getOrComputeECDH(nameSpace string, pk crypto.PubKey, ownSK crypto.PrivKey) (crypto.PrivKey, error) {
	pkRaw, err := pk.Raw()
	if err != nil {
		return nil, err
	}

	name := strings.Join([]string{nameSpace, hex.EncodeToString(pkRaw)}, "_")

	sk, err := a.ks.Get(name)
	if err == nil {
		return sk, nil
	} else if err.Error() != keystore.ErrNoSuchKey.Error() {
		return nil, err
	}

	skB, pkB, err := cryptoutil.EdwardsToMontgomery(ownSK, pk)
	if err != nil {
		return nil, err
	}

	secret := ecdh.X25519().ComputeSecret(skB, pkB)
	groupSK := ed25519.NewKeyFromSeed(secret)

	sk, _, err = crypto.KeyPairFromStdKey(&groupSK)
	if err != nil {
		return nil, err
	}

	if err := a.ks.Put(name, sk); err != nil {
		return nil, err
	}

	return sk, nil
}

func (a *deviceKeystore) getOrComputeDeviceKeyForGroupMember(pk crypto.PubKey) (crypto.PrivKey, error) {
	accountProofSK, err := a.AccountProofPrivKey()
	if err != nil {
		return nil, err
	}

	return a.getOrComputeECDH(keyMember, pk, accountProofSK)
}

// ownMemberDevice is own local device part of a group
type ownMemberDevice struct {
	member crypto.PrivKey
	device crypto.PrivKey
}

func (d *ownMemberDevice) Public() *memberDevice {
	return &memberDevice{
		member: d.member.GetPublic(),
		device: d.device.GetPublic(),
	}
}

// memberDevice is a remote device part of a group
type memberDevice struct {
	member crypto.PubKey
	device crypto.PubKey
}

func newDeviceSecret() (*bertytypes.DeviceSecret, error) {
	counter, err := crand.Int(crand.Reader, big.NewInt(0).SetUint64(math.MaxUint64))
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	chainKey := make([]byte, 32)
	_, err = crand.Read(chainKey)
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	return &bertytypes.DeviceSecret{
		ChainKey: chainKey,
		Counter:  counter.Uint64(),
	}, nil
}

// New creates a new deviceKeystore instance, if the keystore does not hold an deviceKeystore key, one will be created when required
func NewDeviceKeystore(ks keystore.Keystore) DeviceKeystore {
	return &deviceKeystore{
		ks: ks,
	}
}

// NewWithExistingKeys creates a new deviceKeystore instance and registers the supplied secret key, useful when migrating deviceKeystore to another device
func NewWithExistingKeys(ks keystore.Keystore, sk crypto.PrivKey, proofSK crypto.PrivKey) (DeviceKeystore, error) {
	acc := &deviceKeystore{
		ks: ks,
	}

	if err := ks.Put(keyAccount, sk); err != nil {
		return nil, err
	}

	if err := ks.Put(keyAccountProof, proofSK); err != nil {
		return nil, err
	}

	return acc, nil
}
