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

	sqlite "berty.tech/berty/v2/go/internal/gorm-sqlcipher"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

func Test_dbWrapper_addConversation(t *testing.T) {
	groupPK1 := "group_pk"
	groupPK2 := "group_pk_2"

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	convErr, err := db.AddConversation("", "mem_1", "dev_1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, convErr)

	conv1, err := db.AddConversation(groupPK1, "mem_1", "dev_1")
	require.NoError(t, err)
	require.Equal(t, groupPK1, conv1.PublicKey)

	conv2, err := db.AddConversation(groupPK1, "mem_1", "dev_1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrDBEntryAlreadyExists))
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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

func Test_dbWrapper_getContactByConversation(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	pk1 := "pk1"
	convPK1 := "convPK1"

	contactErr, err := db.GetContactByConversation("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, contactErr)

	contact, err := db.GetContactByConversation(convPK1)
	require.Error(t, err)
	require.True(t, errors.Is(err, gorm.ErrRecordNotFound))
	_ = contact

	refContact := messengertypes.Contact{
		PublicKey:             pk1,
		ConversationPublicKey: convPK1,
		State:                 messengertypes.Contact_IncomingRequest,
		DisplayName:           "PK1-Name",
		CreatedDate:           12345,
		SentDate:              123,
	}

	db.db.Create(refContact)

	contact, err = db.GetContactByConversation(convPK1)
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

	contact, err = db.GetContactByConversation(convPK1)
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, contactErr)

	contact, err := db.AddContactRequestIncomingReceived(contact1PK, contact1Name, "")
	require.NoError(t, err)
	require.NotEmpty(t, contact)
	require.Equal(t, contact1PK, contact.PublicKey)
	require.Equal(t, contact1Name, contact.DisplayName)

	createdDate := contact.CreatedDate

	contact, err = db.AddContactRequestIncomingReceived(contact1PK, "contact1OtherName", "")
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrDBEntryAlreadyExists))
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.AddContactRequestIncomingAccepted("contact_1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, contact)

	contact, err = db.AddContactRequestOutgoingEnqueued(contactPK, displayName, convPK)
	require.NoError(t, err)
	require.NotNil(t, contact)
	require.Equal(t, displayName, contact.DisplayName)
	require.Equal(t, contactPK, contact.PublicKey)
	require.Equal(t, convPK, contact.ConversationPublicKey)

	contact, err = db.AddContactRequestOutgoingEnqueued(contactPK, "other_display_name", "other_conv_pk")
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrDBEntryAlreadyExists))
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, conv)

	// should raise an error when passing an empty contact pk
	conv, err = db.AddConversationForContact("convo_1", "mem_1", "dev_1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, device)

	device, err = db.AddDevice("device1", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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

	i, _, err := db.AddInteraction(&messengertypes.Interaction{
		Cid:     "",
		Payload: []byte("payload1"),
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, i)

	i, isNew, err := db.AddInteraction(&messengertypes.Interaction{
		Cid:     "Qm00001",
		Payload: []byte("payload1"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00001", i.Cid)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.True(t, isNew)

	// Data should not be updated
	i, isNew, err = db.AddInteraction(&messengertypes.Interaction{
		Cid:     "Qm00001",
		Payload: []byte("payload2"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00001", i.Cid)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.False(t, isNew)

	i, isNew, err = db.AddInteraction(&messengertypes.Interaction{
		Cid:     "Qm00002",
		Payload: []byte("payload2"),
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, "Qm00002", i.Cid)
	require.Equal(t, []byte("payload2"), i.Payload)
	require.True(t, isNew)

	// Test relations
	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "conversation_3"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Member{PublicKey: "member_3"}).Error)

	i, isNew, err = db.AddInteraction(&messengertypes.Interaction{
		Cid:                   "Qm00003",
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, member)

	member, err = db.AddMember("", "conversation_1", "Display1", "", false, false)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, member)

	member, err = db.AddMember("member_1", "conversation_1", "Display1", "", false, false)
	require.NoError(t, err)
	require.NotNil(t, member)
	require.Equal(t, "member_1", member.PublicKey)
	require.Equal(t, "conversation_1", member.ConversationPublicKey)
	require.Equal(t, "Display1", member.DisplayName)

	member, err = db.AddMember("member_1", "conversation_1", "Display2", "", false, false)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrDBEntryAlreadyExists))
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

	db.db.Create(&messengertypes.Interaction{Cid: "Qm300", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm301", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm302", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm303", DevicePublicKey: "device2", ConversationPublicKey: "conv3"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm104", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm105", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm106", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm107", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm108", DevicePublicKey: "device1", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm209", DevicePublicKey: "device2", ConversationPublicKey: "conv1"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm210", DevicePublicKey: "device1", ConversationPublicKey: "conv2"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm211", DevicePublicKey: "device2", ConversationPublicKey: "conv3"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm212", DevicePublicKey: "device1", ConversationPublicKey: "conv3"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm213", DevicePublicKey: "device2", ConversationPublicKey: "conv2"})

	interactions, err := db.AttributeBacklogInteractions("", "conv3", "member1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Empty(t, interactions)

	interactions, err = db.AttributeBacklogInteractions("device3", "", "member1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Empty(t, interactions)

	interactions, err = db.AttributeBacklogInteractions("device3", "conv3", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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
	require.Equal(t, "Qm300", interactions[0].Cid)
	require.Equal(t, "Qm104", interactions[1].Cid)
	require.Equal(t, "Qm108", interactions[2].Cid)

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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.DeleteInteractions([]string{})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	// Should we raise an error if a Cid is not found
	err = db.DeleteInteractions([]string{"Qm0001", "Qm0002", "Qm0003"})
	require.NoError(t, err)

	db.db.Create(&messengertypes.Interaction{Cid: "Qm0001"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm0002"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm0003"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm0004"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm0005"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm0006"})

	count := int64(0)
	db.db.Model(&messengertypes.Interaction{}).Count(&count)

	require.Equal(t, int64(6), count)

	err = db.DeleteInteractions([]string{"Qm0001", "Qm0002", "Qm0003"})
	require.NoError(t, err)

	db.db.Model(&messengertypes.Interaction{}).Count(&count)
	require.Equal(t, int64(3), count)

	interaction := &messengertypes.Interaction{}

	err = db.db.Where(&messengertypes.Interaction{Cid: "Qm0001"}).First(&interaction).Error
	require.Error(t, err)

	err = db.db.Where(&messengertypes.Interaction{Cid: "Qm0002"}).First(&interaction).Error
	require.Error(t, err)

	err = db.db.Where(&messengertypes.Interaction{Cid: "Qm0004"}).First(&interaction).Error
	require.NoError(t, err)
	require.Equal(t, "Qm0004", interaction.Cid)
}

func Test_dbWrapper_GetAccount(t *testing.T) {
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrNotFound))
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
	require.True(t, errors.Is(err, errcode.ErrCode_ErrDBMultipleRecords))
	require.Empty(t, acc)

	require.NoError(t, db.db.Delete(refOtherAccount).Error)

	require.NoError(t, db.db.Create(&messengertypes.ServiceToken{
		AccountPk: refAccount.PublicKey,
		TokenId:   "tokID1",
		Token:     "tok1",
		SupportedServices: []*messengertypes.ServiceTokenSupportedServiceRecord{
			{
				TokenId: "tokID1",
				Type:    "type1",
				Address: "addr1",
			},
		},
		AuthenticationUrl: "https://url1/",
	}).Error)
	require.NoError(t, db.db.Create(&messengertypes.AccountVerifiedCredential{
		AccountPk:        refAccount.PublicKey,
		Identifier:       "id1",
		RegistrationDate: messengerutil.TimestampMs(time.Now()),
		ExpirationDate:   messengerutil.TimestampMs(time.Now().Add(time.Hour)),
		Issuer:           "iss1",
	}).Error)
	require.NoError(t, db.db.Create(&messengertypes.AccountVerifiedCredential{
		AccountPk:        refAccount.PublicKey,
		Identifier:       "id2",
		RegistrationDate: messengerutil.TimestampMs(time.Now()),
		ExpirationDate:   messengerutil.TimestampMs(time.Now().Add(time.Hour)),
		Issuer:           "iss2",
	}).Error)
	require.NoError(t, db.db.Create(&messengertypes.AccountVerifiedCredential{
		AccountPk:        refOtherAccount.PublicKey,
		Identifier:       "id3",
		RegistrationDate: messengerutil.TimestampMs(time.Now()),
		ExpirationDate:   messengerutil.TimestampMs(time.Now().Add(time.Hour)),
		Issuer:           "iss3",
	}).Error)

	require.NoError(t, db.db.Create(&messengertypes.AccountDirectoryServiceRecord{
		AccountPk:             refAccount.PublicKey,
		Identifier:            "id1",
		IdentifierProofIssuer: "iss1",
		RegistrationDate:      messengerutil.TimestampMs(time.Now()),
		ExpirationDate:        messengerutil.TimestampMs(time.Now().Add(time.Hour)),
		ServerAddr:            "srv_ds_1",
		Revoked:               false,
		DirectoryRecordToken:  "tok_ds_1",
	}).Error)

	require.NoError(t, db.db.Create(&messengertypes.AccountDirectoryServiceRecord{
		AccountPk:             refAccount.PublicKey,
		Identifier:            "id2",
		IdentifierProofIssuer: "iss2",
		RegistrationDate:      messengerutil.TimestampMs(time.Now()),
		ExpirationDate:        messengerutil.TimestampMs(time.Now().Add(time.Hour)),
		ServerAddr:            "srv_ds_2",
		Revoked:               false,
		DirectoryRecordToken:  "tok_ds_2",
	}).Error)

	require.NoError(t, db.db.Create(&messengertypes.AccountDirectoryServiceRecord{
		AccountPk:             refOtherAccount.PublicKey,
		Identifier:            "id3",
		IdentifierProofIssuer: "iss3",
		RegistrationDate:      messengerutil.TimestampMs(time.Now()),
		ExpirationDate:        messengerutil.TimestampMs(time.Now().Add(time.Hour)),
		ServerAddr:            "srv_ds_3",
		Revoked:               false,
		DirectoryRecordToken:  "tok_ds_3",
	}).Error)

	acc, err = db.GetAccount()
	require.NoError(t, err)
	require.Equal(t, refAccount.PublicKey, acc.PublicKey)
	require.Equal(t, refAccount.Link, acc.Link)
	require.Len(t, acc.ServiceTokens, 1)

	require.Len(t, acc.VerifiedCredentials, 2)
	require.Contains(t, []string{acc.VerifiedCredentials[0].Identifier, acc.VerifiedCredentials[1].Identifier}, "id1")
	require.Contains(t, []string{acc.VerifiedCredentials[0].Identifier, acc.VerifiedCredentials[1].Identifier}, "id2")
	require.Equal(t, "tokID1", acc.ServiceTokens[0].TokenId)
	require.Equal(t, refAccount.PublicKey, acc.ServiceTokens[0].AccountPk)
	require.Equal(t, "https://url1/", acc.ServiceTokens[0].AuthenticationUrl)
	require.Len(t, acc.ServiceTokens[0].SupportedServices, 1)
	require.Equal(t, "type1", acc.ServiceTokens[0].SupportedServices[0].Type)
	require.Equal(t, "addr1", acc.ServiceTokens[0].SupportedServices[0].Address)

	require.Len(t, acc.DirectoryServiceRecords, 2)
	require.Contains(t, []string{acc.DirectoryServiceRecords[0].Identifier, acc.DirectoryServiceRecords[1].Identifier}, "id1")
	require.Contains(t, []string{acc.DirectoryServiceRecords[0].Identifier, acc.DirectoryServiceRecords[1].Identifier}, "id2")
	require.Equal(t, "tok_ds_1", acc.DirectoryServiceRecords[0].DirectoryRecordToken)
	require.Equal(t, "iss1", acc.DirectoryServiceRecords[0].IdentifierProofIssuer)
	require.Equal(t, refAccount.PublicKey, acc.DirectoryServiceRecords[0].AccountPk)
	require.Equal(t, false, acc.DirectoryServiceRecords[0].Revoked)
	require.Equal(t, "srv_ds_1", acc.DirectoryServiceRecords[0].ServerAddr)
}

func Test_dbWrapper_getAcknowledgementsCidsForInteraction(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	cids, err := db.GetAcknowledgementsCIDsForInteraction("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Empty(t, cids)

	cids, err = db.GetAcknowledgementsCIDsForInteraction("QmXX")
	require.NoError(t, err)
	require.Empty(t, cids)

	db.db.Create(&messengertypes.Interaction{Cid: "Qm0001", Type: messengertypes.AppMessage_TypeAcknowledge, TargetCid: "QmTarget"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm0002", Type: messengertypes.AppMessage_TypeAcknowledge, TargetCid: "QmTarget"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm0003", Type: messengertypes.AppMessage_TypeAcknowledge, TargetCid: "QmOtherTarget"})

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

	db.db.Create(&messengertypes.Interaction{Cid: "cid1", ConversationPublicKey: "pk1"})
	db.db.Create(&messengertypes.Interaction{Cid: "cid2", ConversationPublicKey: "pk1"})
	db.db.Create(&messengertypes.Interaction{Cid: "cid3", ConversationPublicKey: "pk1"})
	db.db.Create(&messengertypes.Interaction{Cid: "cid4", ConversationPublicKey: "pk1"})

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

	db.db.Create(&messengertypes.Interaction{Cid: "Qm1"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm2"})
	db.db.Create(&messengertypes.Interaction{Cid: "Qm3"})

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

	acc, err := db.UpdateAccount("", "https://url1/", "DisplayName1")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, acc)

	acc, err = db.UpdateAccount("pk_1", "https://url1/", "DisplayName1")
	require.Error(t, err)
	require.Nil(t, acc)

	db.db.Create(&messengertypes.Account{PublicKey: "pk_1"})

	acc, err = db.UpdateAccount("pk_1", "", "")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "", acc.Link)
	require.Equal(t, "", acc.DisplayName)

	acc, err = db.UpdateAccount("pk_1", "https://url1/", "DisplayName1")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url1/", acc.Link)
	require.Equal(t, "DisplayName1", acc.DisplayName)

	acc, err = db.UpdateAccount("pk_1", "https://url2/", "")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url2/", acc.Link)
	require.Equal(t, "DisplayName1", acc.DisplayName)

	acc, err = db.UpdateAccount("pk_1", "", "DisplayName2")
	require.NoError(t, err)
	require.NotNil(t, acc)
	require.Equal(t, "https://url2/", acc.Link)
	require.Equal(t, "DisplayName2", acc.DisplayName)
}

func Test_dbWrapper_updateContact(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	err := db.UpdateContact("", &messengertypes.Contact{})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.UpdateContact("pk_1", &messengertypes.Contact{})
	require.Error(t, err)

	require.NoError(t, db.db.Create(&messengertypes.Contact{PublicKey: "pk_1"}).Error)

	err = db.UpdateContact("pk_1", &messengertypes.Contact{})
	require.NoError(t, err)

	err = db.UpdateContact("pk_1", &messengertypes.Contact{DisplayName: "DisplayName1"})
	require.NoError(t, err)

	c := &messengertypes.Contact{}
	require.NoError(t, db.db.First(&c, &messengertypes.Contact{PublicKey: "pk_1"}).Error)
	require.Equal(t, "pk_1", c.PublicKey)
	require.Equal(t, "DisplayName1", c.DisplayName)
	require.Equal(t, messengertypes.Contact_Undefined, c.State)

	err = db.UpdateContact("pk_1", &messengertypes.Contact{State: messengertypes.Contact_Accepted})
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

	_, err := db.UpdateConversation(&messengertypes.Conversation{})
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Error(t, err)

	isNew, err := db.UpdateConversation(&messengertypes.Conversation{PublicKey: "conv_1"})
	require.NoError(t, err)
	require.True(t, isNew)

	c := &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "conv_1"}).First(&c).Error)

	isNew, err = db.UpdateConversation(&messengertypes.Conversation{PublicKey: "conv_1", DisplayName: "DisplayName1"})
	require.NoError(t, err)
	require.False(t, isNew)

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "conv_1"}).First(&c).Error)
	require.Equal(t, "DisplayName1", c.DisplayName)

	isNew, err = db.UpdateConversation(&messengertypes.Conversation{PublicKey: "conv_1", Link: "https://link1/"})
	require.NoError(t, err)
	require.False(t, isNew)

	c = &messengertypes.Conversation{}
	require.NoError(t, db.db.Where(&messengertypes.Conversation{PublicKey: "conv_1"}).First(&c).Error)
	require.Equal(t, "DisplayName1", c.DisplayName)
	require.Equal(t, "https://link1/", c.Link)

	isNew, err = db.UpdateConversation(&messengertypes.Conversation{PublicKey: "conv_1", Link: "https://link2/", DisplayName: "DisplayName2"})
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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
		Cid:                   "cid_1",
		ConversationPublicKey: "conversation_1",
	}).Error)

	conversation, err = db.GetConversationByPK("conversation_1")
	require.NoError(t, err)
	require.NotNil(t, conversation)
	require.Equal(t, "conversation_1", conversation.PublicKey)
	require.NotEmpty(t, conversation.ReplicationInfo)
	require.Equal(t, "cid_1", conversation.ReplicationInfo[0].Cid)

	db.db.Create(&messengertypes.Conversation{PublicKey: "conversation_2"})
	conversation, err = db.GetConversationByPK("conversation_2")
	require.NoError(t, err)
	require.NotNil(t, conversation)
	require.Equal(t, "conversation_2", conversation.PublicKey)
}

func Test_dbWrapper_getDBInfo(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	info, err := db.GetDBInfo()
	require.NoError(t, err)
	require.Empty(t, info)

	refCount := 0

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.Account{PublicKey: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.Contact{PublicKey: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.Interaction{Cid: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.Conversation{PublicKey: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.Member{PublicKey: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.Device{PublicKey: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.ServiceTokenSupportedServiceRecord{Type: fmt.Sprintf("%d", i), Address: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.ServiceToken{Token: fmt.Sprintf("%d", i), TokenId: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.ConversationReplicationInfo{Cid: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.MetadataEvent{Cid: fmt.Sprintf("%d", i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.AccountVerifiedCredential{Identifier: fmt.Sprintf("%d", i), Issuer: fmt.Sprintf("%d", i), ExpirationDate: int64(i), RegistrationDate: int64(i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.AccountDirectoryServiceRecord{Identifier: fmt.Sprintf("%d", i), ServerAddr: fmt.Sprintf("%d", i), ExpirationDate: int64(i), RegistrationDate: int64(i)})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.PushDeviceToken{
			AccountPk: fmt.Sprintf("%d", i),
			TokenType: pushtypes.PushServiceTokenType(i),
			BundleId:  fmt.Sprintf("%d", i),
			Token:     []byte(fmt.Sprintf("%d", i)),
			PublicKey: []byte(fmt.Sprintf("%d", i)),
		})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.PushServerRecord{
			AccountPk:  fmt.Sprintf("%d", i),
			ServerAddr: fmt.Sprintf("%d", i),
			ServerKey:  []byte(fmt.Sprintf("%d", i)),
		})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.PushLocalDeviceSharedToken{
			TokenId:               fmt.Sprintf("%d", i),
			ConversationPublicKey: fmt.Sprintf("%d", i),
		})
	}
	refCount++

	for i := 0; i <= refCount; i++ {
		db.db.Create(&messengertypes.PushMemberToken{
			TokenId:               fmt.Sprintf("%d", i),
			ConversationPublicKey: fmt.Sprintf("%d", i),
			DevicePk:              fmt.Sprintf("%d", i),
			ServerAddr:            fmt.Sprintf("%d", i),
			ServerKey:             []byte(fmt.Sprintf("%d", i)),
			Token:                 []byte(fmt.Sprintf("%d", i)),
		})
	}
	refCount++

	require.Equal(t, len(getDBModels()), refCount)

	refCount = 0
	info, err = db.GetDBInfo()
	require.NoError(t, err)
	refCount++
	require.Equal(t, int64(refCount), info.Accounts)
	refCount++
	require.Equal(t, int64(refCount), info.Contacts)
	refCount++
	require.Equal(t, int64(refCount), info.Interactions)
	refCount++
	require.Equal(t, int64(refCount), info.Conversations)
	refCount++
	require.Equal(t, int64(refCount), info.Members)
	refCount++
	require.Equal(t, int64(refCount), info.Devices)
	refCount++
	require.Equal(t, int64(refCount), info.ServiceTokenSupportedServiceRecords)
	refCount++
	require.Equal(t, int64(refCount), info.ServiceTokens)
	refCount++
	require.Equal(t, int64(refCount), info.ConversationReplicationInfo)
	refCount++
	require.Equal(t, int64(refCount), info.MetadataEvents)
	refCount++
	require.Equal(t, int64(refCount), info.AccountVerifiedCredentials)
	refCount++
	require.Equal(t, int64(refCount), info.AccountDirectoryServiceRecord)
	refCount++
	require.Equal(t, int64(refCount), info.PushDeviceToken)
	refCount++
	require.Equal(t, int64(refCount), info.PushServerRecord)
	refCount++
	require.Equal(t, int64(refCount), info.PushLocalDeviceSharedToken)
	refCount++
	require.Equal(t, int64(refCount), info.PushMemberToken)

	require.Equal(t, len(getDBModels()), refCount)

	// Ensure all tables are in the debug data
	tables := []string(nil)
	err = db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%_fts%'").Scan(&tables).Error
	require.NoError(t, err)
	expectedTablesCount := len(getDBModels())
	require.Equal(t, expectedTablesCount, len(tables), fmt.Sprintf("expected %d tables in DB, got tables %s", expectedTablesCount, strings.Join(tables, ", ")))
}

func Test_dbWrapper_getMemberByPK(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	member, err := db.GetMemberByPK("", "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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

func Test_dbWrapper_getMembersByConversation(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	members, err := db.GetMembersByConversation("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, members)

	members, err = db.GetMembersByConversation("unknown")
	require.Error(t, err)
	require.Nil(t, members)

	db.db.Create(&messengertypes.Member{PublicKey: "member_1", ConversationPublicKey: "conv_1"})

	members, err = db.GetMembersByConversation("conv_1")
	require.NoError(t, err)
	require.NotNil(t, members)
	require.Len(t, members, 1)
	require.Equal(t, "member_1", members[0].PublicKey)
	require.Equal(t, "conv_1", members[0].ConversationPublicKey)

	members, err = db.GetMembersByConversation("conv_2")
	require.Error(t, err)
	require.Nil(t, members)
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, interaction)

	interaction, err = db.MarkInteractionAsAcknowledged("QmXXXX")
	require.Error(t, err)
	require.Equal(t, err, gorm.ErrRecordNotFound)
	require.Nil(t, interaction)

	require.NoError(t, db.db.Create(&messengertypes.Interaction{Cid: "Qm0001", Acknowledged: true}).Error)
	interaction, err = db.MarkInteractionAsAcknowledged("Qm0001")
	require.NoError(t, err)
	require.Nil(t, interaction)

	require.NoError(t, db.db.Create(&messengertypes.Interaction{Cid: "Qm0002", Acknowledged: false}).Error)
	interaction, err = db.MarkInteractionAsAcknowledged("Qm0002")
	require.NoError(t, err)
	require.NotNil(t, interaction)
	require.Equal(t, "Qm0002", interaction.Cid)
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
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

	db.db.Model(&messengertypes.Conversation{}).Preload("ReplicationInfo").Preload("PushLocalDeviceSharedTokens").Preload("PushMemberTokens").Where(&messengertypes.Conversation{PublicKey: "conv1"}).First(&c)
	require.Equal(t, "conv1", c.PublicKey)
	require.True(t, c.IsOpen)
	require.Equal(t, int32(0), c.UnreadCount)

	conv, updated, err = db.SetConversationIsOpenStatus("conv1", false)
	require.NoError(t, err)
	require.True(t, updated)

	c = &messengertypes.Conversation{}
	db.db.Model(&messengertypes.Conversation{}).Preload("ReplicationInfo").Preload("PushLocalDeviceSharedTokens").Preload("PushMemberTokens").Where(&messengertypes.Conversation{PublicKey: "conv1"}).First(&c)
	require.Equal(t, "conv1", c.PublicKey)
	require.False(t, c.IsOpen)
	require.Equal(t, int32(0), c.UnreadCount)
	require.Equal(t, c, conv)

	c = &messengertypes.Conversation{}
	db.db.Model(&messengertypes.Conversation{}).Preload("ReplicationInfo").Preload("PushLocalDeviceSharedTokens").Preload("PushMemberTokens").Where(&messengertypes.Conversation{PublicKey: "conv2"}).First(&c)
	require.Equal(t, "conv2", c.PublicKey)
	require.False(t, c.IsOpen)
	require.Equal(t, int32(1000), c.UnreadCount)

	conv, updated, err = db.SetConversationIsOpenStatus("conv2", true)
	require.NoError(t, err)
	require.True(t, updated)

	c = &messengertypes.Conversation{}
	db.db.Model(&messengertypes.Conversation{}).Preload("ReplicationInfo").Preload("PushLocalDeviceSharedTokens").Preload("PushMemberTokens").Where(&messengertypes.Conversation{PublicKey: "conv2"}).First(&c)
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	opened, err = db.IsConversationOpened("convo_a")
	require.NoError(t, err)
	require.True(t, opened)

	opened, err = db.IsConversationOpened("convo_b")
	require.NoError(t, err)
	require.False(t, opened)
}

func Test_dbWrapper_getLatestInteractionPerConversation(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	for i := 0; i < 10; i++ {
		err := db.db.Create(&messengertypes.Conversation{PublicKey: fmt.Sprintf("c%d", i)}).Error
		require.NoError(t, err)

		for j := 0; j <= i; j++ {
			err := db.db.Create(&messengertypes.Interaction{
				Cid:                   fmt.Sprintf("c%d_i%d", i, j),
				ConversationPublicKey: fmt.Sprintf("c%d", i),
				Payload:               []byte(fmt.Sprintf("c%d_i%d", i, j)),
				SentDate:              int64(i*100 + j),
			}).Error
			require.NoError(t, err)
		}
	}

	interactions, err := db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{Amount: 5})
	require.NoError(t, err)
	require.Len(t, interactions, 40)

	interactions, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{RefCid: "c9_i9", Amount: 5})
	require.NoError(t, err)
	require.Len(t, interactions, 5)

	interactions, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{RefCid: "c9_i7", Amount: 5, OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 2)

	interactions, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPk: "c8", RefCid: "c9_i9", Amount: 5})
	require.Error(t, err)
	require.Len(t, interactions, 0)
}

func Test_dbWrapper_getLatestInteractionAndMediaPerConversation_sorting(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	err := db.db.Create(&messengertypes.Conversation{PublicKey: "c1"}).Error
	require.NoError(t, err)

	for i := 0; i < 100; i++ {
		err := db.db.Create(&messengertypes.Interaction{
			Cid:                   fmt.Sprintf("c1_i%02d", i),
			ConversationPublicKey: "c1",
			Payload:               []byte(fmt.Sprintf("c1_i%02d", i)),
			SentDate:              1000,
		}).Error
		require.NoError(t, err)
	}

	interactions, err := db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPk: "c1", Amount: 5})
	require.NoError(t, err)
	require.Len(t, interactions, 5)

	require.Equal(t, "c1_i99", interactions[0].Cid)
	require.Equal(t, "c1_i98", interactions[1].Cid)
	require.Equal(t, "c1_i97", interactions[2].Cid)
	require.Equal(t, "c1_i96", interactions[3].Cid)
	require.Equal(t, "c1_i95", interactions[4].Cid)

	interactions, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPk: "c1", Amount: 5, RefCid: "c1_i95"})
	require.NoError(t, err)
	require.Len(t, interactions, 5)

	require.Equal(t, "c1_i94", interactions[0].Cid)
	require.Equal(t, "c1_i93", interactions[1].Cid)
	require.Equal(t, "c1_i92", interactions[2].Cid)
	require.Equal(t, "c1_i91", interactions[3].Cid)
	require.Equal(t, "c1_i90", interactions[4].Cid)

	interactions, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPk: "c1", Amount: 5, RefCid: "c1_i03"})
	require.NoError(t, err)
	require.Len(t, interactions, 3)

	require.Equal(t, "c1_i02", interactions[0].Cid)
	require.Equal(t, "c1_i01", interactions[1].Cid)
	require.Equal(t, "c1_i00", interactions[2].Cid)

	interactions, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPk: "c1", Amount: 5, OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 5)

	require.Equal(t, "c1_i00", interactions[0].Cid)
	require.Equal(t, "c1_i01", interactions[1].Cid)
	require.Equal(t, "c1_i02", interactions[2].Cid)
	require.Equal(t, "c1_i03", interactions[3].Cid)
	require.Equal(t, "c1_i04", interactions[4].Cid)

	interactions, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPk: "c1", Amount: 5, RefCid: "c1_i04", OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 5)

	require.Equal(t, "c1_i05", interactions[0].Cid)
	require.Equal(t, "c1_i06", interactions[1].Cid)
	require.Equal(t, "c1_i07", interactions[2].Cid)
	require.Equal(t, "c1_i08", interactions[3].Cid)
	require.Equal(t, "c1_i09", interactions[4].Cid)

	interactions, err = db.GetPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{ConversationPk: "c1", Amount: 5, RefCid: "c1_i96", OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 3)

	require.Equal(t, "c1_i97", interactions[0].Cid)
	require.Equal(t, "c1_i98", interactions[1].Cid)
	require.Equal(t, "c1_i99", interactions[2].Cid)
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

	db.db.Create(&messengertypes.Interaction{Cid: "cid_1", SentDate: 1000})
	db.db.Create(&messengertypes.Interaction{Cid: "cid_2", SentDate: 1001})
	db.db.Create(&messengertypes.Interaction{Cid: "cid_3", SentDate: 1002})
	db.db.Create(&messengertypes.Interaction{Cid: "cid_4", SentDate: 1003})

	interactions, err = db.InteractionsSearch("dummy", nil)
	require.NoError(t, err)
	require.Empty(t, interactions)

	err = db.InteractionIndexText("cid_0", "This entry should not be added as the Cid doesn't match any interaction")
	require.Error(t, err)

	interactions, err = db.InteractionsSearch("interaction", nil)
	require.NoError(t, err)
	require.Empty(t, interactions)

	err = db.InteractionIndexText("cid_1", "This dummy content should show up in the results if we need it")
	require.NoError(t, err)

	err = db.InteractionIndexText("cid_2", "This other content should show up in the results if the relevant word is typed")
	require.NoError(t, err)

	// Adding content for the same Cid twice should not trigger an error
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
	require.Equal(t, "cid_1", interactions[0].Cid)

	interactions, err = db.InteractionsSearch("other", nil)
	require.NoError(t, err)
	require.Len(t, interactions, 1)
	require.Equal(t, "cid_2", interactions[0].Cid)

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

		err := db.db.Create(&messengertypes.Interaction{Cid: id, SentDate: 1000}).Error
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
	require.Equal(t, "cid_99", interactions[0].Cid)
	require.Equal(t, "cid_97", interactions[1].Cid)
	require.Equal(t, "cid_83", interactions[8].Cid)
	require.Equal(t, "cid_81", interactions[9].Cid)

	interactions, err = db.InteractionsSearch("else", &SearchOptions{})
	require.NoError(t, err)
	require.Len(t, interactions, 10)
	require.Equal(t, "cid_98", interactions[0].Cid)
	require.Equal(t, "cid_96", interactions[1].Cid)
	require.Equal(t, "cid_82", interactions[8].Cid)
	require.Equal(t, "cid_80", interactions[9].Cid)

	interactions, err = db.InteractionsSearch("else", &SearchOptions{RefCID: "cid_80"})
	require.NoError(t, err)
	require.Len(t, interactions, 10)
	require.Equal(t, "cid_78", interactions[0].Cid)
	require.Equal(t, "cid_76", interactions[1].Cid)
	require.Equal(t, "cid_62", interactions[8].Cid)
	require.Equal(t, "cid_60", interactions[9].Cid)

	interactions, err = db.InteractionsSearch("else", &SearchOptions{RefCID: "cid_60", OldestToNewest: true})
	require.NoError(t, err)
	require.Len(t, interactions, 10)
	require.Equal(t, "cid_62", interactions[0].Cid)
	require.Equal(t, "cid_64", interactions[1].Cid)
	require.Equal(t, "cid_78", interactions[8].Cid)
	require.Equal(t, "cid_80", interactions[9].Cid)

	interactions, err = db.InteractionsSearch("else", &SearchOptions{RefCID: "cid_60", OldestToNewest: true, Limit: 4})
	require.NoError(t, err)
	require.Len(t, interactions, 4)
	require.Equal(t, "cid_62", interactions[0].Cid)
	require.Equal(t, "cid_64", interactions[1].Cid)
	require.Equal(t, "cid_66", interactions[2].Cid)
	require.Equal(t, "cid_68", interactions[3].Cid)
}

