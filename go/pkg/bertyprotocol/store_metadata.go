package bertyprotocol

import (
	"context"
	crand "crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"io/ioutil"

	"github.com/gogo/protobuf/proto"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-ipfs-log/identityprovider"
	ipliface "berty.tech/go-ipfs-log/iface"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go-orbit-db/stores/basestore"
	"berty.tech/go-orbit-db/stores/operation"
)

const groupMetadataStoreType = "berty_group_metadata"

type metadataStore struct {
	basestore.BaseStore
	g      *protocoltypes.Group
	devKS  DeviceKeystore
	mks    *messageKeystore
	logger *zap.Logger
}

func isMultiMemberGroup(m *metadataStore) bool {
	return m.g.GroupType == protocoltypes.GroupTypeMultiMember
}

func isAccountGroup(m *metadataStore) bool {
	return m.g.GroupType == protocoltypes.GroupTypeAccount
}

func isContactGroup(m *metadataStore) bool {
	return m.g.GroupType == protocoltypes.GroupTypeContact
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

func openMetadataEntry(log ipfslog.Log, e ipfslog.Entry, g *protocoltypes.Group, devKS DeviceKeystore) (*protocoltypes.GroupMetadataEvent, proto.Message, error) {
	op, err := operation.ParseOperation(e)
	if err != nil {
		return nil, nil, err
	}

	meta, event, attachmentsCIDs, err := openGroupEnvelope(g, op.GetValue(), devKS)
	if err != nil {
		return nil, nil, err
	}

	metaEvent, err := newGroupMetadataEventFromEntry(log, e, meta, event, g, attachmentsCIDs)
	if err != nil {
		return nil, nil, err
	}

	return metaEvent, event, err
}

// FIXME: use iterator instead to reduce resource usage (require go-ipfs-log improvements)
func (m *metadataStore) ListEvents(ctx context.Context, since, until []byte, reverse bool) (<-chan *protocoltypes.GroupMetadataEvent, error) {
	entries, err := getEntriesInRange(m.OpLog().GetEntries().Reverse().Slice(), since, until)
	if err != nil {
		return nil, err
	}

	out := make(chan *protocoltypes.GroupMetadataEvent)

	go func() {
		iterateOverEntries(
			entries,
			reverse,
			func(entry ipliface.IPFSLogEntry) {
				event, _, err := openMetadataEntry(m.OpLog(), entry, m.g, m.devKS)
				if err != nil {
					m.logger.Error("unable to open metadata event", zap.Error(err))
				} else {
					out <- event
					m.logger.Info("metadata store - sent 1 event from log history")
				}
			},
		)

		out <- nil
		close(out)
	}()

	return out, nil
}

func (m *metadataStore) AddDeviceToGroup(ctx context.Context) (operation.Operation, error) {
	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return metadataStoreAddDeviceToGroup(ctx, m, m.g, md)
}

func metadataStoreAddDeviceToGroup(ctx context.Context, m *metadataStore, g *protocoltypes.Group, md *ownMemberDevice) (operation.Operation, error) {
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

	event := &protocoltypes.GroupAddMemberDevice{
		MemberPK:  member,
		DevicePK:  device,
		MemberSig: memberSig,
	}

	sig, err := signProto(event, md.device)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	m.logger.Info("announcing device on store")

	return metadataStoreAddEvent(ctx, m, g, protocoltypes.EventTypeGroupMemberDeviceAdded, event, sig, nil)
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
		m.logger.Warn("sending secret to an unknown group member")
	}

	ds, err := m.mks.GetDeviceSecret(m.g, m.devKS)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	return metadataStoreSendSecret(ctx, m, m.g, md, memberPK, ds)
}

