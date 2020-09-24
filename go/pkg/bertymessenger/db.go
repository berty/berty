package bertymessenger

import (
	"errors"
	"fmt"
	"time"

	"github.com/mattn/go-sqlite3"
	"go.uber.org/multierr"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type dbWrapper struct {
	db *gorm.DB
}

func (d *dbWrapper) initDB() error {
	return d.db.AutoMigrate([]interface{}{
		&Conversation{},
		&Account{},
		&Contact{},
		&Interaction{},
		&Member{},
		&Device{},
	}...)
}

func (d *dbWrapper) dbModelRowsCount(model interface{}) (int64, error) {
	var count int64
	return count, d.db.Model(model).Count(&count).Error
}

func dropAllTables(db *gorm.DB) error {
	tables := []string(nil)
	if err := db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error; err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	for _, table := range tables {
		if err := db.Migrator().DropTable(table); err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}
	}

	return nil
}

func isSQLiteError(err error, sqliteErr sqlite3.ErrNo) bool {
	e, ok := err.(sqlite3.Error)
	if !ok {
		return false
	}

	return e.Code == sqliteErr
}

func (d *dbWrapper) tx(txFunc func(*dbWrapper) error) error {
	// Use this to propagate scope, ie. opened account
	return d.db.Transaction(func(tx *gorm.DB) error {
		return txFunc(&dbWrapper{
			db: tx,
		})
	})
}

func (d *dbWrapper) addConversationForContact(groupPK, contactPK string) (Conversation, error) {
	conversation := Conversation{
		PublicKey:        groupPK,
		ContactPublicKey: contactPK,
		Type:             Conversation_ContactType,
		DisplayName:      "", // empty on account conversations
		Link:             "", // empty on account conversations
		CreatedDate:      timestampMs(time.Now()),
	}

	if err := d.db.
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "public_key"}},
			DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
		}).
		Create(&conversation).
		Error; err != nil {
		return Conversation{}, err
	}

	return conversation, nil
}

func (d *dbWrapper) addConversation(groupPK string) (Conversation, error) {
	conversation := Conversation{
		PublicKey:   groupPK,
		Type:        Conversation_MultiMemberType,
		CreatedDate: timestampMs(time.Now()),
	}

	if err := d.db.Create(&conversation).Error; err != nil {
		if isSQLiteError(err, sqlite3.ErrConstraint) {
			return Conversation{}, errcode.ErrDBEntryAlreadyExists.Wrap(err)
		}

		return Conversation{}, errcode.ErrDBWrite.Wrap(err)
	}

	return conversation, nil
}

