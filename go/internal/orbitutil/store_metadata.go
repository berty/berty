package orbitutil

import (
	"context"

	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/basestore"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/golang/protobuf/proto"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/account"
	"berty.tech/berty/go/internal/bertycrypto"
	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

const GroupMetadataStoreType = "berty_group_metadata"

type MetadataStoreImpl struct {
	basestore.BaseStore
	g   *bertyprotocol.Group
	acc *account.Account
	mk  bertycrypto.MessageKeys
}

func (m *MetadataStoreImpl) ListEvents(ctx context.Context) <-chan *bertyprotocol.GroupMetadataEvent {
	ch := make(chan *bertyprotocol.GroupMetadataEvent)

	go func() {
		log := m.OpLog()

		for _, e := range log.GetEntries().Slice() {
			op, err := operation.ParseOperation(e)
			if err != nil {
				// TODO: log
				continue
			}

			meta, event, err := bertyprotocol.OpenGroupEnvelope(m.g, op.GetValue())
			if err != nil {
				// TODO: log
				continue
			}

			metaEvent, err := bertyprotocol.NewGroupMetadataEventFromEntry(log, e, meta, event, m.g)
			if err != nil {
				// TODO: log
				continue
			}

			ch <- metaEvent
		}

		close(ch)
	}()

	return ch
}

func (m *MetadataStoreImpl) JoinGroup(ctx context.Context) (operation.Operation, error) {
	md, err := m.acc.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return MetadataStoreJoinGroup(ctx, m, m.g, md)
}

func MetadataStoreJoinGroup(ctx context.Context, m MetadataStore, g *bertyprotocol.Group, md *account.OwnMemberDevice) (operation.Operation, error) {
	device, err := md.Device.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	member, err := md.Member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	k, err := m.GetMemberByDevice(md.Device.GetPublic())
	if err == nil && k != nil {
		return nil, nil
	}

	memberSig, err := md.Member.Sign(device)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	event := &bertyprotocol.GroupAddMemberDevice{
		MemberPK:  member,
		DevicePK:  device,
		MemberSig: memberSig,
	}

	sig, err := SignProto(event, md.Device)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return MetadataStoreAddEvent(ctx, m, g, bertyprotocol.EventTypeGroupMemberDeviceAdded, event, sig)
}

func (m *MetadataStoreImpl) SendSecret(ctx context.Context, memberPK crypto.PubKey) (operation.Operation, error) {
	md, err := m.acc.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ok, err := m.AreSecretsAlreadySent(memberPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if ok {
		return nil, errcode.ErrGroupSecretAlreadySentToMember
	}

	if devs, err := m.GetDevicesForMember(memberPK); len(devs) == 0 || err != nil {
		return nil, errcode.ErrInvalidInput
	}

	ds, err := bertycrypto.DeviceSecret(ctx, m.g, m.mk, m.acc)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	return MetadataStoreSendSecret(ctx, m, m.g, md, memberPK, ds)
}

func MetadataStoreSendSecret(ctx context.Context, m MetadataStore, g *bertyprotocol.Group, md *account.OwnMemberDevice, memberPK crypto.PubKey, ds *bertyprotocol.DeviceSecret) (operation.Operation, error) {
	payload, err := group.NewSecretEntryPayload(md.Device, memberPK, ds, g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	devicePKRaw, err := md.Device.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	memberPKRaw, err := memberPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event := &bertyprotocol.GroupAddDeviceSecret{
		DevicePK:     devicePKRaw,
		DestMemberPK: memberPKRaw,
		Payload:      payload,
	}

	sig, err := SignProto(event, md.Device)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return MetadataStoreAddEvent(ctx, m, g, bertyprotocol.EventTypeGroupDeviceSecretAdded, event, sig)
}

func (m *MetadataStoreImpl) ClaimGroupOwnership(ctx context.Context, groupSK crypto.PrivKey) (operation.Operation, error) {
	md, err := m.acc.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	memberPK, err := md.Member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event := &bertyprotocol.MultiMemberInitialMember{
		MemberPK: memberPK,
	}

	sig, err := SignProto(event, groupSK)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return MetadataStoreAddEvent(ctx, m, m.g, bertyprotocol.EventTypeMultiMemberGroupInitialMemberAnnounced, event, sig)
}

func SignProto(message proto.Message, sk crypto.PrivKey) ([]byte, error) {
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

func MetadataStoreAddEvent(ctx context.Context, m MetadataStore, g *bertyprotocol.Group, eventType bertyprotocol.EventType, event proto.Marshaler, sig []byte) (operation.Operation, error) {
	env, err := bertyprotocol.SealGroupEnvelope(g, eventType, event, sig)
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

func (m *MetadataStoreImpl) GetMemberByDevice(pk crypto.PubKey) (crypto.PubKey, error) {
	return m.Index().(*metadataStoreIndex).GetMemberByDevice(pk)
}

func (m *MetadataStoreImpl) GetDevicesForMember(pk crypto.PubKey) ([]crypto.PubKey, error) {
	return m.Index().(*metadataStoreIndex).GetDevicesForMember(pk)
}

func (m *MetadataStoreImpl) MemberCount() int {
	return m.Index().(*metadataStoreIndex).MemberCount()
}

func (m *MetadataStoreImpl) DeviceCount() int {
	return m.Index().(*metadataStoreIndex).DeviceCount()
}

func (m *MetadataStoreImpl) ListMembers() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).ListMembers()
}

func (m *MetadataStoreImpl) ListDevices() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).ListDevices()
}

func (m *MetadataStoreImpl) ListAdmins() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).ListAdmins()
}

func (m *MetadataStoreImpl) AreSecretsAlreadySent(pk crypto.PubKey) (bool, error) {
	return m.Index().(*metadataStoreIndex).AreSecretsAlreadySent(pk)
}

func ConstructorFactoryGroupMetadata(s *bertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		g, err := s.getGroupFromOptions(options)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		md, err := s.account.MemberDeviceForGroup(g)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		store := &MetadataStoreImpl{
			g:   g,
			mk:  s.mk,
			acc: s.account,
		}

		options.Index = NewMetadataIndex(ctx, store, g, md.Public())

		if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBInit.Wrap(err)
		}

		return store, nil
	}
}

var _ MetadataStore = (*MetadataStoreImpl)(nil)
