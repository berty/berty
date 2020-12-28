package bertyprotocol

import (
	"context"
	"fmt"
	"sync"

	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
)

// FIXME: replace members, devices, sentSecrets, contacts and groups by a circular buffer to avoid an attack by RAM saturation
type metadataStoreIndex struct {
	members                  map[string][]*memberDevice
	devices                  map[string]*memberDevice
	handledEvents            map[string]struct{}
	sentSecrets              map[string]struct{}
	admins                   map[crypto.PubKey]struct{}
	contacts                 map[string]*accountContact
	contactsFromGroupPK      map[string]*accountContact
	groups                   map[string]*accountGroup
	serviceTokens            map[string]*protocoltypes.ServiceToken
	contactRequestMetadata   map[string][]byte
	contactRequestSeed       []byte
	contactRequestEnabled    *bool
	eventHandlers            map[protocoltypes.EventType][]func(event proto.Message) error
	postIndexActions         []func() error
	eventsContactAddAliasKey []*protocoltypes.ContactAddAliasKey
	ownAliasKeySent          bool
	otherAliasKey            []byte
	g                        *protocoltypes.Group
	ownMemberDevice          *memberDevice
	deviceKeystore           DeviceKeystore
	ctx                      context.Context
	eventEmitter             events.EmitterInterface
	lock                     sync.RWMutex
	logger                   *zap.Logger
}

func (m *metadataStoreIndex) Get(key string) interface{} {
	return nil
}

func (m *metadataStoreIndex) setLogger(logger *zap.Logger) {
	if logger == nil {
		return
	}

	m.logger = logger
}

// TODO: refractor common part with UpdateIndex() function
func (m *metadataStoreIndex) UpdateReplicatingEntry(e ipfslog.Entry, metaEvent *protocoltypes.GroupMetadataEvent, event proto.Message) {
	m.lock.Lock()
	defer m.lock.Unlock()

	_, alreadyHandledEvent := m.handledEvents[e.GetHash().String()]

	// TODO: improve account events handling
	if m.g.GroupType != protocoltypes.GroupTypeAccount && alreadyHandledEvent {
		return
	}

	handlers, ok := m.eventHandlers[metaEvent.Metadata.EventType]
	if !ok {
		m.logger.Error("handler for event type not found", zap.String("event-type", metaEvent.Metadata.EventType.String()))
		return
	}

	var lastErr error

	for _, h := range handlers {
		err := h(event)
		if err != nil {
			m.logger.Error("unable to handle event", zap.Error(err))
			lastErr = err
		}
	}

	if lastErr == nil {
		// Only marked it as handled if successful,
		// otherwhile try handling again when replicating finished
		m.handledEvents[e.GetHash().String()] = struct{}{}
	}
}

func (m *metadataStoreIndex) UpdateIndex(log ipfslog.Log, _ []ipfslog.Entry) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	entries := log.Values().Slice()

	// Resetting state
	m.contacts = map[string]*accountContact{}
	m.contactsFromGroupPK = map[string]*accountContact{}
	m.groups = map[string]*accountGroup{}
	m.serviceTokens = map[string]*protocoltypes.ServiceToken{}
	m.contactRequestMetadata = map[string][]byte{}
	m.contactRequestEnabled = nil
	m.contactRequestSeed = []byte(nil)

	for i := len(entries) - 1; i >= 0; i-- {
		e := entries[i]

		_, alreadyHandledEvent := m.handledEvents[e.GetHash().String()]

		// TODO: improve account events handling
		if m.g.GroupType != protocoltypes.GroupTypeAccount && alreadyHandledEvent {
			continue
		}

		metaEvent, event, err := openMetadataEntry(log, e, m.g, m.deviceKeystore)
		if err != nil {
			m.logger.Error("unable to open metadata entry", zap.Error(err))
			continue
		}

		handlers, ok := m.eventHandlers[metaEvent.Metadata.EventType]
		if !ok {
			m.handledEvents[e.GetHash().String()] = struct{}{}
			m.logger.Error("handler for event type not found", zap.String("event-type", metaEvent.Metadata.EventType.String()))
			continue
		}

		var lastErr error

		for _, h := range handlers {
			err = h(event)
			if err != nil {
				m.logger.Error("unable to handle event", zap.Error(err))
				lastErr = err
			}
		}

		if lastErr != nil {
			m.handledEvents[e.GetHash().String()] = struct{}{}
			continue
		}

		m.handledEvents[e.GetHash().String()] = struct{}{}
	}

	for _, h := range m.postIndexActions {
		if err := h(); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	return nil
}

