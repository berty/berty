package bertymessenger

import (
	"errors"
	"fmt"
	"testing"

	"github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type getInMemoryTestDBOpts int32

const (
	getInMemoryTestDBOptsUndefined = iota
	getInMemoryTestDBOptsNoInit
)

var _ = getInMemoryTestDBOptsUndefined

func getInMemoryTestDB(t testing.TB, opts ...getInMemoryTestDBOpts) (*dbWrapper, func()) {
	t.Helper()

	init := true
	for _, o := range opts {
		if o == getInMemoryTestDBOptsNoInit {
			init = false
		}
	}

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}

	wrappedDB := &dbWrapper{db: db}

	if init {
		if err := wrappedDB.initDB(); err != nil {
			t.Fatal(err)
		}
	}

	d, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}

	return wrappedDB, func() { _ = d.Close() }
}

func Test_dbWrapper_addConversation(t *testing.T) {
	groupPK1 := "group_pk"
	groupPK2 := "group_pk_2"

	db, dispose := getInMemoryTestDB(t)
	defer dispose()

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

	dev, err := db.getDeviceByPK(pk1)
	require.Error(t, err)
	require.True(t, errors.Is(err, gorm.ErrRecordNotFound))
	_ = dev

	refDev := Device{
		PublicKey:      pk1,
		OwnerPublicKey: "ownerPK1",
	}

	db.db.Create(refDev)

	dev, err = db.getDeviceByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refDev.PublicKey, dev.PublicKey)
	require.Equal(t, refDev.OwnerPublicKey, dev.OwnerPublicKey)

	db.db.Create(&Device{
		PublicKey:      "pk2",
		OwnerPublicKey: "ownerPK2",
	})

	dev, err = db.getDeviceByPK(pk1)
	require.NoError(t, err)
	require.Equal(t, refDev.PublicKey, dev.PublicKey)
	require.Equal(t, refDev.OwnerPublicKey, dev.OwnerPublicKey)
}

func Test_dbWrapper_getContactByPK(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	pk1 := "pk1"

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
		PublicKey:      "pk2",
		OwnerPublicKey: "ownerPK2",
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

	acc, err := db.addAccount("", "http://url1/")
	require.Error(t, err)
	require.Empty(t, acc)

	acc, err = db.addAccount("pk_1", "http://url1/")
	require.NoError(t, err)
	require.NotEmpty(t, acc)
	require.Equal(t, "pk_1", acc.PublicKey)
	require.Equal(t, "http://url1/", acc.Link)
	require.Equal(t, Account_NotReady, acc.State)

	acc, err = db.addAccount("pk_1", "http://url2/")
	require.NoError(t, err)
	require.NotEmpty(t, acc)
	require.Equal(t, "pk_1", acc.PublicKey)
	require.Equal(t, "http://url1/", acc.Link)
	require.Equal(t, Account_NotReady, acc.State)
}

func Test_dbWrapper_addContactRequestIncomingReceived(t *testing.T) {
	var (
		db, dispose  = getInMemoryTestDB(t)
		contact1PK   = "contactPK1"
		contact1Name = "contactName1"
	)

	defer dispose()

	contact, err := db.addContactRequestIncomingReceived(contact1PK, contact1Name)
	require.NoError(t, err)
	require.NotEmpty(t, contact)
	require.Equal(t, contact1PK, contact.PublicKey)
	require.Equal(t, contact1Name, contact.DisplayName)

	createdDate := contact.CreatedDate

	contact, err = db.addContactRequestIncomingReceived(contact1PK, "contact1OtherName")
	require.NoError(t, err)
	require.NotEmpty(t, contact)
	require.Equal(t, contact1PK, contact.PublicKey)
	require.Equal(t, contact1Name, contact.DisplayName)
	require.Equal(t, createdDate, contact.CreatedDate)
}

func Test_dbWrapper_addContactRequestIncomingAccepted(t *testing.T) {
	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	contact, conversation, err := db.addContactRequestIncomingAccepted("contact_1", "group_1")
	require.Error(t, err)
	require.Empty(t, contact)
	require.Empty(t, conversation)
}

