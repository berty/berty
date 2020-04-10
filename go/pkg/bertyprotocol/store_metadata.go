package bertyprotocol

import (
	"context"
	crand "crypto/rand"
	"fmt"
	"io"
	"io/ioutil"

	"encoding/base64"

	"berty.tech/berty/v2/go/internal/cryptoutil"
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
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"
)

const groupMetadataStoreType = "berty_group_metadata"

type metadataStore struct {
	basestore.BaseStore
	g      *bertytypes.Group
	devKS  DeviceKeystore
	mks    *MessageKeystore
	logger *zap.Logger
}

func isMultiMemberGroup(m *metadataStore) bool {
	return m.g.GroupType == bertytypes.GroupTypeMultiMember
}

func isAccountGroup(m *metadataStore) bool {
	return m.g.GroupType == bertytypes.GroupTypeAccount
}

func isContactGroup(m *metadataStore) bool {
	return m.g.GroupType == bertytypes.GroupTypeContact
}

func (m *metadataStore) typeChecker(types ...func(m *metadataStore) bool) bool {
	for _, t := range types {
		if t(m) {
			return true
		}
	}

	return false
}

func (m *metadataStore) setLogger(l *zap.Logger) {
	if l == nil {
		return
	}

	m.logger = l.With(zap.String("group-id", fmt.Sprintf("%.6s", base64.StdEncoding.EncodeToString(m.g.PublicKey))))

	if index, ok := m.Index().(loggable); ok {
		index.setLogger(m.logger)
	}
}

func (m *metadataStore) ListEvents(ctx context.Context) <-chan *bertytypes.GroupMetadataEvent {
	ch := make(chan *bertytypes.GroupMetadataEvent)

	go func() {
		log := m.OpLog()

		for _, e := range log.GetEntries().Slice() {
			op, err := operation.ParseOperation(e)
			if err != nil {
				continue
			}

			meta, event, err := openGroupEnvelope(m.g, op.GetValue())
			if err != nil {
				m.logger.Error("unable to open group envelope", zap.Error(err))
				continue
			}

			metaEvent, err := newGroupMetadataEventFromEntry(log, e, meta, event, m.g)
			if err != nil {
				m.logger.Error("unable to get group metadata event from entry", zap.Error(err))
				continue
			}

			ch <- metaEvent
		}

		close(ch)
	}()

	return ch
}

func (m *metadataStore) AddDeviceToGroup(ctx context.Context) (operation.Operation, error) {
	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return metadataStoreAddDeviceToGroup(ctx, m, m.g, md)
}

func metadataStoreAddDeviceToGroup(ctx context.Context, m *metadataStore, g *bertytypes.Group, md *ownMemberDevice) (operation.Operation, error) {
	device, err := md.device.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	member, err := md.member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	k, err := m.GetMemberByDevice(md.device.GetPublic())
	if err == nil && k != nil {
		return nil, nil
	}

	memberSig, err := md.member.Sign(device)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	event := &bertytypes.GroupAddMemberDevice{
		MemberPK:  member,
		DevicePK:  device,
		MemberSig: memberSig,
	}

	sig, err := signProto(event, md.device)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	return metadataStoreAddEvent(ctx, m, g, bertytypes.EventTypeGroupMemberDeviceAdded, event, sig)
}

func (m *metadataStore) SendSecret(ctx context.Context, memberPK crypto.PubKey) (operation.Operation, error) {
	md, err := m.devKS.MemberDeviceForGroup(m.g)
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
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		return nil, errcode.ErrInvalidInput
	}

	ds, err := getDeviceSecret(ctx, m.g, m.mks, m.devKS)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	return metadataStoreSendSecret(ctx, m, m.g, md, memberPK, ds)
}