func (m *metadataStoreIndex) handleGroupAddMemberDevice(event proto.Message) error {
	e, ok := event.(*protocoltypes.GroupAddMemberDevice)
	if !ok {
		return errcode.ErrInvalidInput
	}

	member, err := crypto.UnmarshalEd25519PublicKey(e.MemberPK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	device, err := crypto.UnmarshalEd25519PublicKey(e.DevicePK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if _, ok := m.devices[string(e.DevicePK)]; ok {
		return nil
	}

	m.devices[string(e.DevicePK)] = &memberDevice{
		member: member,
		device: device,
	}

	m.members[string(e.MemberPK)] = append(m.members[string(e.MemberPK)], &memberDevice{
		member: member,
		device: device,
	})

	return nil
}

func (m *metadataStoreIndex) handleGroupAddDeviceSecret(event proto.Message) error {
	e, ok := event.(*protocoltypes.GroupAddDeviceSecret)
	if !ok {
		return errcode.ErrInvalidInput
	}

	_, err := crypto.UnmarshalEd25519PublicKey(e.DestMemberPK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	senderPK, err := crypto.UnmarshalEd25519PublicKey(e.DevicePK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if m.ownMemberDevice.device.Equals(senderPK) {
		m.sentSecrets[string(e.DestMemberPK)] = struct{}{}
	}

	return nil
}

func (m *metadataStoreIndex) getMemberByDevice(pk crypto.PubKey) (crypto.PubKey, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.unsafeGetMemberByDevice(pk)
}

func (m *metadataStoreIndex) unsafeGetMemberByDevice(pk crypto.PubKey) (crypto.PubKey, error) {
	id, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	device, ok := m.devices[string(id)]
	if !ok {
		return nil, errcode.ErrMissingInput
	}

	return device.member, nil
}

func (m *metadataStoreIndex) getDevicesForMember(pk crypto.PubKey) ([]crypto.PubKey, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	id, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	mds, ok := m.members[string(id)]
	if !ok {
		return nil, errcode.ErrInvalidInput
	}

	ret := make([]crypto.PubKey, len(mds))
	for i, md := range mds {
		ret[i] = md.device
	}

	return ret, nil
}

func (m *metadataStoreIndex) MemberCount() int {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return len(m.members)
}

func (m *metadataStoreIndex) DeviceCount() int {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return len(m.devices)
}

func (m *metadataStoreIndex) listContacts() map[string]*accountContact {
	m.lock.RLock()
	defer m.lock.RUnlock()

	contacts := make(map[string]*accountContact)

	for k, contact := range m.contacts {
		contacts[k] = &accountContact{
			state: contact.state,
			contact: &protocoltypes.ShareableContact{
				PK:                   contact.contact.PK,
				PublicRendezvousSeed: contact.contact.PublicRendezvousSeed,
				Metadata:             contact.contact.Metadata,
			},
		}
	}

	return contacts
}

func (m *metadataStoreIndex) listMembers() []crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	members := make([]crypto.PubKey, len(m.members))
	i := 0

	for _, md := range m.members {
		members[i] = md[0].member
		i++
	}

	return members
}

func (m *metadataStoreIndex) listDevices() []crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	devices := make([]crypto.PubKey, len(m.devices))
	i := 0

	for _, md := range m.devices {
		devices[i] = md.device
		i++
	}

	return devices
}

func (m *metadataStoreIndex) areSecretsAlreadySent(pk crypto.PubKey) (bool, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	key, err := pk.Raw()
	if err != nil {
		return false, errcode.ErrInvalidInput.Wrap(err)
	}

	_, ok := m.sentSecrets[string(key)]
	return ok, nil
}

type accountGroupJoinedState uint32

const (
	accountGroupJoinedStateJoined accountGroupJoinedState = iota + 1
	accountGroupJoinedStateLeft
)

type accountGroup struct {
	state accountGroupJoinedState
	group *protocoltypes.Group
}

type accountContact struct {
	state   protocoltypes.ContactState
	contact *protocoltypes.ShareableContact
}

func (m *metadataStoreIndex) handleGroupJoined(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountGroupJoined)
	if !ok {
		return errcode.ErrInvalidInput
	}

	_, ok = m.groups[string(evt.Group.PublicKey)]
	if ok {
		return nil
	}

	m.groups[string(evt.Group.PublicKey)] = &accountGroup{
		group: evt.Group,
		state: accountGroupJoinedStateJoined,
	}

	return nil
}

func (m *metadataStoreIndex) handleGroupLeft(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountGroupLeft)
	if !ok {
		return errcode.ErrInvalidInput
	}

	_, ok = m.groups[string(evt.GroupPK)]
	if ok {
		return nil
	}

	m.groups[string(evt.GroupPK)] = &accountGroup{
		state: accountGroupJoinedStateLeft,
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestDisabled(event proto.Message) error {
	if m.contactRequestEnabled != nil {
		return nil
	}

	_, ok := event.(*protocoltypes.AccountContactRequestDisabled)
	if !ok {
		return errcode.ErrInvalidInput
	}

	f := false
	m.contactRequestEnabled = &f

	return nil
}

func (m *metadataStoreIndex) handleContactRequestEnabled(event proto.Message) error {
	if m.contactRequestEnabled != nil {
		return nil
	}

	_, ok := event.(*protocoltypes.AccountContactRequestEnabled)
	if !ok {
		return errcode.ErrInvalidInput
	}

	t := true
	m.contactRequestEnabled = &t

	return nil
}

func (m *metadataStoreIndex) handleContactRequestReferenceReset(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountContactRequestReferenceReset)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if m.contactRequestSeed != nil {
		return nil
	}

	m.contactRequestSeed = evt.PublicRendezvousSeed

	return nil
}

func (m *metadataStoreIndex) registerContactFromGroupPK(ac *accountContact) error {
	if m.g.GroupType != protocoltypes.GroupTypeAccount {
		return errcode.ErrGroupInvalidType
	}

	contactPK, err := crypto.UnmarshalEd25519PublicKey(ac.contact.PK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	sk, err := m.deviceKeystore.ContactGroupPrivKey(contactPK)
	if err != nil {
		return err
	}

	g, err := getGroupForContact(sk)
	if err != nil {
		return errcode.ErrOrbitDBOpen.Wrap(err)
	}

	m.contactsFromGroupPK[string(g.PublicKey)] = ac

	return nil
}

func (m *metadataStoreIndex) handleContactRequestOutgoingEnqueued(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountContactRequestEnqueued)
	if ko := !ok || evt.Contact == nil; ko {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.Contact.PK)]; ok {
		if m.contacts[string(evt.Contact.PK)].contact.Metadata == nil {
			m.contacts[string(evt.Contact.PK)].contact.Metadata = evt.Contact.Metadata
		}

		if m.contacts[string(evt.Contact.PK)].contact.PublicRendezvousSeed == nil {
			m.contacts[string(evt.Contact.PK)].contact.PublicRendezvousSeed = evt.Contact.PublicRendezvousSeed
		}

		return nil
	}

	if data, ok := m.contactRequestMetadata[string(evt.Contact.PK)]; !ok || len(data) == 0 {
		m.contactRequestMetadata[string(evt.Contact.PK)] = evt.OwnMetadata
	}

	ac := &accountContact{
		state: protocoltypes.ContactStateToRequest,
		contact: &protocoltypes.ShareableContact{
			PK:                   evt.Contact.PK,
			Metadata:             evt.Contact.Metadata,
			PublicRendezvousSeed: evt.Contact.PublicRendezvousSeed,
		},
	}

	m.contacts[string(evt.Contact.PK)] = ac
	err := m.registerContactFromGroupPK(ac)

	return err
}

