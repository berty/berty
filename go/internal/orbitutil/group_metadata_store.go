package orbitutil

import (
	"context"

	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/golang/protobuf/proto"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

const GroupMetadataStoreType = "berty_group_metadata"

type MemberDevice struct {
	Member crypto.PubKey
	Device crypto.PubKey
}

type metadataStore struct {
	BaseGroupStore
}

func (m *metadataStore) JoinGroup(ctx context.Context) (operation.Operation, error) {
	device, err := m.GetGroupContext().GetDevicePrivKey().GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	member, err := m.GetGroupContext().GetMemberPrivKey().GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	// TODO: how to sign
	sig := []byte{}
	memberSig := []byte{}

	event := &bertyprotocol.GroupAddMemberDevice{
		MemberPK:  member,
		DevicePK:  device,
		MemberSig: memberSig,
	}

	return m.addEvent(ctx, bertyprotocol.EventTypeGroupMemberDeviceAdded, event, sig)
}

func (m *metadataStore) SendSecret(ctx context.Context, memberPK crypto.PubKey) (operation.Operation, error) {
	ok, err := m.AreSecretsAlreadySent(memberPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if ok {
		return nil, errcode.ErrGroupSecretAlreadySentToMember
	}

	deviceSK := m.GetGroupContext().GetDevicePrivKey()

	devicePKRaw, err := deviceSK.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	if devs, err := m.GetDevicesForMember(memberPK); len(devs) == 0 || err != nil {
		return nil, errcode.ErrInvalidInput
	}

	memberPKRaw, err := memberPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	payload, err := group.NewSecretEntryPayload(deviceSK, memberPK, m.GetGroupContext().GetDeviceSecret(), m.GetGroupContext().GetGroup())
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	event := &bertyprotocol.GroupAddDeviceSecret{
		DevicePK:     devicePKRaw,
		DestMemberPK: memberPKRaw,
		Payload:      payload,
	}

	sig, err := m.signProto(event, m.GetGroupContext().GetDevicePrivKey())
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return m.addEvent(ctx, bertyprotocol.EventTypeGroupDeviceSecretAdded, event, sig)
}

func (m *metadataStore) ClaimGroupOwnership(ctx context.Context, groupSK crypto.PrivKey) (operation.Operation, error) {
	memberPK, err := m.GetGroupContext().GetMemberPrivKey().GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event := &bertyprotocol.MultiMemberInitialMember{
		MemberPK: memberPK,
	}

	sig, err := m.signProto(event, groupSK)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return m.addEvent(ctx, bertyprotocol.EventTypeMultiMemberGroupInitialMemberAnnounced, event, sig)
}

func (m *metadataStore) signProto(message proto.Message, sk crypto.PrivKey) ([]byte, error) {
	data, err := proto.Marshal(message)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	sig, err := sk.Sign(data)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return sig, nil
}

func (m *metadataStore) addEvent(ctx context.Context, eventType bertyprotocol.EventType, event proto.Marshaler, sig []byte) (operation.Operation, error) {
	env, err := SealGroupEnvelope(m.GetGroupContext().GetGroup(), eventType, event, sig)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	op := operation.NewOperation(nil, "ADD", env)

	e, err := m.AddOperation(ctx, op, nil)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	op, err = operation.ParseOperation(e)
	if err != nil {
		return nil, errcode.ErrOrbitDBDeserialization.Wrap(err)
	}

	return op, nil
}

func (m *metadataStore) GetMemberByDevice(pk crypto.PubKey) (crypto.PubKey, error) {
	return m.Index().(*metadataStoreIndex).GetMemberByDevice(pk)
}

func (m *metadataStore) GetDevicesForMember(pk crypto.PubKey) ([]crypto.PubKey, error) {
	return m.Index().(*metadataStoreIndex).GetDevicesForMember(pk)
}

func (m *metadataStore) MemberCount() int {
	return m.Index().(*metadataStoreIndex).MemberCount()
}

func (m *metadataStore) DeviceCount() int {
	return m.Index().(*metadataStoreIndex).DeviceCount()
}

func (m *metadataStore) ListMembers() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).ListMembers()
}

func (m *metadataStore) ListDevices() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).ListDevices()
}

func (m *metadataStore) ListAdmins() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).ListAdmins()
}

func (m *metadataStore) GetDeviceSecret(pk crypto.PubKey) (*bertyprotocol.DeviceSecret, error) {
	return m.Index().(*metadataStoreIndex).GetDeviceSecret(pk)
}

func (m *metadataStore) AreSecretsAlreadySent(pk crypto.PubKey) (bool, error) {
	return m.Index().(*metadataStoreIndex).AreSecretsAlreadySent(pk)
}

func ConstructorFactoryGroupMetadata(s BertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		store := &metadataStore{}
		if err := s.InitGroupStore(ctx, NewMetadataIndex, store, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBOpen.Wrap(err)
		}

		return store, nil
	}
}

var _ MetadataStore = (*metadataStore)(nil)