func Test_dbWrapper_addInteraction_fromPushFirst(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	const testCid = "Qm00001"

	i, isNew, err := db.AddInteraction(&messengertypes.Interaction{
		Cid:               testCid,
		Payload:           []byte("payload1"),
		OutOfStoreMessage: true,
	})
	require.NoError(t, err)
	require.True(t, isNew)
	require.NotNil(t, i)
	require.Equal(t, testCid, i.Cid)
	require.Equal(t, []byte("payload1"), i.Payload)

	// Data should not be updated when receiving another pushed event
	i, isNew, err = db.AddInteraction(&messengertypes.Interaction{
		Cid:               testCid,
		Payload:           []byte("payload2"),
		OutOfStoreMessage: true,
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, testCid, i.Cid)
	require.Equal(t, []byte("payload1"), i.Payload)
	require.False(t, isNew)

	// Data should be updated when synchronizing messages with OrbitDB
	i, isNew, err = db.AddInteraction(&messengertypes.Interaction{
		Cid:               testCid,
		Payload:           []byte("payload3"),
		OutOfStoreMessage: false,
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, testCid, i.Cid)
	require.Equal(t, []byte("payload3"), i.Payload)
	require.True(t, isNew)
}

func Test_dbWrapper_addInteraction_fromPushLast(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	const testCid = "Qm00001"

	i, isNew, err := db.AddInteraction(&messengertypes.Interaction{
		Cid:               testCid,
		Payload:           []byte("payload1"),
		OutOfStoreMessage: false,
	})
	require.NoError(t, err)
	require.True(t, isNew)
	require.NotNil(t, i)
	require.Equal(t, testCid, i.Cid)
	require.Equal(t, []byte("payload1"), i.Payload)

	// Data should not be updated when receiving a pushed event
	i, isNew, err = db.AddInteraction(&messengertypes.Interaction{
		Cid:               testCid,
		Payload:           []byte("payload2"),
		OutOfStoreMessage: true,
	})
	require.NoError(t, err)
	require.NotNil(t, i)
	require.Equal(t, testCid, i.Cid)
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

func Test_dbWrapper_GetDevicesForContact(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "Convo1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Conversation{PublicKey: "Convo2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Contact{PublicKey: "Member1", ConversationPublicKey: "Convo1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Contact{PublicKey: "Member2", ConversationPublicKey: "Convo1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Contact{PublicKey: "Member1", ConversationPublicKey: "Convo2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Contact{PublicKey: "Member3", ConversationPublicKey: "Convo2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device11", MemberPublicKey: "Member1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device12", MemberPublicKey: "Member1"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device21", MemberPublicKey: "Member2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device22", MemberPublicKey: "Member2"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device31", MemberPublicKey: "Member3"}).Error)
	require.NoError(t, db.db.Create(&messengertypes.Device{PublicKey: "Device32", MemberPublicKey: "Member3"}).Error)

	dev, err := db.GetDevicesForContact("bogus", "Member1")
	require.NoError(t, err)
	require.Len(t, dev, 0)

	dev, err = db.GetDevicesForContact("Convo1", "bogus")
	require.NoError(t, err)
	require.Len(t, dev, 0)

	dev, err = db.GetDevicesForContact("Convo1", "Member1")
	require.NoError(t, err)
	require.Len(t, dev, 2)
}

func Test_dbWrapper_SaveAccountVerifiedCredential(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	db.db.Create(&messengertypes.Account{PublicKey: "test1"})

	err := db.SaveAccountVerifiedCredential(&protocoltypes.AccountVerifiedCredentialRegistered{})
	require.Error(t, err)

	count := int64(0)
	err = db.db.Model(&messengertypes.AccountVerifiedCredential{}).Count(&count).Error
	require.NoError(t, err)
	require.Equal(t, int64(0), count)

	err = db.SaveAccountVerifiedCredential(&protocoltypes.AccountVerifiedCredentialRegistered{
		Identifier:       "id1",
		RegistrationDate: 10 * messengerutil.MilliToNanoFactor,
		ExpirationDate:   20 * messengerutil.MilliToNanoFactor,
		Issuer:           "iss1",
	})
	require.NoError(t, err)

	err = db.db.Model(&messengertypes.AccountVerifiedCredential{}).Count(&count).Error
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	err = db.SaveAccountVerifiedCredential(&protocoltypes.AccountVerifiedCredentialRegistered{
		Identifier:       "id1",
		RegistrationDate: 9 * messengerutil.MilliToNanoFactor,
		ExpirationDate:   19 * messengerutil.MilliToNanoFactor,
		Issuer:           "iss1",
	})
	require.NoError(t, err)

	err = db.db.Model(&messengertypes.AccountVerifiedCredential{}).Count(&count).Error
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	entry := &messengertypes.AccountVerifiedCredential{}
	err = db.db.Model(&messengertypes.AccountVerifiedCredential{}).First(&entry, &messengertypes.AccountVerifiedCredential{Identifier: "id1", ExpirationDate: 20}).Error
	require.NoError(t, err)

	err = db.SaveAccountVerifiedCredential(&protocoltypes.AccountVerifiedCredentialRegistered{
		Identifier:       "id2",
		ExpirationDate:   20 * messengerutil.MilliToNanoFactor,
		RegistrationDate: 10 * messengerutil.MilliToNanoFactor,
		Issuer:           "iss1",
	})
	require.NoError(t, err)

	err = db.db.Model(&messengertypes.AccountVerifiedCredential{}).Count(&count).Error
	require.NoError(t, err)
	require.Equal(t, int64(2), count)
}

func Test_dbWrapper_SaveAccountDirectoryServiceRecord_GetAccountDirectoryServiceRecord_MarkAccountDirectoryServiceRecordAsRevoked(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	db.db.Create(&messengertypes.Account{PublicKey: "test1"})

	// marking as revoked non existing token
	err := db.MarkAccountDirectoryServiceRecordAsRevoked("server1", "token1", 19)
	require.Error(t, err)

	// retrieving non existing token
	record, err := db.GetAccountDirectoryServiceRecord("server1", "token1")
	require.Error(t, err)

	// saving a new token
	err = db.SaveAccountDirectoryServiceRecord("acc1", &messengertypes.AppMessage_AccountDirectoryServiceRegistered{
		Identifier:                     "id1",
		IdentifierProofIssuer:          "iss1",
		RegistrationDate:               10 * messengerutil.MilliToNanoFactor,
		ExpirationDate:                 20 * messengerutil.MilliToNanoFactor,
		ServerAddr:                     "server1",
		DirectoryRecordToken:           "token1",
		DirectoryRecordUnregisterToken: "unregister_token1",
	})
	require.NoError(t, err)

	count := int64(0)

	// checking that a single token exists
	err = db.db.Model(&messengertypes.AccountDirectoryServiceRecord{}).Count(&count).Error
	require.NoError(t, err)
	require.Equal(t, int64(1), count)

	// saving a new token
	err = db.SaveAccountDirectoryServiceRecord("acc1", &messengertypes.AppMessage_AccountDirectoryServiceRegistered{
		Identifier:                     "id2",
		IdentifierProofIssuer:          "iss2",
		RegistrationDate:               30 * messengerutil.MilliToNanoFactor,
		ExpirationDate:                 40 * messengerutil.MilliToNanoFactor,
		ServerAddr:                     "server2",
		DirectoryRecordToken:           "token2",
		DirectoryRecordUnregisterToken: "unregister_token2",
	})
	require.NoError(t, err)

	count = int64(0)

	// checking that a second token exists
	err = db.db.Model(&messengertypes.AccountDirectoryServiceRecord{}).Count(&count).Error
	require.NoError(t, err)
	require.Equal(t, int64(2), count)

	// checking token details
	record, err = db.GetAccountDirectoryServiceRecord("server1", "token1")
	require.NoError(t, err)
	require.Equal(t, "id1", record.Identifier)
	require.Equal(t, "iss1", record.IdentifierProofIssuer)
	require.Equal(t, int64(10), record.RegistrationDate)
	require.Equal(t, int64(20), record.ExpirationDate)
	require.Equal(t, "server1", record.ServerAddr)
	require.Equal(t, "token1", record.DirectoryRecordToken)
	require.Equal(t, "unregister_token1", record.DirectoryRecordUnregisterToken)
	require.Equal(t, false, record.Revoked)

	// checking the second token details
	record, err = db.GetAccountDirectoryServiceRecord("server2", "token2")
	require.NoError(t, err)
	require.Equal(t, "id2", record.Identifier)
	require.Equal(t, "iss2", record.IdentifierProofIssuer)
	require.Equal(t, int64(30), record.RegistrationDate)
	require.Equal(t, int64(40), record.ExpirationDate)
	require.Equal(t, "server2", record.ServerAddr)
	require.Equal(t, "token2", record.DirectoryRecordToken)
	require.Equal(t, "unregister_token2", record.DirectoryRecordUnregisterToken)
	require.Equal(t, false, record.Revoked)

	// marking the token as revoked
	err = db.MarkAccountDirectoryServiceRecordAsRevoked("server1", "token1", int64(20))
	require.NoError(t, err)

	// marking the token as revoked a second time
	err = db.MarkAccountDirectoryServiceRecordAsRevoked("server1", "token1", int64(20))
	require.NoError(t, err)

	// checking that the token is actually revoked
	record, err = db.GetAccountDirectoryServiceRecord("server1", "token1")
	require.NoError(t, err)
	require.Equal(t, "id1", record.Identifier)
	require.Equal(t, "iss1", record.IdentifierProofIssuer)
	require.Equal(t, int64(10), record.RegistrationDate)
	require.Equal(t, int64(20), record.ExpirationDate)
	require.Equal(t, "server1", record.ServerAddr)
	require.Equal(t, "token1", record.DirectoryRecordToken)
	require.Equal(t, true, record.Revoked)

	// checking that the second token is not revoked
	record, err = db.GetAccountDirectoryServiceRecord("server2", "token2")
	require.NoError(t, err)
	require.Equal(t, "id2", record.Identifier)
	require.Equal(t, "iss2", record.IdentifierProofIssuer)
	require.Equal(t, int64(30), record.RegistrationDate)
	require.Equal(t, int64(40), record.ExpirationDate)
	require.Equal(t, "server2", record.ServerAddr)
	require.Equal(t, "token2", record.DirectoryRecordToken)
	require.Equal(t, false, record.Revoked)

	// updating a token
	err = db.SaveAccountDirectoryServiceRecord("acc1", &messengertypes.AppMessage_AccountDirectoryServiceRegistered{
		Identifier:                     "id1",
		IdentifierProofIssuer:          "iss1.1",
		RegistrationDate:               50 * messengerutil.MilliToNanoFactor,
		ExpirationDate:                 60 * messengerutil.MilliToNanoFactor,
		ServerAddr:                     "server1",
		DirectoryRecordToken:           "token1.1",
		DirectoryRecordUnregisterToken: "unregister_token1.1",
	})
	require.NoError(t, err)

	// checking updated token details
	record, err = db.GetAccountDirectoryServiceRecord("server1", "token1")
	require.Error(t, err)

	record, err = db.GetAccountDirectoryServiceRecord("server1", "token1.1")
	require.NoError(t, err)
	require.Equal(t, "id1", record.Identifier)
	require.Equal(t, "iss1.1", record.IdentifierProofIssuer)
	require.Equal(t, int64(50), record.RegistrationDate)
	require.Equal(t, int64(60), record.ExpirationDate)
	require.Equal(t, "server1", record.ServerAddr)
	require.Equal(t, "token1.1", record.DirectoryRecordToken)
	require.Equal(t, "unregister_token1.1", record.DirectoryRecordUnregisterToken)
	require.Equal(t, false, record.Revoked)
}

func TestDBAutoMigrateTwice(t *testing.T) {
	const dbName = "test.db"

	db, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:%s?mode=memory&cache=shared", dbName)), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(getDBModels()...)
	require.NoError(t, err)

	err = db.AutoMigrate(getDBModels()...)
	require.NoError(t, err)

	sqlDB, err := db.DB()
	require.NoError(t, err)
	sqlDB.Close()
}

func Test_dbWrapper_GetPushDeviceToken(t *testing.T) {
	account1PK := "account1_pk"
	account2PK := "account2_pk"
	bundleID1 := "bundle_id1"
	bundleID2 := "bundle_id2"
	token1 := []byte("token1")
	token2 := []byte("token2")
	publicKey1 := []byte("public_key1")
	publicKey2 := []byte("public_key2")

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// test invalid input
	deviceTokenErr, err := db.GetPushDeviceToken("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, deviceTokenErr)

	// test missing record
	deviceTokenMiss, err := db.GetPushDeviceToken(account1PK)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrNotFound))
	require.Nil(t, deviceTokenMiss)

	// create the first push device token entry
	rec := &messengertypes.PushDeviceToken{
		AccountPk: account1PK,
		TokenType: pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
		BundleId:  bundleID1,
		Token:     token1,
		PublicKey: publicKey1,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// create the second device token entry
	rec = &messengertypes.PushDeviceToken{
		AccountPk: account2PK,
		TokenType: pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging,
		BundleId:  bundleID2,
		Token:     token2,
		PublicKey: publicKey2,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// test getting records
	deviceToken1, err := db.GetPushDeviceToken(account1PK)
	require.NoError(t, err)
	require.NotNil(t, deviceToken1)
	require.Equal(t, account1PK, deviceToken1.AccountPk)
	require.Equal(t, bundleID1, deviceToken1.BundleId)
	require.Equal(t, token1, deviceToken1.Token)
	require.Equal(t, publicKey1, deviceToken1.PublicKey)

	deviceToken2, err := db.GetPushDeviceToken(account2PK)
	require.NoError(t, err)
	require.NotNil(t, deviceToken2)
	require.Equal(t, account2PK, deviceToken2.AccountPk)
	require.Equal(t, bundleID2, deviceToken2.BundleId)
	require.Equal(t, token2, deviceToken2.Token)
	require.Equal(t, publicKey2, deviceToken2.PublicKey)
}

func Test_dbWrapper_SavePushDeviceToken(t *testing.T) {
	account1PK := "account1_pk"
	bundleID1 := "bundle_id1"
	bundleID2 := "bundle_id2"
	token1 := []byte("token1")
	token2 := []byte("token2")
	publicKey1 := []byte("public_key1")
	publicKey2 := []byte("public_key2")

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// test invalid input
	err := db.SavePushDeviceToken("", &messengertypes.AppMessage_PushSetDeviceToken{
		DeviceToken: &pushtypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
			BundleId:           bundleID1,
			Token:              token1,
			RecipientPublicKey: publicKey1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushDeviceToken(account1PK, &messengertypes.AppMessage_PushSetDeviceToken{
		DeviceToken: &pushtypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenUndefined,
			BundleId:           bundleID1,
			Token:              token1,
			RecipientPublicKey: publicKey1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushDeviceToken(account1PK, &messengertypes.AppMessage_PushSetDeviceToken{
		DeviceToken: &pushtypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging,
			BundleId:           "",
			Token:              token1,
			RecipientPublicKey: publicKey1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushDeviceToken(account1PK, &messengertypes.AppMessage_PushSetDeviceToken{
		DeviceToken: &pushtypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging,
			BundleId:           bundleID1,
			Token:              []byte{},
			RecipientPublicKey: publicKey1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushDeviceToken(account1PK, &messengertypes.AppMessage_PushSetDeviceToken{
		DeviceToken: &pushtypes.PushServiceReceiver{
			TokenType:          pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging,
			BundleId:           bundleID1,
			Token:              token1,
			RecipientPublicKey: []byte{},
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	// create a push device token entry
	serviceReceiver := &pushtypes.PushServiceReceiver{
		TokenType:          pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging,
		BundleId:           bundleID1,
		Token:              token1,
		RecipientPublicKey: publicKey1,
	}
	deviceToken := &messengertypes.AppMessage_PushSetDeviceToken{
		DeviceToken: serviceReceiver,
	}

	err = db.SavePushDeviceToken(account1PK, deviceToken)
	require.NoError(t, err)

	// check that the push server entry was created
	rec, err := db.GetPushDeviceToken(account1PK)
	require.NoError(t, err)
	require.NotNil(t, rec)
	require.Equal(t, account1PK, rec.AccountPk)
	require.Equal(t, pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging, rec.TokenType)
	require.Equal(t, bundleID1, rec.BundleId)
	require.Equal(t, token1, rec.Token)
	require.Equal(t, publicKey1, rec.PublicKey)

	// update the push server entry
	serviceReceiver2 := &pushtypes.PushServiceReceiver{
		TokenType:          pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService,
		BundleId:           bundleID2,
		Token:              token2,
		RecipientPublicKey: publicKey2,
	}
	deviceToken2 := &messengertypes.AppMessage_PushSetDeviceToken{
		DeviceToken: serviceReceiver2,
	}

	err = db.SavePushDeviceToken(account1PK, deviceToken2)
	require.NoError(t, err)

	// check that the push server entry was updated
	rec, err = db.GetPushDeviceToken(account1PK)
	require.NoError(t, err)
	require.NotNil(t, rec)
	require.Equal(t, account1PK, rec.AccountPk)
	require.Equal(t, pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService, rec.TokenType)
	require.Equal(t, bundleID2, rec.BundleId)
	require.Equal(t, token2, rec.Token)
	require.Equal(t, publicKey2, rec.PublicKey)
}

func Test_dbWrapper_GetPushServerRecord(t *testing.T) {
	groupPK := "group_pk"
	server1Addr := "server1_addr"
	server1Key := []byte("server2_key")
	server2Addr := "server2_addr"
	server2Key := []byte("server2_key")

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// test invalid input
	serverErr, err := db.GetPushServerRecord("", server1Addr)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, serverErr)

	serverErr, err = db.GetPushServerRecord(groupPK, "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, serverErr)

	// test missing record
	serverMiss, err := db.GetPushServerRecord(groupPK, server1Addr)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrNotFound))
	require.Nil(t, serverMiss)

	// create the first push server entry
	rec := &messengertypes.PushServerRecord{
		AccountPk:  groupPK,
		ServerAddr: server1Addr,
		ServerKey:  server1Key,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// create the second push server entry
	rec = &messengertypes.PushServerRecord{
		AccountPk:  groupPK,
		ServerAddr: server2Addr,
		ServerKey:  server2Key,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// test getting records
	serverRec, err := db.GetPushServerRecord(groupPK, server1Addr)
	require.NoError(t, err)
	require.NotNil(t, serverRec)
	require.Equal(t, groupPK, serverRec.AccountPk)
	require.Equal(t, server1Addr, serverRec.ServerAddr)
	require.Equal(t, server1Key, serverRec.ServerKey)

	server2Rec, err := db.GetPushServerRecord(groupPK, server2Addr)
	require.NoError(t, err)
	require.NotNil(t, server2Rec)
	require.Equal(t, groupPK, server2Rec.AccountPk)
	require.Equal(t, server2Addr, server2Rec.ServerAddr)
	require.Equal(t, server2Key, server2Rec.ServerKey)
}

func Test_dbWrapper_SavePushServer(t *testing.T) {
	groupPK1 := "group_pk"
	server1Addr := "server1_addr"
	server1Key := []byte("server1_key")
	server2Key := []byte("server2_key")

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// test invalid input
	err := db.SavePushServer("", &messengertypes.AppMessage_PushSetServer{
		Server: &messengertypes.PushServer{
			Addr: server1Addr,
			Key:  server1Key,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushServer(groupPK1, &messengertypes.AppMessage_PushSetServer{
		Server: &messengertypes.PushServer{
			Addr: "",
			Key:  server1Key,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushServer(groupPK1, &messengertypes.AppMessage_PushSetServer{
		Server: &messengertypes.PushServer{
			Addr: server1Addr,
			Key:  []byte(""),
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	// create a push server entry
	server := &messengertypes.PushServer{
		Addr: server1Addr,
		Key:  server1Key,
	}
	appServer := &messengertypes.AppMessage_PushSetServer{
		Server: server,
	}

	err = db.SavePushServer(groupPK1, appServer)
	require.NoError(t, err)

	// check that the push server entry was created
	rec, err := db.GetPushServerRecord(groupPK1, server.Addr)
	require.NoError(t, err)
	require.NotNil(t, rec)
	require.Equal(t, groupPK1, rec.AccountPk)
	require.Equal(t, server1Addr, rec.ServerAddr)
	require.Equal(t, server1Key, rec.ServerKey)

	// update the push server entry
	server2 := &messengertypes.PushServer{
		Addr: server1Addr,
		Key:  server2Key,
	}
	appServer2 := &messengertypes.AppMessage_PushSetServer{
		Server: server2,
	}
	err = db.SavePushServer(groupPK1, appServer2)
	require.NoError(t, err)

	// check that the push server entry was updated
	rec, err = db.GetPushServerRecord(groupPK1, server.Addr)
	require.NoError(t, err)
	require.NotNil(t, rec)
	require.Equal(t, groupPK1, rec.AccountPk)
	require.Equal(t, server1Addr, rec.ServerAddr)
	require.Equal(t, server2Key, rec.ServerKey)
}

func Test_dbWrapper_GetPushMemberTokensForConversation(t *testing.T) {
	conversationPK := "conversation_pk"
	device1PK := "device1_pk"
	server1Addr := "server1_addr"
	server1Key := []byte("server2_key")
	token1 := []byte("token1")
	tokenID1 := messengerutil.MakeSharedPushIdentifier(server1Key, token1)
	device2PK := "device2_pk"
	server2Addr := "server2_addr"
	server2Key := []byte("server2_key")
	token2 := []byte("token2")
	tokenID2 := messengerutil.MakeSharedPushIdentifier(server2Key, token2)

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// test invalid input
	memberTokensErr, err := db.GetPushMemberTokensForConversation("")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, memberTokensErr)

	// test missing record
	memberTokensMiss, err := db.GetPushMemberTokensForConversation(conversationPK)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrNotFound))
	require.Nil(t, memberTokensMiss)

	// create the first push device token entry
	rec := &messengertypes.PushMemberToken{
		TokenId:               tokenID1,
		ConversationPublicKey: conversationPK,
		DevicePk:              device1PK,
		ServerAddr:            server1Addr,
		ServerKey:             server1Key,
		Token:                 token1,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// create the second push device token entry
	rec = &messengertypes.PushMemberToken{
		TokenId:               tokenID2,
		ConversationPublicKey: conversationPK,
		DevicePk:              device2PK,
		ServerAddr:            server2Addr,
		ServerKey:             server2Key,
		Token:                 token2,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// test getting records
	deviceTokens, err := db.GetPushMemberTokensForConversation(conversationPK)
	require.NoError(t, err)
	require.NotNil(t, deviceTokens)
	require.Len(t, deviceTokens, 2)

	require.Equal(t, tokenID1, deviceTokens[0].TokenId)
	require.Equal(t, conversationPK, deviceTokens[0].ConversationPublicKey)
	require.Equal(t, device1PK, deviceTokens[0].DevicePk)
	require.Equal(t, server1Addr, deviceTokens[0].ServerAddr)
	require.Equal(t, server1Key, deviceTokens[0].ServerKey)
	require.Equal(t, token1, deviceTokens[0].Token)

	require.Equal(t, tokenID2, deviceTokens[1].TokenId)
	require.Equal(t, conversationPK, deviceTokens[1].ConversationPublicKey)
	require.Equal(t, device2PK, deviceTokens[1].DevicePk)
	require.Equal(t, server2Addr, deviceTokens[1].ServerAddr)
	require.Equal(t, server2Key, deviceTokens[1].ServerKey)
	require.Equal(t, token2, deviceTokens[1].Token)
}

func Test_dbWrapper_GetPushMemberTokens(t *testing.T) {
	conversationPK := "conversation_pk"
	devicePK := "device_pk"
	server1Addr := "server1_addr"
	server1Key := []byte("server2_key")
	server2Addr := "server2_addr"
	server2Key := []byte("server2_key")
	token1 := []byte("token1")
	token2 := []byte("token2")
	tokenID1 := messengerutil.MakeSharedPushIdentifier(server1Key, token1)
	tokenID2 := messengerutil.MakeSharedPushIdentifier(server2Key, token2)

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// test invalid input
	memberTokensErr, err := db.GetPushMemberTokens("", devicePK)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, memberTokensErr)

	memberTokensErr, err = db.GetPushMemberTokens(conversationPK, "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, memberTokensErr)

	// test missing record
	memberTokensMiss, err := db.GetPushMemberTokens(conversationPK, devicePK)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrNotFound))
	require.Nil(t, memberTokensMiss)

	// create the first push device token entry
	rec := &messengertypes.PushMemberToken{
		TokenId:               tokenID1,
		ConversationPublicKey: conversationPK,
		DevicePk:              devicePK,
		ServerAddr:            server1Addr,
		ServerKey:             server1Key,
		Token:                 token1,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// create the second push device token entry
	rec = &messengertypes.PushMemberToken{
		ConversationPublicKey: conversationPK,
		TokenId:               tokenID2,
		DevicePk:              devicePK,
		ServerAddr:            server2Addr,
		ServerKey:             server2Key,
		Token:                 token2,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// test getting records
	tokens, err := db.GetPushMemberTokens(conversationPK, devicePK)
	require.NoError(t, err)
	require.NotNil(t, tokens)
	require.Len(t, tokens, 2)

	require.Equal(t, tokenID1, tokens[0].TokenId)
	require.Equal(t, conversationPK, tokens[0].ConversationPublicKey)
	require.Equal(t, devicePK, tokens[0].DevicePk)
	require.Equal(t, server1Addr, tokens[0].ServerAddr)
	require.Equal(t, server1Key, tokens[0].ServerKey)
	require.Equal(t, token1, tokens[0].Token)

	require.Equal(t, tokenID2, tokens[1].TokenId)
	require.Equal(t, conversationPK, tokens[1].ConversationPublicKey)
	require.Equal(t, devicePK, tokens[1].DevicePk)
	require.Equal(t, server2Addr, tokens[1].ServerAddr)
	require.Equal(t, server2Key, tokens[1].ServerKey)
	require.Equal(t, token2, tokens[1].Token)
}

func Test_dbWrapper_SavePushMemberToken(t *testing.T) {
	conversationPK := "conversation_pk"
	memberPK := "member_pk"
	devicePK := "device_pk"
	server1Addr := "server1_addr"
	server1Key := []byte("server1_key")
	server2Addr := "server2_addr"
	server2Key := []byte("server2_key")
	token1 := []byte("token1")
	token2 := []byte("token2")
	tokenID1 := messengerutil.MakeSharedPushIdentifier(server1Key, token1)
	tokenID2 := messengerutil.MakeSharedPushIdentifier(server2Key, token2)

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// test invalid input
	err := db.SavePushMemberToken("", conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   &messengertypes.PushServer{Addr: server1Addr, Key: server1Key},
			Token:    token1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushMemberToken(tokenID1, "", &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   &messengertypes.PushServer{Addr: server1Addr, Key: server1Key},
			Token:    token1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushMemberToken(tokenID1, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: nil,
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushMemberToken(tokenID1, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: "",
			Server:   &messengertypes.PushServer{Addr: server1Addr, Key: server1Key},
			Token:    token1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushMemberToken(tokenID1, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   nil,
			Token:    token1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushMemberToken(tokenID1, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   &messengertypes.PushServer{Addr: "", Key: server1Key},
			Token:    token1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushMemberToken(tokenID1, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   &messengertypes.PushServer{Addr: server1Addr, Key: nil},
			Token:    token1,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushMemberToken(tokenID1, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   &messengertypes.PushServer{Addr: server1Addr, Key: server1Key},
			Token:    nil,
		},
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	// test saving one record
	err = db.SavePushMemberToken(tokenID1, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   &messengertypes.PushServer{Addr: server1Addr, Key: server1Key},
			Token:    token1,
		},
	})
	require.NoError(t, err)

	// check if this entry is saved
	token, err := db.GetPushMemberToken(tokenID1)
	require.NoError(t, err)
	require.NotNil(t, token)

	require.Equal(t, tokenID1, token.TokenId)
	require.Equal(t, conversationPK, token.ConversationPublicKey)
	require.Equal(t, devicePK, token.DevicePk)
	require.Equal(t, server1Addr, token.ServerAddr)
	require.Equal(t, server1Key, token.ServerKey)
	require.Equal(t, token1, token.Token)

	// check if this entry is saved
	tokens, err := db.GetPushMemberTokens(conversationPK, devicePK)
	require.NoError(t, err)
	require.NotNil(t, tokens)
	require.Len(t, tokens, 1)

	require.Equal(t, conversationPK, tokens[0].ConversationPublicKey)
	require.Equal(t, devicePK, tokens[0].DevicePk)
	require.Equal(t, server1Addr, tokens[0].ServerAddr)
	require.Equal(t, server1Key, tokens[0].ServerKey)
	require.Equal(t, token1, tokens[0].Token)

	// try to update the token

	err = db.SavePushMemberToken(tokenID1, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   &messengertypes.PushServer{Addr: server1Addr, Key: server2Key},
			Token:    token2,
		},
	})
	require.NoError(t, err)

	// check if this entry is NOT updated
	token, err = db.GetPushMemberToken(tokenID1)
	require.NoError(t, err)
	require.NotNil(t, token)

	require.Equal(t, tokenID1, token.TokenId)
	require.Equal(t, conversationPK, token.ConversationPublicKey)
	require.Equal(t, devicePK, token.DevicePk)
	require.Equal(t, server1Addr, token.ServerAddr)
	require.Equal(t, server1Key, token.ServerKey)
	require.Equal(t, token1, token.Token)

	// test saving another record

	err = db.SavePushMemberToken(tokenID2, conversationPK, &messengertypes.AppMessage_PushSetMemberToken{
		MemberToken: &messengertypes.PushMemberTokenUpdate{
			DevicePk: devicePK,
			Server:   &messengertypes.PushServer{Addr: server2Addr, Key: server2Key},
			Token:    token2,
		},
	})
	require.NoError(t, err)

	// check the two entries
	tokens, err = db.GetPushMemberTokens(conversationPK, devicePK)
	require.NoError(t, err)
	require.NotNil(t, tokens)
	require.Len(t, tokens, 2)

	require.Equal(t, tokenID1, tokens[0].TokenId)
	require.Equal(t, conversationPK, tokens[0].ConversationPublicKey)
	require.Equal(t, devicePK, tokens[0].DevicePk)
	require.Equal(t, server1Addr, tokens[0].ServerAddr)
	require.Equal(t, server1Key, tokens[0].ServerKey)
	require.Equal(t, token1, tokens[0].Token)

	require.Equal(t, tokenID2, tokens[1].TokenId)
	require.Equal(t, conversationPK, tokens[1].ConversationPublicKey)
	require.Equal(t, devicePK, tokens[1].DevicePk)
	require.Equal(t, server2Addr, tokens[1].ServerAddr)
	require.Equal(t, server2Key, tokens[1].ServerKey)
	require.Equal(t, token2, tokens[1].Token)

	// test the relation between the conversation and the push member token
	_, err = db.AddConversation(conversationPK, memberPK, devicePK)
	conv, err := db.GetConversationByPK(conversationPK)
	require.NoError(t, err)
	require.NotNil(t, conv)
	require.Len(t, conv.PushMemberTokens, 2)

	require.Equal(t, tokenID1, conv.PushMemberTokens[0].TokenId)
	require.Equal(t, conversationPK, conv.PushMemberTokens[0].ConversationPublicKey)
	require.Equal(t, devicePK, conv.PushMemberTokens[0].DevicePk)
	require.Equal(t, server1Addr, conv.PushMemberTokens[0].ServerAddr)
	require.Equal(t, server1Key, conv.PushMemberTokens[0].ServerKey)
	require.Equal(t, token1, conv.PushMemberTokens[0].Token)

	require.Equal(t, conversationPK, conv.PushMemberTokens[1].ConversationPublicKey)
	require.Equal(t, devicePK, conv.PushMemberTokens[1].DevicePk)
	require.Equal(t, server2Addr, conv.PushMemberTokens[1].ServerAddr)
	require.Equal(t, server2Key, conv.PushMemberTokens[1].ServerKey)
	require.Equal(t, token2, conv.PushMemberTokens[1].Token)
}

func Test_dbWrapper_SaveServiceToken(t *testing.T) {
	accountPK := "account_pk"
	token1 := "token1"
	serviceType1 := "service_type_1"
	serviceAddr1 := "service_addr_1"
	authenticationURL1 := "authentication_url_1"
	token2 := "token2"
	serviceType2 := "service_type_2"
	serviceAddr2 := "service_addr_2"
	authenticationURL2 := "authentication_url_2"

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	db.db.Create(&messengertypes.Account{PublicKey: accountPK})

	// test invalid input
	err := db.AddServiceToken(accountPK, &messengertypes.AppMessage_ServiceAddToken{})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.AddServiceToken(accountPK, &messengertypes.AppMessage_ServiceAddToken{
		Token: "",
		SupportedServices: []*messengertypes.ServiceTokenSupportedService{
			{
				Type:    serviceType1,
				Address: serviceAddr1,
			},
		},
		AuthenticationUrl: authenticationURL1,
		Expiration:        0,
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.AddServiceToken(accountPK, &messengertypes.AppMessage_ServiceAddToken{
		Token:             token1,
		SupportedServices: nil,
		AuthenticationUrl: authenticationURL1,
		Expiration:        0,
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.AddServiceToken(accountPK, &messengertypes.AppMessage_ServiceAddToken{
		Token:             token1,
		SupportedServices: []*messengertypes.ServiceTokenSupportedService{},
		AuthenticationUrl: authenticationURL1,
		Expiration:        0,
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.AddServiceToken(accountPK, &messengertypes.AppMessage_ServiceAddToken{
		Token: token1,
		SupportedServices: []*messengertypes.ServiceTokenSupportedService{
			{
				Type:    serviceType1,
				Address: serviceAddr1,
			},
		},
		AuthenticationUrl: "",
		Expiration:        0,
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	// test saving one record
	serviceToken1 := &messengertypes.AppMessage_ServiceAddToken{
		Token: token1,
		SupportedServices: []*messengertypes.ServiceTokenSupportedService{
			{
				Type:    serviceType1,
				Address: serviceAddr1,
			},
		},
		AuthenticationUrl: authenticationURL1,
		Expiration:        0,
	}
	err = db.AddServiceToken(accountPK, serviceToken1)
	require.NoError(t, err)

	// check if this entry is saved
	token, err := db.GetServiceToken(accountPK, serviceToken1.TokenID())
	require.NoError(t, err)
	require.NotNil(t, token)

	require.Equal(t, token.TokenId, serviceToken1.TokenID())
	require.Equal(t, token.Token, token1)
	require.Len(t, token.SupportedServices, 1)
	require.Equal(t, token.SupportedServices[0].Type, serviceType1)
	require.Equal(t, token.SupportedServices[0].Address, serviceAddr1)
	require.Equal(t, token.AuthenticationUrl, authenticationURL1)
	require.Equal(t, token.Expiration, int64(0))

	// update the token
	serviceToken1 = &messengertypes.AppMessage_ServiceAddToken{
		Token: token1,
		SupportedServices: []*messengertypes.ServiceTokenSupportedService{
			{
				Type:    serviceType1,
				Address: serviceAddr2,
			},
		},
		AuthenticationUrl: authenticationURL1,
		Expiration:        1,
	}
	err = db.AddServiceToken(accountPK, serviceToken1)
	require.NoError(t, err)

	// check if this entry is updated
	token, err = db.GetServiceToken(accountPK, serviceToken1.TokenID())
	require.NoError(t, err)
	require.NotNil(t, token)

	require.Equal(t, token.TokenId, serviceToken1.TokenID())
	require.Equal(t, token.Token, token1)
	require.Len(t, token.SupportedServices, 1)
	require.Equal(t, token.SupportedServices[0].Type, serviceType1)
	require.Equal(t, token.SupportedServices[0].Address, serviceAddr2)
	require.Equal(t, token.AuthenticationUrl, authenticationURL1)
	require.Equal(t, token.Expiration, int64(1))

	// test saving another record

	serviceToken2 := &messengertypes.AppMessage_ServiceAddToken{
		Token: token2,
		SupportedServices: []*messengertypes.ServiceTokenSupportedService{
			{
				Type:    serviceType2,
				Address: serviceAddr2,
			},
		},
		AuthenticationUrl: authenticationURL2,
		Expiration:        0,
	}

	err = db.AddServiceToken(accountPK, serviceToken2)
	require.NoError(t, err)

	// check the second entry
	token, err = db.GetServiceToken(accountPK, serviceToken2.TokenID())
	require.NoError(t, err)
	require.NotNil(t, token)

	require.Equal(t, token.TokenId, serviceToken2.TokenID())
	require.Equal(t, token.Token, token2)
	require.Len(t, token.SupportedServices, 1)
	require.Equal(t, token.SupportedServices[0].Type, serviceType2)
	require.Equal(t, token.SupportedServices[0].Address, serviceAddr2)
	require.Equal(t, token.AuthenticationUrl, authenticationURL2)
	require.Equal(t, token.Expiration, int64(0))

	// check all entries
	tokens, err := db.GetServiceTokens(accountPK)
	require.NoError(t, err)
	require.NotNil(t, tokens)
	require.Len(t, tokens, 2)

	require.Equal(t, tokens[0].TokenId, serviceToken1.TokenID())
	require.Equal(t, tokens[0].Token, token1)
	require.Len(t, tokens[0].SupportedServices, 1)
	require.Equal(t, tokens[0].SupportedServices[0].Type, serviceType1)
	require.Equal(t, tokens[0].SupportedServices[0].Address, serviceAddr2)
	require.Equal(t, tokens[0].AuthenticationUrl, authenticationURL1)
	require.Equal(t, tokens[0].Expiration, int64(1))

	require.Equal(t, tokens[1].TokenId, serviceToken2.TokenID())
	require.Equal(t, tokens[1].Token, token2)
	require.Len(t, tokens[1].SupportedServices, 1)
	require.Equal(t, tokens[1].SupportedServices[0].Type, serviceType2)
	require.Equal(t, tokens[1].SupportedServices[0].Address, serviceAddr2)
	require.Equal(t, tokens[1].AuthenticationUrl, authenticationURL2)
	require.Equal(t, tokens[1].Expiration, int64(0))

	// test the relation between the account and the service token
	acc, err := db.GetAccount()
	require.NoError(t, err)
	require.NotNil(t, acc)

	tokens = acc.ServiceTokens
	require.Len(t, tokens, 2)

	require.Equal(t, tokens[0].TokenId, serviceToken1.TokenID())
	require.Equal(t, tokens[0].Token, token1)
	require.Len(t, tokens[0].SupportedServices, 1)
	require.Equal(t, tokens[0].SupportedServices[0].Type, serviceType1)
	require.Equal(t, tokens[0].SupportedServices[0].Address, serviceAddr2)
	require.Equal(t, tokens[0].AuthenticationUrl, authenticationURL1)
	require.Equal(t, tokens[0].Expiration, int64(1))

	require.Equal(t, tokens[1].TokenId, serviceToken2.TokenID())
	require.Equal(t, tokens[1].Token, token2)
	require.Len(t, tokens[1].SupportedServices, 1)
	require.Equal(t, tokens[1].SupportedServices[0].Type, serviceType2)
	require.Equal(t, tokens[1].SupportedServices[0].Address, serviceAddr2)
	require.Equal(t, tokens[1].AuthenticationUrl, authenticationURL2)
	require.Equal(t, tokens[1].Expiration, int64(0))
}

func Test_dbWrapper_GetServiceToken(t *testing.T) {
	accountPK := "account_pk"
	tokenID1 := "token_id_1"
	token1 := "token1"
	serviceType1 := "service_type_1"
	serviceAddr1 := "service_addr_1"
	authenticationURL1 := "authentication_url_1"
	tokenID2 := "token_id_2"
	token2 := "token2"
	serviceType2 := "service_type_2"
	serviceAddr2 := "service_addr_2"
	authenticationURL2 := "authentication_url_2"

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	db.db.Create(&messengertypes.Account{PublicKey: accountPK})

	// test invalid input
	serviceTokenErr, err := db.GetServiceToken("", tokenID1)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, serviceTokenErr)

	serviceTokenErr, err = db.GetServiceToken(accountPK, "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))
	require.Nil(t, serviceTokenErr)

	// test missing record
	serviceTokenMiss, err := db.GetServiceToken(accountPK, "invalid_token_id")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrNotFound))
	require.Nil(t, serviceTokenMiss)

	// create the first service token entry
	rec := &messengertypes.ServiceToken{
		AccountPk: accountPK,
		TokenId:   tokenID1,
		Token:     token1,
		SupportedServices: []*messengertypes.ServiceTokenSupportedServiceRecord{
			{
				Type:    serviceType1,
				Address: serviceAddr1,
			},
		},
		AuthenticationUrl: authenticationURL1,
		Expiration:        0,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// create the second device token entry
	rec = &messengertypes.ServiceToken{
		AccountPk: accountPK,
		TokenId:   tokenID2,
		Token:     token2,
		SupportedServices: []*messengertypes.ServiceTokenSupportedServiceRecord{
			{
				Type:    serviceType2,
				Address: serviceAddr2,
			},
		},
		AuthenticationUrl: authenticationURL2,
		Expiration:        1,
	}

	err = db.db.Create(rec).Error
	require.NoError(t, err)

	// test getting records
	serviceToken1, err := db.GetServiceToken(accountPK, tokenID1)
	require.NoError(t, err)
	require.NotNil(t, serviceToken1)
	require.Equal(t, serviceToken1.AccountPk, accountPK)
	require.Equal(t, serviceToken1.TokenId, tokenID1)
	require.Equal(t, serviceToken1.Token, token1)
	require.Len(t, serviceToken1.SupportedServices, 1)
	require.Equal(t, serviceToken1.SupportedServices[0].Type, serviceType1)
	require.Equal(t, serviceToken1.SupportedServices[0].Address, serviceAddr1)
	require.Equal(t, serviceToken1.AuthenticationUrl, authenticationURL1)
	require.Equal(t, serviceToken1.Expiration, int64(0))

	serviceToken2, err := db.GetServiceToken(accountPK, tokenID2)
	require.NoError(t, err)
	require.NotNil(t, serviceToken2)
	require.Equal(t, serviceToken2.AccountPk, accountPK)
	require.Equal(t, serviceToken2.TokenId, tokenID2)
	require.Equal(t, serviceToken2.Token, token2)
	require.Len(t, serviceToken2.SupportedServices, 1)
	require.Equal(t, serviceToken2.SupportedServices[0].Type, serviceType2)
	require.Equal(t, serviceToken2.SupportedServices[0].Address, serviceAddr2)
	require.Equal(t, serviceToken2.AuthenticationUrl, authenticationURL2)
	require.Equal(t, serviceToken2.Expiration, int64(1))
}

func Test_dbWrapper_SavePushLocalDeviceSharedToken(t *testing.T) {
	conversationPK := "conversation_pk"
	memberPK := "member_pk"
	devicePK := "device_pk"
	tokenID1 := "token_id_1"
	tokenID2 := "token_id_2"

	db, _, dispose := GetInMemoryTestDB(t)
	defer dispose()

	// test invalid input
	err := db.SavePushLocalDeviceSharedToken("", conversationPK)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	err = db.SavePushLocalDeviceSharedToken(tokenID1, "")
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrInvalidInput))

	// test saving one record
	err = db.SavePushLocalDeviceSharedToken(tokenID1, conversationPK)
	require.NoError(t, err)

	// check if this entry is saved
	tokens, err := db.GetPushSharedLocalDeviceTokens(conversationPK)
	require.NoError(t, err)
	require.NotNil(t, tokens)
	require.Len(t, tokens, 1)

	require.Equal(t, tokenID1, tokens[0].TokenId)
	require.Equal(t, conversationPK, tokens[0].ConversationPublicKey)

	// test adding another record
	err = db.SavePushLocalDeviceSharedToken(tokenID2, conversationPK)
	require.NoError(t, err)

	// check to get the two entries
	tokens, err = db.GetPushSharedLocalDeviceTokens(conversationPK)
	require.NoError(t, err)
	require.NotNil(t, tokens)
	require.Len(t, tokens, 2)

	require.Equal(t, tokenID1, tokens[0].TokenId)
	require.Equal(t, conversationPK, tokens[0].ConversationPublicKey)
	require.Equal(t, tokenID2, tokens[1].TokenId)
	require.Equal(t, conversationPK, tokens[1].ConversationPublicKey)

	// test the relation between the conversation and the local shared push device tokens
	_, err = db.AddConversation(conversationPK, memberPK, devicePK)
	conv, err := db.GetConversationByPK(conversationPK)
	require.NoError(t, err)
	require.NotNil(t, conv)
	require.Len(t, conv.PushLocalDeviceSharedTokens, 2)

	require.Equal(t, tokenID1, conv.PushLocalDeviceSharedTokens[0].TokenId)
	require.Equal(t, conversationPK, conv.PushLocalDeviceSharedTokens[0].ConversationPublicKey)

	require.Equal(t, tokenID2, conv.PushLocalDeviceSharedTokens[1].TokenId)
	require.Equal(t, conversationPK, conv.PushLocalDeviceSharedTokens[1].ConversationPublicKey)
}
