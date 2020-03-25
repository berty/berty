package orbitutil

import (
	"context"
	"fmt"
	"sync"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/golang/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type metadataStoreIndex struct {
	members                  map[string][]*bertyprotocol.MemberDevice
	devices                  map[string]*bertyprotocol.MemberDevice
	handledEvents            map[string]struct{}
	sentSecrets              map[string]struct{}
	admins                   map[crypto.PubKey]struct{}
	contacts                 map[string]*accountContact
	groups                   map[string]*accountGroup
	contactRequestSeed       []byte
	contactRequestEnabled    *bool
	eventHandlers            map[bertyprotocol.EventType][]func(event proto.Message) error
	postIndexActions         []func() error
	eventsContactAddAliasKey []*bertyprotocol.ContactAddAliasKey
	ownAliasKeySent          bool
	otherAliasKey            []byte
	g                        *bertyprotocol.Group
	ownMemberDevice          *bertyprotocol.MemberDevice
	ctx                      context.Context
	eventEmitter             events.EmitterInterface
	lock                     sync.RWMutex
}

func (m *metadataStoreIndex) Get(key string) interface{} {
	return nil
}

func openMetadataEntry(g *bertyprotocol.Group, log ipfslog.Log, e ipfslog.Entry) (*bertyprotocol.GroupMetadataEvent, *bertyprotocol.GroupMetadata, proto.Message, error) {
	op, err := operation.ParseOperation(e)
	if err != nil {
		// TODO: log
		return nil, nil, nil, err
	}

	meta, event, err := bertyprotocol.OpenGroupEnvelope(g, op.GetValue())
	if err != nil {
		// TODO: log
		return nil, nil, nil, err
	}

	metaEvent, err := bertyprotocol.NewGroupMetadataEventFromEntry(log, e, meta, event, g)
	if err != nil {
		// TODO: log
		return nil, nil, nil, err
	}

	return metaEvent, meta, event, nil
}

func (m *metadataStoreIndex) UpdateIndex(log ipfslog.Log, _ []ipfslog.Entry) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	entries := log.Values().Slice()

	// Resetting state
	m.members = map[string][]*bertyprotocol.MemberDevice{}
	m.devices = map[string]*bertyprotocol.MemberDevice{}
	m.admins = map[crypto.PubKey]struct{}{}
	m.sentSecrets = map[string]struct{}{}
	m.contacts = map[string]*accountContact{}
	m.groups = map[string]*accountGroup{}

	for i := len(entries) - 1; i >= 0; i-- {
		e := entries[i]

		metaEvent, meta, event, err := openMetadataEntry(m.g, log, e)
		if err != nil {
			// TODO: log
			continue
		}

		handlers, ok := m.eventHandlers[meta.EventType]
		if !ok {
			m.handledEvents[e.GetHash().String()] = struct{}{}
			// TODO: log
			continue
		}

		var lastErr error

		for _, h := range handlers {
			err = h(event)
			if err != nil {
				// TODO: log
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
	e, ok := event.(*bertyprotocol.GroupAddMemberDevice)
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

	m.devices[string(e.DevicePK)] = &bertyprotocol.MemberDevice{
		Member: member,
		Device: device,
	}

	m.members[string(e.MemberPK)] = append(m.members[string(e.MemberPK)], &bertyprotocol.MemberDevice{
		Member: member,
		Device: device,
	})

	return nil
}

func (m *metadataStoreIndex) handleGroupAddDeviceSecret(event proto.Message) error {
	e, ok := event.(*bertyprotocol.GroupAddDeviceSecret)
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

	if m.ownMemberDevice.Device.Equals(senderPK) {
		m.sentSecrets[string(e.DestMemberPK)] = struct{}{}
	}

	if !destPK.Equals(m.ownMemberDevice.Member) {
		return errcode.ErrGroupSecretOtherDestMember
	}

	return nil
}

func (m *metadataStoreIndex) GetMemberByDevice(pk crypto.PubKey) (crypto.PubKey, error) {
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

	return device.Member, nil
}

func (m *metadataStoreIndex) GetDevicesForMember(pk crypto.PubKey) ([]crypto.PubKey, error) {
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
		ret[i] = md.Device
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

func (m *metadataStoreIndex) ListMembers() []crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	members := make([]crypto.PubKey, len(m.members))
	i := 0

	for _, md := range m.members {
		members[i] = md[0].Member
		i++
	}

	return members
}

func (m *metadataStoreIndex) ListDevices() []crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	devices := make([]crypto.PubKey, len(m.devices))
	i := 0

	for _, md := range m.devices {
		devices[i] = md.Device
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
	group *bertyprotocol.Group
}

type accountContact struct {
	state   bertyprotocol.ContactState
	contact *bertyprotocol.ShareableContact
}

func (m *metadataStoreIndex) handleGroupJoined(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountGroupJoined)
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
	evt, ok := event.(*bertyprotocol.AccountGroupLeft)
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

	_, ok := event.(*bertyprotocol.AccountContactRequestDisabled)
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

	_, ok := event.(*bertyprotocol.AccountContactRequestEnabled)
	if !ok {
		return errcode.ErrInvalidInput
	}

	t := true
	m.contactRequestEnabled = &t

	return nil
}

func (m *metadataStoreIndex) handleContactRequestReferenceReset(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountContactRequestReferenceReset)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if m.contactRequestSeed != nil {
		return nil
	}

	m.contactRequestSeed = evt.RendezvousSeed

	return nil
}

func (m *metadataStoreIndex) handleContactRequestOutgoingEnqueued(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountContactRequestEnqueued)
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
		state: bertyprotocol.ContactStateToRequest,
		contact: &bertyprotocol.ShareableContact{
			PK:                   evt.ContactPK,
			Metadata:             evt.ContactMetadata,
			PublicRendezvousSeed: evt.ContactRendezvousSeed,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestOutgoingSent(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountContactRequestSent)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertyprotocol.ContactStateAdded,
		contact: &bertyprotocol.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestIncomingReceived(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountContactRequestReceived)
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
		state: bertyprotocol.ContactStateReceived,
		contact: &bertyprotocol.ShareableContact{
			PK:                   evt.ContactPK,
			Metadata:             evt.ContactMetadata,
			PublicRendezvousSeed: evt.ContactRendezvousSeed,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestIncomingDiscarded(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountContactRequestDiscarded)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertyprotocol.ContactStateDiscarded,
		contact: &bertyprotocol.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactRequestIncomingAccepted(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountContactRequestAccepted)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertyprotocol.ContactStateAdded,
		contact: &bertyprotocol.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactBlocked(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountContactBlocked)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertyprotocol.ContactStateBlocked,
		contact: &bertyprotocol.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactUnblocked(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.AccountContactUnblocked)
	if !ok {
		return errcode.ErrInvalidInput
	}

	if _, ok := m.contacts[string(evt.ContactPK)]; ok {
		return nil
	}

	m.contacts[string(evt.ContactPK)] = &accountContact{
		state: bertyprotocol.ContactStateRemoved,
		contact: &bertyprotocol.ShareableContact{
			PK: evt.ContactPK,
		},
	}

	return nil
}

func (m *metadataStoreIndex) handleContactAliasKeyAdded(event proto.Message) error {
	evt, ok := event.(*bertyprotocol.ContactAddAliasKey)
	if !ok {
		return errcode.ErrInvalidInput
	}

	m.eventsContactAddAliasKey = append(m.eventsContactAddAliasKey, evt)

	return nil
}

func (m *metadataStoreIndex) handleMultiMemberInitialMember(event proto.Message) error {
	e, ok := event.(*bertyprotocol.MultiMemberInitialMember)
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

func (m *metadataStoreIndex) ListAdmins() []crypto.PubKey {
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

func (m *metadataStoreIndex) ContactRequestsEnabled() bool {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.contactRequestEnabled != nil && *m.contactRequestEnabled
}

func (m *metadataStoreIndex) ContactRequestsSeed() []byte {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.contactRequestSeed
}

func (m *metadataStoreIndex) GetContact(pk crypto.PubKey) (*accountContact, error) {
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

		if memberPK.Equals(m.ownMemberDevice.Member) {
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

// NewMetadataIndex returns a new index to manage the list of the group members
func NewMetadataIndex(ctx context.Context, eventEmitter events.EmitterInterface, g *bertyprotocol.Group, memberDevice *bertyprotocol.MemberDevice) iface.IndexConstructor {
	return func(publicKey []byte) iface.StoreIndex {
		m := &metadataStoreIndex{
			members:         map[string][]*bertyprotocol.MemberDevice{},
			devices:         map[string]*bertyprotocol.MemberDevice{},
			admins:          map[crypto.PubKey]struct{}{},
			sentSecrets:     map[string]struct{}{},
			handledEvents:   map[string]struct{}{},
			contacts:        map[string]*accountContact{},
			groups:          map[string]*accountGroup{},
			g:               g,
			eventEmitter:    eventEmitter,
			ownMemberDevice: memberDevice,
			ctx:             ctx,
		}

		m.eventHandlers = map[bertyprotocol.EventType][]func(event proto.Message) error{
			bertyprotocol.EventTypeAccountContactBlocked:                  {m.handleContactBlocked},
			bertyprotocol.EventTypeAccountContactRequestDisabled:          {m.handleContactRequestDisabled},
			bertyprotocol.EventTypeAccountContactRequestEnabled:           {m.handleContactRequestEnabled},
			bertyprotocol.EventTypeAccountContactRequestIncomingAccepted:  {m.handleContactRequestIncomingAccepted},
			bertyprotocol.EventTypeAccountContactRequestIncomingDiscarded: {m.handleContactRequestIncomingDiscarded},
			bertyprotocol.EventTypeAccountContactRequestIncomingReceived:  {m.handleContactRequestIncomingReceived},
			bertyprotocol.EventTypeAccountContactRequestOutgoingEnqueued:  {m.handleContactRequestOutgoingEnqueued},
			bertyprotocol.EventTypeAccountContactRequestOutgoingSent:      {m.handleContactRequestOutgoingSent},
			bertyprotocol.EventTypeAccountContactRequestReferenceReset:    {m.handleContactRequestReferenceReset},
			bertyprotocol.EventTypeAccountContactUnblocked:                {m.handleContactUnblocked},
			bertyprotocol.EventTypeAccountGroupJoined:                     {m.handleGroupJoined},
			bertyprotocol.EventTypeAccountGroupLeft:                       {m.handleGroupLeft},
			bertyprotocol.EventTypeContactAliasKeyAdded:                   {m.handleContactAliasKeyAdded},
			bertyprotocol.EventTypeGroupDeviceSecretAdded:                 {m.handleGroupAddDeviceSecret},
			bertyprotocol.EventTypeGroupMemberDeviceAdded:                 {m.handleGroupAddMemberDevice},
			bertyprotocol.EventTypeMultiMemberGroupAdminRoleGranted:       {m.handleMultiMemberGrantAdminRole},
			bertyprotocol.EventTypeMultiMemberGroupInitialMemberAnnounced: {m.handleMultiMemberInitialMember},
		}

		m.postIndexActions = []func() error{
			m.postHandlerSentAliases,
		}

		return m
	}
}

var _ iface.StoreIndex = &metadataStoreIndex{}
