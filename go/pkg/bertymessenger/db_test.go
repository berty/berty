package bertymessenger

import (
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func noopReplayer(_ *dbWrapper) error { return nil }

type getInMemoryTestDBOpts int32

const (
	getInMemoryTestDBOptsUndefined = iota
	getInMemoryTestDBOptsNoInit
	getInMemoryTestDBOptsStdOutLogger
)

var _ = getInMemoryTestDBOptsUndefined

func getInMemoryTestDB(t testing.TB, opts ...getInMemoryTestDBOpts) (*dbWrapper, func()) {
	t.Helper()

	init := true
	log := zap.NewNop()
	loggerCleanup := func() {}

	for _, o := range opts {
		switch o {
		case getInMemoryTestDBOptsNoInit:
			init = false
		case getInMemoryTestDBOptsStdOutLogger:
			log, loggerCleanup = testutil.Logger(t)
		}
	}

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		t.Fatal(err)
	}

	wrappedDB := newDBWrapper(db, log)

	if init {
		if err := wrappedDB.initDB(noopReplayer); err != nil {
			t.Fatal(err)
		}
	}

	d, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}

	return wrappedDB, func() {
		_ = d.Close()
		loggerCleanup()
	}
}

func Test_dbWrapper_addConversation(t *testing.T) {
	groupPK1 := "group_pk"
	groupPK2 := "group_pk_2"

	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	convErr, err := db.addConversation("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, convErr)

	conv1, err := db.addConversation(groupPK1)
	require.NoError(t, err)
	require.Equal(t, groupPK1, conv1.PublicKey)

	conv2, err := db.addConversation(groupPK1)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))
	require.Empty(t, conv2)

	conv3, err := db.addConversation(groupPK2)
	require.NoError(t, err)
	require.Equal(t, groupPK2, conv3.PublicKey)
}

func Test_dbWrapper_getDeviceByPK(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	pk1 := "pk1"

	devErr, err := db.getDeviceByPK("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, devErr)

	dev, err := db.getDeviceByPK(pk1)
	require.Error(t, err)
	require.True(t, errors.Is(err, gorm.ErrRecordNotFound))
	_ = dev

	refDev := Device{
		PublicKey:       pk1,
		MemberPublicKey: "ownerPK1",
	}

	db.db.Create(refDev)

	dev, err = db.getDeviceByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refDev.PublicKey, dev.PublicKey)
	require.Equal(t, refDev.MemberPublicKey, dev.MemberPublicKey)

	db.db.Create(&Device{
		PublicKey:       "pk2",
		MemberPublicKey: "ownerPK2",
	})

	dev, err = db.getDeviceByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refDev.PublicKey, dev.PublicKey)
	require.Equal(t, refDev.MemberPublicKey, dev.MemberPublicKey)
}

func Test_dbWrapper_getContactByPK(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	pk1 := "pk1"

	contactErr, err := db.getContactByPK("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contactErr)

	contact, err := db.getContactByPK(pk1)
	require.Error(t, err)
	require.True(t, errors.Is(err, gorm.ErrRecordNotFound))
	_ = contact

	refContact := Contact{
		PublicKey:             pk1,
		ConversationPublicKey: "",
		State:                 Contact_IncomingRequest,
		DisplayName:           "PK1-Name",
		CreatedDate:           12345,
		SentDate:              123,
	}

	db.db.Create(refContact)

	contact, err = db.getContactByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refContact.PublicKey, contact.PublicKey)
	require.Equal(t, refContact.ConversationPublicKey, contact.ConversationPublicKey)
	require.Equal(t, refContact.State, contact.State)
	require.Equal(t, refContact.DisplayName, contact.DisplayName)
	require.Equal(t, refContact.CreatedDate, contact.CreatedDate)
	require.Equal(t, refContact.SentDate, contact.SentDate)

	db.db.Create(&Device{
		PublicKey:       "pk2",
		MemberPublicKey: "ownerPK2",
	})

	contact, err = db.getContactByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refContact.PublicKey, contact.PublicKey)
	require.Equal(t, refContact.ConversationPublicKey, contact.ConversationPublicKey)
	require.Equal(t, refContact.State, contact.State)
	require.Equal(t, refContact.DisplayName, contact.DisplayName)
	require.Equal(t, refContact.CreatedDate, contact.CreatedDate)
	require.Equal(t, refContact.SentDate, contact.SentDate)
}

func Test_dbWrapper_addAccount(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	err := db.addAccount("", "http://url1/")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	err = db.addAccount("pk_1", "http://url1/")
	require.NoError(t, err)

	err = db.addAccount("pk_1", "http://url2/")
	require.NoError(t, err)
}

func Test_dbWrapper_addContactRequestIncomingReceived(t *testing.T) {
	var (
		db, dispose  = getInMemoryTestDB(t)
		contact1PK   = "contactPK1"
		contact1Name = "contactName1"
	)

	defer dispose()

	contactErr, err := db.addContactRequestIncomingReceived("", "some name", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contactErr)

	contact, err := db.addContactRequestIncomingReceived(contact1PK, contact1Name, "")
	require.NoError(t, err)
	require.NotEmpty(t, contact)
	require.Equal(t, contact1PK, contact.PublicKey)
	require.Equal(t, contact1Name, contact.DisplayName)

	createdDate := contact.CreatedDate

	contact, err = db.addContactRequestIncomingReceived(contact1PK, "contact1OtherName", "")
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))
	require.NotEmpty(t, contact)
	require.Equal(t, contact1PK, contact.PublicKey)
	require.Equal(t, contact1Name, contact.DisplayName)
	require.Equal(t, createdDate, contact.CreatedDate)
}