func Test_dbWrapper_addContactRequestOutgoingEnqueued(t *testing.T) {
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

	contact, err = db.addContactRequestOutgoingEnqueued(contactPK, displayName, convPK)
	require.NoError(t, err)
	require.NotNil(t, contact)
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
}

func Test_dbWrapper_addDevice(t *testing.T) {
}

func Test_dbWrapper_addInteraction(t *testing.T) {
}

func Test_dbWrapper_addMember(t *testing.T) {
}

func Test_dbWrapper_attributeBacklogInteractions(t *testing.T) {
}

func Test_dbWrapper_dbModelRowsCount(t *testing.T) {
}

func Test_dbWrapper_deleteInteractions(t *testing.T) {
}

func Test_dbWrapper_getAccount(t *testing.T) {
	refAccount := &Account{
		PublicKey: "pk1",
		Link:      "https://link1/",
		State:     Account_NotReady,
	}
	refOtherAccount := &Account{
		PublicKey: "pk2",
		Link:      "https://link2/",
		State:     Account_NotReady,
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
	require.Equal(t, refAccount.State, acc.State)
	require.Equal(t, refAccount.Link, acc.Link)

	db.db.Create(refOtherAccount)
	acc, err = db.getAccount()
	require.Error(t, err)
	require.True(t, errors.Is(err, errcode.ErrDBMultipleRecords))
	require.Empty(t, acc)
}

func Test_dbWrapper_getAccountByPK(t *testing.T) {
	refAccount := &Account{
		PublicKey: "pk1",
		Link:      "https://link1/",
		State:     Account_NotReady,
	}

	db, dispose := getInMemoryTestDB(t)
	defer dispose()

	acc, err := db.getAccountByPK(refAccount.PublicKey)
	require.Error(t, err)
	require.True(t, errors.Is(err, gorm.ErrRecordNotFound))
	require.Empty(t, acc)

	db.db.Create(refAccount)

	acc, err = db.getAccountByPK(refAccount.PublicKey)
	require.NoError(t, err)
	require.Equal(t, refAccount.PublicKey, acc.PublicKey)
	require.Equal(t, refAccount.State, acc.State)
	require.Equal(t, refAccount.Link, acc.Link)
}

func Test_dbWrapper_getAcknowledgementsCIDsForInteraction(t *testing.T) {
}

func Test_dbWrapper_getAllContacts(t *testing.T) {
}

func Test_dbWrapper_getAllConversations(t *testing.T) {
}

func Test_dbWrapper_getAllInteractions(t *testing.T) {
}

func Test_dbWrapper_getAllMembers(t *testing.T) {
}

func Test_dbWrapper_getContactsByState(t *testing.T) {
}

func Test_dbWrapper_getConversationByPK(t *testing.T) {
}

func Test_dbWrapper_getDBInfo(t *testing.T) {
}

func Test_dbWrapper_getMemberByPK(t *testing.T) {
}

func Test_dbWrapper_initDB(t *testing.T) {
	db, dispose := getInMemoryTestDB(t, getInMemoryTestDBOptsNoInit)
	defer dispose()

	tables := []string(nil)

	err := db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.Empty(t, tables)

	err = db.initDB()
	require.NoError(t, err)

	err = db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error
	require.NoError(t, err)
	require.NotEmpty(t, tables)
}

func Test_dbWrapper_markInteractionAsAcknowledged(t *testing.T) {
}

func Test_dbWrapper_setConversationIsOpenStatus(t *testing.T) {
}

func Test_dbWrapper_tx(t *testing.T) {
}

func Test_dbWrapper_updateAccount(t *testing.T) {
}

func Test_dbWrapper_updateContact(t *testing.T) {
}

func Test_dbWrapper_updateConversation(t *testing.T) {
}

func Test_dbWrapper_updateConversationReadState(t *testing.T) {
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