func (d *dbWrapper) updateConversation(c Conversation) error {
	cl := clause.OnConflict{ // Maybe DoNothing ?
		Columns:   []clause.Column{{Name: "public_key"}},
		DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
	}
	if err := d.db.Clauses(cl).Create(&c).Error; err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func (d *dbWrapper) updateConversationReadState(pk string, newUnread bool, eventDate time.Time) error {
	updates := map[string]interface{}{
		"last_update": timestampMs(eventDate),
	}

	// if conv is not open, increment the unread_count
	if newUnread {
		updates["unread_count"] = gorm.Expr("unread_count + 1")
	}

	// db update
	tx := d.db.Model(&Conversation{}).Where(&Conversation{PublicKey: pk}).Updates(updates)

	if tx.Error != nil {
		return tx.Error
	}

	if tx.RowsAffected == 0 {
		return errcode.ErrDBWrite.Wrap(fmt.Errorf("record not found"))
	}

	return nil
}

func (d *dbWrapper) addAccount(pk, url string) (Account, error) {
	acc := Account{
		PublicKey: pk,
		Link:      url,
		State:     Account_NotReady,
	}

	if pk == "" {
		return Account{}, errcode.ErrInvalidInput.Wrap(fmt.Errorf("pk cannot be nil"))
	}

	if err := d.db.Create(&acc).Error; isSQLiteError(err, sqlite3.ErrConstraint) {
		return d.getAccountByPK(pk)
	} else if err != nil {
		return Account{}, err
	}

	return acc, nil
}

func (d *dbWrapper) updateAccount(pk, url, displayName string) (Account, error) {
	acc := Account{}

	values := map[string]interface{}{}
	if url != "" {
		values["link"] = url
	}

	if displayName != "" {
		values["display_name"] = displayName
		values["state"] = Account_Ready
	}

	tx := d.db.Model(&Account{}).Where(&Account{PublicKey: pk}).Updates(values).First(&acc)
	if tx.Error != nil {
		return acc, tx.Error
	}

	return acc, nil
}

func (d *dbWrapper) getAccount() (Account, error) {
	var (
		account Account
		count   int64
	)

	d.db.Model(&Account{}).Count(&count)
	if count > 1 {
		return Account{}, errcode.ErrDBMultipleRecords
	}

	return account, d.db.First(&account).Error
}

func (d *dbWrapper) getAccountByPK(publicKey string) (Account, error) {
	account := Account{}
	err := d.db.First(&account, &Account{PublicKey: publicKey}).Error

	return account, err
}

func (d *dbWrapper) getDeviceByPK(publicKey string) (Device, error) {
	device := Device{}
	err := d.db.First(&device, &Device{PublicKey: publicKey}).Error

	return device, err
}

func (d *dbWrapper) getContactByPK(publicKey string) (Contact, error) {
	contact := Contact{}
	err := d.db.First(&contact, &Contact{PublicKey: publicKey}).Error

	return contact, err
}

func (d *dbWrapper) getConversationByPK(publicKey string) (Conversation, error) {
	conversation := Conversation{}
	err := d.db.First(&conversation, &Conversation{PublicKey: publicKey}).Error

	return conversation, err
}

func (d *dbWrapper) getAllConversations() ([]Conversation, error) {
	convs := []Conversation(nil)
	err := d.db.Find(&convs).Error

	return convs, err
}

func (d *dbWrapper) getAllMembers() ([]Member, error) {
	members := []Member(nil)
	err := d.db.Find(&members).Error

	return members, err
}

func (d *dbWrapper) getAllContacts() ([]Contact, error) {
	contacts := []Contact(nil)
	err := d.db.Find(&contacts).Error

	return contacts, err
}

func (d *dbWrapper) getContactsByState(state Contact_State) ([]Contact, error) {
	contacts := []Contact(nil)
	err := d.db.Where(&Contact{State: state}).Find(&contacts).Error

	return contacts, err
}

func (d *dbWrapper) getAllInteractions() ([]Interaction, error) {
	interactions := []Interaction(nil)
	err := d.db.Find(&interactions).Error

	return interactions, err
}

func (d *dbWrapper) getInteractionByCID(cid string) (Interaction, error) {
	var interaction Interaction
	return interaction, d.db.First(&interaction, &Interaction{CID: cid}).Error
}

func (d *dbWrapper) getMemberByPK(publicKey string) (Member, error) {
	var member Member
	err := d.db.First(&member, &Member{PublicKey: publicKey}).Error

	return member, err
}

func (d *dbWrapper) addContactRequestOutgoingEnqueued(contactPK, displayName, convPK string) (Contact, error) {
	contact := Contact{
		PublicKey:             contactPK,
		DisplayName:           displayName,
		State:                 Contact_OutgoingRequestEnqueued,
		CreatedDate:           timestampMs(time.Now()),
		ConversationPublicKey: convPK,
	}

	tx := d.db.Where(&Contact{PublicKey: contactPK}).FirstOrCreate(&contact)

	// if tx.Error == nil && tx.RowsAffected == 0 {
	// Maybe update DisplayName in some cases?
	// TODO: better handle case where the state is "IncomingRequest", should end up as in "Established" state in this case IMO
	// }

	return contact, tx.Error
}

func (d *dbWrapper) addContactRequestOutgoingSent(contactPK string) (Contact, error) {
	contact := Contact{}

	if tx := d.db.
		Where(&Contact{
			PublicKey: contactPK,
			State:     Contact_OutgoingRequestEnqueued,
		}).
		Updates(&Contact{
			SentDate: timestampMs(time.Now()),
			State:    Contact_OutgoingRequestSent,
		}); tx.Error != nil {
		return Contact{}, tx.Error
	} else if tx.RowsAffected == 0 {
		return Contact{}, errcode.ErrDBAddContactRequestOutgoingSent.Wrap(fmt.Errorf("nothing found"))
	}

	err := d.db.Where(&Contact{PublicKey: contactPK}).First(&contact).Error

	return contact, err
}

func (d *dbWrapper) addContactRequestIncomingReceived(contactPK, displayName string) (Contact, error) {
	contact := Contact{
		DisplayName: displayName,
		PublicKey:   contactPK,
		State:       Contact_IncomingRequest,
		CreatedDate: timestampMs(time.Now()),
	}

	if err := d.db.
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(&contact).
		Error; isSQLiteError(err, sqlite3.ErrConstraint) {
		return d.getContactByPK(contactPK)
	} else if err != nil {
		return Contact{}, errcode.ErrDBWrite.Wrap(err)
	}

	return d.getContactByPK(contactPK)
}

func (d *dbWrapper) addContactRequestIncomingAccepted(contactPK, groupPK string) (Contact, Conversation, error) {
	contact := Contact{
		PublicKey: contactPK,
		State:     Contact_IncomingRequest,
	}
	conversation := Conversation{
		PublicKey:        groupPK,
		Type:             Conversation_ContactType,
		ContactPublicKey: contactPK,
		DisplayName:      "", // empty on account conversations
		Link:             "", // empty on account conversations
		CreatedDate:      timestampMs(time.Now()),
	}

	if err := d.db.Transaction(func(db *gorm.DB) error {
		tx := db.Where(&Contact{
			PublicKey: contactPK,
			State:     Contact_IncomingRequest,
		}).Updates(&Contact{
			State:                 Contact_Established,
			ConversationPublicKey: groupPK,
		})

		if tx.RowsAffected != 1 {
			return errcode.ErrInvalidInput.Wrap(errors.New("no incoming request"))
		}

		tx.First(&contact)

		return db.
			Clauses(clause.OnConflict{DoNothing: true}).
			Create(&conversation).
			Error
	}); err != nil {
		return Contact{}, Conversation{}, err
	}

	return contact, conversation, nil
}

func (d *dbWrapper) markInteractionAsAcknowledged(cid string) (bool, error) {
	tx := d.db.Model(&Interaction{}).Where(&Interaction{
		CID: cid,
	}).Update("acknowledged", true)

	return tx.RowsAffected == 1, tx.Error
}

func (d *dbWrapper) getAcknowledgementsCIDsForInteraction(cid string) ([]string, error) {
	var cids []string

	if err := d.db.Model(&Interaction{}).Where(&Interaction{
		Type:      AppMessage_TypeAcknowledge,
		TargetCID: cid,
	}).Pluck("cid", &cids).Error; err != nil {
		return nil, err
	}

	return cids, nil
}

func (d *dbWrapper) deleteInteractions(cids []string) error {
	return d.db.Model(&Interaction{}).Delete(&Interaction{}, &cids).Error
}

func (d *dbWrapper) getDBInfo() (*SystemInfo_DB, error) {
	var err error
	infos := &SystemInfo_DB{}

	infos.Accounts, err = d.dbModelRowsCount(Account{})
	err = multierr.Append(err, err)

	infos.Contacts, err = d.dbModelRowsCount(Contact{})
	err = multierr.Append(err, err)

	infos.Interactions, err = d.dbModelRowsCount(Interaction{})
	err = multierr.Append(err, err)

	infos.Conversations, err = d.dbModelRowsCount(Conversation{})
	err = multierr.Append(err, err)

	infos.Members, err = d.dbModelRowsCount(Member{})
	err = multierr.Append(err, err)

	infos.Devices, err = d.dbModelRowsCount(Device{})
	err = multierr.Append(err, err)

	return infos, err
}

func (d *dbWrapper) addDevice(devicePK string, memberPK string) (Device, error) {
	if err := d.db.
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "public_key"}},
			DoNothing: true,
		}).
		Create(&Device{
			PublicKey:      devicePK,
			OwnerPublicKey: memberPK,
		}).
		Error; err != nil {
		return Device{}, err
	}

	return d.getDeviceByPK(devicePK)
}