func metadataStoreSendSecret(ctx context.Context, m *metadataStore, g *bertytypes.Group, md *ownMemberDevice, memberPK crypto.PubKey, ds *bertytypes.DeviceSecret) (operation.Operation, error) {
	payload, err := newSecretEntryPayload(md.device, memberPK, ds, g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	devicePKRaw, err := md.device.GetPublic().Raw()
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

	sig, err := signProto(event, md.device)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	return metadataStoreAddEvent(ctx, m, g, bertytypes.EventTypeGroupDeviceSecretAdded, event, sig)
}

func (m *metadataStore) ClaimGroupOwnership(ctx context.Context, groupSK crypto.PrivKey) (operation.Operation, error) {
	if !m.typeChecker(isMultiMemberGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	memberPK, err := md.member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event := &bertytypes.MultiMemberInitialMember{
		MemberPK: memberPK,
	}

	sig, err := signProto(event, groupSK)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	return metadataStoreAddEvent(ctx, m, m.g, bertytypes.EventTypeMultiMemberGroupInitialMemberAnnounced, event, sig)
}

func signProto(message proto.Message, sk crypto.PrivKey) ([]byte, error) {
	data, err := proto.Marshal(message)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	sig, err := sk.Sign(data)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	return sig, nil
}

func metadataStoreAddEvent(ctx context.Context, m *metadataStore, g *bertytypes.Group, eventType bertytypes.EventType, event proto.Marshaler, sig []byte) (operation.Operation, error) {
	env, err := sealGroupEnvelope(g, eventType, event, sig)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
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
	return m.Index().(*metadataStoreIndex).getMemberByDevice(pk)
}

func (m *metadataStore) GetDevicesForMember(pk crypto.PubKey) ([]crypto.PubKey, error) {
	return m.Index().(*metadataStoreIndex).getDevicesForMember(pk)
}

func (m *metadataStore) ListAdmins() []crypto.PubKey {
	if m.typeChecker(isContactGroup, isAccountGroup) {
		return m.ListMembers()
	}

	return m.Index().(*metadataStoreIndex).listAdmins()
}

func (m *metadataStore) GetIncomingContactRequestsStatus() (bool, *bertytypes.ShareableContact) {
	if !m.typeChecker(isAccountGroup) {
		return false, nil
	}

	enabled := m.Index().(*metadataStoreIndex).contactRequestsEnabled()
	seed := m.Index().(*metadataStoreIndex).contactRequestsSeed()

	if len(seed) == 0 {
		return enabled, nil
	}

	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		m.logger.Error("unable to get member device for group", zap.Error(err))
		return enabled, nil
	}

	pkBytes, err := md.member.GetPublic().Raw()
	if err != nil {
		m.logger.Error("unable to serialize member public key", zap.Error(err))
		return enabled, nil
	}

	contactRef := &bertytypes.ShareableContact{
		PK:                   pkBytes,
		PublicRendezvousSeed: seed,
	}

	return enabled, contactRef
}

func (m *metadataStore) ListMembers() []crypto.PubKey {
	if m.typeChecker(isAccountGroup) {
		return nil
	}

	if m.typeChecker(isContactGroup) {
		return nil
	}

	if m.typeChecker(isMultiMemberGroup) {
		return m.Index().(*metadataStoreIndex).listMembers()
	}

	return nil
}

func (m *metadataStore) ListDevices() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).listDevices()
}

func (m *metadataStore) ListMultiMemberGroups() []*bertytypes.Group {
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

	for _, g := range idx.groups {
		if g.state != accountGroupJoinedStateJoined {
			continue
		}

		groups = append(groups, g.group)
	}

	return groups
}

func (m *metadataStore) ListContactsByStatus(states ...bertytypes.ContactState) []*bertytypes.ShareableContact {
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

func (m *metadataStore) checkIfInGroup(pk []byte) bool {
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

// GroupJoin indicates the payload includes that the deviceKeystore has joined a group
func (m *metadataStore) GroupJoin(ctx context.Context, g *bertytypes.Group) (operation.Operation, error) {
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

// GroupLeave indicates the payload includes that the deviceKeystore has left a group
func (m *metadataStore) GroupLeave(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
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

// ContactRequestDisable indicates the payload includes that the deviceKeystore has disabled incoming contact requests
func (m *metadataStore) ContactRequestDisable(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountContactRequestDisabled{}, bertytypes.EventTypeAccountContactRequestDisabled)
}

// ContactRequestEnable indicates the payload includes that the deviceKeystore has enabled incoming contact requests
func (m *metadataStore) ContactRequestEnable(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountContactRequestEnabled{}, bertytypes.EventTypeAccountContactRequestEnabled)
}

// ContactRequestReferenceReset indicates the payload includes that the deviceKeystore has a new contact request reference
func (m *metadataStore) ContactRequestReferenceReset(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	seed, err := ioutil.ReadAll(io.LimitReader(crand.Reader, bertytypes.RendezvousSeedLength))
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return m.attributeSignAndAddEvent(ctx, &bertytypes.AccountContactRequestReferenceReset{
		PublicRendezvousSeed: seed,
	}, bertytypes.EventTypeAccountContactRequestReferenceReset)
}

// ContactRequestOutgoingEnqueue indicates the payload includes that the deviceKeystore will attempt to send a new contact request
func (m *metadataStore) ContactRequestOutgoingEnqueue(ctx context.Context, contact *bertytypes.ShareableContact) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if err := contact.CheckFormat(); err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	accSK, err := m.devKS.AccountPrivKey()
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
		Contact: &bertytypes.ShareableContact{
			PK:                   contact.PK,
			PublicRendezvousSeed: contact.PublicRendezvousSeed,
			Metadata:             contact.Metadata,
		},
	}, bertytypes.EventTypeAccountContactRequestOutgoingEnqueued)
}