func (m *metadataStoreIndex) handleContactRequestOutgoingSent(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountContactRequestSent)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	ac := &accountContact{
		state: protocoltypes.ContactStateAdded,
		contact: &protocoltypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	m.contacts[string(evt.ContactPK)] = ac
	err := m.registerContactFromGroupPK(ac)

	return err
}

func (m *metadataStoreIndex) handleContactRequestIncomingReceived(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountContactRequestReceived)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		if m.contacts[string(evt.ContactPK)].contact.Metadata == nil {
			m.contacts[string(evt.ContactPK)].contact.Metadata = evt.ContactMetadata
		}

		if m.contacts[string(evt.ContactPK)].contact.PublicRendezvousSeed == nil {
			m.contacts[string(evt.ContactPK)].contact.PublicRendezvousSeed = evt.ContactRendezvousSeed
		}

		return nil
	}

	ac := &accountContact{
		state: protocoltypes.ContactStateReceived,
		contact: &protocoltypes.ShareableContact{
			PK:                   evt.ContactPK,
			Metadata:             evt.ContactMetadata,
			PublicRendezvousSeed: evt.ContactRendezvousSeed,
		},
	}

	m.contacts[string(evt.ContactPK)] = ac
	err := m.registerContactFromGroupPK(ac)

	return err
}