func (d *dbWrapper) updateContact(contact Contact) error {
	return d.db.Updates(&contact).Error
}

func (d *dbWrapper) addInteraction(i Interaction) (Interaction, error) {
	// Clauses(clause.OnConflict{
	// 	Columns:   []clause.Column{{Name: "c_id"}},
	// 	DoNothing: true,
	// }).
	// 	Create(&i).
	// 	Error

	if err := d.db.Create(i).Error; err != nil {
		return Interaction{}, err
	}

	if err := d.db.First(&i, &Interaction{CID: i.CID}).Error; err != nil {
		return Interaction{}, err
	}

	return i, nil
}

func (d *dbWrapper) attributeBacklogInteractions(devicePK, groupPK, memberPK string) ([]*Interaction, error) {
	var (
		backlog []*Interaction
		cids    []string
	)

	if err := d.db.
		Order("arrival_index asc").
		Where("device_public_key = ? AND conversation_public_key = ? AND member_public_key = ?", devicePK, groupPK, "").
		Pluck("cid", &cids).
		Update("member_public_key", memberPK).
		Error; err != nil {
		return nil, err
	}

	if err := d.db.Find(&backlog, cids).Error; err != nil {
		return nil, err
	}

	return backlog, nil
}

func (d *dbWrapper) addMember(memberPK, groupPK, displayName string) (*Member, error) {
	onConflict := clause.OnConflict{
		Columns:   []clause.Column{{Name: "public_key"}},
		DoUpdates: clause.AssignmentColumns([]string{"display_name"}),
	}

	if displayName == "" {
		nameSuffix := "1337"
		if len(memberPK) >= 4 {
			nameSuffix = memberPK[:4]
		}
		displayName = "anon#" + nameSuffix

		onConflict = clause.OnConflict{
			Columns:   []clause.Column{{Name: "public_key"}},
			DoNothing: true,
		}
	}

	member := &Member{
		PublicKey:             memberPK,
		ConversationPublicKey: groupPK,
		DisplayName:           displayName,
	}

	return member, d.db.Clauses(&onConflict).Create(&member).Error
}

func (d *dbWrapper) setConversationIsOpenStatus(conversationPK string, status bool) (bool, error) {
	values := map[string]interface{}{
		"is_open": status,
	}

	if status == true {
		values["unread_count"] = 0
	}

	tx := d.db.
		Model(&Conversation{}).
		Where(&Conversation{PublicKey: conversationPK}).
		Where("is_open", !status).
		Updates(values)

	return tx.RowsAffected > 0, tx.Error
}