func metadataStoreSendSecret(ctx context.Context, m *metadataStore, g *protocoltypes.Group, md *ownMemberDevice, memberPK crypto.PubKey, ds *protocoltypes.DeviceSecret) (operation.Operation, error) {
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

	event := &protocoltypes.GroupAddDeviceSecret{
		DevicePK:     devicePKRaw,
		DestMemberPK: memberPKRaw,
		Payload:      payload,
	}

	sig, err := signProto(event, md.device)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	return metadataStoreAddEvent(ctx, m, g, protocoltypes.EventTypeGroupDeviceSecretAdded, event, sig, nil)
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

	event := &protocoltypes.MultiMemberInitialMember{
		MemberPK: memberPK,
	}

	sig, err := signProto(event, groupSK)
	if err != nil {
		return nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	return metadataStoreAddEvent(ctx, m, m.g, protocoltypes.EventTypeMultiMemberGroupInitialMemberAnnounced, event, sig, nil)
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

func metadataStoreAddEvent(ctx context.Context, m *metadataStore, g *protocoltypes.Group, eventType protocoltypes.EventType, event proto.Marshaler, sig []byte, attachmentsCIDs [][]byte) (operation.Operation, error) {
	attachmentsSecrets, err := m.devKS.AttachmentSecretSlice(attachmentsCIDs)
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	env, err := sealGroupEnvelope(g, eventType, event, sig, attachmentsCIDs, attachmentsSecrets)
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

func (m *metadataStore) ListContacts() map[string]*accountContact {
	return m.Index().(*metadataStoreIndex).listContacts()
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

func (m *metadataStore) GetIncomingContactRequestsStatus() (bool, *protocoltypes.ShareableContact) {
	if !m.typeChecker(isAccountGroup) {
		return false, nil
	}

	enabled := m.Index().(*metadataStoreIndex).contactRequestsEnabled()
	seed := m.Index().(*metadataStoreIndex).contactRequestsSeed()

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

	contactRef := &protocoltypes.ShareableContact{
		PK:                   pkBytes,
		PublicRendezvousSeed: seed,
	}

	return enabled, contactRef
}

func (m *metadataStore) ListMembers() []crypto.PubKey {
	if m.typeChecker(isAccountGroup, isContactGroup, isMultiMemberGroup) {
		return m.Index().(*metadataStoreIndex).listMembers()
	}

	return nil
}

func (m *metadataStore) ListDevices() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).listDevices()
}

func (m *metadataStore) ListOtherMembersDevices() []crypto.PubKey {
	return m.Index().(*metadataStoreIndex).listOtherMembersDevices()
}

func (m *metadataStore) ListMultiMemberGroups() []*protocoltypes.Group {
	if !m.typeChecker(isAccountGroup) {
		return nil
	}

	idx, ok := m.Index().(*metadataStoreIndex)
	if !ok {
		return nil
	}
	idx.lock.Lock()
	defer idx.lock.Unlock()

	groups := []*protocoltypes.Group(nil)

	for _, g := range idx.groups {
		if g.state != accountGroupJoinedStateJoined {
			continue
		}

		groups = append(groups, g.group)
	}

	return groups
}

func (m *metadataStore) GetRequestOwnMetadataForContact(pk []byte) ([]byte, error) {
	idx, ok := m.Index().(*metadataStoreIndex)
	if !ok {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid index type"))
	}

	idx.lock.Lock()
	defer idx.lock.Unlock()

	meta, ok := idx.contactRequestMetadata[string(pk)]
	if !ok {
		return nil, errcode.ErrMissingMapKey.Wrap(fmt.Errorf("no metadata found for specified contact"))
	}

	return meta, nil
}

func (m *metadataStore) ListContactsByStatus(states ...protocoltypes.ContactState) []*protocoltypes.ShareableContact {
	if !m.typeChecker(isAccountGroup) {
		return nil
	}

	idx, ok := m.Index().(*metadataStoreIndex)
	if !ok {
		return nil
	}
	idx.lock.Lock()
	defer idx.lock.Unlock()

	contacts := []*protocoltypes.ShareableContact(nil)

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

func (m *metadataStore) GetContactFromGroupPK(groupPK []byte) *protocoltypes.ShareableContact {
	if !m.typeChecker(isAccountGroup) {
		return nil
	}

	idx, ok := m.Index().(*metadataStoreIndex)
	if !ok {
		return nil
	}
	idx.lock.Lock()
	defer idx.lock.Unlock()

	contact, ok := idx.contactsFromGroupPK[string(groupPK)]
	if !ok || contact == nil {
		return nil
	}

	return contact.contact
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
func (m *metadataStore) GroupJoin(ctx context.Context, g *protocoltypes.Group) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if err := g.IsValid(); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if m.checkIfInGroup(g.PublicKey) {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("already present in group"))
	}

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AccountGroupJoined{
		Group: g,
	}, protocoltypes.EventTypeAccountGroupJoined, nil)
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

	return m.groupAction(ctx, pk, &protocoltypes.AccountGroupLeft{}, protocoltypes.EventTypeAccountGroupLeft)
}

// ContactRequestDisable indicates the payload includes that the deviceKeystore has disabled incoming contact requests
func (m *metadataStore) ContactRequestDisable(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AccountContactRequestDisabled{}, protocoltypes.EventTypeAccountContactRequestDisabled, nil)
}

