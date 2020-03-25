package account

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/hex"
	"strings"
	"sync"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/aead/ecdh"
	"github.com/ipfs/go-ipfs/keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type Account struct {
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
func (a *Account) AccountPrivKey() (crypto.PrivKey, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	return a.getOrGenerateNamedKey(keyAccount)
}

// AccountProofPrivKey returns the private key associated with the current account
func (a *Account) AccountProofPrivKey() (crypto.PrivKey, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	return a.getOrGenerateNamedKey(keyAccountProof)
}

// DevicePrivKey returns the current device private key
func (a *Account) DevicePrivKey() (crypto.PrivKey, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	return a.getOrGenerateNamedKey(keyDevice)
}

// ContactGroupPrivKey retrieves the account signing key associated with the supplied contact pub key
func (a *Account) ContactGroupPrivKey(pk crypto.PubKey) (crypto.PrivKey, error) {
	accountSK, err := a.AccountPrivKey()
	if err != nil {
		return nil, err
	}

	return a.getOrComputeECDH(keyContactGroup, pk, accountSK)
}

// memberDeviceForMultiMemberGroup retrieves the device signing key associated with the supplied group pub key
func (a *Account) memberDeviceForMultiMemberGroup(groupPK crypto.PubKey) (*bertyprotocol.OwnMemberDevice, error) {
	memberSK, err := a.getOrComputeDeviceKeyForGroupMember(groupPK)
	if err != nil {
		return nil, err
	}

	deviceSK, err := a.getOrGenerateDeviceKeyForGroupDevice(groupPK)
	if err != nil {
		return nil, err
	}

	return &bertyprotocol.OwnMemberDevice{
		Member: memberSK,
		Device: deviceSK,
	}, nil
}

func (a *Account) MemberDeviceForGroup(g *bertyprotocol.Group) (*bertyprotocol.OwnMemberDevice, error) {
	pk, err := g.GetPubKey()
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	switch g.GroupType {
	case bertyprotocol.GroupTypeAccount, bertyprotocol.GroupTypeContact:
		memberSK, err := a.AccountPrivKey()
		if err != nil {
			return nil, err
		}

		deviceSK, err := a.DevicePrivKey()
		if err != nil {
			return nil, err
		}

		return &bertyprotocol.OwnMemberDevice{
			Member: memberSK,
			Device: deviceSK,
		}, nil

	case bertyprotocol.GroupTypeMultiMember:
		return a.memberDeviceForMultiMemberGroup(pk)
	}

	return nil, errcode.ErrInvalidInput
}

func (a *Account) getOrGenerateNamedKey(name string) (crypto.PrivKey, error) {
	sk, err := a.ks.Get(name)
	if err == nil {
		return sk, nil
	} else if err.Error() != keystore.ErrNoSuchKey.Error() {
		return nil, err
	}

	sk, _, err = crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, err
	}

	if err := a.ks.Put(name, sk); err != nil {
		return nil, err
	}

	return sk, nil
}

func (a *Account) getOrGenerateDeviceKeyForGroupDevice(pk crypto.PubKey) (crypto.PrivKey, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	groupPKRaw, err := pk.Raw()
	if err != nil {
		return nil, err
	}

	name := strings.Join([]string{keyMemberDevice, hex.EncodeToString(groupPKRaw)}, "_")

	return a.getOrGenerateNamedKey(name)
}

func (a *Account) getOrComputeECDH(nameSpace string, pk crypto.PubKey, ownSK crypto.PrivKey) (crypto.PrivKey, error) {
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

func (a *Account) getOrComputeDeviceKeyForGroupMember(pk crypto.PubKey) (crypto.PrivKey, error) {
	accountProofSK, err := a.AccountProofPrivKey()
	if err != nil {
		return nil, err
	}

	return a.getOrComputeECDH(keyMember, pk, accountProofSK)
}

// New creates a new Account instance, if the keystore does not hold an account key, one will be created when required
func New(ks keystore.Keystore) bertyprotocol.AccountKeys {
	return &Account{
		ks: ks,
	}
}

// NewWithExistingKeys creates a new Account instance and registers the supplied secret key, useful when migrating account to another device
func NewWithExistingKeys(ks keystore.Keystore, sk crypto.PrivKey, proofSK crypto.PrivKey) (*Account, error) {
	acc := &Account{
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

var _ bertyprotocol.AccountKeys = (*Account)(nil)
