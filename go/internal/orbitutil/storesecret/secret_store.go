package storesecret

import (
	"context"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/orbitutil/orbitutilapi"
	"berty.tech/berty/go/internal/orbitutil/storegroup"
	"berty.tech/berty/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
)

const StoreType = "berty_secret"

type secretStore struct {
	storegroup.BaseGroupStore
}

// GetDeviceSecret gets received device secret using senderDevicePubKey or
// "sent receipt" using remoteMemberPubKey
func (s *secretStore) GetDeviceSecret(pubKey crypto.PubKey) (*group.DeviceSecret, error) {
	pubKeyBytes, err := pubKey.Raw()
	if err != nil {
		return nil, errcode.TODO
	}

	value := s.Index().Get(string(pubKeyBytes))
	if value == nil {
		return nil, errcode.TODO.Wrap(errors.New("unable to get secret for this device"))
	}

	casted, ok := value.(*secretsMapEntry)
	if !ok {
		return nil, errcode.TODO.Wrap(errors.New("unable to cast interface to map entry"))
	}

	if !casted.exists {
		return nil, errcode.ErrGroupSecretEntryDoesNotExist
	}

	return casted.secret, nil
}

// SendSecret sends secret of this device to a group member
func (s *secretStore) SendSecret(ctx context.Context, remoteMemberPubKey crypto.PubKey) (operation.Operation, error) {
	// Check if secret was already sent to this member
	_, err := s.GetDeviceSecret(remoteMemberPubKey)
	if err != nil && err != errcode.ErrGroupSecretEntryDoesNotExist {
		return nil, errcode.TODO.Wrap(errors.Wrap(err, "unable to check if secret was already sent"))
	} else if err == nil {
		return nil, errcode.ErrGroupSecretAlreadySentToMember
	}

	payload, err := group.NewSecretEntryPayload(s.GetGroupContext().GetDevicePrivKey(), remoteMemberPubKey, s.GetGroupContext().GetDeviceSecret(), s.GetGroupContext().GetGroup())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	env, err := group.SealStorePayload(payload, s.GetGroupContext().GetGroup(), s.GetGroupContext().GetDevicePrivKey())
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
		if err := s.InitGroupStore(ctx, NewSecretStoreIndex(ctx), store, ipfs, identity, addr, options); err != nil {
			return nil, errcode.TODO.Wrap(errors.Wrap(err, "unable to initialize base store"))
		}

		return store, nil
	}
}

var _ orbitutilapi.SecretStore = (*secretStore)(nil)