// ContactRequestEnable indicates the payload includes that the deviceKeystore has enabled incoming contact requests
func (m *metadataStore) ContactRequestEnable(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AccountContactRequestEnabled{}, protocoltypes.EventTypeAccountContactRequestEnabled, nil)
}

// ContactRequestReferenceReset indicates the payload includes that the deviceKeystore has a new contact request reference
func (m *metadataStore) ContactRequestReferenceReset(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	seed, err := ioutil.ReadAll(io.LimitReader(crand.Reader, protocoltypes.RendezvousSeedLength))
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AccountContactRequestReferenceReset{
		PublicRendezvousSeed: seed,
	}, protocoltypes.EventTypeAccountContactRequestReferenceReset, nil)
}

// ContactRequestOutgoingEnqueue indicates the payload includes that the deviceKeystore will attempt to send a new contact request
func (m *metadataStore) ContactRequestOutgoingEnqueue(ctx context.Context, contact *protocoltypes.ShareableContact, ownMetadata []byte) (operation.Operation, error) {
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
		return nil, errcode.ErrContactRequestSameAccount
	}

	pk, err := contact.GetPubKey()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if m.checkContactStatus(pk, protocoltypes.ContactStateAdded) {
		return nil, errcode.ErrContactRequestContactAlreadyAdded
	}

	if m.checkContactStatus(pk, protocoltypes.ContactStateRemoved, protocoltypes.ContactStateDiscarded, protocoltypes.ContactStateReceived) {
		return m.ContactRequestOutgoingSent(ctx, pk)
	}

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AccountContactRequestEnqueued{
		Contact: &protocoltypes.ShareableContact{
			PK:                   contact.PK,
			PublicRendezvousSeed: contact.PublicRendezvousSeed,
			Metadata:             contact.Metadata,
		},
		OwnMetadata: ownMetadata,
	}, protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued, nil)
}

// ContactRequestOutgoingSent indicates the payload includes that the deviceKeystore has sent a contact request
func (m *metadataStore) ContactRequestOutgoingSent(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	switch m.getContactStatus(pk) {
	case protocoltypes.ContactStateToRequest:
	case protocoltypes.ContactStateReceived:
	case protocoltypes.ContactStateRemoved:
	case protocoltypes.ContactStateDiscarded:

	case protocoltypes.ContactStateUndefined:
		return nil, errcode.ErrContactRequestContactUndefined
	case protocoltypes.ContactStateAdded:
		return nil, errcode.ErrContactRequestContactAlreadyAdded
	case protocoltypes.ContactStateBlocked:
		return nil, errcode.ErrContactRequestContactBlocked
	default:
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &protocoltypes.AccountContactRequestSent{}, protocoltypes.EventTypeAccountContactRequestOutgoingSent)
}

