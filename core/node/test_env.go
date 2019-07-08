package node

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"fmt"

	"github.com/pkg/errors"

	netmock "berty.tech/core/test/mock/network"
	host "github.com/libp2p/go-libp2p-host"

	"berty.tech/core/entity"
	"berty.tech/core/sql"
	"berty.tech/core/test/mock"
	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

type TestEnvContact struct {
	Name           string
	TestEnvDevices map[string]*TestEnvDevice
}

type TestEnvDevice struct {
	Name           string
	Device         *entity.Device
	DB             *gorm.DB
	dbPath         string
	Node           *Node
	TestEnvContact *TestEnvContact
	Host           host.Host
}

type TestEnv struct {
	TestEnvContacts map[string]*TestEnvContact
	ctx             context.Context
}

func (t *TestEnv) AddContact(contactName string) error {
	if t.TestEnvContacts[contactName] != nil {
		return errors.New(fmt.Sprintf("contact %s is already existing", contactName))
	}

	testEnvContact := &TestEnvContact{
		Name:           contactName,
		TestEnvDevices: map[string]*TestEnvDevice{},
	}

	t.TestEnvContacts[contactName] = testEnvContact

	err := t.AddDevice(contactName, contactName)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("unable to add device for contact %s", contactName))
	}

	return nil
}

func (t *TestEnv) CreateBertyContacts(contactNames ...string) error {
	for _, contactName := range contactNames {
		err := t.AddContact(contactName)
		if err != nil {
			return errors.Wrap(err, "unable to create contacts")
		}
	}

	return nil
}

func (t *TestEnv) EventFrom(deviceID string) *entity.Event {
	testDevice := t.GetDevice(deviceID)

	return testDevice.Node.NewEvent(t.ctx)
}

func (t *TestEnv) ConversationEventFrom(deviceID string, withMembers ...string) *entity.Event {
	event := t.EventFrom(deviceID)
	conversation := t.FindConversation(deviceID, withMembers...)

	return event.SetToConversation(conversation)
}

func (t *TestEnv) IDGen(deviceID string) string {
	testDevice := t.GetDevice(deviceID)

	return testDevice.Node.NewID()
}

func (t *TestEnvDevice) DBInsert(val interface{}) error {
	err := t.DB.Create(val).Error

	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("unable to insert value %v in db for device %s", val, t.Name))
	}

	return nil
}

func (t *TestEnv) DBInsert(deviceID string, val interface{}) error {
	return t.GetDevice(deviceID).DBInsert(val)
}

func (t *TestEnv) AddDevice(contactName string, deviceName string) error {
	if t.TestEnvContacts[contactName] == nil {
		return errors.New(fmt.Sprintf("can't add device %s, contact %s does not exists", deviceName, contactName))
	}

	testEnvContact := t.TestEnvContacts[contactName]

	if len(testEnvContact.TestEnvDevices) != 0 {
		return errors.New(fmt.Sprintf("can't add device %s, contact %s already have devices, multiple devices not supported yet", deviceName, contactName))
	}

	dbPath, db, err := mock.GetMockedDb(sql.AllModels()...)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, unable to create a database", deviceName, contactName))
	}

	testEnvDevice := &TestEnvDevice{
		Name:           deviceName,
		TestEnvContact: testEnvContact,
		DB:             db,
		dbPath:         dbPath,
	}

	testEnvContact.TestEnvDevices[deviceName] = testEnvDevice

	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, unable generate a private key", deviceName, contactName))
	}

	privBytes, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, marshal private key", deviceName, contactName))
	}

	pubBytes, err := x509.MarshalPKIXPublicKey(priv.Public())
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, marshal public key", deviceName, contactName))
	}

	b64Key := base64.StdEncoding.EncodeToString(pubBytes)
	contact := &entity.Contact{ID: b64Key, Status: entity.Contact_Myself, DisplayName: deviceName}
	device := &entity.Device{ID: b64Key, Name: deviceName, Status: entity.Device_Myself, ApiVersion: 1, ContactID: b64Key}

	if err := t.DBInsert(deviceName, contact); err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, can't insert contact in db", deviceName, contactName))
	}
	if err := t.DBInsert(deviceName, device); err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, can't insert device in db", deviceName, contactName))
	}

	if err := t.DBInsert(deviceName, &entity.Config{
		ID:                         uuid.Must(uuid.NewV4()).String(),
		NotificationsEnabled:       false,
		NotificationsPreviews:      false,
		DebugNotificationVerbosity: entity.DebugVerbosity_VERBOSITY_LEVEL_ERROR,
		CurrentDevice:              device,
		CurrentDeviceID:            device.ID,
		Myself:                     contact,
		MyselfID:                   contact.ID,
		CryptoParams:               privBytes,
	}); err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, can't insert config in db", deviceName, contactName))
	}

	networkDriver := &netmock.SimpleDriver{}

	n, err := New(t.ctx,
		WithSQL(db),
		WithDevice(device),
		WithNetworkDriver(networkDriver),
		WithInitConfig(),
		WithSoftwareCrypto(),
		WithConfig(),
	)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, can't create a new node", deviceName, contactName))
	}

	testEnvDevice.Node = n

	config, err := n.ConfigFromDB(t.ctx)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("can't add device %s to contact %s, can't get node's config", deviceName, contactName))
	}

	testEnvDevice.Device = config.CurrentDevice

	return nil
}

func (t *TestEnv) Befriend(first string, second string) error {
	for _, deviceFirst := range t.TestEnvContacts[first].TestEnvDevices {
		for _, deviceSecond := range t.TestEnvContacts[second].TestEnvDevices {
			if err := t.befriend(deviceSecond, t.TestEnvContacts[first]); err != nil {
				return err
			}
		}

		if err := t.befriend(deviceFirst, t.TestEnvContacts[second]); err != nil {
			return err
		}
	}

	return nil
}