func (m *metadataStoreIndex) handleContactRequestIncomingDiscarded(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountContactRequestDiscarded)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	ac := &accountContact{
		state: protocoltypes.ContactStateDiscarded,
		contact: &protocoltypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	m.contacts[string(evt.ContactPK)] = ac
	err := m.registerContactFromGroupPK(ac)

	return err
}

func (m *metadataStoreIndex) handleContactRequestIncomingAccepted(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountContactRequestAccepted)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	ac := &accountContact{
		state: protocoltypes.ContactStateAdded,
		contact: &protocoltypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	m.contacts[string(evt.ContactPK)] = ac
	err := m.registerContactFromGroupPK(ac)

	return err
}

func (m *metadataStoreIndex) handleContactBlocked(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountContactBlocked)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	ac := &accountContact{
		state: protocoltypes.ContactStateBlocked,
		contact: &protocoltypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	m.contacts[string(evt.ContactPK)] = ac
	err := m.registerContactFromGroupPK(ac)

	return err
}

func (m *metadataStoreIndex) handleContactUnblocked(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountContactUnblocked)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	ac := &accountContact{
		state: protocoltypes.ContactStateRemoved,
		contact: &protocoltypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	m.contacts[string(evt.ContactPK)] = ac
	err := m.registerContactFromGroupPK(ac)

	return err
}

func (m *metadataStoreIndex) handleContactAliasKeyAdded(event proto.Message) error {
	evt, ok := event.(*protocoltypes.ContactAddAliasKey)
	if !ok {
		return errcode.ErrInvalidInput
	}

	m.eventsContactAddAliasKey = append(m.eventsContactAddAliasKey, evt)

	return nil
}

func (m *metadataStoreIndex) listServiceTokens() []*protocoltypes.ServiceToken {
	m.lock.RLock()
	defer m.lock.RUnlock()

	ret := []*protocoltypes.ServiceToken(nil)

	for _, t := range m.serviceTokens {
		if t == nil {
			continue
		}

		ret = append(ret, t)
	}

	return ret
}

func (m *metadataStoreIndex) handleAccountServiceTokenAdded(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountServiceTokenAdded)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.serviceTokens[evt.ServiceToken.TokenID()]; ok {
		return nil
	}

	m.serviceTokens[evt.ServiceToken.TokenID()] = evt.ServiceToken

	return nil
}

func (m *metadataStoreIndex) handleAccountServiceTokenRemoved(event proto.Message) error {
	evt, ok := event.(*protocoltypes.AccountServiceTokenRemoved)
	if !ok {
		return errcode.ErrInvalidInput
	}

	m.serviceTokens[evt.TokenID] = nil

	return nil
}

func (m *metadataStoreIndex) handleMultiMemberInitialMember(event proto.Message) error {
	e, ok := event.(*protocoltypes.MultiMemberInitialMember)
	if !ok {
		return errcode.ErrInvalidInput
	}

	pk, err := crypto.UnmarshalEd25519PublicKey(e.MemberPK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if _, ok := m.admins[pk]; ok {
		return errcode.ErrInternal
	}

	m.admins[pk] = struct{}{}

	return nil
}

func (m *metadataStoreIndex) handleMultiMemberGrantAdminRole(event proto.Message) error {
	// TODO:

	return nil
}

func (m *metadataStoreIndex) listAdmins() []crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	admins := make([]crypto.PubKey, len(m.admins))
	i := 0

	for admin := range m.admins {
		admins[i] = admin
		i++
	}

	return admins
}

func (m *metadataStoreIndex) contactRequestsEnabled() bool {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.contactRequestEnabled != nil && *m.contactRequestEnabled
}

func (m *metadataStoreIndex) contactRequestsSeed() []byte {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.contactRequestSeed
}