// ContactRequestIncomingReceived indicates the payload includes that the deviceKeystore has received a contact request
func (m *metadataStore) ContactRequestIncomingReceived(ctx context.Context, contact *protocoltypes.ShareableContact) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if err := contact.CheckFormat(protocoltypes.ShareableContactOptionsAllowMissingRDVSeed); err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	accSK, err := m.devKS.AccountPrivKey()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if contact.IsSamePK(accSK.GetPublic()) {
		return nil, errcode.ErrContactRequestSameAccount
	}

	pk, err := contact.GetPubKey()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	switch m.getContactStatus(pk) {
	case protocoltypes.ContactStateUndefined:
	case protocoltypes.ContactStateRemoved:
	case protocoltypes.ContactStateDiscarded:

	// If incoming request comes from an account for which an outgoing request
	// is in "sending" state, mark the outgoing request as "sent"
	case protocoltypes.ContactStateToRequest:
		return m.ContactRequestOutgoingSent(ctx, pk)

	// Errors
	case protocoltypes.ContactStateReceived:
		return nil, errcode.ErrContactRequestIncomingAlreadyReceived
	case protocoltypes.ContactStateAdded:
		return nil, errcode.ErrContactRequestContactAlreadyAdded
	case protocoltypes.ContactStateBlocked:
		return nil, errcode.ErrContactRequestContactBlocked
	default:
		return nil, errcode.ErrInvalidInput
	}

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AccountContactRequestReceived{
		ContactPK:             contact.PK,
		ContactRendezvousSeed: contact.PublicRendezvousSeed,
		ContactMetadata:       contact.Metadata,
	}, protocoltypes.EventTypeAccountContactRequestIncomingReceived, nil)
}

// ContactRequestIncomingDiscard indicates the payload includes that the deviceKeystore has ignored a contact request
func (m *metadataStore) ContactRequestIncomingDiscard(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, protocoltypes.ContactStateReceived) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &protocoltypes.AccountContactRequestDiscarded{}, protocoltypes.EventTypeAccountContactRequestIncomingDiscarded)
}

// ContactRequestIncomingAccept indicates the payload includes that the deviceKeystore has accepted a contact request
func (m *metadataStore) ContactRequestIncomingAccept(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, protocoltypes.ContactStateReceived) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &protocoltypes.AccountContactRequestAccepted{}, protocoltypes.EventTypeAccountContactRequestIncomingAccepted)
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

	if m.checkContactStatus(pk, protocoltypes.ContactStateBlocked) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &protocoltypes.AccountContactBlocked{}, protocoltypes.EventTypeAccountContactBlocked)
}

// ContactUnblock indicates the payload includes that the deviceKeystore has unblocked a contact
func (m *metadataStore) ContactUnblock(ctx context.Context, pk crypto.PubKey) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	if !m.checkContactStatus(pk, protocoltypes.ContactStateBlocked) {
		return nil, errcode.ErrInvalidInput
	}

	return m.contactAction(ctx, pk, &protocoltypes.AccountContactUnblocked{}, protocoltypes.EventTypeAccountContactUnblocked)
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

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.ContactAddAliasKey{
		AliasPK: alias,
	}, protocoltypes.EventTypeContactAliasKeyAdded, nil)
}

func (m *metadataStore) SendAliasProof(ctx context.Context) (operation.Operation, error) {
	if !m.typeChecker(isMultiMemberGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	resolver := []byte(nil) // TODO: should be a hmac value of something for quicker searches
	proof := []byte(nil)    // TODO: should be a signed value of something

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.MultiMemberGroupAddAliasResolver{
		AliasResolver: resolver,
		AliasProof:    proof,
	}, protocoltypes.EventTypeMultiMemberGroupAliasResolverAdded, nil)
}

func (m *metadataStore) SendAppMetadata(ctx context.Context, message []byte, attachmentsCIDs [][]byte) (operation.Operation, error) {
	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AppMetadata{
		Message: message,
	}, protocoltypes.EventTypeGroupMetadataPayloadSent, attachmentsCIDs)
}

func (m *metadataStore) SendAccountServiceTokenAdded(ctx context.Context, token *protocoltypes.ServiceToken) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	m.Index().(*metadataStoreIndex).lock.RLock()
	_, ok := m.Index().(*metadataStoreIndex).serviceTokens[token.TokenID()]
	m.Index().(*metadataStoreIndex).lock.RUnlock()

	if ok {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("token has already been registered"))
	}

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AccountServiceTokenAdded{
		ServiceToken: token,
	}, protocoltypes.EventTypeAccountServiceTokenAdded, nil)
}

