package orbitutil

import (
	"context"
	"crypto/rand"
	"io"
	"io/ioutil"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/basestore"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/golang/protobuf/proto"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/box"
)

const GroupMetadataStoreType = "berty_group_metadata"

type MetadataStoreImpl struct {
	basestore.BaseStore
	g   *bertytypes.Group
	acc bertyprotocol.AccountKeys
	mk  bertyprotocol.MessageKeys
}

func isMultiMemberGroup(m *MetadataStoreImpl) bool {
	return m.g.GroupType == bertytypes.GroupTypeMultiMember
}

func isAccountGroup(m *MetadataStoreImpl) bool {
	return m.g.GroupType == bertytypes.GroupTypeAccount
}

func isContactGroup(m *MetadataStoreImpl) bool {
	return m.g.GroupType == bertytypes.GroupTypeContact
}

func (m *MetadataStoreImpl) typeChecker(types ...func(m *MetadataStoreImpl) bool) bool {
	for _, t := range types {
		if t(m) == true {
			return true
		}
	}

	return false
}

func (m *MetadataStoreImpl) ListEvents(ctx context.Context) <-chan *bertytypes.GroupMetadataEvent {
	ch := make(chan *bertytypes.GroupMetadataEvent)

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

func (m *MetadataStoreImpl) AddDeviceToGroup(ctx context.Context) (operation.Operation, error) {
	md, err := m.acc.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return MetadataStoreAddDeviceToGroup(ctx, m, m.g, md)
}

func MetadataStoreAddDeviceToGroup(ctx context.Context, m bertyprotocol.MetadataStore, g *bertytypes.Group, md *bertyprotocol.OwnMemberDevice) (operation.Operation, error) {
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

	event := &bertytypes.GroupAddMemberDevice{
		MemberPK:  member,
		DevicePK:  device,
		MemberSig: memberSig,
	}

	sig, err := SignProto(event, md.Device)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return MetadataStoreAddEvent(ctx, m, g, bertytypes.EventTypeGroupMemberDeviceAdded, event, sig)
}

func (m *MetadataStoreImpl) SendSecret(ctx context.Context, memberPK crypto.PubKey) (operation.Operation, error) {
	md, err := m.acc.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ok, err := m.Index().(*metadataStoreIndex).areSecretsAlreadySent(memberPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if ok {
		return nil, errcode.ErrGroupSecretAlreadySentToMember
	}

	if devs, err := m.GetDevicesForMember(memberPK); len(devs) == 0 || err != nil {
		return nil, errcode.ErrInvalidInput
	}

	ds, err := bertyprotocol.GetDeviceSecret(ctx, m.g, m.mk, m.acc)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	return MetadataStoreSendSecret(ctx, m, m.g, md, memberPK, ds)
}

func MetadataStoreSendSecret(ctx context.Context, m bertyprotocol.MetadataStore, g *bertytypes.Group, md *bertyprotocol.OwnMemberDevice, memberPK crypto.PubKey, ds *bertytypes.DeviceSecret) (operation.Operation, error) {
	payload, err := NewSecretEntryPayload(md.Device, memberPK, ds, g)
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

	event := &bertytypes.GroupAddDeviceSecret{
		DevicePK:     devicePKRaw,
		DestMemberPK: memberPKRaw,
		Payload:      payload,
	}

	sig, err := SignProto(event, md.Device)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return MetadataStoreAddEvent(ctx, m, g, bertytypes.EventTypeGroupDeviceSecretAdded, event, sig)
}

func (m *MetadataStoreImpl) ClaimGroupOwnership(ctx context.Context, groupSK crypto.PrivKey) (operation.Operation, error) {
	if !m.typeChecker(isMultiMemberGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	md, err := m.acc.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	memberPK, err := md.Member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event := &bertytypes.MultiMemberInitialMember{
		MemberPK: memberPK,
	}

	sig, err := SignProto(event, groupSK)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return MetadataStoreAddEvent(ctx, m, m.g, bertytypes.EventTypeMultiMemberGroupInitialMemberAnnounced, event, sig)
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

func MetadataStoreAddEvent(ctx context.Context, m bertyprotocol.MetadataStore, g *bertytypes.Group, eventType bertytypes.EventType, event proto.Marshaler, sig []byte) (operation.Operation, error) {
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

func (m *MetadataStoreImpl) ListAdmins() []crypto.PubKey {
	if m.typeChecker(isContactGroup, isAccountGroup) {
		return m.ListMembers()
	}

	return m.Index().(*metadataStoreIndex).ListAdmins()
}

func (m *MetadataStoreImpl) GetIncomingContactRequestsStatus() (bool, *bertytypes.ShareableContact) {
	if !m.typeChecker(isAccountGroup) {
		return false, nil
	}

	enabled := m.Index().(*metadataStoreIndex).ContactRequestsEnabled()
	seed := m.Index().(*metadataStoreIndex).ContactRequestsSeed()

	if len(seed) == 0 {
		return enabled, nil
	}

	md, err := m.acc.MemberDeviceForGroup(m.g)
	if err != nil {
		// TODO: log
		return enabled, nil
	}

	pkBytes, err := md.Member.GetPublic().Raw()
	if err != nil {
		// TODO: log
		return enabled, nil
	}

	contactRef := &bertytypes.ShareableContact{
		PK:                   pkBytes,
		PublicRendezvousSeed: seed,
	}

	return enabled, contactRef
}

func (m *MetadataStoreImpl) ListMembers() []crypto.PubKey {
	if m.typeChecker(isAccountGroup) {
		return nil
	}

	if m.typeChecker(isContactGroup) {
		return nil
	}

	if m.typeChecker(isMultiMemberGroup) {
		return m.Index().(*metadataStoreIndex).ListMembers()
	}

	return nil
}

func (m *MetadataStoreImpl) ListDevices() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).ListDevices()
}

func (m *MetadataStoreImpl) ListMultiMemberGroups() []*bertytypes.Group {
	if !m.typeChecker(isAccountGroup) {
		return nil
	}

	idx, ok := m.Index().(*metadataStoreIndex)
	if !ok {
		return nil
	}
	idx.lock.Lock()
	defer idx.lock.Unlock()

	groups := []*bertytypes.Group(nil)

	for _, c := range idx.groups {
		if c.state != accountGroupJoinedStateJoined {
			continue
		}

		groups = append(groups, c.group)
	}

	return groups

}

func (m *MetadataStoreImpl) ListContactsByStatus(states ...bertytypes.ContactState) []*bertytypes.ShareableContact {
	if !m.typeChecker(isAccountGroup) {
		return nil
	}

	idx, ok := m.Index().(*metadataStoreIndex)
	if !ok {
		return nil
	}
	idx.lock.Lock()
	defer idx.lock.Unlock()

	contacts := []*bertytypes.ShareableContact(nil)

	for _, c := range idx.contacts {
		hasState := false
		for _, s := range states {
			if c.state == s {
				hasState = true
				break
			}
		}

		if hasState {
			contacts = append(contacts, c.contact)
		}
	}

	return contacts
}

func (m *MetadataStoreImpl) checkIfInGroup(pk []byte) bool {
	idx, ok := m.Index().(*metadataStoreIndex)
	if !ok {
		return false
	}

	idx.lock.Lock()
	defer idx.lock.Unlock()

	if existingGroup, ok := idx.groups[string(pk)]; ok && existingGroup.state == accountGroupJoinedStateJoined {
		return true
	}

	return false
}

// GroupJoin indicates the payload includes that the account has joined a group
func (m *MetadataStoreImpl) GroupJoin(ctx context.Context, g *bertytypes.Group) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if err := g.IsValid(); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if m.checkIfInGroup(g.PublicKey) {
		return nil, errcode.ErrInvalidInput
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountGroupJoined{
		Group: g,
	}, bertytypes.EventTypeAccountGroupJoined)
}

// GroupLeave indicates the payload includes that the account has left a group
func (m *MetadataStoreImpl) GroupLeave(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if pk == nil {
		return nil, errcode.ErrInvalidInput
	}

	bytes, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	if !m.checkIfInGroup(bytes) {
		return nil, errcode.ErrInvalidInput
	}

	return m.groupAction(ctx, pk, &bertytypes.AccountGroupLeft{}, bertytypes.EventTypeAccountGroupLeft)
}

// ContactRequestDisable indicates the payload includes that the account has disabled incoming contact requests
func (m *MetadataStoreImpl) ContactRequestDisable(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountContactRequestDisabled{}, bertytypes.EventTypeAccountContactRequestDisabled)
}

// ContactRequestEnable indicates the payload includes that the account has enabled incoming contact requests
func (m *MetadataStoreImpl) ContactRequestEnable(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountContactRequestEnabled{}, bertytypes.EventTypeAccountContactRequestEnabled)
}

