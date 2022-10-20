package cryptoutil

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
	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type DeviceKeystore interface {
	AccountPrivKey() (crypto.PrivKey, error)
	AccountProofPrivKey() (crypto.PrivKey, error)
	DevicePrivKey() (crypto.PrivKey, error)
	ContactGroupPrivKey(pk crypto.PubKey) (crypto.PrivKey, error)
	MemberDeviceForGroup(g *protocoltypes.Group) (*OwnMemberDevice, error)
	RestoreAccountKeys(accountKey crypto.PrivKey, accountProofKey crypto.PrivKey) error
}

type deviceKeystore struct {
	ks     keystore.Keystore
	mu     sync.Mutex
	logger *zap.Logger
}

type DeviceKeystoreOpts struct {
	Logger *zap.Logger
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

// DevicePrivKey returns the current Device private key
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

// memberDeviceForMultiMemberGroup retrieves the Device signing key associated with the supplied group pub key
func (a *deviceKeystore) memberDeviceForMultiMemberGroup(groupPK crypto.PubKey) (*OwnMemberDevice, error) {
	memberSK, err := a.getOrComputeDeviceKeyForGroupMember(groupPK)
	if err != nil {
		return nil, err
	}

	deviceSK, err := a.getOrGenerateDeviceKeyForGroupDevice(groupPK)
	if err != nil {
		return nil, err
	}

	return &OwnMemberDevice{
		member: memberSK,
		device: deviceSK,
	}, nil
}

func (a *deviceKeystore) MemberDeviceForGroup(g *protocoltypes.Group) (*OwnMemberDevice, error) {
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

		return &OwnMemberDevice{
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

	skB, pkB, err := EdwardsToMontgomery(ownSK, pk)
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

// OwnMemberDevice is own local Device part of a group
type OwnMemberDevice struct {
	member crypto.PrivKey
	device crypto.PrivKey
}

func (d *OwnMemberDevice) PrivateMember() crypto.PrivKey {
	return d.member
}

func (d *OwnMemberDevice) PrivateDevice() crypto.PrivKey {
	return d.device
}

func (d *OwnMemberDevice) Public() *MemberDevice {
	return &MemberDevice{
		Member: d.member.GetPublic(),
		Device: d.device.GetPublic(),
	}
}

func NewOwnMemberDevice(member crypto.PrivKey, device crypto.PrivKey) *OwnMemberDevice {
	return &OwnMemberDevice{
		member: member,
		device: device,
	}
}

// MemberDevice is a remote Device part of a group
type MemberDevice struct {
	Member crypto.PubKey
	Device crypto.PubKey
}

func NewDeviceSecret() (*protocoltypes.DeviceSecret, error) {
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

// NewDeviceKeystore creates a new deviceKeystore instance, if the keystore does not hold an deviceKeystore key, one will be created when required
func NewDeviceKeystore(ks keystore.Keystore, opts *DeviceKeystoreOpts) DeviceKeystore {
	if opts == nil {
		opts = &DeviceKeystoreOpts{}
	}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	return &deviceKeystore{
		ks:     ks,
		logger: opts.Logger,
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