func Test_dbWrapper_addContactRequestIncomingAccepted(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	contact, err := db.addContactRequestIncomingAccepted("", "group_1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.addContactRequestIncomingAccepted("contact_1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.addContactRequestIncomingAccepted("contact_1", "group_1")
	require.Error(t, err)
	require.Empty(t, contact)

	// TODO:
	t.Skip("complete test")
}

func Test_dbWrapper_addContactRequestOutgoingEnqueued(t *testing.T) {
	var (
		contactPK   = "contactPK1"
		displayName = "displayName1"
		convPK      = "convPK1"
		db, dispose = getInMemoryTestDB(t)
	)

	defer dispose()

	contact, err := db.addContactRequestOutgoingEnqueued("", displayName, convPK)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.addContactRequestOutgoingEnqueued(contactPK, displayName, convPK)
	require.NoError(t, err)
	require.NotNil(t, contact)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, convPK, contact.ConversationPublicKey)

	contact, err = db.addContactRequestOutgoingEnqueued(contactPK, "other_display_name", "other_conv_pk")
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))
	require.NotNil(t, contact)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, convPK, contact.ConversationPublicKey)
}

func Test_dbWrapper_addContactRequestOutgoingSent(t *testing.T) {
	var (
		contactPK   = "contactPK1"
		displayName = "displayName1"
		convPK      = "convPK1"
		db, dispose = getInMemoryTestDB(t)
	)

	defer dispose()

	contact, err := db.addContactRequestOutgoingEnqueued(contactPK, displayName, convPK)
	require.NoError(t, err)
	require.NotNil(t, contact)

	contact, err = db.getContactByPK(contactPK)
	require.NoError(t, err)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, convPK, contact.ConversationPublicKey)
	require.Equal(t, Contact_OutgoingRequestEnqueued, contact.State)

	contact, err = db.addContactRequestOutgoingSent("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.addContactRequestOutgoingSent(contactPK)
	require.NoError(t, err)
	require.NotNil(t, contact)

	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, convPK, contact.ConversationPublicKey)
	require.Equal(t, Contact_OutgoingRequestSent, contact.State)

	contact, err = db.getContactByPK(contactPK)
	require.NoError(t, err)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, convPK, contact.ConversationPublicKey)
	require.Equal(t, Contact_OutgoingRequestSent, contact.State)

	contact, err = db.addContactRequestOutgoingSent(contactPK)
	require.Error(t, err)
}