// ContactRequestReferenceReset indicates the payload includes that the account has a new contact request reference
func (m *MetadataStoreImpl) ContactRequestReferenceReset(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	seed, err := ioutil.ReadAll(io.LimitReader(rand.Reader, bertytypes.RendezvousSeedLength))
	if err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountContactRequestReferenceReset{
		RendezvousSeed: seed,
	}, bertytypes.EventTypeAccountContactRequestReferenceReset)
}

// ContactRequestOutgoingEnqueue indicates the payload includes that the account will attempt to send a new contact request
func (m *MetadataStoreImpl) ContactRequestOutgoingEnqueue(ctx context.Context, contact *bertytypes.ShareableContact) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if err := contact.CheckFormat(); err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	accSK, err := m.acc.AccountPrivKey()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if contact.IsSamePK(accSK.GetPublic()) {
		return nil, errcode.ErrInvalidInput
	}

	pk, err := contact.GetPubKey()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if m.checkContactStatus(pk, bertytypes.ContactStateRemoved, bertytypes.ContactStateDiscarded, bertytypes.ContactStateReceived) {
		return m.ContactRequestOutgoingSent(ctx, pk)
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountContactRequestEnqueued{
		ContactPK:             contact.PK,
		ContactRendezvousSeed: contact.PublicRendezvousSeed,
		ContactMetadata:       contact.Metadata,
	}, bertytypes.EventTypeAccountContactRequestOutgoingEnqueued)
}

