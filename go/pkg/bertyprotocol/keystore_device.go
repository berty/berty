package bertyprotocol

import (
	"crypto/ed25519"
	crand "crypto/rand"
	"encoding/hex"
	"fmt"
	"math"
	"math/big"
	"strings"
	"sync"

	"github.com/aead/ecdh"
	ipfscid "github.com/ipfs/go-cid"
	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type DeviceKeystore interface {
	AccountPrivKey() (crypto.PrivKey, error)
	AccountProofPrivKey() (crypto.PrivKey, error)
	DevicePrivKey() (crypto.PrivKey, error)
	ContactGroupPrivKey(pk crypto.PubKey) (crypto.PrivKey, error)
	MemberDeviceForGroup(g *protocoltypes.Group) (*ownMemberDevice, error)
	RestoreAccountKeys(accountKey crypto.PrivKey, accountProofKey crypto.PrivKey) error

	AttachmentPrivKey(cid []byte) (crypto.PrivKey, error)
	AttachmentPrivKeyPut(cid []byte, sk crypto.PrivKey) error
	AttachmentSecret(cid []byte) ([]byte, error)
	AttachmentSecretPut(cid []byte, secret []byte) error
	AttachmentSecretSlice(cids [][]byte) ([][]byte, error)
	AttachmentSecretSlicePut(cids, secrets [][]byte) error
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

func (a *deviceKeystore) MemberDeviceForGroup(g *protocoltypes.Group) (*ownMemberDevice, error) {
	pk, err := g.GetPubKey()
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	switch g.GroupType {
	case protocoltypes.GroupTypeAccount, protocoltypes.GroupTypeContact:
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

	case protocoltypes.GroupTypeMultiMember:
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
	a.mu.Lock()
	defer a.mu.Unlock()

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

func (a *deviceKeystore) RestoreAccountKeys(sk crypto.PrivKey, proofSK crypto.PrivKey) error {
	if sk == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing account key"))
	}

	if proofSK == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing account proof key"))
	}

	ok, err := a.ks.Has(keyAccount)
	if err != nil {
		return err
	}

	if ok {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("an account key is already set in this keystore"))
	}

	ok, err = a.ks.Has(keyAccountProof)
	if err != nil {
		return err
	}

	if ok {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("an account proof key is already set in this keystore"))
	}

	if err := a.ks.Put(keyAccount, sk); err != nil {
		return err
	}

	if err := a.ks.Put(keyAccountProof, proofSK); err != nil {
		return err
	}

	return nil
}

func (a *deviceKeystore) AttachmentPrivKey(cidBytes []byte) (crypto.PrivKey, error) {
	id, err := attachmentKeyIDFromCID(cidBytes)
	if err != nil {
		return nil, err
	}

	a.mu.Lock()
	defer a.mu.Unlock()

	key, err := a.ks.Get(id)
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	return key, nil
}

func (a *deviceKeystore) AttachmentPrivKeyPut(cidBytes []byte, sk crypto.PrivKey) error {
	id, err := attachmentKeyIDFromCID(cidBytes)
	if err != nil {
		return err
	}

	a.mu.Lock()
	defer a.mu.Unlock()

	existing, err := a.ks.Get(id)
	if err == nil && existing.Equals(sk) {
		return nil // we already have the same key, do nothing instead of returning an error
	}

	err = a.ks.Put(id, sk)
	if err != nil {
		return errcode.ErrKeystorePut.Wrap(err)
	}

	return nil
}

func attachmentKeyIDFromCID(cidBytes []byte) (string, error) {
	cid, err := ipfscid.Cast(cidBytes)
	if err != nil {
		return "", errcode.ErrDeserialization.Wrap(err)
	}
	return attachmentKeyV0Prefix + cid.String(), nil
}

func (a *deviceKeystore) AttachmentSecret(cidBytes []byte) ([]byte, error) {
	key, err := a.AttachmentPrivKey(cidBytes)
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}
	s, err := attachmentKeyMarshal(key)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}
	return s, nil
}

func (a *deviceKeystore) AttachmentSecretPut(cidBytes []byte, s []byte) error {
	sk, err := attachmentKeyUnmarshal(s)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	err = a.AttachmentPrivKeyPut(cidBytes, sk)
	if err != nil {
		return errcode.ErrKeystorePut.Wrap(err)
	}
	return nil
}

func (a *deviceKeystore) AttachmentSecretSlice(cids [][]byte) ([][]byte, error) {
	return mapBufArray(cids, a.AttachmentSecret)
}

func (a *deviceKeystore) AttachmentSecretSlicePut(cids, secrets [][]byte) error {
	if len(cids) != len(secrets) {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("length mismatch (%d cids for %d secrets)", len(cids), len(secrets)))
	}

	for i, cid := range cids {
		err := a.AttachmentSecretPut(cid, secrets[i])
		if err != nil {
			return errcode.ErrForEach.Wrap(err)
		}
	}
	return nil
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

func newDeviceSecret() (*protocoltypes.DeviceSecret, error) {
	counter, err := crand.Int(crand.Reader, big.NewInt(0).SetUint64(math.MaxUint64))
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	chainKey := make([]byte, 32)
	_, err = crand.Read(chainKey)
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	return &protocoltypes.DeviceSecret{
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