func Test_dbWrapper_addConversationForContact(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	// should raise an error when passing an empty conversation pk
	conv, err := db.addConversationForContact("", "contact_1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, conv)

	// should raise an error when passing an empty contact pk
	conv, err = db.addConversationForContact("convo_1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, conv)

	// should be ok
	conv, err = db.addConversationForContact("convo_1", "contact_1")
	require.NoError(t, err)
	require.Equal(t, "convo_1", conv.PublicKey)
	require.Equal(t, "contact_1", conv.ContactPublicKey)

	count, err := db.dbModelRowsCount(&Conversation{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	// should be idempotent
	conv, err = db.addConversationForContact("convo_1", "contact_1")
	require.NoError(t, err)
	require.Equal(t, "convo_1", conv.PublicKey)
	require.Equal(t, "contact_1", conv.ContactPublicKey)

	count, err = db.dbModelRowsCount(&Conversation{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	// should not create another conversation for the same contact
	conv, err = db.addConversationForContact("convo_2", "contact_1")
	require.Error(t, err)
	require.Nil(t, conv)

	count, err = db.dbModelRowsCount(&Conversation{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	// should raise an error when reusing a conversation id for another contact
	conv, err = db.addConversationForContact("convo_1", "contact_2")
	require.Error(t, err)
	require.Nil(t, conv)

	count, err = db.dbModelRowsCount(&Conversation{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)
}

func Test_dbWrapper_addDevice(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	device, err := db.addDevice("", "member1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, device)

	device, err = db.addDevice("device1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, device)

	device, err = db.addDevice("device1", "member1")
	require.NoError(t, err)
	require.NotNil(t, device)
	require.Equal(t, "device1", device.PublicKey)
	require.Equal(t, "member1", device.MemberPublicKey)

	device, err = db.addDevice("device1", "member2")
	require.Error(t, err)
	require.Nil(t, device)

	device, err = db.addDevice("device2", "member1")
	require.NoError(t, err)
	require.NotNil(t, device)
	require.Equal(t, "device2", device.PublicKey)
	require.Equal(t, "member1", device.MemberPublicKey)

	device, err = db.addDevice("device3", "member3")
	require.NoError(t, err)
	require.NotNil(t, device)
	require.Equal(t, "device3", device.PublicKey)
	require.Equal(t, "member3", device.MemberPublicKey)
}

func Test_dbWrapper_addInteraction(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	i, _, err := db.addInteraction(Interaction{
		CID:     "",
		Payload: []byte("payload1"),
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, i)

	i, isNew, err := db.addInteraction(Interaction{
		CID:     "Qm00001",
		Payload: []byte("payload1"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00001", i.CID)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.True(t, isNew)

	// Data should not be updated
	i, isNew, err = db.addInteraction(Interaction{
		CID:     "Qm00001",
		Payload: []byte("payload2"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00001", i.CID)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.False(t, isNew)

	i, isNew, err = db.addInteraction(Interaction{
		CID:     "Qm00002",
		Payload: []byte("payload2"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00002", i.CID)
	require.Equal(t, []byte("payload2"), i.Payload)
	require.True(t, isNew)

	// Test relations
	require.NoError(t, db.db.Create(&Conversation{PublicKey: "conversation_3"}).Error)
	require.NoError(t, db.db.Create(&Member{PublicKey: "member_3"}).Error)

	i, isNew, err = db.addInteraction(Interaction{
		CID:                   "Qm00003",
		Payload:               []byte("payload3"),
		MemberPublicKey:       "member_3",
		ConversationPublicKey: "conversation_3",
	})

	require.NoError(t, err)
	require.NotNil(t, i)
	require.NotEmpty(t, i.Member)
	require.NotEmpty(t, i.Conversation)
	require.Equal(t, i.MemberPublicKey, i.Member.PublicKey)
	require.Equal(t, i.ConversationPublicKey, i.Conversation.PublicKey)
	require.True(t, isNew)
}

func Test_dbWrapper_addMember(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	member, err := db.addMember("member_1", "", "Display1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, member)

	member, err = db.addMember("", "conversation_1", "Display1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, member)

	member, err = db.addMember("member_1", "conversation_1", "Display1")
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display1", member.DisplayName)

	member, err = db.addMember("member_1", "conversation_1", "Display2")
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display1", member.DisplayName)

	member, err = db.addMember("member_1", "conversation_2", "Display1")
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conversation_2", member.ConversationPublicKey)
	require.Equal(t, "Display1", member.DisplayName)

	member, err = db.addMember("member_2", "conversation_1", "Display2")
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_2", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display2", member.DisplayName)
}

func Test_dbWrapper_attributeBacklogInteractions(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	db.db.Create(&Interaction{CID: "Qm300", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&Interaction{CID: "Qm301", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&Interaction{CID: "Qm302", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&Interaction{CID: "Qm303", DevicePublicKey: "device2", ConversationPublicKey: "conv3"})
	db.db.Create(&Interaction{CID: "Qm104", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&Interaction{CID: "Qm105", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&Interaction{CID: "Qm106", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&Interaction{CID: "Qm107", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&Interaction{CID: "Qm108", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&Interaction{CID: "Qm209", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&Interaction{CID: "Qm210", DevicePublicKey: "device1", ConversationPublicKey: "conv2"})
	db.db.Create(&Interaction{CID: "Qm211", DevicePublicKey: "device2", ConversationPublicKey: "conv3"})
	db.db.Create(&Interaction{CID: "Qm212", DevicePublicKey: "device1", ConversationPublicKey: "conv3"})
	db.db.Create(&Interaction{CID: "Qm213", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})

	interactions, err := db.attributeBacklogInteractions("", "conv3", "member1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Empty(t, interactions)

	interactions, err = db.attributeBacklogInteractions("device3", "", "member1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Empty(t, interactions)

	interactions, err = db.attributeBacklogInteractions("device3", "conv3", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Empty(t, interactions)

	interactions, err = db.attributeBacklogInteractions("device3", "conv3", "member1")
	require.NoError(t, err)
	require.Empty(t, interactions)

	interactions, err = db.attributeBacklogInteractions("device1", "conv1", "member1")
	require.NoError(t, err)
	require.Len(t, interactions, 3)
	require.Equal(t, "member1", interactions[0].MemberPublicKey)
	require.Equal(t, "member1", interactions[1].MemberPublicKey)
	require.Equal(t, "member1", interactions[2].MemberPublicKey)
	require.Equal(t, "Qm300", interactions[0].CID)
	require.Equal(t, "Qm104", interactions[1].CID)
	require.Equal(t, "Qm108", interactions[2].CID)

	interactions, err = db.attributeBacklogInteractions("device1", "conv1", "member1")
	require.NoError(t, err)
	require.Empty(t, interactions)
}

func Test_dbWrapper_dbModelRowsCount(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	count, err := db.dbModelRowsCount(&Account{})
	require.NoError(t, err)
	require.Equal(t, int64(0), count)

	db.db.Create(&Account{PublicKey: "test1"})

	count, err = db.dbModelRowsCount(&Account{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	db.db.Create(&Account{PublicKey: "test2"})

	count, err = db.dbModelRowsCount(&Account{})
	require.NoError(t, err)
	require.Equal(t, int64(2), count)

	// Another model with no data
	count, err = db.dbModelRowsCount(&Contact{})
	require.NoError(t, err)
	require.Equal(t, int64(0), count)

	// Invalid model
	count, err = db.dbModelRowsCount(&dbWrapper{})
	require.Error(t, err)
	require.Equal(t, int64(0), count)
}

func Test_dbWrapper_deleteInteractions(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	err := db.deleteInteractions(nil)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	err = db.deleteInteractions([]string{})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	// Should we raise an error if a CID is not found
	err = db.deleteInteractions([]string{"Qm0001", "Qm0002", "Qm0003"})
	require.NoError(t, err)

	db.db.Create(&Interaction{CID: "Qm0001"})
	db.db.Create(&Interaction{CID: "Qm0002"})
	db.db.Create(&Interaction{CID: "Qm0003"})
	db.db.Create(&Interaction{CID: "Qm0004"})
	db.db.Create(&Interaction{CID: "Qm0005"})
	db.db.Create(&Interaction{CID: "Qm0006"})

	count := int64(0)
	db.db.Model(&Interaction{}).Count(&count)

	require.Equal(t, int64(6), count)

	err = db.deleteInteractions([]string{"Qm0001", "Qm0002", "Qm0003"})
	require.NoError(t, err)

	db.db.Model(&Interaction{}).Count(&count)
	require.Equal(t, int64(3), count)

	interaction := &Interaction{}

	err = db.db.Where(&Interaction{CID: "Qm0001"}).First(&interaction).Error
	require.Error(t, err)

	err = db.db.Where(&Interaction{CID: "Qm0002"}).First(&interaction).Error
	require.Error(t, err)

	err = db.db.Where(&Interaction{CID: "Qm0004"}).First(&interaction).Error
	require.NoError(t, err)
	require.Equal(t, "Qm0004", interaction.CID)
}

func Test_dbWrapper_getAccount(t *testing.T) {
	refAccount := &Account{
		PublicKey: "pk1",
		Link:      "https://link1/",
	}
	refOtherAccount := &Account{
		PublicKey: "pk2",
		Link:      "https://link2/",
	}

	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	acc, err := db.getAccount()
	require.Error(t, err)
	require.True(t, errors.Is(err, gorm.ErrRecordNotFound))
	require.Empty(t, acc)

	db.db.Create(refAccount)

	acc, err = db.getAccount()
	require.NoError(t, err)
	require.Equal(t, refAccount.PublicKey, acc.PublicKey)
	require.Equal(t, refAccount.Link, acc.Link)
	require.Empty(t, acc.ServiceTokens)

	db.db.Create(refOtherAccount)
	acc, err = db.getAccount()
	require.Error(t, err)
	require.True(t, errors.Is(err, errcode.ErrDBMultipleRecords))
	require.Empty(t, acc)

	require.NoError(t, db.db.Delete(refOtherAccount).Error)

	require.NoError(t, db.db.Create(&ServiceToken{
		AccountPK:         refAccount.PublicKey,
		TokenID:           "tok1",
		ServiceType:       "srv1",
		AuthenticationURL: "https://url1/",
	}).Error)

	acc, err = db.getAccount()
	require.NoError(t, err)
	require.Equal(t, refAccount.PublicKey, acc.PublicKey)
	require.Equal(t, refAccount.Link, acc.Link)
	require.Len(t, acc.ServiceTokens, 1)
	require.Equal(t, "tok1", acc.ServiceTokens[0].TokenID)
	require.Equal(t, refAccount.PublicKey, acc.ServiceTokens[0].AccountPK)
	require.Equal(t, "https://url1/", acc.ServiceTokens[0].AuthenticationURL)
	require.Equal(t, "srv1", acc.ServiceTokens[0].ServiceType)
}

func Test_dbWrapper_getAcknowledgementsCIDsForInteraction(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	cids, err := db.getAcknowledgementsCIDsForInteraction("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Empty(t, cids)

	cids, err = db.getAcknowledgementsCIDsForInteraction("QmXX")
	require.NoError(t, err)
	require.Empty(t, cids)

	db.db.Create(&Interaction{CID: "Qm0001", Type: AppMessage_TypeAcknowledge, TargetCID: "QmTarget"})
	db.db.Create(&Interaction{CID: "Qm0002", Type: AppMessage_TypeAcknowledge, TargetCID: "QmTarget"})
	db.db.Create(&Interaction{CID: "Qm0003", Type: AppMessage_TypeAcknowledge, TargetCID: "QmOtherTarget"})

	cids, err = db.getAcknowledgementsCIDsForInteraction("QmXX")
	require.NoError(t, err)
	require.Empty(t, cids)

	cids, err = db.getAcknowledgementsCIDsForInteraction("QmTarget")
	require.NoError(t, err)
	require.Len(t, cids, 2)

	cids, err = db.getAcknowledgementsCIDsForInteraction("QmOtherTarget")
	require.NoError(t, err)
	require.Len(t, cids, 1)
}

func Test_dbWrapper_getAllContacts(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	contacts, err := db.getAllContacts()
	require.NoError(t, err)
	require.Len(t, contacts, 0)

	db.db.Create(&Contact{PublicKey: "pk1"})
	db.db.Create(&Contact{PublicKey: "pk2"})
	db.db.Create(&Contact{PublicKey: "pk3"})

	contacts, err = db.getAllContacts()
	require.NoError(t, err)
	require.Len(t, contacts, 3)
}

func Test_dbWrapper_getAllConversations(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	conversations, err := db.getAllConversations()
	require.NoError(t, err)
	require.Len(t, conversations, 0)

	db.db.Create(&Conversation{PublicKey: "pk1"})
	db.db.Create(&Conversation{PublicKey: "pk2"})
	db.db.Create(&Conversation{PublicKey: "pk3"})

	conversations, err = db.getAllConversations()
	require.NoError(t, err)
	require.Len(t, conversations, 3)
}

func Test_dbWrapper_getAllInteractions(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	interactions, err := db.getAllInteractions()
	require.NoError(t, err)
	require.Len(t, interactions, 0)

	db.db.Create(&Interaction{CID: "Qm1"})
	db.db.Create(&Interaction{CID: "Qm2"})
	db.db.Create(&Interaction{CID: "Qm3"})

	interactions, err = db.getAllInteractions()
	require.NoError(t, err)
	require.Len(t, interactions, 3)
}

func Test_dbWrapper_getAllMembers(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	members, err := db.getAllMembers()
	require.NoError(t, err)
	require.Len(t, members, 0)

	db.db.Create(&Member{PublicKey: "pk1"})
	db.db.Create(&Member{PublicKey: "pk2"})
	db.db.Create(&Member{PublicKey: "pk3"})

	members, err = db.getAllMembers()
	require.NoError(t, err)
	require.Len(t, members, 3)
}

func Test_dbWrapper_getContactsByState(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	contacts, err := db.getContactsByState(Contact_Accepted)
	require.NoError(t, err)
	require.Len(t, contacts, 0)

	db.db.Create(&Contact{PublicKey: "pk1", State: Contact_IncomingRequest})
	db.db.Create(&Contact{PublicKey: "pk2", State: Contact_OutgoingRequestEnqueued})
	db.db.Create(&Contact{PublicKey: "pk3", State: Contact_OutgoingRequestSent})

	contacts, err = db.getContactsByState(Contact_Accepted)
	require.NoError(t, err)
	require.Len(t, contacts, 0)

	db.db.Create(&Contact{PublicKey: "pk4", State: Contact_Accepted})
	db.db.Create(&Contact{PublicKey: "pk5", State: Contact_Accepted})
	db.db.Create(&Contact{PublicKey: "pk6", State: Contact_Accepted})

	contacts, err = db.getContactsByState(Contact_Accepted)
	require.NoError(t, err)
	require.Len(t, contacts, 3)
}

func Test_dbWrapper_updateAccount(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	acc, err := db.updateAccount("", "https://url1/", "DisplayName1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, acc)

	acc, err = db.updateAccount("pk_1", "https://url1/", "DisplayName1")
	require.Error(t, err)
	require.Nil(t, acc)

	db.db.Create(&Account{PublicKey: "pk_1"})

	acc, err = db.updateAccount("pk_1", "", "")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "", acc.Link)
	require.Equal(t, "", acc.DisplayName)

	acc, err = db.updateAccount("pk_1", "https://url1/", "DisplayName1")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url1/", acc.Link)
	require.Equal(t, "DisplayName1", acc.DisplayName)

	acc, err = db.updateAccount("pk_1", "https://url2/", "")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url2/", acc.Link)
	require.Equal(t, "DisplayName1", acc.DisplayName)

	acc, err = db.updateAccount("pk_1", "", "DisplayName2")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url2/", acc.Link)
	require.Equal(t, "DisplayName2", acc.DisplayName)
}

func Test_dbWrapper_updateContact(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	err := db.updateContact(Contact{})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	err = db.updateContact(Contact{PublicKey: "pk_1"})
	require.Error(t, err)

	require.NoError(t, db.db.Create(&Contact{PublicKey: "pk_1"}).Error)

	err = db.updateContact(Contact{PublicKey: "pk_1"})
	require.NoError(t, err)

	err = db.updateContact(Contact{PublicKey: "pk_1", DisplayName: "DisplayName1"})
	require.NoError(t, err)

	c := &Contact{}
	require.NoError(t, db.db.First(&c, &Contact{PublicKey: "pk_1"}).Error)
	require.Equal(t, "pk_1", c.PublicKey)
	require.Equal(t, "DisplayName1", c.DisplayName)
	require.Equal(t, Contact_Undefined, c.State)

	err = db.updateContact(Contact{PublicKey: "pk_1", State: Contact_Accepted})
	require.NoError(t, err)

	c = &Contact{}
	require.NoError(t, db.db.First(&c, &Contact{PublicKey: "pk_1"}).Error)
	require.Equal(t, "pk_1", c.PublicKey)
	require.Equal(t, "DisplayName1", c.DisplayName)
	require.Equal(t, Contact_Accepted, c.State)
}

func Test_dbWrapper_updateConversation(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	_, err := db.updateConversation(Conversation{})
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Error(t, err)

	isNew, err := db.updateConversation(Conversation{PublicKey: "conv_1"})
	require.NoError(t, err)
	require.True(t, isNew)

	c := &Conversation{}
	require.NoError(t, db.db.Where(&Conversation{PublicKey: "conv_1"}).First(&c).Error)

	isNew, err = db.updateConversation(Conversation{PublicKey: "conv_1", DisplayName: "DisplayName1"})
	require.NoError(t, err)
	require.False(t, isNew)

	c = &Conversation{}
	require.NoError(t, db.db.Where(&Conversation{PublicKey: "conv_1"}).First(&c).Error)
	require.Equal(t, "DisplayName1", c.DisplayName)

	isNew, err = db.updateConversation(Conversation{PublicKey: "conv_1", Link: "https://link1/"})
	require.NoError(t, err)
	require.False(t, isNew)

	c = &Conversation{}
	require.NoError(t, db.db.Where(&Conversation{PublicKey: "conv_1"}).First(&c).Error)
	require.Equal(t, "DisplayName1", c.DisplayName)
	require.Equal(t, "https://link1/", c.Link)

	isNew, err = db.updateConversation(Conversation{PublicKey: "conv_1", Link: "https://link2/", DisplayName: "DisplayName2"})
	require.NoError(t, err)
	require.False(t, isNew)

	c = &Conversation{}
	require.NoError(t, db.db.Where(&Conversation{PublicKey: "conv_1"}).First(&c).Error)
	require.Equal(t, "DisplayName2", c.DisplayName)
	require.Equal(t, "https://link2/", c.Link)
}

func Test_dbWrapper_getConversationByPK(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	conversation, err := db.getConversationByPK("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, conversation)

	conversation, err = db.getConversationByPK("unknown")
	require.Error(t, err)
	require.Nil(t, conversation)

	db.db.Create(&Conversation{PublicKey: "conversation_1"})

	conversation, err = db.getConversationByPK("conversation_1")
	require.NoError(t, err)
	require.NotNil(t, conversation)
	require.Equal(t, "conversation_1", conversation.PublicKey)
	require.Empty(t, conversation.ReplicationInfo)

	require.NoError(t, db.db.Create(&ConversationReplicationInfo{
		CID:                   "cid_1",
		ConversationPublicKey: "conversation_1",
	}).Error)

	conversation, err = db.getConversationByPK("conversation_1")
	require.NoError(t, err)
	require.NotNil(t, conversation)
	require.Equal(t, "conversation_1", conversation.PublicKey)
	require.NotEmpty(t, conversation.ReplicationInfo)
	require.Equal(t, "cid_1", conversation.ReplicationInfo[0].CID)
}

func Test_dbWrapper_getDBInfo(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	info, err := db.getDBInfo()
	require.NoError(t, err)
	require.Empty(t, info)

	for i := 0; i < 1; i++ {
		db.db.Create(&Account{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 2; i++ {
		db.db.Create(&Contact{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 3; i++ {
		db.db.Create(&Interaction{CID: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 4; i++ {
		db.db.Create(&Conversation{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 5; i++ {
		db.db.Create(&Member{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 6; i++ {
		db.db.Create(&Device{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 7; i++ {
		db.db.Create(&ServiceToken{ServiceType: fmt.Sprintf("%d", i), TokenID: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 8; i++ {
		db.db.Create(&ConversationReplicationInfo{CID: fmt.Sprintf("%d", i)})
	}

	info, err = db.getDBInfo()
	require.NoError(t, err)
	require.Equal(t, int64(1), info.Accounts)
	require.Equal(t, int64(2), info.Contacts)
	require.Equal(t, int64(3), info.Interactions)
	require.Equal(t, int64(4), info.Conversations)
	require.Equal(t, int64(5), info.Members)
	require.Equal(t, int64(6), info.Devices)
	require.Equal(t, int64(7), info.ServiceTokens)
	require.Equal(t, int64(8), info.ConversationReplicationInfo)

	// Ensure all tables are in the debug data
	tables := []string(nil)
	err = db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.Equal(t, 8, len(tables))
}

func Test_dbWrapper_getMemberByPK(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	member, err := db.getMemberByPK("", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, member)

	member, err = db.getMemberByPK("unknown", "")
	require.Error(t, err)
	require.Nil(t, member)

	db.db.Create(&Member{PublicKey: "member_1", ConversationPublicKey: "conv_1"})

	member, err = db.getMemberByPK("member_1", "conv_1")
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conv_1", member.ConversationPublicKey)

	member, err = db.getMemberByPK("member_1", "conv_2")
	require.Error(t, err)
	require.Nil(t, member)
}

func Test_dbWrapper_initDB(t *testing.T) {
	db, dispose := getInMemoryTestDB(t, getInMemoryTestDBOptsNoInit)
	defer dispose()

	tables := []string(nil)

	err := db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.Empty(t, tables)

	err = db.initDB(noopReplayer)
	require.NoError(t, err)

	err = db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.NotEmpty(t, tables)
}

func Test_dbWrapper_markInteractionAsAcknowledged(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	interaction, err := db.markInteractionAsAcknowledged("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, interaction)

	interaction, err = db.markInteractionAsAcknowledged("QmXXXX")
	require.Error(t, err)
	require.Equal(t, err, gorm.ErrRecordNotFound)
	require.Nil(t, interaction)

	require.NoError(t, db.db.Create(&Interaction{CID: "Qm0001", Acknowledged: true}).Error)
	interaction, err = db.markInteractionAsAcknowledged("Qm0001")
	require.NoError(t, err)
	require.Nil(t, interaction)

	require.NoError(t, db.db.Create(&Interaction{CID: "Qm0002", Acknowledged: false}).Error)
	interaction, err = db.markInteractionAsAcknowledged("Qm0002")
	require.NoError(t, err)
	require.NotNil(t, interaction)
	require.Equal(t, "Qm0002", interaction.CID)
	require.True(t, interaction.Acknowledged)

	interaction, err = db.markInteractionAsAcknowledged("Qm0002")
	require.NoError(t, err)
	require.Nil(t, interaction)
}

func Test_dbWrapper_setConversationIsOpenStatus(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	conv, updated, err := db.setConversationIsOpenStatus("", true)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.False(t, updated)
	require.Nil(t, conv)

	conv, updated, err = db.setConversationIsOpenStatus("conv_xxx", true)
	require.Error(t, err)
	require.False(t, updated)

	db.db.Create(&Conversation{PublicKey: "conv1", IsOpen: true})
	db.db.Create(&Conversation{PublicKey: "conv2", IsOpen: false, UnreadCount: 1000})
	db.db.Create(&Conversation{PublicKey: "conv3", IsOpen: false, UnreadCount: 2000})

	c := &Conversation{}

	conv, updated, err = db.setConversationIsOpenStatus("conv1", true)
	require.NoError(t, err)
	require.False(t, updated)

	db.db.Model(&Conversation{}).Preload("ReplicationInfo").Where(&Conversation{PublicKey: "conv1"}).First(&c)
	require.Equal(t, "conv1", c.PublicKey)
	require.True(t, c.IsOpen)
	require.Equal(t, int32(0), c.UnreadCount)

	conv, updated, err = db.setConversationIsOpenStatus("conv1", false)
	require.NoError(t, err)
	require.True(t, updated)

	c = &Conversation{}
	db.db.Model(&Conversation{}).Preload("ReplicationInfo").Where(&Conversation{PublicKey: "conv1"}).First(&c)
	require.Equal(t, "conv1", c.PublicKey)
	require.False(t, c.IsOpen)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, c, conv)

	c = &Conversation{}
	db.db.Model(&Conversation{}).Preload("ReplicationInfo").Where(&Conversation{PublicKey: "conv2"}).First(&c)
	require.Equal(t, "conv2", c.PublicKey)
	require.False(t, c.IsOpen)
	require.Equal(t, int32(1000), c.UnreadCount)

	conv, updated, err = db.setConversationIsOpenStatus("conv2", true)
	require.NoError(t, err)
	require.True(t, updated)

	c = &Conversation{}
	db.db.Model(&Conversation{}).Preload("ReplicationInfo").Where(&Conversation{PublicKey: "conv2"}).First(&c)
	require.Equal(t, "conv2", c.PublicKey)
	require.True(t, c.IsOpen)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, c, conv)
}

func Test_dbWrapper_tx(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	err := db.tx(func(tx *dbWrapper) error {
		return fmt.Errorf("some error")
	})
	require.Error(t, err)

	count, err := db.dbModelRowsCount(&Account{})
	require.NoError(t, err)
	require.Equal(t, int64(0), count)

	err = db.tx(func(tx *dbWrapper) error {
		err := tx.addAccount("some pk", "some url")
		require.NoError(t, err)
		return nil
	})
	require.NoError(t, err)

	count, err = db.dbModelRowsCount(&Account{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	err = db.tx(func(tx *dbWrapper) error {
		err := tx.addAccount("some pk 2", "some url 2")
		require.NoError(t, err)
		return fmt.Errorf("some error")
	})
	require.Error(t, err)

	count, err = db.dbModelRowsCount(&Account{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)
}

func Test_dbWrapper_updateConversationReadState(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	c := &Conversation{}

	require.NoError(t, db.db.Create(&Conversation{PublicKey: "convo_a", UnreadCount: 0, LastUpdate: timestampMs(time.Unix(10000, 0))}).Error)
	require.NoError(t, db.db.Create(&Conversation{PublicKey: "convo_b", UnreadCount: 1000, LastUpdate: timestampMs(time.Unix(20000, 0))}).Error)
	require.NoError(t, db.db.Create(&Conversation{PublicKey: "convo_c", UnreadCount: 2000, LastUpdate: timestampMs(time.Unix(30000, 0))}).Error)

	c = &Conversation{}
	require.NoError(t, db.db.Where(&Conversation{PublicKey: "convo_a"}).Find(&c).Error)
	require.Equal(t, "convo_a", c.PublicKey)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, timestampMs(time.Unix(10000, 0)), c.LastUpdate)

	err := db.updateConversationReadState("", false, time.Unix(10001, 0))
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	require.NoError(t, db.updateConversationReadState("convo_a", false, time.Unix(10001, 0)))

	c = &Conversation{}
	require.NoError(t, db.db.Where(&Conversation{PublicKey: "convo_a"}).Find(&c).Error)
	require.Equal(t, "convo_a", c.PublicKey)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, timestampMs(time.Unix(10001, 0)), c.LastUpdate)

	require.NoError(t, db.updateConversationReadState("convo_b", true, time.Unix(20001, 0)))

	c = &Conversation{}
	require.NoError(t, db.db.Where(&Conversation{PublicKey: "convo_b"}).Find(&c).Error)
	require.Equal(t, "convo_b", c.PublicKey)
	require.Equal(t, int32(1001), c.UnreadCount)
	require.Equal(t, timestampMs(time.Unix(20001, 0)), c.LastUpdate)

	c = &Conversation{}
	require.NoError(t, db.db.Where(&Conversation{PublicKey: "convo_c"}).Find(&c).Error)
	require.Equal(t, "convo_c", c.PublicKey)
	require.Equal(t, int32(2000), c.UnreadCount)
	require.Equal(t, timestampMs(time.Unix(30000, 0)), c.LastUpdate)

	require.Error(t, db.updateConversationReadState("convo_d", true, time.Unix(20001, 0)))
}

func Test_dropAllTables(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	tables := []string(nil)
	err := db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.NotEmpty(t, tables)

	err = dropAllTables(db.db)
	require.NoError(t, err)

	tables = []string(nil)
	err = db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.Empty(t, tables)
}

func Test_isSQLiteError(t *testing.T) {
	require.False(t, isSQLiteError(nil, sqlite3.ErrConstraint))
	require.False(t, isSQLiteError(fmt.Errorf("err"), sqlite3.ErrConstraint))
	require.False(t, isSQLiteError(fmt.Errorf("err: %v", sqlite3.ErrConstraint), sqlite3.ErrConstraint))
	require.True(t, isSQLiteError(sqlite3.Error{Code: sqlite3.ErrConstraint}, sqlite3.ErrConstraint))
}

func Test_dbWrapper_isConversationOpened(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	require.NoError(t, db.db.Create(&Conversation{PublicKey: "convo_a", IsOpen: true}).Error)
	require.NoError(t, db.db.Create(&Conversation{PublicKey: "convo_b", IsOpen: false}).Error)

	opened, err := db.isConversationOpened("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	opened, err = db.isConversationOpened("convo_a")
	require.NoError(t, err)
	require.True(t, opened)

	opened, err = db.isConversationOpened("convo_b")
	require.NoError(t, err)
	require.False(t, opened)
}

func Test_dbWrapper_addServiceToken(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	tok1 := &bertytypes.ServiceToken{
		Token:             "tok1",
		AuthenticationURL: "https://url1/",
		SupportedServices: []*bertytypes.ServiceTokenSupportedService{
			{ServiceType: "srv1"},
			{ServiceType: "srv2"},
		},
	}

	tok2 := &bertytypes.ServiceToken{
		Token:             "tok2",
		AuthenticationURL: "https://url2/",
		SupportedServices: []*bertytypes.ServiceTokenSupportedService{
			{ServiceType: "srv3"},
			{ServiceType: "srv4"},
		},
	}

	err := db.addServiceToken("", tok1)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	err = db.addServiceToken("", &bertytypes.ServiceToken{
		Token:             "tok2",
		AuthenticationURL: "https://url2/",
		SupportedServices: []*bertytypes.ServiceTokenSupportedService{},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	err = db.addServiceToken("acc_1", tok1)
	require.NoError(t, err)

	err = db.addServiceToken("acc_1", tok2)
	require.NoError(t, err)

	tok := &ServiceToken{}
	require.NoError(t, db.db.Model(&ServiceToken{}).Where(&ServiceToken{TokenID: tok1.TokenID(), ServiceType: "srv1"}).First(&tok).Error)
	require.Equal(t, tok1.TokenID(), tok.TokenID)
	require.Equal(t, "srv1", tok.ServiceType)
	require.Equal(t, tok1.AuthenticationURL, tok.AuthenticationURL)

	tok = &ServiceToken{}
	require.NoError(t, db.db.Model(&ServiceToken{}).Where(&ServiceToken{TokenID: tok2.TokenID(), ServiceType: "srv3"}).First(&tok).Error)
	require.Equal(t, tok2.TokenID(), tok.TokenID)
	require.Equal(t, "srv3", tok.ServiceType)
	require.Equal(t, tok2.AuthenticationURL, tok.AuthenticationURL)

	tok = &ServiceToken{}
	require.Error(t, db.db.Model(&ServiceToken{}).Where(&ServiceToken{TokenID: tok1.TokenID(), ServiceType: "srv3"}).First(&tok).Error)

	tok = &ServiceToken{}
	require.Error(t, db.db.Model(&ServiceToken{}).Where(&ServiceToken{TokenID: tok2.TokenID(), ServiceType: "srv2"}).First(&tok).Error)
}

func Test_dbWrapper_getReplyOptionsCIDForConversation(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	cid, err := db.getReplyOptionsCIDForConversation("")
	require.Error(t, err)
	require.Equal(t, "", cid)

	cid, err = db.getReplyOptionsCIDForConversation("unknown_conversation")
	require.NoError(t, err)
	require.Equal(t, "", cid)

	db.db.Create(&Interaction{CID: "cid_1", Type: AppMessage_TypeReplyOptions, ConversationPublicKey: "conv_1", IsMe: false})

	cid, err = db.getReplyOptionsCIDForConversation("conv_1")
	require.NoError(t, err)
	require.Equal(t, "cid_1", cid)

	db.db.Create(&Interaction{CID: "cid_2", Type: AppMessage_TypeUserMessage, ConversationPublicKey: "conv_1", IsMe: false})

	cid, err = db.getReplyOptionsCIDForConversation("conv_1")
	require.NoError(t, err)
	require.Equal(t, "cid_1", cid)

	db.db.Create(&Interaction{CID: "cid_3", Type: AppMessage_TypeReplyOptions, ConversationPublicKey: "conv_1", IsMe: false})

	cid, err = db.getReplyOptionsCIDForConversation("conv_1")
	require.NoError(t, err)
	require.Equal(t, "cid_3", cid)

	db.db.Create(&Interaction{CID: "cid_4", Type: AppMessage_TypeUserMessage, ConversationPublicKey: "conv_1", IsMe: true})

	cid, err = db.getReplyOptionsCIDForConversation("conv_1")
	require.NoError(t, err)
	require.Equal(t, "", cid)
}