// ContactRequestOutgoingSent indicates the payload includes that the account has sent a contact request
func (m *MetadataStoreImpl) ContactRequestOutgoingSent(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, bertytypes.ContactStateToRequest, bertytypes.ContactStateRemoved, bertytypes.ContactStateReceived, bertytypes.ContactStateDiscarded) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactRequestSent{}, bertytypes.EventTypeAccountContactRequestOutgoingSent)
}

// ContactRequestIncomingReceived indicates the payload includes that the account has received a contact request
func (m *MetadataStoreImpl) ContactRequestIncomingReceived(ctx context.Context, contact *bertytypes.ShareableContact) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if err := contact.CheckFormat(); err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	accSK, err := m.acc.AccountPrivKey()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if contact.IsSamePK(accSK.GetPublic()) {
		return nil, errcode.ErrInvalidInput
	}

	pk, err := contact.GetPubKey()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	// Contact was waiting to be accepted, mark as sent instead
	if m.checkContactStatus(pk, bertytypes.ContactStateToRequest) {
		return m.ContactRequestOutgoingSent(ctx, pk)
	}

	if m.checkContactStatus(pk, bertytypes.ContactStateReceived, bertytypes.ContactStateAdded, bertytypes.ContactStateBlocked) {
		return nil, errcode.ErrInvalidInput
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountContactRequestReceived{
		ContactPK:             contact.PK,
		ContactRendezvousSeed: contact.PublicRendezvousSeed,
		ContactMetadata:       contact.Metadata,
	}, bertytypes.EventTypeAccountContactRequestIncomingReceived)
}

// ContactRequestIncomingDiscard indicates the payload includes that the account has ignored a contact request
func (m *MetadataStoreImpl) ContactRequestIncomingDiscard(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, bertytypes.ContactStateReceived) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactRequestDiscarded{}, bertytypes.EventTypeAccountContactRequestIncomingDiscarded)
}

// ContactRequestIncomingAccept indicates the payload includes that the account has accepted a contact request
func (m *MetadataStoreImpl) ContactRequestIncomingAccept(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, bertytypes.ContactStateReceived) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactRequestAccepted{}, bertytypes.EventTypeAccountContactRequestIncomingAccepted)
}

