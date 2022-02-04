package messengerdb

import (
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	sqlite3 "github.com/mutecomm/go-sqlcipher/v4"
	"github.com/stretchr/testify/require"
	"golang.org/x/net/context"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func Test_dbWrapper_addConversation(t *testing.T) {
	groupPK1 := "group_pk"
	groupPK2 := "group_pk_2"

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	convErr, err := db.AddConversation("", "mem_1", "dev_1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, convErr)

	conv1, err := db.AddConversation(groupPK1, "mem_1", "dev_1")
	require.NoError(t, err)
	require.Equal(t, groupPK1, conv1.PublicKey)

	conv2, err := db.AddConversation(groupPK1, "mem_1", "dev_1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))
	require.Empty(t, conv2)

	conv3, err := db.AddConversation(groupPK2, "mem_1", "dev_1")
	require.NoError(t, err)
	require.Equal(t, groupPK2, conv3.PublicKey)
}

func Test_dbWrapper_getDeviceByPK(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	pk1 := "pk1"

	devErr, err := db.GetDeviceByPK("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, devErr)

	dev, err := db.GetDeviceByPK(pk1)
	require.Error(t, err)
	require.True(t, errors.Is(err, gorm.ErrRecordNotFound))
	_ = dev

	refDev := messengertypes.Device{
		PublicKey:       pk1,
		MemberPublicKey: "ownerPK1",
	}

	db.db.Create(refDev)

	dev, err = db.GetDeviceByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refDev.PublicKey, dev.PublicKey)
	require.Equal(t, refDev.MemberPublicKey, dev.MemberPublicKey)

	db.db.Create(&messengertypes.Device{
		PublicKey:       "pk2",
		MemberPublicKey: "ownerPK2",
	})

	dev, err = db.GetDeviceByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refDev.PublicKey, dev.PublicKey)
	require.Equal(t, refDev.MemberPublicKey, dev.MemberPublicKey)
}

func Test_dbWrapper_getContactByPK(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	pk1 := "pk1"

	contactErr, err := db.GetContactByPK("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contactErr)

	contact, err := db.GetContactByPK(pk1)
	require.Error(t, err)
	require.True(t, errors.Is(err, gorm.ErrRecordNotFound))
	_ = contact

	refContact := messengertypes.Contact{
		PublicKey:             pk1,
		ConversationPublicKey: "",
		State:                 messengertypes.Contact_IncomingRequest,
		DisplayName:           "PK1-Name",
		CreatedDate:           12345,
		SentDate:              123,
	}

	db.db.Create(refContact)

	contact, err = db.GetContactByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refContact.PublicKey, contact.PublicKey)
	require.Equal(t, refContact.ConversationPublicKey, contact.ConversationPublicKey)
	require.Equal(t, refContact.State, contact.State)
	require.Equal(t, refContact.DisplayName, contact.DisplayName)
	require.Equal(t, refContact.CreatedDate, contact.CreatedDate)
	require.Equal(t, refContact.SentDate, contact.SentDate)

	db.db.Create(&messengertypes.Device{
		PublicKey:       "pk2",
		MemberPublicKey: "ownerPK2",
	})

	contact, err = db.GetContactByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refContact.PublicKey, contact.PublicKey)
	require.Equal(t, refContact.ConversationPublicKey, contact.ConversationPublicKey)
	require.Equal(t, refContact.State, contact.State)
	require.Equal(t, refContact.DisplayName, contact.DisplayName)
	require.Equal(t, refContact.CreatedDate, contact.CreatedDate)
	require.Equal(t, refContact.SentDate, contact.SentDate)
}

func Test_dbWrapper_addAccount(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	err := db.FirstOrCreateAccount("", "http://url1/")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	err = db.FirstOrCreateAccount("pk_1", "http://url1/")
	require.NoError(t, err)

	err = db.FirstOrCreateAccount("pk_1", "http://url2/")
	require.NoError(t, err)
}

func Test_dbWrapper_addContactRequestIncomingReceived(t *testing.T) {
	var (
		db, _, dispose = GetInMemoryTestDB(t)
		contact1PK     = "contactPK1"
		contact1Name   = "contactName1"
	)

	defer dispose()

	contactErr, err := db.AddContactRequestIncomingReceived("", "some name", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contactErr)

	contact, err := db.AddContactRequestIncomingReceived(contact1PK, contact1Name, "")
	require.NoError(t, err)
	require.NotEmpty(t, contact)
	require.Equal(t, contact1PK, contact.PublicKey)
	require.Equal(t, contact1Name, contact.DisplayName)

	createdDate := contact.CreatedDate

	contact, err = db.AddContactRequestIncomingReceived(contact1PK, "contact1OtherName", "")
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))
	require.NotEmpty(t, contact)
	require.Equal(t, contact1PK, contact.PublicKey)
	require.Equal(t, contact1Name, contact.DisplayName)
	require.Equal(t, createdDate, contact.CreatedDate)
}

func Test_dbWrapper_addContactRequestIncomingAccepted(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	contact, err := db.AddContactRequestIncomingAccepted("", "group_1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.AddContactRequestIncomingAccepted("contact_1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.AddContactRequestIncomingAccepted("contact_1", "group_1")
	require.Error(t, err)
	require.Empty(t, contact)

	// TODO:
	t.Skip("complete test")
}

func Test_dbWrapper_addContactRequestOutgoingEnqueued(t *testing.T) {
	var (
		contactPK      = "contactPK1"
		displayName    = "displayName1"
		convPK         = "convPK1"
		db, _, dispose = GetInMemoryTestDB(t)
	)

	defer dispose()

	contact, err := db.AddContactRequestOutgoingEnqueued("", displayName, convPK)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.AddContactRequestOutgoingEnqueued(contactPK, displayName, convPK)
	require.NoError(t, err)
	require.NotNil(t, contact)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, convPK, contact.ConversationPublicKey)

	contact, err = db.AddContactRequestOutgoingEnqueued(contactPK, "other_display_name", "other_conv_pk")
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))
	require.NotNil(t, contact)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, convPK, contact.ConversationPublicKey)
}

func Test_dbWrapper_addContactRequestOutgoingSent(t *testing.T) {
	var (
		contactPK      = "contactPK1"
		displayName    = "displayName1"
		convPK         = "convPK1"
		db, _, dispose = GetInMemoryTestDB(t)
	)

	defer dispose()

	contact, err := db.AddContactRequestOutgoingEnqueued(contactPK, displayName, convPK)
	require.NoError(t, err)
	require.NotNil(t, contact)

	contact, err = db.GetContactByPK(contactPK)
	require.NoError(t, err)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, convPK, contact.ConversationPublicKey)
	require.Equal(t, messengertypes.Contact_OutgoingRequestEnqueued, contact.State)

	contact, err = db.AddContactRequestOutgoingSent("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.AddContactRequestOutgoingSent(contactPK)
	require.NoError(t, err)
	require.NotNil(t, contact)

	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, convPK, contact.ConversationPublicKey)
	require.Equal(t, messengertypes.Contact_OutgoingRequestSent, contact.State)

	contact, err = db.GetContactByPK(contactPK)
	require.NoError(t, err)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, convPK, contact.ConversationPublicKey)
	require.Equal(t, messengertypes.Contact_OutgoingRequestSent, contact.State)

	contact, err = db.AddContactRequestOutgoingSent(contactPK)
	require.Error(t, err)
}

