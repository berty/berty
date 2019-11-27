package settingstore

import (
	"context"
	"encoding/base64"
	"fmt"

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

const StoreType = "berty_settings"

func keyAsString(key crypto.PubKey) (string, error) {
	raw, err := key.Raw()
	if err != nil {
		return "", errcode.TODO.Wrap(err)
	}

	return base64.StdEncoding.EncodeToString(raw), nil
}

func isAllowedToWriteSetting(memberStore orbitutilapi.MemberStore, payload *group.SettingsEntryPayload) error {
	if payload.Type != group.SettingsEntryPayload_PayloadTypeGroupSetting {
		return nil
	}

	members, err := memberStore.ListMembers()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if len(members) == 0 {
		return errcode.TODO.Wrap(fmt.Errorf("no members listed"))
	}

	author, err := payload.GetSignerPubKey()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if !members[0].Member.Equals(author) {
		return errcode.TODO.Wrap(fmt.Errorf("only group creator is allowed to edit group settings"))
	}

	return nil
}

type settingsStore struct {
	storegroup.BaseGroupStore
}

func (s *settingsStore) set(ctx context.Context, payload *group.SettingsEntryPayload, member crypto.PrivKey) (operation.Operation, error) {
	rawMember, err := member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	payload.MemberPubKey = rawMember

	env, err := group.SealStorePayload(payload, s.GetGroupContext().GetGroup(), member)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if err := isAllowedToWriteSetting(s.GetGroupContext().GetMemberStore(), payload); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op := operation.NewOperation(nil, "SET", env)

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

func (s *settingsStore) Set(ctx context.Context, name string, value []byte, member crypto.PrivKey) (operation.Operation, error) {
	return s.set(ctx, &group.SettingsEntryPayload{
		Type:  group.SettingsEntryPayload_PayloadTypeMemberSetting,
		Key:   name,
		Value: value,
	}, member)
}

func (s *settingsStore) Get(member crypto.PubKey) (map[string][]byte, error) {
	namespace, err := keyAsString(member)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return s.get(namespace)
}

func (s *settingsStore) get(namespace string) (map[string][]byte, error) {
	raw := s.Index().Get(namespace)
	values, ok := raw.(map[string][]byte)

	if !ok {
		return map[string][]byte{}, errcode.TODO.Wrap(fmt.Errorf("unable to cast value from index"))
	}

	return values, nil
}

func (s *settingsStore) SetForGroup(ctx context.Context, name string, value []byte, member crypto.PrivKey) (operation.Operation, error) {
	return s.set(ctx, &group.SettingsEntryPayload{
		Type:  group.SettingsEntryPayload_PayloadTypeGroupSetting,
		Key:   name,
		Value: value,
	}, member)
}

func (s *settingsStore) GetForGroup() (map[string][]byte, error) {
	return s.get("")
}

func ConstructorFactory(s orbitutilapi.BertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		store := &settingsStore{}
		if err := s.InitGroupStore(ctx, NewSettingsStoreIndex, store, ipfs, identity, addr, options); err != nil {
			return nil, errors.Wrap(err, "unable to initialize base store")
		}

		return store, nil
	}
}

var _ orbitutilapi.SettingsStore = (*settingsStore)(nil)
