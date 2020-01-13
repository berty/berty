package storesetting

import (
	"context"
	"encoding/base64"
	"fmt"

	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/orbitutil/orbitutilapi"
	"berty.tech/berty/go/internal/orbitutil/storegroup"
	"berty.tech/berty/go/pkg/errcode"
)

const StoreType = "berty_setting"

func keyAsString(key crypto.PubKey) (string, error) {
	raw, err := key.Raw()
	if err != nil {
		return "", errcode.ErrSerialization.Wrap(err)
	}

	return base64.StdEncoding.EncodeToString(raw), nil
}

// TODO: shouldn't this function be named isAllowedToWriteGroupSetting instead?
func isAllowedToWriteSetting(memberStore orbitutilapi.MemberStore, payload *group.SettingEntryPayload) error {
	if payload.Type != group.SettingEntryPayload_PayloadTypeGroupSetting {
		return nil
	}

	author, err := payload.GetSignerPubKey()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	creator, err := memberStore.GetGroupCreator()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if !author.Equals(creator.Member()) {
		return errcode.ErrNotAuthorized.Wrap(fmt.Errorf("only group creator is allowed to edit group settings"))
	}

	return nil
}

type settingStore struct {
	storegroup.BaseGroupStore
}

func (s *settingStore) set(ctx context.Context, payload *group.SettingEntryPayload) (operation.Operation, error) {
	rawMember, err := s.GetGroupContext().GetMemberPrivKey().GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	payload.MemberPubKey = rawMember

	env, err := group.SealStorePayload(payload, s.GetGroupContext().GetGroup(), s.GetGroupContext().GetMemberPrivKey())
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	if err := isAllowedToWriteSetting(s.GetGroupContext().GetMemberStore(), payload); err != nil {
		return nil, errcode.ErrNotAuthorized.Wrap(err)
	}

	op := operation.NewOperation(nil, "SET", env)

	e, err := s.AddOperation(ctx, op, nil)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	op, err = operation.ParseOperation(e)
	if err != nil {
		return nil, errcode.ErrOrbitDBDeserialization.Wrap(err)
	}

	return op, nil
}

func (s *settingStore) Set(ctx context.Context, name string, value []byte) (operation.Operation, error) {
	return s.set(ctx, &group.SettingEntryPayload{
		Type:  group.SettingEntryPayload_PayloadTypeMemberSetting,
		Key:   name,
		Value: value,
	})
}

func (s *settingStore) Get(member crypto.PubKey) (map[string][]byte, error) {
	namespace, err := keyAsString(member)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return s.get(namespace)
}

func (s *settingStore) get(namespace string) (map[string][]byte, error) {
	raw := s.Index().Get(namespace)
	values, ok := raw.(map[string][]byte)

	if !ok {
		return map[string][]byte{}, errcode.ErrOrbitDBIndexCast.Wrap(fmt.Errorf("unable to cast value from index"))
	}

	return values, nil
}

func (s *settingStore) SetForGroup(ctx context.Context, name string, value []byte) (operation.Operation, error) {
	return s.set(ctx, &group.SettingEntryPayload{
		Type:  group.SettingEntryPayload_PayloadTypeGroupSetting,
		Key:   name,
		Value: value,
	})
}

func (s *settingStore) GetForGroup() (map[string][]byte, error) {
	return s.get("")
}

func ConstructorFactory(s orbitutilapi.BertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		store := &settingStore{}
		if err := s.InitGroupStore(ctx, NewSettingStoreIndex, store, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBOpen.Wrap(err)
		}

		return store, nil
	}
}

var _ orbitutilapi.SettingStore = (*settingStore)(nil)