func (m *metadataStoreIndex) getContact(pk crypto.PubKey) (*accountContact, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	bytes, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	contact, ok := m.contacts[string(bytes)]
	if !ok {
		return nil, errcode.ErrMissingMapKey.Wrap(err)
	}

	return contact, nil
}

func (m *metadataStoreIndex) postHandlerSentAliases() error {
	for _, evt := range m.eventsContactAddAliasKey {
		pk, err := crypto.UnmarshalEd25519PublicKey(evt.DevicePK)
		if err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		memberPK, err := m.unsafeGetMemberByDevice(pk)
		if err != nil {
			return fmt.Errorf("couldn't get member for device")
		}

		if memberPK.Equals(m.ownMemberDevice.member) {
			m.ownAliasKeySent = true
			continue
		}

		if _, err = crypto.UnmarshalEd25519PublicKey(evt.AliasPK); err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		m.otherAliasKey = evt.AliasPK
	}

	m.eventsContactAddAliasKey = nil

	return nil
}

// newMetadataIndex returns a new index to manage the list of the group members
func newMetadataIndex(ctx context.Context, eventEmitter events.EmitterInterface, g *protocoltypes.Group, md *memberDevice, devKS DeviceKeystore) iface.IndexConstructor {
	return func(publicKey []byte) iface.StoreIndex {
		m := &metadataStoreIndex{
			members:                map[string][]*memberDevice{},
			devices:                map[string]*memberDevice{},
			admins:                 map[crypto.PubKey]struct{}{},
			sentSecrets:            map[string]struct{}{},
			handledEvents:          map[string]struct{}{},
			contacts:               map[string]*accountContact{},
			contactsFromGroupPK:    map[string]*accountContact{},
			groups:                 map[string]*accountGroup{},
			serviceTokens:          map[string]*protocoltypes.ServiceToken{},
			contactRequestMetadata: map[string][]byte{},
			g:                      g,
			eventEmitter:           eventEmitter,
			ownMemberDevice:        md,
			deviceKeystore:         devKS,
			ctx:                    ctx,
			logger:                 zap.NewNop(),
		}

		m.eventHandlers = map[protocoltypes.EventType][]func(event proto.Message) error{
			protocoltypes.EventTypeAccountContactBlocked:                  {m.handleContactBlocked},
			protocoltypes.EventTypeAccountContactRequestDisabled:          {m.handleContactRequestDisabled},
			protocoltypes.EventTypeAccountContactRequestEnabled:           {m.handleContactRequestEnabled},
			protocoltypes.EventTypeAccountContactRequestIncomingAccepted:  {m.handleContactRequestIncomingAccepted},
			protocoltypes.EventTypeAccountContactRequestIncomingDiscarded: {m.handleContactRequestIncomingDiscarded},
			protocoltypes.EventTypeAccountContactRequestIncomingReceived:  {m.handleContactRequestIncomingReceived},
			protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued:  {m.handleContactRequestOutgoingEnqueued},
			protocoltypes.EventTypeAccountContactRequestOutgoingSent:      {m.handleContactRequestOutgoingSent},
			protocoltypes.EventTypeAccountContactRequestReferenceReset:    {m.handleContactRequestReferenceReset},
			protocoltypes.EventTypeAccountContactUnblocked:                {m.handleContactUnblocked},
			protocoltypes.EventTypeAccountGroupJoined:                     {m.handleGroupJoined},
			protocoltypes.EventTypeAccountGroupLeft:                       {m.handleGroupLeft},
			protocoltypes.EventTypeContactAliasKeyAdded:                   {m.handleContactAliasKeyAdded},
			protocoltypes.EventTypeGroupDeviceSecretAdded:                 {m.handleGroupAddDeviceSecret},
			protocoltypes.EventTypeGroupMemberDeviceAdded:                 {m.handleGroupAddMemberDevice},
			protocoltypes.EventTypeMultiMemberGroupAdminRoleGranted:       {m.handleMultiMemberGrantAdminRole},
			protocoltypes.EventTypeMultiMemberGroupInitialMemberAnnounced: {m.handleMultiMemberInitialMember},
			protocoltypes.EventTypeAccountServiceTokenAdded:               {m.handleAccountServiceTokenAdded},
			protocoltypes.EventTypeAccountServiceTokenRemoved:             {m.handleAccountServiceTokenRemoved},
		}

		m.postIndexActions = []func() error{
			m.postHandlerSentAliases,
		}

		return m
	}
}

var _ iface.StoreIndex = &metadataStoreIndex{}
