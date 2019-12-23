package storemember

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

const StoreType = "berty_member"

type memberStore struct {
	storegroup.BaseGroupStore
}

func (m *memberStore) MemberCount() (int, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return 0, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	return len(tree.membersByMember), nil
}

func (m *memberStore) GetEntryByMember(memberPubKey crypto.PubKey) (orbitutilapi.MemberEntry, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	memberPubKeyBytes, err := memberPubKey.Raw()
	if err != nil {
		return orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("unable to get member pubkey raw data"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	entry, ok := tree.membersByMember[string(memberPubKeyBytes)]
	if !ok {
		return orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("member doesn't exists"))
	}

	return *entry, nil
}

func (m *memberStore) ListMembers() ([]crypto.PubKey, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return []crypto.PubKey{}, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	var memberList []crypto.PubKey
	for member := range tree.membersByMember {
		memberPubKey, err := crypto.UnmarshalEd25519PublicKey([]byte(member))
		if err != nil {
			return []crypto.PubKey{}, errcode.TODO.Wrap(errors.Wrap(err, "unable to unmarshal member pubkey"))
		}
		memberList = append(memberList, memberPubKey)
	}

	return memberList, nil
}

func (m *memberStore) DeviceCount() (int, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return 0, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	return len(tree.membersByDevice), nil
}

func (m *memberStore) GetEntryByDevice(devicePubKey crypto.PubKey) (orbitutilapi.MemberEntry, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	devicePubKeyBytes, err := devicePubKey.Raw()
	if err != nil {
		return orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("unable to get device pubkey raw data"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	entry, ok := tree.membersByDevice[string(devicePubKeyBytes)]
	if !ok {
		return orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("device doesn't exists"))
	}

	return *entry, nil
}

func (m *memberStore) ListDevices() ([]crypto.PubKey, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return []crypto.PubKey{}, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	var deviceList []crypto.PubKey
	for device := range tree.membersByDevice {
		devicePubKey, err := crypto.UnmarshalEd25519PublicKey([]byte(device))
		if err != nil {
			return []crypto.PubKey{}, errcode.TODO.Wrap(errors.Wrap(err, "unable to unmarshal device pubkey"))
		}
		deviceList = append(deviceList, devicePubKey)
	}

	return deviceList, nil
}

func (m *memberStore) InviterCount() (int, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return 0, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	return len(tree.membersByInviter), nil
}

func (m *memberStore) GetEntriesByInviter(inviterPubKey crypto.PubKey) ([]orbitutilapi.MemberEntry, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return []orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	inviterPubKeyBytes, err := inviterPubKey.Raw()
	if err != nil {
		return []orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("unable to get inviter pubkey raw data"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	entries, ok := tree.membersByInviter[string(inviterPubKeyBytes)]
	if !ok {
		return []orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(errors.New("inviter doesn't exists"))
	}

	entriesCopy := make([]orbitutilapi.MemberEntry, len(entries))
	for i, entry := range entries {
		entriesCopy[i] = *entry
	}

	return entriesCopy, nil
}

func (m *memberStore) ListInviters() ([]crypto.PubKey, error) {
	tree, ok := m.Index().Get("").(*memberTree)
	if !ok {
		return []crypto.PubKey{}, errcode.TODO.Wrap(errors.New("unable to cast member tree"))
	}

	tree.muMemberTree.RLock()
	defer tree.muMemberTree.RUnlock()
	var inviterList []crypto.PubKey
	for inviter := range tree.membersByInviter {
		inviterPubKey, err := crypto.UnmarshalEd25519PublicKey([]byte(inviter))
		if err != nil {
			return []crypto.PubKey{}, errcode.TODO.Wrap(errors.Wrap(err, "unable to unmarshal inviter pubkey"))
		}
		inviterList = append(inviterList, inviterPubKey)
	}

	return inviterList, nil
}

func (m *memberStore) GetGroupCreator() (orbitutilapi.MemberEntry, error) {
	// Inviter key of group creator == groupID key
	invitees, err := m.GetEntriesByInviter(m.GetGroupContext().GetGroup().PubKey)
	if err != nil {
		return orbitutilapi.MemberEntry{}, errcode.TODO.Wrap(err)
	}

	// Only one member must use the invitation issued during group creation
	return invitees[0], nil
}

func (m *memberStore) RedeemInvitation(ctx context.Context, invitation *group.Invitation) (operation.Operation, error) {
	payload, err := group.NewMemberEntryPayload(m.GetGroupContext().GetMemberPrivKey(), m.GetGroupContext().GetDevicePrivKey(), invitation)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	env, err := group.SealStorePayload(payload, m.GetGroupContext().GetGroup(), m.GetGroupContext().GetDevicePrivKey())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	op := operation.NewOperation(nil, "ADD", env)

	e, err := m.AddOperation(ctx, op, nil)
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
		store := &memberStore{}
		if err := s.InitGroupStore(ctx, NewMemberStoreIndex, store, ipfs, identity, addr, options); err != nil {
			return nil, errcode.TODO.Wrap(errors.Wrap(err, "unable to initialize base store"))
		}

		return store, nil
	}
}

var _ orbitutilapi.MemberStore = (*memberStore)(nil)