func (m *metadataStore) SendAccountServiceTokenRemoved(ctx context.Context, tokenID string) (operation.Operation, error) {
	if !m.typeChecker(isAccountGroup) {
		return nil, errcode.ErrGroupInvalidType
	}

	m.Index().(*metadataStoreIndex).lock.RLock()
	val, ok := m.Index().(*metadataStoreIndex).serviceTokens[tokenID]
	m.Index().(*metadataStoreIndex).lock.RUnlock()

	if !ok {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("token not registered"))
	} else if val == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("token already removed"))
	}

	return m.attributeSignAndAddEvent(ctx, &protocoltypes.AccountServiceTokenRemoved{
		TokenID: tokenID,
	}, protocoltypes.EventTypeAccountServiceTokenRemoved, nil)
}

func (m *metadataStore) SendGroupReplicating(ctx context.Context, t *protocoltypes.ServiceToken, endpoint string) (operation.Operation, error) {
	return m.attributeSignAndAddEvent(ctx, &protocoltypes.GroupReplicating{
		AuthenticationURL: t.AuthenticationURL,
		ReplicationServer: endpoint,
	}, protocoltypes.EventTypeGroupReplicating, nil)
}

func (m *metadataStore) SendPushToken(ctx context.Context, t *protocoltypes.PushMemberTokenUpdate) (operation.Operation, error) {
	return m.attributeSignAndAddEvent(ctx, &protocoltypes.PushMemberTokenUpdate{
		Server: t.Server,
		Token:  t.Token,
	}, protocoltypes.EventTypePushMemberTokenUpdate, nil)
}

func (m *metadataStore) RegisterDevicePushToken(ctx context.Context, token *protocoltypes.PushServiceReceiver) (operation.Operation, error) {
	return m.attributeSignAndAddEvent(ctx, &protocoltypes.PushDeviceTokenRegistered{
		Token: token,
	}, protocoltypes.EventTypePushDeviceTokenRegistered, nil)
}

func (m *metadataStore) RegisterDevicePushServer(ctx context.Context, server *protocoltypes.PushServer) (operation.Operation, error) {
	return m.attributeSignAndAddEvent(ctx, &protocoltypes.PushDeviceServerRegistered{
		Server: server,
	}, protocoltypes.EventTypePushDeviceServerRegistered, nil)
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

func (m *metadataStore) attributeSignAndAddEvent(ctx context.Context, evt accountSignableEvent, eventType protocoltypes.EventType, attachmentsCIDs [][]byte) (operation.Operation, error) {
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

	return metadataStoreAddEvent(ctx, m, m.g, eventType, evt, sig, attachmentsCIDs)
}

func (m *metadataStore) contactAction(ctx context.Context, pk crypto.PubKey, event accountContactEvent, evtType protocoltypes.EventType) (operation.Operation, error) {
	if pk == nil || event == nil {
		return nil, errcode.ErrInvalidInput
	}

	pkBytes, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event.SetContactPK(pkBytes)

	return m.attributeSignAndAddEvent(ctx, event, evtType, nil)
}

func (m *metadataStore) groupAction(ctx context.Context, pk crypto.PubKey, event accountGroupEvent, evtType protocoltypes.EventType) (operation.Operation, error) {
	pkBytes, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	event.SetGroupPK(pkBytes)

	return m.attributeSignAndAddEvent(ctx, event, evtType, nil)
}

func (m *metadataStore) getContactStatus(pk crypto.PubKey) protocoltypes.ContactState {
	if pk == nil {
		return protocoltypes.ContactStateUndefined
	}

	contact, err := m.Index().(*metadataStoreIndex).getContact(pk)
	if err != nil {
		m.logger.Warn("unable to get contact for public key", zap.Error(err))
		return protocoltypes.ContactStateUndefined
	}

	return contact.state
}

func (m *metadataStore) checkContactStatus(pk crypto.PubKey, states ...protocoltypes.ContactState) bool {
	contactStatus := m.getContactStatus(pk)

	for _, s := range states {
		if contactStatus == s {
			return true
		}
	}

	return false
}

func (m *metadataStore) listServiceTokens() []*protocoltypes.ServiceToken {
	return m.Index().(*metadataStoreIndex).listServiceTokens()
}

func (m *metadataStore) getServiceToken(tokenID string) (*protocoltypes.ServiceToken, error) {
	m.Index().(*metadataStoreIndex).lock.RLock()
	defer m.Index().(*metadataStoreIndex).lock.RUnlock()

	token, ok := m.Index().(*metadataStoreIndex).serviceTokens[tokenID]
	if !ok {
		return nil, errcode.ErrServicesAuthUnknownToken
	}

	return token, nil
}

func (m *metadataStore) getCurrentDevicePushToken() *protocoltypes.PushServiceReceiver {
	receiver := m.Index().(*metadataStoreIndex).getCurrentDevicePushToken()
	if receiver == nil {
		return nil
	}

	return receiver.Token
}

func (m *metadataStore) getCurrentDevicePushServer() *protocoltypes.PushServer {
	registration := m.Index().(*metadataStoreIndex).getCurrentDevicePushServer()
	if registration == nil {
		return nil
	}

	return registration.Server
}

func (m *metadataStore) getPushTokenForDevice(d crypto.PubKey) (*protocoltypes.PushMemberTokenUpdate, error) {
	m.Index().(*metadataStoreIndex).lock.RLock()
	defer m.Index().(*metadataStoreIndex).lock.RUnlock()

	pk, err := d.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	token, ok := m.Index().(*metadataStoreIndex).membersPushTokens[string(pk)]
	if !ok {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("token not found"))
	}

	return token, nil
}