func (t *TestEnv) befriend(selfDevice *TestEnvDevice, otherContact *TestEnvContact) error {
	// TODO: Use libp2p mock net and do this via events
	conversationID := ""
	if err := selfDevice.DBInsert(&entity.Contact{
		DisplayName:         otherContact.Name,
		OverrideDisplayName: otherContact.Name,
		Status:              entity.Contact_IsFriend,
	}); err != nil {
		return errors.Wrap(err, fmt.Sprintf("unable to befriend %s and %s", selfDevice.Name, otherContact.Name))
	}

	otherContactID := ""

	for _, device := range otherContact.TestEnvDevices {
		if err := selfDevice.DBInsert(device.Device.Filtered()); err != nil {
			return errors.Wrap(err, fmt.Sprintf("unable to befriend %s and %s", selfDevice.Name, otherContact.Name))
		}

		otherContactID = device.Device.ContactID
	}

	if selfDevice.Device.ContactID < otherContactID {
		conversationID = fmt.Sprintf("%s:%s",
			selfDevice.Device.ContactID,
			otherContactID,
		)
	} else {
		conversationID = fmt.Sprintf("%s:%s",
			otherContactID,
			selfDevice.Device.ContactID,
		)
	}

	if err := selfDevice.DBInsert(&entity.Conversation{ID: conversationID}); err != nil {
		return errors.Wrap(err, fmt.Sprintf("unable to befriend %s and %s", selfDevice.Name, otherContact.Name))
	}

	if err := selfDevice.DBInsert(&entity.ConversationMember{ID: fmt.Sprintf("%s:%s", conversationID, selfDevice.Device.ContactID), ConversationID: conversationID, ContactID: selfDevice.Device.ContactID, Status: entity.ConversationMember_Owner}); err != nil {
		return errors.Wrap(err, fmt.Sprintf("unable to befriend %s and %s", selfDevice.Name, otherContact.Name))
	}

	if err := selfDevice.DBInsert(&entity.ConversationMember{ID: fmt.Sprintf("%s:%s", conversationID, otherContactID), ConversationID: conversationID, ContactID: otherContactID, Status: entity.ConversationMember_Owner}); err != nil {
		return errors.Wrap(err, fmt.Sprintf("unable to befriend %s and %s", selfDevice.Name, otherContact.Name))
	}

	return nil
}

func (t *TestEnv) GetDevice(deviceName string) *TestEnvDevice {
	for _, contact := range t.TestEnvContacts {
		for _, device := range contact.TestEnvDevices {
			if device.Name == deviceName {
				return device
			}
		}
	}

	return nil
}

func (t *TestEnvDevice) Close() {
	mock.RemoveDb(t.dbPath, t.DB)
}

func (t *TestEnv) Close() {
	for _, contact := range t.TestEnvContacts {
		for _, device := range contact.TestEnvDevices {
			device.Close()
		}
	}
}

func (t *TestEnv) FindConversation(ownerID string, otherMembers ...string) *entity.Conversation {
	conversations := []*entity.Conversation{}
	testDevice := t.GetDevice(ownerID)

	query := testDevice.DB.Model(&entity.Conversation{})

	for idx, otherMember := range otherMembers {
		query.Joins(fmt.Sprintf("join conversation_member AS tmp_%d on conversation_member.conversation_id = conversation.id AND conversation_member", idx), otherMember)
	}

	err := query.Find(&conversations).Error
	if err != nil {
		return nil
	}

	for _, conversation := range conversations {
		if len(conversation.Members) == len(otherMembers)+1 {
			return conversation
		}
	}

	return nil
}

func (t *TestEnv) CreateGroupConversation(contactIDs ...string) (*entity.Conversation, error) {
	conversation := &entity.Conversation{}
	var conversationMembers []*entity.ConversationMember

	for _, testContactID := range contactIDs {
		contactID := ""
		memberStatus := entity.ConversationMember_Active

		for _, testDevice := range t.TestEnvContacts[testContactID].TestEnvDevices {
			if conversation.ID == "" {
				conversation.ID = testDevice.Node.NewID()
				memberStatus = entity.ConversationMember_Owner
			}

			contactID = testDevice.Device.ContactID
			break
		}

		conversationMembers = append(conversationMembers, &entity.ConversationMember{
			ID:             conversation.ID + ":" + contactID,
			ContactID:      contactID,
			ConversationID: conversation.ID,
			Status:         memberStatus,
		})
	}

	for _, testContactID := range contactIDs {
		for _, testDevice := range t.TestEnvContacts[testContactID].TestEnvDevices {
			if err := testDevice.DBInsert(conversation); err != nil {
				return nil, errors.Wrap(err, "unable to create group conversation")
			}

			for _, conversationMember := range conversationMembers {
				if err := testDevice.DBInsert(conversationMember); err != nil {
					return nil, err
				}
			}
		}
	}

	return conversation, nil
}

func (t *TestEnv) DBDebug(enabled bool) {
	for _, testContact := range t.TestEnvContacts {
		for _, testDevice := range testContact.TestEnvDevices {
			testDevice.DB = testDevice.DB.LogMode(enabled)
			testDevice.Node.sqlDriver = testDevice.DB
		}
	}
}

func NewTestEnv(ctx context.Context) *TestEnv {
	return &TestEnv{
		TestEnvContacts: map[string]*TestEnvContact{},
		ctx:             ctx,
	}
}