func Test_dbWrapper_addConversationForContact(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// should raise an error when passing an empty conversation pk
	conv, err := db.AddConversationForContact("", "mem_1", "dev_1", "contact_1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, conv)

	// should raise an error when passing an empty contact pk
	conv, err = db.AddConversationForContact("convo_1", "mem_1", "dev_1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, conv)

	// should be ok
	conv, err = db.AddConversationForContact("convo_1", "mem_1", "dev_1", "contact_1")
	require.NoError(t, err)
	require.Equal(t, "convo_1", conv.PublicKey)
	require.Equal(t, "contact_1", conv.ContactPublicKey)

	count, err := db.dbModelRowsCount(&messengertypes.Conversation{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	// should be idempotent
	conv, err = db.AddConversationForContact("convo_1", "mem_1", "dev_1", "contact_1")
	require.NoError(t, err)
	require.Equal(t, "convo_1", conv.PublicKey)
	require.Equal(t, "contact_1", conv.ContactPublicKey)

	count, err = db.dbModelRowsCount(&messengertypes.Conversation{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	// should not create another conversation for the same contact
	conv, err = db.AddConversationForContact("convo_2", "mem_1", "dev_1", "contact_1")
	require.Error(t, err)
	require.Nil(t, conv)

	count, err = db.dbModelRowsCount(&messengertypes.Conversation{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	// should raise an error when reusing a conversation id for another contact
	conv, err = db.AddConversationForContact("convo_1", "mem_1", "dev_1", "contact_2")
	require.Error(t, err)
	require.Nil(t, conv)

	count, err = db.dbModelRowsCount(&messengertypes.Conversation{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)
}

func Test_dbWrapper_addDevice(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	device, err := db.AddDevice("", "member1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, device)

	device, err = db.AddDevice("device1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, device)

	device, err = db.AddDevice("device1", "member1")
	require.NoError(t, err)
	require.NotNil(t, device)
	require.Equal(t, "device1", device.PublicKey)
	require.Equal(t, "member1", device.MemberPublicKey)

	device, err = db.AddDevice("device1", "member2")
	require.Error(t, err)
	require.Nil(t, device)

	device, err = db.AddDevice("device2", "member1")
	require.NoError(t, err)
	require.NotNil(t, device)
	require.Equal(t, "device2", device.PublicKey)
	require.Equal(t, "member1", device.MemberPublicKey)

	device, err = db.AddDevice("device3", "member3")
	require.NoError(t, err)
	require.NotNil(t, device)
	require.Equal(t, "device3", device.PublicKey)
	require.Equal(t, "member3", device.MemberPublicKey)
}

func Test_dbWrapper_addInteraction(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	i, _, err := db.AddInteraction(messengertypes.Interaction{
		CID:     "",
		Payload: []byte("payload1"),
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, i)

	i, isNew, err := db.AddInteraction(messengertypes.Interaction{
		CID:     "Qm00001",
		Payload: []byte("payload1"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00001", i.CID)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.True(t, isNew)

	// Data should not be updated
	i, isNew, err = db.AddInteraction(messengertypes.Interaction{
		CID:     "Qm00001",
		Payload: []byte("payload2"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00001", i.CID)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.False(t, isNew)

	i, isNew, err = db.AddInteraction(messengertypes.Interaction{
		CID:     "Qm00002",
		Payload: []byte("payload2"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00002", i.CID)
	require.Equal(t, []byte("payload2"), i.Payload)
	require.True(t, isNew)

	// Test relations
	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "conversation_3"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Member{PublicKey: "member_3"}).Error)

	i, isNew, err = db.AddInteraction(messengertypes.Interaction{
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
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	member, err := db.AddMember("member_1", "", "Display1", "", false, false)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, member)

	member, err = db.AddMember("", "conversation_1", "Display1", "", false, false)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, member)

	member, err = db.AddMember("member_1", "conversation_1", "Display1", "", false, false)
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display1", member.DisplayName)

	member, err = db.AddMember("member_1", "conversation_1", "Display2", "", false, false)
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display1", member.DisplayName)

	member, err = db.AddMember("member_1", "conversation_2", "Display1", "", false, false)
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conversation_2", member.ConversationPublicKey)
	require.Equal(t, "Display1", member.DisplayName)

	member, err = db.AddMember("member_2", "conversation_1", "Display2", "", false, false)
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_2", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display2", member.DisplayName)

	member, err = db.AddMember("member_3", "conversation_1", "Display3", "", false, true)
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_3", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display3", member.DisplayName)
	require.True(t, member.IsCreator)
	require.False(t, member.IsMe)

	member, err = db.AddMember("member_4", "conversation_1", "Display4", "", true, false)
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_4", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display4", member.DisplayName)
	require.False(t, member.IsCreator)
	require.True(t, member.IsMe)
}

func Test_dbWrapper_attributeBacklogInteractions(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	db.db.Create(&messengertypes.Interaction{CID: "Qm300", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm301", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm302", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm303", DevicePublicKey: "device2", ConversationPublicKey: "conv3"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm104", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm105", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm106", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm107", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm108", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm209", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm210", DevicePublicKey: "device1", ConversationPublicKey: "conv2"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm211", DevicePublicKey: "device2", ConversationPublicKey: "conv3"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm212", DevicePublicKey: "device1", ConversationPublicKey: "conv3"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm213", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})

	interactions, err := db.AttributeBacklogInteractions("", "conv3", "member1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Empty(t, interactions)

	interactions, err = db.AttributeBacklogInteractions("device3", "", "member1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Empty(t, interactions)

	interactions, err = db.AttributeBacklogInteractions("device3", "conv3", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Empty(t, interactions)

	interactions, err = db.AttributeBacklogInteractions("device3", "conv3", "member1")
	require.NoError(t, err)
	require.Empty(t, interactions)

	interactions, err = db.AttributeBacklogInteractions("device1", "conv1", "member1")
	require.NoError(t, err)
	require.Len(t, interactions, 3)
	require.Equal(t, "member1", interactions[0].MemberPublicKey)
	require.Equal(t, "member1", interactions[1].MemberPublicKey)
	require.Equal(t, "member1", interactions[2].MemberPublicKey)
	require.Equal(t, "Qm300", interactions[0].CID)
	require.Equal(t, "Qm104", interactions[1].CID)
	require.Equal(t, "Qm108", interactions[2].CID)

	interactions, err = db.AttributeBacklogInteractions("device1", "conv1", "member1")
	require.NoError(t, err)
	require.Empty(t, interactions)
}

func Test_dbWrapper_dbModelRowsCount(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	count, err := db.dbModelRowsCount(&messengertypes.Account{})
	require.NoError(t, err)
	require.Equal(t, int64(0), count)

	db.db.Create(&messengertypes.Account{PublicKey: "test1"})

	count, err = db.dbModelRowsCount(&messengertypes.Account{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	db.db.Create(&messengertypes.Account{PublicKey: "test2"})

	count, err = db.dbModelRowsCount(&messengertypes.Account{})
	require.NoError(t, err)
	require.Equal(t, int64(2), count)

	// Another model with no data
	count, err = db.dbModelRowsCount(&messengertypes.Contact{})
	require.NoError(t, err)
	require.Equal(t, int64(0), count)

	// Invalid model
	count, err = db.dbModelRowsCount(&DBWrapper{})
	require.Error(t, err)
	require.Equal(t, int64(0), count)
}

func Test_dbWrapper_deleteInteractions(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	err := db.DeleteInteractions(nil)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	err = db.DeleteInteractions([]string{})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	// Should we raise an error if a CID is not found
	err = db.DeleteInteractions([]string{"Qm0001", "Qm0002", "Qm0003"})
	require.NoError(t, err)

	db.db.Create(&messengertypes.Interaction{CID: "Qm0001"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm0002"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm0003"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm0004"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm0005"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm0006"})

	count := int64(0)
	db.db.Model(&messengertypes.Interaction{}).Count(&count)

	require.Equal(t, int64(6), count)

	err = db.DeleteInteractions([]string{"Qm0001", "Qm0002", "Qm0003"})
	require.NoError(t, err)

	db.db.Model(&messengertypes.Interaction{}).Count(&count)
	require.Equal(t, int64(3), count)

	interaction := &messengertypes.Interaction{}

	err = db.db.Where(&messengertypes.Interaction{CID: "Qm0001"}).First(&interaction).Error
	require.Error(t, err)

	err = db.db.Where(&messengertypes.Interaction{CID: "Qm0002"}).First(&interaction).Error
	require.Error(t, err)

	err = db.db.Where(&messengertypes.Interaction{CID: "Qm0004"}).First(&interaction).Error
	require.NoError(t, err)
	require.Equal(t, "Qm0004", interaction.CID)
}

func Test_dbWrapper_getAccount(t *testing.T) {
	refAccount := &messengertypes.Account{
		PublicKey: "pk1",
		Link:      "https://link1/",
	}
	refOtherAccount := &messengertypes.Account{
		PublicKey: "pk2",
		Link:      "https://link2/",
	}

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	acc, err := db.GetAccount()
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrNotFound))
	require.Empty(t, acc)

	db.db.Create(refAccount)

	acc, err = db.GetAccount()
	require.NoError(t, err)
	require.Equal(t, refAccount.PublicKey, acc.PublicKey)
	require.Equal(t, refAccount.Link, acc.Link)
	require.Empty(t, acc.ServiceTokens)

	db.db.Create(refOtherAccount)
	acc, err = db.GetAccount()
	require.Error(t, err)
	require.True(t, errors.Is(err, errcode.ErrDBMultipleRecords))
	require.Empty(t, acc)

	require.NoError(t, db.db.Delete(refOtherAccount).Error)

	require.NoError(t, db.db.Create(&messengertypes.ServiceToken{
		AccountPK:         refAccount.PublicKey,
		TokenID:           "tok1",
		ServiceType:       "srv1",
		AuthenticationURL: "https://url1/",
	}).Error)

	acc, err = db.GetAccount()
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
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	cids, err := db.GetAcknowledgementsCIDsForInteraction("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Empty(t, cids)

	cids, err = db.GetAcknowledgementsCIDsForInteraction("QmXX")
	require.NoError(t, err)
	require.Empty(t, cids)

	db.db.Create(&messengertypes.Interaction{CID: "Qm0001", Type: messengertypes.AppMessage_TypeAcknowledge, TargetCID: "QmTarget"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm0002", Type: messengertypes.AppMessage_TypeAcknowledge, TargetCID: "QmTarget"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm0003", Type: messengertypes.AppMessage_TypeAcknowledge, TargetCID: "QmOtherTarget"})

	cids, err = db.GetAcknowledgementsCIDsForInteraction("QmXX")
	require.NoError(t, err)
	require.Empty(t, cids)

	cids, err = db.GetAcknowledgementsCIDsForInteraction("QmTarget")
	require.NoError(t, err)
	require.Len(t, cids, 2)

	cids, err = db.GetAcknowledgementsCIDsForInteraction("QmOtherTarget")
	require.NoError(t, err)
	require.Len(t, cids, 1)
}

func Test_dbWrapper_getAllContacts(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	contacts, err := db.GetAllContacts()
	require.NoError(t, err)
	require.Len(t, contacts, 0)

	db.db.Create(&messengertypes.Contact{PublicKey: "pk1"})
	db.db.Create(&messengertypes.Contact{PublicKey: "pk2"})
	db.db.Create(&messengertypes.Contact{PublicKey: "pk3"})

	contacts, err = db.GetAllContacts()
	require.NoError(t, err)
	require.Len(t, contacts, 3)
}

func Test_dbWrapper_getAllConversations(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	conversations, err := db.GetAllConversations()
	require.NoError(t, err)
	require.Len(t, conversations, 0)

	db.db.Create(&messengertypes.Conversation{PublicKey: "pk1"})
	db.db.Create(&messengertypes.Conversation{PublicKey: "pk2"})
	db.db.Create(&messengertypes.Conversation{PublicKey: "pk3"})

	conversations, err = db.GetAllConversations()
	require.NoError(t, err)
	require.Len(t, conversations, 3)

	db.db.Create(&messengertypes.Interaction{CID: "cid1", ConversationPublicKey: "pk1"})
	db.db.Create(&messengertypes.Interaction{CID: "cid2", ConversationPublicKey: "pk1"})
	db.db.Create(&messengertypes.Interaction{CID: "cid3", ConversationPublicKey: "pk1"})
	db.db.Create(&messengertypes.Interaction{CID: "cid4", ConversationPublicKey: "pk1"})

	conversations, err = db.GetAllConversations()
	require.NoError(t, err)
	require.Len(t, conversations, 3)
}

func Test_dbWrapper_getAllInteractions(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	interactions, err := db.GetAllInteractions()
	require.NoError(t, err)
	require.Len(t, interactions, 0)

	db.db.Create(&messengertypes.Interaction{CID: "Qm1"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm2"})
	db.db.Create(&messengertypes.Interaction{CID: "Qm3"})

	interactions, err = db.GetAllInteractions()
	require.NoError(t, err)
	require.Len(t, interactions, 3)
}

func Test_dbWrapper_getAllMembers(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	members, err := db.GetAllMembers()
	require.NoError(t, err)
	require.Len(t, members, 0)

	db.db.Create(&messengertypes.Member{PublicKey: "pk1"})
	db.db.Create(&messengertypes.Member{PublicKey: "pk2"})
	db.db.Create(&messengertypes.Member{PublicKey: "pk3"})

	members, err = db.GetAllMembers()
	require.NoError(t, err)
	require.Len(t, members, 3)
}

func Test_dbWrapper_getContactsByState(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	contacts, err := db.GetContactsByState(messengertypes.Contact_Accepted)
	require.NoError(t, err)
	require.Len(t, contacts, 0)

	db.db.Create(&messengertypes.Contact{PublicKey: "pk1", State: messengertypes.Contact_IncomingRequest})
	db.db.Create(&messengertypes.Contact{PublicKey: "pk2", State: messengertypes.Contact_OutgoingRequestEnqueued})
	db.db.Create(&messengertypes.Contact{PublicKey: "pk3", State: messengertypes.Contact_OutgoingRequestSent})

	contacts, err = db.GetContactsByState(messengertypes.Contact_Accepted)
	require.NoError(t, err)
	require.Len(t, contacts, 0)

	db.db.Create(&messengertypes.Contact{PublicKey: "pk4", State: messengertypes.Contact_Accepted})
	db.db.Create(&messengertypes.Contact{PublicKey: "pk5", State: messengertypes.Contact_Accepted})
	db.db.Create(&messengertypes.Contact{PublicKey: "pk6", State: messengertypes.Contact_Accepted})

	contacts, err = db.GetContactsByState(messengertypes.Contact_Accepted)
	require.NoError(t, err)
	require.Len(t, contacts, 3)
}

func Test_dbWrapper_updateAccount(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	acc, err := db.UpdateAccount("", "https://url1/", "DisplayName1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, acc)

	acc, err = db.UpdateAccount("pk_1", "https://url1/", "DisplayName1", "")
	require.Error(t, err)
	require.Nil(t, acc)

	db.db.Create(&messengertypes.Account{PublicKey: "pk_1"})

	acc, err = db.UpdateAccount("pk_1", "", "", "")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "", acc.Link)
	require.Equal(t, "", acc.DisplayName)

	acc, err = db.UpdateAccount("pk_1", "https://url1/", "DisplayName1", "")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url1/", acc.Link)
	require.Equal(t, "DisplayName1", acc.DisplayName)

	acc, err = db.UpdateAccount("pk_1", "https://url2/", "", "")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url2/", acc.Link)
	require.Equal(t, "DisplayName1", acc.DisplayName)

	acc, err = db.UpdateAccount("pk_1", "", "DisplayName2", "")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url2/", acc.Link)
	require.Equal(t, "DisplayName2", acc.DisplayName)
}

func Test_dbWrapper_updateContact(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	err := db.UpdateContact("", messengertypes.Contact{})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	err = db.UpdateContact("pk_1", messengertypes.Contact{})
	require.Error(t, err)

	require.NoError(t, db.db.Create(&messengertypes.Contact{PublicKey: "pk_1"}).Error)

	err = db.UpdateContact("pk_1", messengertypes.Contact{})
	require.NoError(t, err)

	err = db.UpdateContact("pk_1", messengertypes.Contact{DisplayName: "DisplayName1"})
	require.NoError(t, err)

	c := &messengertypes.Contact{}
	require.NoError(t, db.db.First(&c, &messengertypes.Contact{PublicKey: "pk_1"}).Error)
	require.Equal(t, "pk_1", c.PublicKey)
	require.Equal(t, "DisplayName1", c.DisplayName)
	require.Equal(t, messengertypes.Contact_Undefined, c.State)

	err = db.UpdateContact("pk_1", messengertypes.Contact{State: messengertypes.Contact_Accepted})
	require.NoError(t, err)

	c = &messengertypes.Contact{}
	require.NoError(t, db.db.First(&c, &messengertypes.Contact{PublicKey: "pk_1"}).Error)
	require.Equal(t, "pk_1", c.PublicKey)
	require.Equal(t, "DisplayName1", c.DisplayName)
	require.Equal(t, messengertypes.Contact_Accepted, c.State)
}

func Test_dbWrapper_updateConversation(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	_, err := db.UpdateConversation(messengertypes.Conversation{})
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Error(t, err)

	isNew, err := db.UpdateConversation(messengertypes.Conversation{PublicKey: "conv_1"})
	require.NoError(t, err)
	require.True(t, isNew)

	c := &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "conv_1"}).First(&c).Error)

	isNew, err = db.UpdateConversation(messengertypes.Conversation{PublicKey: "conv_1", DisplayName: "DisplayName1"})
	require.NoError(t, err)
	require.False(t, isNew)

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "conv_1"}).First(&c).Error)
	require.Equal(t, "DisplayName1", c.DisplayName)

	isNew, err = db.UpdateConversation(messengertypes.Conversation{PublicKey: "conv_1", Link: "https://link1/"})
	require.NoError(t, err)
	require.False(t, isNew)

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "conv_1"}).First(&c).Error)
	require.Equal(t, "DisplayName1", c.DisplayName)
	require.Equal(t, "https://link1/", c.Link)

	isNew, err = db.UpdateConversation(messengertypes.Conversation{PublicKey: "conv_1", Link: "https://link2/", DisplayName: "DisplayName2"})
	require.NoError(t, err)
	require.False(t, isNew)

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "conv_1"}).First(&c).Error)
	require.Equal(t, "DisplayName2", c.DisplayName)
	require.Equal(t, "https://link2/", c.Link)
}

func Test_dbWrapper_getConversationByPK(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	conversation, err := db.GetConversationByPK("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, conversation)

	conversation, err = db.GetConversationByPK("unknown")
	require.Error(t, err)
	require.Nil(t, conversation)

	db.db.Create(&messengertypes.Conversation{PublicKey: "conversation_1"})

	conversation, err = db.GetConversationByPK("conversation_1")
	require.NoError(t, err)
	require.NotNil(t, conversation)
	require.Equal(t, "conversation_1", conversation.PublicKey)
	require.Empty(t, conversation.ReplicationInfo)

	require.NoError(t, db.db.Create(&messengertypes.ConversationReplicationInfo{
		CID:                   "cid_1",
		ConversationPublicKey: "conversation_1",
	}).Error)

	conversation, err = db.GetConversationByPK("conversation_1")
	require.NoError(t, err)
	require.NotNil(t, conversation)
	require.Equal(t, "conversation_1", conversation.PublicKey)
	require.NotEmpty(t, conversation.ReplicationInfo)
	require.Equal(t, "cid_1", conversation.ReplicationInfo[0].CID)
	require.Nil(t, conversation.ReplyOptions)

	require.NoError(t, db.db.Create(&messengertypes.Interaction{
		CID:                   "cid_2",
		ConversationPublicKey: "conversation_1",
	}).Error)
	require.NoError(t, db.db.Updates(&messengertypes.Conversation{PublicKey: "conversation_1", ReplyOptionsCID: "cid_2"}).Error)

	conversation, err = db.GetConversationByPK("conversation_1")
	require.NoError(t, err)
	require.NotNil(t, conversation)
	require.Equal(t, "conversation_1", conversation.PublicKey)
	require.NotNil(t, conversation.ReplyOptions)
	require.Equal(t, "cid_2", conversation.ReplyOptionsCID)
	require.Equal(t, "cid_2", conversation.ReplyOptions.CID)

	db.db.Create(&messengertypes.Conversation{PublicKey: "conversation_2"})
	conversation, err = db.GetConversationByPK("conversation_2")
	require.NoError(t, err)
	require.NotNil(t, conversation)
	require.Equal(t, "conversation_2", conversation.PublicKey)
	require.Nil(t, conversation.ReplyOptions)
	require.Empty(t, conversation.ReplyOptionsCID)
}

func Test_dbWrapper_getDBInfo(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	info, err := db.GetDBInfo()
	require.NoError(t, err)
	require.Empty(t, info)

	for i := 0; i < 1; i++ {
		db.db.Create(&messengertypes.Account{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 2; i++ {
		db.db.Create(&messengertypes.Contact{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 3; i++ {
		db.db.Create(&messengertypes.Interaction{CID: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 4; i++ {
		db.db.Create(&messengertypes.Conversation{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 5; i++ {
		db.db.Create(&messengertypes.Member{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 6; i++ {
		db.db.Create(&messengertypes.Device{PublicKey: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 7; i++ {
		db.db.Create(&messengertypes.ServiceToken{ServiceType: fmt.Sprintf("%d", i), TokenID: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 8; i++ {
		db.db.Create(&messengertypes.ConversationReplicationInfo{CID: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 9; i++ {
		db.db.Create(&messengertypes.Reaction{Emoji: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 10; i++ {
		db.db.Create(&messengertypes.MetadataEvent{CID: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 11; i++ {
		db.db.Create(&messengertypes.Media{CID: fmt.Sprintf("%d", i)})
	}

	for i := 0; i < 12; i++ {
		db.db.Create(&messengertypes.SharedPushToken{
			ConversationPublicKey: fmt.Sprintf("%d", i),
			MemberPublicKey:       fmt.Sprintf("%d", i),
			DevicePublicKey:       fmt.Sprintf("%d", i),
			Token:                 fmt.Sprintf("%d", i),
		})
	}

	info, err = db.GetDBInfo()
	require.NoError(t, err)
	require.Equal(t, int64(1), info.Accounts)
	require.Equal(t, int64(2), info.Contacts)
	require.Equal(t, int64(3), info.Interactions)
	require.Equal(t, int64(4), info.Conversations)
	require.Equal(t, int64(5), info.Members)
	require.Equal(t, int64(6), info.Devices)
	require.Equal(t, int64(7), info.ServiceTokens)
	require.Equal(t, int64(8), info.ConversationReplicationInfo)
	require.Equal(t, int64(9), info.Reactions)
	require.Equal(t, int64(10), info.MetadataEvents)
	require.Equal(t, int64(11), info.Medias)
	require.Equal(t, int64(12), info.SharedPushTokens)

	// Ensure all tables are in the debug data
	tables := []string(nil)
	err = db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%_fts%'").Scan(&tables).Error
	require.NoError(t, err)
	expectedTablesCount := 12
	require.Equal(t, expectedTablesCount, len(tables), fmt.Sprintf("expected %d tables in DB, got tables %s", expectedTablesCount, strings.Join(tables, ", ")))
}

func Test_dbWrapper_getMemberByPK(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	member, err := db.GetMemberByPK("", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, member)

	member, err = db.GetMemberByPK("unknown", "")
	require.Error(t, err)
	require.Nil(t, member)

	db.db.Create(&messengertypes.Member{PublicKey: "member_1", ConversationPublicKey: "conv_1"})

	member, err = db.GetMemberByPK("member_1", "conv_1")
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conv_1", member.ConversationPublicKey)

	member, err = db.GetMemberByPK("member_1", "conv_2")
	require.Error(t, err)
	require.Nil(t, member)
}

func Test_dbWrapper_initDB(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t, GetInMemoryTestDBOptsNoInit)
	defer dispose()

	tables := []string(nil)

	err := db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.Empty(t, tables)

	err = db.InitDB(noopReplayer)
	require.NoError(t, err)

	err = db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.NotEmpty(t, tables)
}

func Test_dbWrapper_markInteractionAsAcknowledged(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	interaction, err := db.MarkInteractionAsAcknowledged("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.Nil(t, interaction)

	interaction, err = db.MarkInteractionAsAcknowledged("QmXXXX")
	require.Error(t, err)
	require.Equal(t, err, gorm.ErrRecordNotFound)
	require.Nil(t, interaction)

	require.NoError(t, db.db.Create(&messengertypes.Interaction{CID: "Qm0001", Acknowledged: true}).Error)
	interaction, err = db.MarkInteractionAsAcknowledged("Qm0001")
	require.NoError(t, err)
	require.Nil(t, interaction)

	require.NoError(t, db.db.Create(&messengertypes.Interaction{CID: "Qm0002", Acknowledged: false}).Error)
	interaction, err = db.MarkInteractionAsAcknowledged("Qm0002")
	require.NoError(t, err)
	require.NotNil(t, interaction)
	require.Equal(t, "Qm0002", interaction.CID)
	require.True(t, interaction.Acknowledged)

	interaction, err = db.MarkInteractionAsAcknowledged("Qm0002")
	require.NoError(t, err)
	require.Nil(t, interaction)
}

func Test_dbWrapper_setConversationIsOpenStatus(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	conv, updated, err := db.SetConversationIsOpenStatus("", true)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))
	require.False(t, updated)
	require.Nil(t, conv)

	conv, updated, err = db.SetConversationIsOpenStatus("conv_xxx", true)
	require.Error(t, err)
	require.False(t, updated)

	db.db.Create(&messengertypes.Conversation{PublicKey: "conv1", IsOpen: true})
	db.db.Create(&messengertypes.Conversation{PublicKey: "conv2", IsOpen: false, UnreadCount: 1000})
	db.db.Create(&messengertypes.Conversation{PublicKey: "conv3", IsOpen: false, UnreadCount: 2000})

	c := &messengertypes.Conversation{}

	conv, updated, err = db.SetConversationIsOpenStatus("conv1", true)
	require.NoError(t, err)
	require.False(t, updated)

	db.db.Model(&messengertypes.Conversation{}).Preload("ReplicationInfo").Where(&messengertypes.Conversation{PublicKey: "conv1"}).First(&c)
	require.Equal(t, "conv1", c.PublicKey)
	require.True(t, c.IsOpen)
	require.Equal(t, int32(0), c.UnreadCount)

	conv, updated, err = db.SetConversationIsOpenStatus("conv1", false)
	require.NoError(t, err)
	require.True(t, updated)

	c = &messengertypes.Conversation{}
	db.db.Model(&messengertypes.Conversation{}).Preload("ReplicationInfo").Where(&messengertypes.Conversation{PublicKey: "conv1"}).First(&c)
	require.Equal(t, "conv1", c.PublicKey)
	require.False(t, c.IsOpen)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, c, conv)

	c = &messengertypes.Conversation{}
	db.db.Model(&messengertypes.Conversation{}).Preload("ReplicationInfo").Where(&messengertypes.Conversation{PublicKey: "conv2"}).First(&c)
	require.Equal(t, "conv2", c.PublicKey)
	require.False(t, c.IsOpen)
	require.Equal(t, int32(1000), c.UnreadCount)

	conv, updated, err = db.SetConversationIsOpenStatus("conv2", true)
	require.NoError(t, err)
	require.True(t, updated)

	c = &messengertypes.Conversation{}
	db.db.Model(&messengertypes.Conversation{}).Preload("ReplicationInfo").Where(&messengertypes.Conversation{PublicKey: "conv2"}).First(&c)
	require.Equal(t, "conv2", c.PublicKey)
	require.True(t, c.IsOpen)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, c, conv)
}

func Test_dbWrapper_tx(t *testing.T) {
	ctx := context.TODO()

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	err := db.TX(ctx, func(tx *DBWrapper) error {
		return fmt.Errorf("some error")
	})
	require.Error(t, err)

	count, err := db.dbModelRowsCount(&messengertypes.Account{})
	require.NoError(t, err)
	require.Equal(t, int64(0), count)

	err = db.TX(ctx, func(tx *DBWrapper) error {
		err := tx.FirstOrCreateAccount("some pk", "some url")
		require.NoError(t, err)
		return nil
	})
	require.NoError(t, err)

	count, err = db.dbModelRowsCount(&messengertypes.Account{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	err = db.TX(ctx, func(tx *DBWrapper) error {
		err := tx.FirstOrCreateAccount("some pk 2", "some url 2")
		require.NoError(t, err)
		return fmt.Errorf("some error")
	})
	require.Error(t, err)

	count, err = db.dbModelRowsCount(&messengertypes.Account{})
	require.NoError(t, err)
	require.Equal(t, int64(1), count)
}

func Test_dbWrapper_updateConversationReadState(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	c := &messengertypes.Conversation{}

	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "convo_a", UnreadCount: 0, LastUpdate: messengerutil.TimestampMs(time.Unix(10000, 0))}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "convo_b", UnreadCount: 1000, LastUpdate: messengerutil.TimestampMs(time.Unix(20000, 0))}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "convo_c", UnreadCount: 2000, LastUpdate: messengerutil.TimestampMs(time.Unix(30000, 0))}).Error)

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "convo_a"}).Find(&c).Error)
	require.Equal(t, "convo_a", c.PublicKey)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, messengerutil.TimestampMs(time.Unix(10000, 0)), c.LastUpdate)

	err := db.UpdateConversationReadState("", false, time.Unix(10001, 0))
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	require.NoError(t, db.UpdateConversationReadState("convo_a", false, time.Unix(10001, 0)))

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "convo_a"}).Find(&c).Error)
	require.Equal(t, "convo_a", c.PublicKey)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, messengerutil.TimestampMs(time.Unix(10001, 0)), c.LastUpdate)

	require.NoError(t, db.UpdateConversationReadState("convo_b", true, time.Unix(20001, 0)))

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "convo_b"}).Find(&c).Error)
	require.Equal(t, "convo_b", c.PublicKey)
	require.Equal(t, int32(1001), c.UnreadCount)
	require.Equal(t, messengerutil.TimestampMs(time.Unix(20001, 0)), c.LastUpdate)

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "convo_c"}).Find(&c).Error)
	require.Equal(t, "convo_c", c.PublicKey)
	require.Equal(t, int32(2000), c.UnreadCount)
	require.Equal(t, messengerutil.TimestampMs(time.Unix(30000, 0)), c.LastUpdate)

	require.Error(t, db.UpdateConversationReadState("convo_d", true, time.Unix(20001, 0)))
}

func Test_dropAllTables(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
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
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "convo_a", IsOpen: true}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "convo_b", IsOpen: false}).Error)

	opened, err := db.IsConversationOpened("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrInvalidInput))

	opened, err = db.IsConversationOpened("convo_a")
	require.NoError(t, err)
	require.True(t, opened)

	opened, err = db.IsConversationOpened("convo_b")
	require.NoError(t, err)
	require.False(t, opened)
}

func Test_dbWrapper_addServiceToken(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	tok1 := &protocoltypes.ServiceToken{
		Token:             "tok1",
		AuthenticationURL: "https://url1/",
		SupportedServices: []*protocoltypes.ServiceTokenSupportedService{
			{ServiceType: "srv1"},
			{ServiceType: "srv2"},
		},
	}

	tok2 := &protocoltypes.ServiceToken{
		Token:             "tok2",
		AuthenticationURL: "https://url2/",
		SupportedServices: []*protocoltypes.ServiceTokenSupportedService{
			{ServiceType: "srv3"},
			{ServiceType: "srv4"},
		},
	}

	db.db.Create(&messengertypes.Account{PublicKey: "accountpk"})

	err := db.AddServiceToken(tok1)
	require.NoError(t, err)

	err = db.AddServiceToken(tok2)
	require.NoError(t, err)

	tok := &messengertypes.ServiceToken{}
	require.NoError(t, db.db.Model(&messengertypes.ServiceToken{}).Where(&messengertypes.ServiceToken{TokenID: tok1.TokenID(), ServiceType: "srv1"}).First(&tok).Error)
	require.Equal(t, tok1.TokenID(), tok.TokenID)
	require.Equal(t, "srv1", tok.ServiceType)
	require.Equal(t, tok1.AuthenticationURL, tok.AuthenticationURL)

	tok = &messengertypes.ServiceToken{}
	require.NoError(t, db.db.Model(&messengertypes.ServiceToken{}).Where(&messengertypes.ServiceToken{TokenID: tok2.TokenID(), ServiceType: "srv3"}).First(&tok).Error)
	require.Equal(t, tok2.TokenID(), tok.TokenID)
	require.Equal(t, "srv3", tok.ServiceType)
	require.Equal(t, tok2.AuthenticationURL, tok.AuthenticationURL)

	tok = &messengertypes.ServiceToken{}
	require.Error(t, db.db.Model(&messengertypes.ServiceToken{}).Where(&messengertypes.ServiceToken{TokenID: tok1.TokenID(), ServiceType: "srv3"}).First(&tok).Error)

	tok = &messengertypes.ServiceToken{}
	require.Error(t, db.db.Model(&messengertypes.ServiceToken{}).Where(&messengertypes.ServiceToken{TokenID: tok2.TokenID(), ServiceType: "srv2"}).First(&tok).Error)
}

func Test_dbWrapper_getReplyOptionsCIDForConversation(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	cid, err := db.GetReplyOptionsCIDForConversation("")
	require.Error(t, err)
	require.Equal(t, "", cid)

	cid, err = db.GetReplyOptionsCIDForConversation("unknown_conversation")
	require.NoError(t, err)
	require.Equal(t, "", cid)

	db.db.Create(&messengertypes.Interaction{CID: "cid_1", Type: messengertypes.AppMessage_TypeReplyOptions, ConversationPublicKey: "conv_1", IsMine: false})

	cid, err = db.GetReplyOptionsCIDForConversation("conv_1")
	require.NoError(t, err)
	require.Equal(t, "cid_1", cid)

	db.db.Create(&messengertypes.Interaction{CID: "cid_2", Type: messengertypes.AppMessage_TypeUserMessage, ConversationPublicKey: "conv_1", IsMine: false})

	cid, err = db.GetReplyOptionsCIDForConversation("conv_1")
	require.NoError(t, err)
	require.Equal(t, "cid_1", cid)

	db.db.Create(&messengertypes.Interaction{CID: "cid_3", Type: messengertypes.AppMessage_TypeReplyOptions, ConversationPublicKey: "conv_1", IsMine: false})

	cid, err = db.GetReplyOptionsCIDForConversation("conv_1")
	require.NoError(t, err)
	require.Equal(t, "cid_3", cid)

	db.db.Create(&messengertypes.Interaction{CID: "cid_4", Type: messengertypes.AppMessage_TypeUserMessage, ConversationPublicKey: "conv_1", IsMine: true})

	cid, err = db.GetReplyOptionsCIDForConversation("conv_1")
	require.NoError(t, err)
	require.Equal(t, "", cid)
}

func Test_dbWrapper_addMedias_none(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	added, err := db.AddMedias([]*messengertypes.Media{})
	require.NoError(t, err)
	require.Equal(t, []bool{}, added)

	var medias []*messengertypes.Media
	require.NoError(t, db.db.Find(&medias).Error)
	require.Empty(t, medias)
}

func Test_dbWrapper_addMedias_one(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	media := messengertypes.Media{
		CID: "EiBnLu1b0PFzPcVd_QPPfhzIs0kmzAH2g0VUfiAqvIXMLg", InteractionCID: "testInteractionCID",
		MimeType: "testMimeType", Filename: "testFilename", DisplayName: "testDisplayName",
		State: messengertypes.Media_StateDownloaded,
	}

	added, err := db.AddMedias([]*messengertypes.Media{&media})
	require.NoError(t, err)
	require.Equal(t, []bool{true}, added)

	var medias []*messengertypes.Media
	require.NoError(t, db.db.Find(&medias).Error)

	require.Equal(t, 1, len(medias))
	require.Equal(t, &media, medias[0])
}

func Test_dbWrapper_addMedias_mix(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	testMedias := []*messengertypes.Media{
		{CID: "EiBnLu1b0PFzPcVd_QPPfhzIs0kmzAH2g0VUfiAqvIXMLg"},
		{CID: "EiBnLu1b0PFzPcVd_QPPfhzIs1kmzAH2g0VUfiAqvIXMLg", MimeType: "testMimeType1", Filename: "testFilename1"},
		{
			CID: "EiBnLu1b0PFzPcVd_QPPfhzIs2kmzAH2g0VUfiAqvIXMLg", InteractionCID: "testInteractionCID", MimeType: "testMimeType2",
			Filename: "testFilename2", DisplayName: "testDisplayName", State: messengertypes.Media_StateDownloaded,
		},
	}

	added, err := db.AddMedias(testMedias)
	require.NoError(t, err)
	require.Equal(t, []bool{true, true, true}, added)
	added, err = db.AddMedias(testMedias)
	require.NoError(t, err)
	require.Equal(t, []bool{false, false, false}, added)

	var medias []*messengertypes.Media
	require.NoError(t, db.db.Find(&medias).Error)
	require.Equal(t, testMedias, medias)
}

func Test_dbWrapper_getMedias_none(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	medias, err := db.GetMedias(nil)
	require.NoError(t, err)
	require.Empty(t, medias)

	medias, err = db.GetMedias([]string{})
	require.NoError(t, err)
	require.Empty(t, medias)

	testMedia := messengertypes.Media{CID: "EiBnLu1b0PFzPcVd_QPPfhzIs0kmzAH2g0VUfiAqvIXMLg"}
	medias, err = db.GetMedias([]string{testMedia.CID})
	require.NoError(t, err)
	require.Equal(t, 1, len(medias))
	require.Equal(t, &testMedia, medias[0])
}

func Test_dbWrapper_getMedias_one(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	testMedia := messengertypes.Media{
		CID: "EiBnLu1b0PFzPcVd_QPPfhzIs0kmzAH2g0VUfiAqvIXMLg", InteractionCID: "testInteractionCID",
		MimeType: "testMimeType", Filename: "testFilename", DisplayName: "testDisplayName",
		State: messengertypes.Media_StateDownloaded,
	}

	added, err := db.AddMedias([]*messengertypes.Media{&testMedia})
	require.NoError(t, err)
	require.Equal(t, []bool{true}, added)

	medias, err := db.GetMedias([]string{testMedia.CID})
	require.NoError(t, err)
	require.Equal(t, 1, len(medias))
	require.Equal(t, &testMedia, medias[0])
}

func Test_dbWrapper_getMedias_mix(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	testMedias := []*messengertypes.Media{
		{CID: "EiBnLu1b0PFzPcVd_QPPfhzIs0kmzAH2g0VUfiAqvIXMLg"},
		{CID: "EiBnLu1b0PFzPcVd_QPPfhzIs1kmzAH2g0VUfiAqvIXMLg", MimeType: "testMimeType1", Filename: "testFilename1"},
		{
			CID: "EiBnLu1b0PFzPcVd_QPPfhzIs2kmzAH2g0VUfiAqvIXMLg", InteractionCID: "testInteractionCID", MimeType: "testMimeType2",
			Filename: "testFilename2", DisplayName: "testDisplayName", State: messengertypes.Media_StateDownloaded,
		},
	}

	added, err := db.AddMedias(testMedias)
	require.NoError(t, err)
	require.Equal(t, []bool{true, true, true}, added)

	cids := make([]string, len(testMedias))
	for i, m := range testMedias {
		cids[i] = m.GetCID()
	}

	medias, err := db.GetMedias(cids)
	require.NoError(t, err)
	require.Equal(t, testMedias, medias)
}

func Test_dbWrapper_getLatestInteractionAndMediaPerConversation(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	for i := 0; i < 10; i++ {
		err := db.db.Create(&messengertypes.Conversation{PublicKey: fmt.Sprintf("c%d", i)}).Error
		require.NoError(t, err)

		for j := 0; j <= i; j++ {
			err := db.db.Create(&messengertypes.Interaction{
				CID:                   fmt.Sprintf("c%d_i%d", i, j),
				ConversationPublicKey: fmt.Sprintf("c%d", i),
				Payload:               []byte(fmt.Sprintf("c%d_i%d", i, j)),
				SentDate:              int64(i*100 + j),
			}).Error
			require.NoError(t, err)

			if j >= 8 {
				err := db.db.Create(&messengertypes.Media{
					CID:            fmt.Sprintf("c%d_i%d_m", i, j),
					InteractionCID: fmt.Sprintf("c%d_i%d", i, j),
				}).Error
				require.NoError(t, err)
			}
		}
	}

	interactions, medias, err := db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{Amount: 5})
	require.NoError(t, err)
	require.Len(t, interactions, 40)
	require.Len(t, medias, 3)

	interactions, medias, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{RefCID: "c9_i9", Amount: 5})
	require.NoError(t, err)
	require.Len(t, interactions, 5)
	require.Len(t, medias, 1)

	interactions, medias, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{RefCID: "c9_i7", Amount: 5, OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 2)
	require.Len(t, medias, 2)

	interactions, medias, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPK: "c8", RefCID: "c9_i9", Amount: 5})
	require.Error(t, err)
	require.Len(t, interactions, 0)
	require.Len(t, medias, 0)
}

func Test_dbWrapper_getLatestInteractionAndMediaPerConversation_sorting(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	err := db.db.Create(&messengertypes.Conversation{PublicKey: "c1"}).Error
	require.NoError(t, err)

	for i := 0; i < 100; i++ {
		err := db.db.Create(&messengertypes.Interaction{
			CID:                   fmt.Sprintf("c1_i%02d", i),
			ConversationPublicKey: "c1",
			Payload:               []byte(fmt.Sprintf("c1_i%02d", i)),
			SentDate:              1000,
		}).Error
		require.NoError(t, err)
	}

	interactions, medias, err := db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPK: "c1", Amount: 5})
	require.NoError(t, err)
	require.Len(t, interactions, 5)
	require.Len(t, medias, 0)

	require.Equal(t, "c1_i99", interactions[0].CID)
	require.Equal(t, "c1_i98", interactions[1].CID)
	require.Equal(t, "c1_i97", interactions[2].CID)
	require.Equal(t, "c1_i96", interactions[3].CID)
	require.Equal(t, "c1_i95", interactions[4].CID)

	interactions, medias, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPK: "c1", Amount: 5, RefCID: "c1_i95"})
	require.NoError(t, err)
	require.Len(t, interactions, 5)
	require.Len(t, medias, 0)

	require.Equal(t, "c1_i94", interactions[0].CID)
	require.Equal(t, "c1_i93", interactions[1].CID)
	require.Equal(t, "c1_i92", interactions[2].CID)
	require.Equal(t, "c1_i91", interactions[3].CID)
	require.Equal(t, "c1_i90", interactions[4].CID)

	interactions, medias, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPK: "c1", Amount: 5, RefCID: "c1_i03"})
	require.NoError(t, err)
	require.Len(t, interactions, 3)
	require.Len(t, medias, 0)

	require.Equal(t, "c1_i02", interactions[0].CID)
	require.Equal(t, "c1_i01", interactions[1].CID)
	require.Equal(t, "c1_i00", interactions[2].CID)

	interactions, medias, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPK: "c1", Amount: 5, OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 5)
	require.Len(t, medias, 0)

	require.Equal(t, "c1_i00", interactions[0].CID)
	require.Equal(t, "c1_i01", interactions[1].CID)
	require.Equal(t, "c1_i02", interactions[2].CID)
	require.Equal(t, "c1_i03", interactions[3].CID)
	require.Equal(t, "c1_i04", interactions[4].CID)

	interactions, medias, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPK: "c1", Amount: 5, RefCID: "c1_i04", OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 5)
	require.Len(t, medias, 0)

	require.Equal(t, "c1_i05", interactions[0].CID)
	require.Equal(t, "c1_i06", interactions[1].CID)
	require.Equal(t, "c1_i07", interactions[2].CID)
	require.Equal(t, "c1_i08", interactions[3].CID)
	require.Equal(t, "c1_i09", interactions[4].CID)

	interactions, medias, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPK: "c1", Amount: 5, RefCID: "c1_i96", OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 3)
	require.Len(t, medias, 0)

	require.Equal(t, "c1_i97", interactions[0].CID)
	require.Equal(t, "c1_i98", interactions[1].CID)
	require.Equal(t, "c1_i99", interactions[2].CID)
}

func Test_dbWrapper_interactionIndexText_interactionsSearch(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	if db.disableFTS {
		t.Skip("Skipping current test as full text search is not enabled")
		return
	}

	interactions, err := db.InteractionsSearch("", nil)
	require.Error(t, err)
	require.Empty(t, interactions)

	interactions, err = db.InteractionsSearch("dummy", nil)
	require.NoError(t, err)
	require.Empty(t, interactions)

	db.db.Create(&messengertypes.Interaction{CID: "cid_1", SentDate: 1000})
	db.db.Create(&messengertypes.Interaction{CID: "cid_2", SentDate: 1001})
	db.db.Create(&messengertypes.Interaction{CID: "cid_3", SentDate: 1002})
	db.db.Create(&messengertypes.Interaction{CID: "cid_4", SentDate: 1003})

	interactions, err = db.InteractionsSearch("dummy", nil)
	require.NoError(t, err)
	require.Empty(t, interactions)

	err = db.InteractionIndexText("cid_0", "This entry should not be added as the CID doesn't match any interaction")
	require.Error(t, err)

	interactions, err = db.InteractionsSearch("interaction", nil)
	require.NoError(t, err)
	require.Empty(t, interactions)

	err = db.InteractionIndexText("cid_1", "This dummy content should show up in the results if we need it")
	require.NoError(t, err)

	err = db.InteractionIndexText("cid_2", "This other content should show up in the results if the relevant word is typed")
	require.NoError(t, err)

	// Adding content for the same CID twice should not trigger an error
	err = db.InteractionIndexText("cid_2", "This other content should show up in the results if the relevant word is typed")
	require.NoError(t, err)

	interactions, err = db.InteractionsSearch("content", nil)
	require.NoError(t, err)
	require.Len(t, interactions, 2)

	interactions, err = db.InteractionsSearch("contents", nil)
	require.NoError(t, err)
	require.Len(t, interactions, 2)

	interactions, err = db.InteractionsSearch("CoNteNTs", nil)
	require.NoError(t, err)
	require.Len(t, interactions, 2)

	interactions, err = db.InteractionsSearch("DUMMY", nil)
	require.NoError(t, err)
	require.Len(t, interactions, 1)
	require.Equal(t, "cid_1", interactions[0].CID)

	interactions, err = db.InteractionsSearch("other", nil)
	require.NoError(t, err)
	require.Len(t, interactions, 1)
	require.Equal(t, "cid_2", interactions[0].CID)

	err = db.InteractionIndexText("cid_3", "This other content should show up in the results if the relevant word is typed")
	err = db.InteractionIndexText("cid_4", "This other content should show up in the results if the relevant word is typed")

	interactions, err = db.InteractionsSearch("content", nil)
	require.NoError(t, err)
	require.Len(t, interactions, 4)

	interactions, err = db.InteractionsSearch("content", &SearchOptions{Limit: 1})
	require.NoError(t, err)
	require.Len(t, interactions, 1)

	interactions, err = db.InteractionsSearch("content", &SearchOptions{AfterDate: 1001})
	require.NoError(t, err)
	require.Len(t, interactions, 2)

	interactions, err = db.InteractionsSearch("content", &SearchOptions{BeforeDate: 1003})
	require.NoError(t, err)
	require.Len(t, interactions, 3)

	interactions, err = db.InteractionsSearch("content", &SearchOptions{AfterDate: 1001, BeforeDate: 1003})
	require.NoError(t, err)
	require.Len(t, interactions, 1)
}

func Test_dbWrapper_interactionIndexText_interactionsSearch_sorting(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	if db.disableFTS {
		t.Skip("Skipping current test as full text search is not enabled")
		return
	}

	for i := 0; i < 100; i++ {
		id := fmt.Sprintf("cid_%02d", i)

		err := db.db.Create(&messengertypes.Interaction{CID: id, SentDate: 1000}).Error
		require.NoError(t, err)

		indexed := "This other content should show up in the results if the relevant word is typed"
		if i%2 == 0 {
			indexed = "This is something else"
		}

		err = db.InteractionIndexText(id, indexed)
		require.NoError(t, err)
	}

	interactions, err := db.InteractionsSearch("content", &SearchOptions{})
	require.NoError(t, err)
	require.Len(t, interactions, 10)
	require.Equal(t, "cid_99", interactions[0].CID)
	require.Equal(t, "cid_97", interactions[1].CID)
	require.Equal(t, "cid_83", interactions[8].CID)
	require.Equal(t, "cid_81", interactions[9].CID)

	interactions, err = db.InteractionsSearch("else", &SearchOptions{})
	require.NoError(t, err)
	require.Len(t, interactions, 10)
	require.Equal(t, "cid_98", interactions[0].CID)
	require.Equal(t, "cid_96", interactions[1].CID)
	require.Equal(t, "cid_82", interactions[8].CID)
	require.Equal(t, "cid_80", interactions[9].CID)

	interactions, err = db.InteractionsSearch("else", &SearchOptions{RefCID: "cid_80"})
	require.NoError(t, err)
	require.Len(t, interactions, 10)
	require.Equal(t, "cid_78", interactions[0].CID)
	require.Equal(t, "cid_76", interactions[1].CID)
	require.Equal(t, "cid_62", interactions[8].CID)
	require.Equal(t, "cid_60", interactions[9].CID)

	interactions, err = db.InteractionsSearch("else", &SearchOptions{RefCID: "cid_60", OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 10)
	require.Equal(t, "cid_62", interactions[0].CID)
	require.Equal(t, "cid_64", interactions[1].CID)
	require.Equal(t, "cid_78", interactions[8].CID)
	require.Equal(t, "cid_80", interactions[9].CID)

	interactions, err = db.InteractionsSearch("else", &SearchOptions{RefCID: "cid_60", OldestToNewest: true, Limit: 4})
	require.NoError(t, err)
	require.Len(t, interactions, 4)
	require.Equal(t, "cid_62", interactions[0].CID)
	require.Equal(t, "cid_64", interactions[1].CID)
	require.Equal(t, "cid_66", interactions[2].CID)
	require.Equal(t, "cid_68", interactions[3].CID)
}

func Test_dbWrapper_addInteraction_fromPushFirst(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	const testCID = "Qm00001"

	i, isNew, err := db.AddInteraction(messengertypes.Interaction{
		CID:               testCID,
		Payload:           []byte("payload1"),
		OutOfStoreMessage: true,
	})
	require.NoError(t, err)
	require.True(t, isNew)
	require.NotNil(t, i)
	require.Equal(t, testCID, i.CID)
	require.Equal(t, []byte("payload1"), i.Payload)

	// Data should not be updated when receiving another pushed event
	i, isNew, err = db.AddInteraction(messengertypes.Interaction{
		CID:               testCID,
		Payload:           []byte("payload2"),
		OutOfStoreMessage: true,
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, testCID, i.CID)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.False(t, isNew)

	// Data should be updated when synchronizing messages with OrbitDB
	i, isNew, err = db.AddInteraction(messengertypes.Interaction{
		CID:               testCID,
		Payload:           []byte("payload3"),
		OutOfStoreMessage: false,
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, testCID, i.CID)
	require.Equal(t, []byte("payload3"), i.Payload)
	require.True(t, isNew)
}

func Test_dbWrapper_addInteraction_fromPushLast(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	const testCID = "Qm00001"

	i, isNew, err := db.AddInteraction(messengertypes.Interaction{
		CID:               testCID,
		Payload:           []byte("payload1"),
		OutOfStoreMessage: false,
	})
	require.NoError(t, err)
	require.True(t, isNew)
	require.NotNil(t, i)
	require.Equal(t, testCID, i.CID)
	require.Equal(t, []byte("payload1"), i.Payload)

	// Data should not be updated when receiving a pushed event
	i, isNew, err = db.AddInteraction(messengertypes.Interaction{
		CID:               testCID,
		Payload:           []byte("payload2"),
		OutOfStoreMessage: true,
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, testCID, i.CID)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.False(t, isNew)
}

func Test_dbWrapper_GetDevicesForMember(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "Convo1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "Convo2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Member{PublicKey: "Member1", ConversationPublicKey: "Convo1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Member{PublicKey: "Member2", ConversationPublicKey: "Convo1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Member{PublicKey: "Member1", ConversationPublicKey: "Convo2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Member{PublicKey: "Member3", ConversationPublicKey: "Convo2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device11", MemberPublicKey: "Member1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device12", MemberPublicKey: "Member1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device21", MemberPublicKey: "Member2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device22", MemberPublicKey: "Member2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device31", MemberPublicKey: "Member3"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device32", MemberPublicKey: "Member3"}).Error)

	dev, err := db.GetDevicesForMember("bogus", "Member1")
	require.NoError(t, err)
	require.Len(t, dev, 0)

	dev, err = db.GetDevicesForMember("Convo1", "bogus")
	require.NoError(t, err)
	require.Len(t, dev, 0)

	dev, err = db.GetDevicesForMember("Convo1", "Member1")
	require.NoError(t, err)
	require.Len(t, dev, 2)
}

func Test_dbWrapper_UpdateDeviceSetPushToken(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	count := int64(0)

	err := db.UpdateDeviceSetPushToken(context.Background(), "member1", "device1", "conv1", "token1")
	require.NoError(t, err)

	err = db.db.Model(&messengertypes.SharedPushToken{}).Where(&messengertypes.SharedPushToken{
		DevicePublicKey:       "device1",
		MemberPublicKey:       "member1",
		ConversationPublicKey: "conv1",
		Token:                 "token1",
	}).Count(&count).Error

	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	err = db.UpdateDeviceSetPushToken(context.Background(), "member1", "device1", "conv1", "token2")
	require.NoError(t, err)

	err = db.db.Model(&messengertypes.SharedPushToken{}).Where(&messengertypes.SharedPushToken{
		DevicePublicKey:       "device1",
		MemberPublicKey:       "member1",
		ConversationPublicKey: "conv1",
		Token:                 "token2",
	}).Count(&count).Error

	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	err = db.UpdateDeviceSetPushToken(context.Background(), "member1", "device1", "conv1", "")
	require.NoError(t, err)

	err = db.db.Model(&messengertypes.SharedPushToken{}).Where(&messengertypes.SharedPushToken{
		DevicePublicKey:       "device1",
		MemberPublicKey:       "member1",
		ConversationPublicKey: "conv1",
	}).Count(&count).Error

	require.NoError(t, err)
	require.Equal(t, int64(0), count)
}

func Test_dbWrapper_GetPushTokenSharedForConversation(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	err := db.UpdateDeviceSetPushToken(context.Background(), "member1", "device1", "conv1", "token1")
	require.NoError(t, err)

	err = db.UpdateDeviceSetPushToken(context.Background(), "member1", "device1", "conv2", "token2")
	require.NoError(t, err)

	err = db.UpdateDeviceSetPushToken(context.Background(), "member2", "device2", "conv1", "token3")
	require.NoError(t, err)

	tokens, err := db.GetPushTokenSharedForConversation("conv1")
	require.NoError(t, err)
	require.Len(t, tokens, 2)
}

func Test_dbWrapper_GetInteractionReactionsForEmoji(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	targetCID := "test_cid"
	mpks := []string{"test_mpk_1", "test_mpk_2", "test_mpk_3", "test_mpk_4"}
	date := int64(42)
	emoji := "😼"

	created, err := db.CreateOrUpdateReaction(&messengertypes.Reaction{
		TargetCID:       targetCID,
		MemberPublicKey: mpks[0],
		Emoji:           emoji,
		StateDate:       date,
		State:           true,
		IsMine:          true,
	})
	require.NoError(t, err)
	require.True(t, created)

	created, err = db.CreateOrUpdateReaction(&messengertypes.Reaction{
		TargetCID:       targetCID,
		MemberPublicKey: mpks[1],
		Emoji:           emoji,
		StateDate:       date,
		State:           true,
	})
	require.NoError(t, err)
	require.NoError(t, err)
	require.True(t, created)

	created, err = db.CreateOrUpdateReaction(&messengertypes.Reaction{
		TargetCID:       targetCID,
		MemberPublicKey: mpks[2],
		Emoji:           emoji,
		StateDate:       date,
		State:           false,
	})
	require.NoError(t, err)
	require.NoError(t, err)
	require.True(t, created)

	created, err = db.CreateOrUpdateReaction(&messengertypes.Reaction{
		TargetCID:       targetCID,
		MemberPublicKey: mpks[3],
		Emoji:           "😿",
		StateDate:       date,
		State:           true,
	})
	require.NoError(t, err)
	require.NoError(t, err)
	require.True(t, created)

	infos, err := db.GetInteractionReactionsForEmoji(targetCID, emoji)
	require.NoError(t, err)
	require.Len(t, infos, 2)
}