type EventMetadataReceived struct {
	MetaEvent *protocoltypes.GroupMetadataEvent
	Event     proto.Message
}

func constructorFactoryGroupMetadata(s *BertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		g, err := s.getGroupFromOptions(options)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		var (
			md          *ownMemberDevice
			replication = false
		)

		if s.deviceKeystore == nil {
			replication = true
		} else {
			md, err = s.deviceKeystore.MemberDeviceForGroup(g)
			if err == errcode.ErrInvalidInput {
				replication = true
			} else if err != nil {
				return nil, errcode.TODO.Wrap(err)
			}
		}

		store := &metadataStore{
			g:      g,
			mks:    s.messageKeystore,
			devKS:  s.deviceKeystore,
			logger: s.Logger(),
		}

		if replication {
			options.Index = basestore.NewBaseIndex
			if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
				return nil, errcode.ErrOrbitDBInit.Wrap(err)
			}

			return store, nil
		}

		chSub := store.Subscribe(ctx)
		go func() {
			for e := range chSub {
				var entry ipfslog.Entry

				switch evt := e.(type) {
				case *stores.EventWrite:
					entry = evt.Entry

				case *stores.EventReplicateProgress:
					entry = evt.Entry

				default:
					continue
				}

				if entry == nil {
					continue
				}

				store.logger.Debug("received store event", zap.Any("raw event", e))

				metaEvent, event, err := openMetadataEntry(store.OpLog(), entry, g, store.devKS)
				if err != nil {
					store.logger.Error("unable to open metadata payload", zap.Error(err))
					continue
				}

				store.logger.Debug("received payload", zap.String("payload", metaEvent.Metadata.EventType.String()))

				store.Emit(ctx, &EventMetadataReceived{
					MetaEvent: metaEvent,
					Event:     event,
				})
				store.Emit(ctx, metaEvent)
			}
		}()

		options.Index = newMetadataIndex(ctx, store, g, md.Public(), s.deviceKeystore)

		if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBInit.Wrap(err)
		}

		// Enable logs in the metadata index
		store.setLogger(s.Logger())

		return store, nil
	}
}

func newSecretEntryPayload(localDevicePrivKey crypto.PrivKey, remoteMemberPubKey crypto.PubKey, secret *protocoltypes.DeviceSecret, group *protocoltypes.Group) ([]byte, error) {
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