// ContactBlock indicates the payload includes that the account has blocked a contact
func (m *MetadataStoreImpl) ContactBlock(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	accSK, err := m.acc.AccountPrivKey()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if accSK.GetPublic().Equals(pk) {
		return nil, errcode.ErrInvalidInput
	}

	if m.checkContactStatus(pk, bertytypes.ContactStateBlocked) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactBlocked{}, bertytypes.EventTypeAccountContactBlocked)
}

// ContactUnblock indicates the payload includes that the account has unblocked a contact
func (m *MetadataStoreImpl) ContactUnblock(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, bertytypes.ContactStateBlocked) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactUnblocked{}, bertytypes.EventTypeAccountContactUnblocked)
}

func (m *MetadataStoreImpl) ContactSendAliasKey(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isContactGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	sk, err := m.acc.AccountProofPrivKey()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	alias, err := sk.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.ContactAddAliasKey{
		AliasPK: alias,
	}, bertytypes.EventTypeContactAliasKeyAdded)

}

func (m *MetadataStoreImpl) SendAliasProof(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isMultiMemberGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	resolver := []byte(nil) // TODO: should be a hmac value of something for quicker searches
	proof := []byte(nil)    // TODO: should be a signed value of something

	return m.attributeSignAndAddEvent(ctx, &bertytypes.MultiMemberGroupAddAliasResolver{
		AliasResolver: resolver,
		AliasProof:    proof,
	}, bertytypes.EventTypeMultiMemberGroupAliasResolverAdded)
}

func (m *MetadataStoreImpl) SendAppMetadata(ctx context.Context, message []byte) (operation.Operation, error) {
	return m.attributeSignAndAddEvent(ctx, &bertytypes.AppMetadata{
		Message: message,
	}, bertytypes.EventTypeGroupMetadataPayloadSent)
}

type accountSignableEvent interface {
	proto.Message
	proto.Marshaler
	SetDevicePK([]byte)
}

type accountContactEvent interface {
	accountSignableEvent
	SetContactPK([]byte)
}

type accountGroupEvent interface {
	accountSignableEvent
	SetGroupPK([]byte)
}

func (m *MetadataStoreImpl) attributeSignAndAddEvent(ctx context.Context, evt accountSignableEvent, eventType bertytypes.EventType) (operation.Operation, error) {
	md, err := m.acc.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	device, err := md.Device.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	evt.SetDevicePK(device)

	sig, err := SignProto(evt, md.Device)
	if err != nil {
		return nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	return MetadataStoreAddEvent(ctx, m, m.g, eventType, evt, sig)
}

func (m *MetadataStoreImpl) contactAction(ctx context.Context, pk crypto.PubKey, event accountContactEvent, evtType bertytypes.EventType) (operation.Operation, error) {
	if pk == nil || event == nil {
		return nil, errcode.ErrInvalidInput
	}

	pkBytes, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event.SetContactPK(pkBytes)

	return m.attributeSignAndAddEvent(ctx, event, evtType)
}

func (m *MetadataStoreImpl) groupAction(ctx context.Context, pk crypto.PubKey, event accountGroupEvent, evtType bertytypes.EventType) (operation.Operation, error) {
	pkBytes, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event.SetGroupPK(pkBytes)

	return m.attributeSignAndAddEvent(ctx, event, evtType)
}

func (m *MetadataStoreImpl) checkContactStatus(pk crypto.PubKey, states ...bertytypes.ContactState) bool {
	if pk == nil {
		return false
	}

	contact, err := m.Index().(*metadataStoreIndex).GetContact(pk)
	if err != nil {
		// TODO: log
		return false
	}

	for _, s := range states {
		if contact.state == s {
			return true
		}
	}

	return false
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

func NewSecretEntryPayload(localDevicePrivKey crypto.PrivKey, remoteMemberPubKey crypto.PubKey, secret *bertytypes.DeviceSecret, group *bertytypes.Group) ([]byte, error) {
	message, err := secret.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	nonce, err := bertyprotocol.GroupIDToNonce(group)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	mongPriv, mongPub, err := cryptoutil.EdwardsToMontgomery(localDevicePrivKey, remoteMemberPubKey)
	if err != nil {
		return nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	encryptedSecret := box.Seal(nil, message, nonce, mongPub, mongPriv)

	return encryptedSecret, nil
}

var _ bertyprotocol.MetadataStore = (*MetadataStoreImpl)(nil)