// ContactRequestOutgoingSent indicates the payload includes that the deviceKeystore has sent a contact request
func (m *metadataStore) ContactRequestOutgoingSent(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, bertytypes.ContactStateToRequest, bertytypes.ContactStateRemoved, bertytypes.ContactStateReceived, bertytypes.ContactStateDiscarded) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactRequestSent{}, bertytypes.EventTypeAccountContactRequestOutgoingSent)
}

// ContactRequestIncomingReceived indicates the payload includes that the deviceKeystore has received a contact request
func (m *metadataStore) ContactRequestIncomingReceived(ctx context.Context, contact *bertytypes.ShareableContact) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if err := contact.CheckFormat(); err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	accSK, err := m.devKS.AccountPrivKey()
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

// ContactRequestIncomingDiscard indicates the payload includes that the deviceKeystore has ignored a contact request
func (m *metadataStore) ContactRequestIncomingDiscard(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, bertytypes.ContactStateReceived) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactRequestDiscarded{}, bertytypes.EventTypeAccountContactRequestIncomingDiscarded)
}

// ContactRequestIncomingAccept indicates the payload includes that the deviceKeystore has accepted a contact request
func (m *metadataStore) ContactRequestIncomingAccept(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, bertytypes.ContactStateReceived) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactRequestAccepted{}, bertytypes.EventTypeAccountContactRequestIncomingAccepted)
}

// ContactBlock indicates the payload includes that the deviceKeystore has blocked a contact
func (m *metadataStore) ContactBlock(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	accSK, err := m.devKS.AccountPrivKey()
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

// ContactUnblock indicates the payload includes that the deviceKeystore has unblocked a contact
func (m *metadataStore) ContactUnblock(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, bertytypes.ContactStateBlocked) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &bertytypes.AccountContactUnblocked{}, bertytypes.EventTypeAccountContactUnblocked)
}

func (m *metadataStore) ContactSendAliasKey(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isContactGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	sk, err := m.devKS.AccountProofPrivKey()
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

func (m *metadataStore) SendAliasProof(ctx context.Context) (operation.Operation, error) {
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

func (m *metadataStore) SendAppMetadata(ctx context.Context, message []byte) (operation.Operation, error) {
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

func (m *metadataStore) attributeSignAndAddEvent(ctx context.Context, evt accountSignableEvent, eventType bertytypes.EventType) (operation.Operation, error) {
	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	device, err := md.device.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	evt.SetDevicePK(device)

	sig, err := signProto(evt, md.device)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	return metadataStoreAddEvent(ctx, m, m.g, eventType, evt, sig)
}

func (m *metadataStore) contactAction(ctx context.Context, pk crypto.PubKey, event accountContactEvent, evtType bertytypes.EventType) (operation.Operation, error) {
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

func (m *metadataStore) groupAction(ctx context.Context, pk crypto.PubKey, event accountGroupEvent, evtType bertytypes.EventType) (operation.Operation, error) {
	pkBytes, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event.SetGroupPK(pkBytes)

	return m.attributeSignAndAddEvent(ctx, event, evtType)
}

func (m *metadataStore) checkContactStatus(pk crypto.PubKey, states ...bertytypes.ContactState) bool {
	if pk == nil {
		return false
	}

	contact, err := m.Index().(*metadataStoreIndex).getContact(pk)
	if err != nil {
		m.logger.Error("unable to get contact for public key", zap.Error(err))
		return false
	}

	for _, s := range states {
		if contact.state == s {
			return true
		}
	}

	return false
}

func constructorFactoryGroupMetadata(s *bertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		g, err := s.getGroupFromOptions(options)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		md, err := s.deviceKeystore.MemberDeviceForGroup(g)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		store := &metadataStore{
			g:      g,
			mks:    s.messageKeystore,
			devKS:  s.deviceKeystore,
			logger: zap.NewNop(),
		}

		options.Index = newMetadataIndex(ctx, store, g, md.Public())

		if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBInit.Wrap(err)
		}

		return store, nil
	}
}

func newSecretEntryPayload(localDevicePrivKey crypto.PrivKey, remoteMemberPubKey crypto.PubKey, secret *bertytypes.DeviceSecret, group *bertytypes.Group) ([]byte, error) {
	message, err := secret.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	mongPriv, mongPub, err := cryptoutil.EdwardsToMontgomery(localDevicePrivKey, remoteMemberPubKey)
	if err != nil {
		return nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	nonce := groupIDToNonce(group)
	encryptedSecret := box.Seal(nil, message, nonce, mongPub, mongPriv)

	return encryptedSecret, nil
}
