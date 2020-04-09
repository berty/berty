package bertyprotocol

import (
	"context"
	"fmt"
	"sync"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/golang/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
)

type metadataStoreIndex struct {
	members                  map[string][]*memberDevice
	devices                  map[string]*memberDevice
	handledEvents            map[string]struct{}
	sentSecrets              map[string]struct{}
	admins                   map[crypto.PubKey]struct{}
	contacts                 map[string]*accountContact
	groups                   map[string]*accountGroup
	contactRequestSeed       []byte
	contactRequestEnabled    *bool
	eventHandlers            map[bertytypes.EventType][]func(event proto.Message) error
	postIndexActions         []func() error
	eventsContactAddAliasKey []*bertytypes.ContactAddAliasKey
	ownAliasKeySent          bool
	otherAliasKey            []byte
	g                        *bertytypes.Group
	ownMemberDevice          *memberDevice
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

func (m *metadataStoreIndex) openMetadataEntry(log ipfslog.Log, e ipfslog.Entry) (*bertytypes.GroupMetadataEvent, *bertytypes.GroupMetadata, proto.Message, error) {
	op, err := operation.ParseOperation(e)
	if err != nil {
		m.logger.Error("unable to register chain key", zap.Error(err))
		return nil, nil, nil, err
	}

	meta, event, err := openGroupEnvelope(m.g, op.GetValue())
	if err != nil {
		m.logger.Error("unable to open group envelope", zap.Error(err))
		return nil, nil, nil, err
	}

	metaEvent, err := newGroupMetadataEventFromEntry(log, e, meta, event, m.g)
	if err != nil {
		m.logger.Error("unable to open group envelope", zap.Error(err))
		return nil, nil, nil, err
	}

	return metaEvent, meta, event, nil
}

func (m *metadataStoreIndex) UpdateIndex(log ipfslog.Log, _ []ipfslog.Entry) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	entries := log.Values().Slice()

	// Resetting state
	m.members = map[string][]*memberDevice{}
	m.devices = map[string]*memberDevice{}
	m.admins = map[crypto.PubKey]struct{}{}
	m.sentSecrets = map[string]struct{}{}
	m.contacts = map[string]*accountContact{}
	m.groups = map[string]*accountGroup{}

	for i := len(entries) - 1; i >= 0; i-- {
		e := entries[i]

		metaEvent, meta, event, err := m.openMetadataEntry(log, e)
		if err != nil {
			m.logger.Error("unable to open metadata entry", zap.Error(err))
			continue
		}

		handlers, ok := m.eventHandlers[meta.EventType]
		if !ok {
			m.handledEvents[e.GetHash().String()] = struct{}{}
			m.logger.Error("handler for event type not found", zap.String("event-type", meta.EventType.String()))
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

		if _, ok := m.handledEvents[e.GetHash().String()]; !ok {
			m.eventEmitter.Emit(m.ctx, metaEvent)
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
	e, ok := event.(*bertytypes.GroupAddMemberDevice)
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
	e, ok := event.(*bertytypes.GroupAddDeviceSecret)
	if !ok {
		return errcode.ErrInvalidInput
	}

	destPK, err := crypto.UnmarshalEd25519PublicKey(e.DestMemberPK)
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

	if !destPK.Equals(m.ownMemberDevice.member) {
		return errcode.ErrGroupSecretOtherDestMember
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
	group *bertytypes.Group
}

type accountContact struct {
	state   bertytypes.ContactState
	contact *bertytypes.ShareableContact
}

func (m *metadataStoreIndex) handleGroupJoined(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountGroupJoined)
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
	evt, ok := event.(*bertytypes.AccountGroupLeft)
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

	_, ok := event.(*bertytypes.AccountContactRequestDisabled)
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

	_, ok := event.(*bertytypes.AccountContactRequestEnabled)
	if !ok {
		return errcode.ErrInvalidInput
	}

	t := true
	m.contactRequestEnabled = &t

	return nil
}

func (m *metadataStoreIndex) handleContactRequestReferenceReset(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountContactRequestReferenceReset)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if m.contactRequestSeed != nil {
		return nil
	}

	m.contactRequestSeed = evt.PublicRendezvousSeed

	return nil
}

func (m *metadataStoreIndex) handleContactRequestOutgoingEnqueued(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountContactRequestEnqueued)
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

	m.contacts[string(evt.Contact.PK)] = &accountContact{
		state: bertytypes.ContactStateToRequest,
		contact: &bertytypes.ShareableContact{
			PK:                   evt.Contact.PK,
			Metadata:             evt.Contact.Metadata,
			PublicRendezvousSeed: evt.Contact.PublicRendezvousSeed,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestOutgoingSent(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountContactRequestSent)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertytypes.ContactStateAdded,
		contact: &bertytypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestIncomingReceived(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountContactRequestReceived)
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

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertytypes.ContactStateReceived,
		contact: &bertytypes.ShareableContact{
			PK:                   evt.ContactPK,
			Metadata:             evt.ContactMetadata,
			PublicRendezvousSeed: evt.ContactRendezvousSeed,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestIncomingDiscarded(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountContactRequestDiscarded)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertytypes.ContactStateDiscarded,
		contact: &bertytypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestIncomingAccepted(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountContactRequestAccepted)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertytypes.ContactStateAdded,
		contact: &bertytypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactBlocked(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountContactBlocked)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertytypes.ContactStateBlocked,
		contact: &bertytypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactUnblocked(event proto.Message) error {
	evt, ok := event.(*bertytypes.AccountContactUnblocked)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertytypes.ContactStateRemoved,
		contact: &bertytypes.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactAliasKeyAdded(event proto.Message) error {
	evt, ok := event.(*bertytypes.ContactAddAliasKey)
	if !ok {
		return errcode.ErrInvalidInput
	}

	m.eventsContactAddAliasKey = append(m.eventsContactAddAliasKey, evt)

	return nil
}

func (m *metadataStoreIndex) handleMultiMemberInitialMember(event proto.Message) error {
	e, ok := event.(*bertytypes.MultiMemberInitialMember)
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
func newMetadataIndex(ctx context.Context, eventEmitter events.EmitterInterface, g *bertytypes.Group, md *memberDevice) iface.IndexConstructor {
	return func(publicKey []byte) iface.StoreIndex {
		m := &metadataStoreIndex{
			members:         map[string][]*memberDevice{},
			devices:         map[string]*memberDevice{},
			admins:          map[crypto.PubKey]struct{}{},
			sentSecrets:     map[string]struct{}{},
			handledEvents:   map[string]struct{}{},
			contacts:        map[string]*accountContact{},
			groups:          map[string]*accountGroup{},
			g:               g,
			eventEmitter:    eventEmitter,
			ownMemberDevice: md,
			ctx:             ctx,
			logger:          zap.NewNop(),
		}

		m.eventHandlers = map[bertytypes.EventType][]func(event proto.Message) error{
			bertytypes.EventTypeAccountContactBlocked:                  {m.handleContactBlocked},
			bertytypes.EventTypeAccountContactRequestDisabled:          {m.handleContactRequestDisabled},
			bertytypes.EventTypeAccountContactRequestEnabled:           {m.handleContactRequestEnabled},
			bertytypes.EventTypeAccountContactRequestIncomingAccepted:  {m.handleContactRequestIncomingAccepted},
			bertytypes.EventTypeAccountContactRequestIncomingDiscarded: {m.handleContactRequestIncomingDiscarded},
			bertytypes.EventTypeAccountContactRequestIncomingReceived:  {m.handleContactRequestIncomingReceived},
			bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:  {m.handleContactRequestOutgoingEnqueued},
			bertytypes.EventTypeAccountContactRequestOutgoingSent:      {m.handleContactRequestOutgoingSent},
			bertytypes.EventTypeAccountContactRequestReferenceReset:    {m.handleContactRequestReferenceReset},
			bertytypes.EventTypeAccountContactUnblocked:                {m.handleContactUnblocked},
			bertytypes.EventTypeAccountGroupJoined:                     {m.handleGroupJoined},
			bertytypes.EventTypeAccountGroupLeft:                       {m.handleGroupLeft},
			bertytypes.EventTypeContactAliasKeyAdded:                   {m.handleContactAliasKeyAdded},
			bertytypes.EventTypeGroupDeviceSecretAdded:                 {m.handleGroupAddDeviceSecret},
			bertytypes.EventTypeGroupMemberDeviceAdded:                 {m.handleGroupAddMemberDevice},
			bertytypes.EventTypeMultiMemberGroupAdminRoleGranted:       {m.handleMultiMemberGrantAdminRole},
			bertytypes.EventTypeMultiMemberGroupInitialMemberAnnounced: {m.handleMultiMemberInitialMember},
		}

		m.postIndexActions = []func() error{
			m.postHandlerSentAliases,
		}

		return m
	}
}

var _ iface.StoreIndex = &metadataStoreIndex{}
