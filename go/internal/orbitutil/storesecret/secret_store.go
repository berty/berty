package storesecret

import (
	"context"

	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
	"berty.tech/go/internal/orbitutil/storegroup"
	"berty.tech/go/pkg/errcode"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
)

const StoreType = "berty_secret"

type secretStore struct {
	storegroup.BaseGroupStore
}

// GetDeviceSecret gets secret device
func (s *secretStore) GetDeviceSecret(senderDevicePubKey crypto.PubKey) (*group.DeviceSecret, error) {
	senderBytes, err := senderDevicePubKey.Raw()
	if err != nil {
		return nil, errcode.TODO
	}

	value := s.Index().Get(string(senderBytes))
	if value == nil {
		return nil, errors.New("unable to get secret for this device")
	}

	casted, ok := value.(*secretsMapEntry)
	if !ok {
		return nil, errors.New("unable to cast interface to map entry")
	}

	if !casted.exists {
		return nil, errcode.ErrGroupSecretEntryDoesNotExist
	}

	return casted.secret, nil
}

// SendSecret sends secret of this device to another group member
func (s *secretStore) SendSecret(ctx context.Context, remoteMemberPubKey crypto.PubKey) (operation.Operation, error) {
	localDevicePrivKey := s.GetGroupContext().GetDevicePrivKey()
	deviceSecret := s.GetGroupContext().GetDeviceSecret()
	payload, err := group.NewSecretEntryPayload(localDevicePrivKey, remoteMemberPubKey, deviceSecret, s.GetGroupContext().GetGroup())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	env, err := group.SealStorePayload(payload, s.GetGroupContext().GetGroup(), localDevicePrivKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op := operation.NewOperation(nil, "ADD", env)

	e, err := s.AddOperation(ctx, op, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op, err = operation.ParseOperation(e)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return op, nil
}

func ConstructorFactory(s orbitutilapi.BertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		store := &secretStore{}
		if err := s.InitGroupStore(ctx, NewSecretStoreIndex, store, ipfs, identity, addr, options); err != nil {
			return nil, errors.Wrap(err, "unable to initialize base store")
		}

		return store, nil
	}
}

var _ orbitutilapi.SecretStore = (*secretStore)(nil)
