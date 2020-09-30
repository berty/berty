package bertymessenger

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/mattn/go-sqlite3"
	"go.uber.org/multierr"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type dbWrapper struct {
	db *gorm.DB
}

func newDBWrapper(db *gorm.DB) *dbWrapper {
	if db.Logger != nil {
		db.Logger = &dbLogWrapper{Interface: db.Logger}
	}

	return &dbWrapper{
		db: db,
	}
}

func (d *dbWrapper) initDB() error {
	return d.db.AutoMigrate([]interface{}{
		&Conversation{},
		&Account{},
		&ServiceToken{},
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
		return txFunc(&dbWrapper{db: tx})
	})
}

func (d *dbWrapper) addConversationForContact(groupPK, contactPK string) (*Conversation, error) {
	if groupPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no conversation public key specified"))
	}

	if contactPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no contact public key specified"))
	}

	if err := d.tx(func(tx *dbWrapper) error {
		conversation := &Conversation{
			PublicKey:        groupPK,
			ContactPublicKey: contactPK,
			Type:             Conversation_ContactType,
			DisplayName:      "", // empty on account conversations
			Link:             "", // empty on account conversations
			CreatedDate:      timestampMs(time.Now()),
		}

		// Check if a conversation already exists for this contact with another pk (or for this conversation pk and another contact)
		{
			count := int64(0)

			if err := tx.db.
				Model(&Conversation{}).
				Where("(contact_public_key == ? AND public_key != ?) OR (contact_public_key != ? AND public_key == ?)", contactPK, groupPK, contactPK, groupPK).
				Count(&count).
				Error; err != nil {
				return err
			}

			if count > 0 {
				return errcode.ErrDBAddConversation.Wrap(fmt.Errorf("a conversation already exists for this contact"))
			}
		}

		return tx.db.
			Clauses(clause.OnConflict{DoNothing: true}).
			Create(&conversation).
			Error
	}); err != nil {
		return nil, err
	}

	return d.getConversationByPK(groupPK)
}

func (d *dbWrapper) addConversation(groupPK string) (*Conversation, error) {
	conversation := &Conversation{
		PublicKey:   groupPK,
		Type:        Conversation_MultiMemberType,
		CreatedDate: timestampMs(time.Now()),
	}

	if err := d.db.Create(&conversation).Error; err != nil {
		if isSQLiteError(err, sqlite3.ErrConstraint) {
			return nil, errcode.ErrDBEntryAlreadyExists.Wrap(err)
		}

		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return conversation, nil
}

func (d *dbWrapper) updateConversation(c Conversation) error {
	if c.PublicKey == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("no public key specified"))
	}

	columns := []string(nil)
	if c.Link != "" {
		columns = append(columns, "link")
	}

	if c.DisplayName != "" {
		columns = append(columns, "display_name")
	}

	if c.LocalDevicePublicKey != "" {
		columns = append(columns, "local_device_public_key")
	}

	if c.AccountMemberPublicKey != "" {
		columns = append(columns, "account_member_public_key")
	}

	cl := clause.OnConflict{ // Maybe DoNothing ?
		Columns: []clause.Column{{Name: "public_key"}},
	}
	if len(columns) > 0 {
		cl.DoUpdates = clause.AssignmentColumns(columns)
	} else {
		cl.DoNothing = true
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

func (d *dbWrapper) addAccount(pk, url string) error {
	acc := &Account{
		PublicKey: pk,
		Link:      url,
	}

	if pk == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("pk cannot be nil"))
	}

	if err := d.db.Create(&acc).Error; isSQLiteError(err, sqlite3.ErrConstraint) {
		return nil
	} else if err != nil {
		return err
	}

	return nil
}

func (d *dbWrapper) updateAccount(pk, url, displayName string) (*Account, error) {
	acc := &Account{}

	values := map[string]interface{}{}
	if url != "" {
		values["link"] = url
	}

	if displayName != "" {
		values["display_name"] = displayName
	}

	tx := d.db.Model(&Account{}).Where(&Account{PublicKey: pk}).Updates(values).First(&acc)
	if tx.Error != nil {
		return nil, tx.Error
	}

	return acc, nil
}

func (d *dbWrapper) getAccount() (*Account, error) {
	var (
		account = &Account{}
		count   int64
	)

	d.db.Model(&Account{}).Count(&count)
	if count > 1 {
		return nil, errcode.ErrDBMultipleRecords
	}

	return account, d.db.Model(&Account{}).Preload("ServiceTokens").First(&account).Error
}

func (d *dbWrapper) getDeviceByPK(publicKey string) (*Device, error) {
	device := &Device{}

	if err := d.db.First(&device, &Device{PublicKey: publicKey}).Error; err != nil {
		return nil, err
	}

	return device, nil
}

func (d *dbWrapper) getContactByPK(publicKey string) (*Contact, error) {
	contact := &Contact{}

	if err := d.db.First(&contact, &Contact{PublicKey: publicKey}).Error; err != nil {
		return nil, err
	}

	return contact, nil
}

func (d *dbWrapper) getConversationByPK(publicKey string) (*Conversation, error) {
	conversation := &Conversation{}

	if err := d.db.First(&conversation, &Conversation{PublicKey: publicKey}).Error; err != nil {
		return nil, err
	}

	return conversation, nil
}

func (d *dbWrapper) getMemberByPK(publicKey string) (*Member, error) {
	member := &Member{}

	if err := d.db.First(&member, &Member{PublicKey: publicKey}).Error; err != nil {
		return nil, err
	}

	return member, nil
}

func (d *dbWrapper) getAllConversations() ([]*Conversation, error) {
	convs := []*Conversation(nil)

	return convs, d.db.Find(&convs).Error
}

func (d *dbWrapper) getAllMembers() ([]*Member, error) {
	members := []*Member(nil)

	return members, d.db.Find(&members).Error
}

func (d *dbWrapper) getAllContacts() ([]*Contact, error) {
	contacts := []*Contact(nil)

	return contacts, d.db.Find(&contacts).Error
}

func (d *dbWrapper) getContactsByState(state Contact_State) ([]*Contact, error) {
	contacts := []*Contact(nil)

	return contacts, d.db.Where(&Contact{State: state}).Find(&contacts).Error
}

func (d *dbWrapper) getAllInteractions() ([]*Interaction, error) {
	interactions := []*Interaction(nil)

	return interactions, d.db.Preload(clause.Associations).Find(&interactions).Error
}

func (d *dbWrapper) getInteractionByCID(cid string) (*Interaction, error) {
	interaction := &Interaction{}
	return interaction, d.db.Preload(clause.Associations).First(&interaction, &Interaction{CID: cid}).Error
}

func (d *dbWrapper) addContactRequestOutgoingEnqueued(contactPK, displayName, convPK string) (*Contact, error) {
	contact := &Contact{
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

func (d *dbWrapper) addContactRequestOutgoingSent(contactPK string) (*Contact, error) {
	contact := &Contact{}

	if res := d.db.
		Where(&Contact{
			PublicKey: contactPK,
			State:     Contact_OutgoingRequestEnqueued,
		}).
		Updates(&Contact{
			SentDate: timestampMs(time.Now()),
			State:    Contact_OutgoingRequestSent,
		}); res.Error != nil {
		return nil, res.Error
	} else if res.RowsAffected == 0 {
		return nil, errcode.ErrDBAddContactRequestOutgoingSent.Wrap(fmt.Errorf("nothing found"))
	}

	return contact, d.db.Where(&Contact{PublicKey: contactPK}).First(&contact).Error
}

func (d *dbWrapper) addContactRequestIncomingReceived(contactPK, displayName string) (*Contact, error) {
	if err := d.db.
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(&Contact{
			DisplayName: displayName,
			PublicKey:   contactPK,
			State:       Contact_IncomingRequest,
			CreatedDate: timestampMs(time.Now()),
		}).
		Error; isSQLiteError(err, sqlite3.ErrConstraint) {
		return d.getContactByPK(contactPK)
	} else if err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return d.getContactByPK(contactPK)
}

func (d *dbWrapper) addContactRequestIncomingAccepted(contactPK, groupPK string) (*Contact, *Conversation, error) {
	if contactPK == "" {
		return nil, nil, errcode.ErrInvalidInput.Wrap(errors.New("a contact public key is required"))
	}

	if groupPK == "" {
		return nil, nil, errcode.ErrInvalidInput.Wrap(errors.New("a conversation public key is required"))
	}

	contact, err := d.getContactByPK(contactPK)
	if err != nil {
		return nil, nil, err
	}

	if contact.State != Contact_IncomingRequest {
		return nil, nil, errcode.ErrInvalidInput.Wrap(errors.New("no incoming request"))
	}

	conversation := &Conversation{
		PublicKey:        groupPK,
		Type:             Conversation_ContactType,
		ContactPublicKey: contactPK,
		DisplayName:      "", // empty on account conversations
		Link:             "", // empty on account conversations
		CreatedDate:      timestampMs(time.Now()),
	}

	if err := d.db.Transaction(func(db *gorm.DB) error {
		contact.State = Contact_Accepted
		contact.ConversationPublicKey = groupPK

		if err := db.Save(&contact).Error; err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		return db.
			Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "public_key"}},
				DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
			}).
			Create(&conversation).
			Error
	}); err != nil {
		return nil, nil, errcode.ErrDBWrite.Wrap(err)
	}

	return contact, conversation, nil
}

func (d *dbWrapper) markInteractionAsAcknowledged(cid string) (*Interaction, error) {
	count := int64(0)

	if err := d.db.Model(&Interaction{}).Where(map[string]interface{}{"cid": cid}).Count(&count).Error; err != nil {
		return nil, err
	}

	if count == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	res := d.db.Model(&Interaction{}).Where(map[string]interface{}{"cid": cid, "acknowledged": false}).Update("acknowledged", true)

	if res.Error != nil {
		return nil, res.Error
	}

	if res.RowsAffected == 0 {
		return nil, nil
	}

	return d.getInteractionByCID(cid)
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
	var err, errs error
	infos := &SystemInfo_DB{}

	infos.Accounts, err = d.dbModelRowsCount(Account{})
	errs = multierr.Append(errs, err)

	infos.Contacts, err = d.dbModelRowsCount(Contact{})
	errs = multierr.Append(errs, err)

	infos.Interactions, err = d.dbModelRowsCount(Interaction{})
	errs = multierr.Append(errs, err)

	infos.Conversations, err = d.dbModelRowsCount(Conversation{})
	errs = multierr.Append(errs, err)

	infos.Members, err = d.dbModelRowsCount(Member{})
	errs = multierr.Append(errs, err)

	infos.Devices, err = d.dbModelRowsCount(Device{})
	errs = multierr.Append(errs, err)

	infos.ServiceTokens, err = d.dbModelRowsCount(ServiceToken{})
	errs = multierr.Append(errs, err)

	return infos, errs
}

func (d *dbWrapper) addDevice(devicePK string, memberPK string) (*Device, error) {
	if err := d.tx(func(tx *dbWrapper) error {
		// Check if this device already exists for another member
		{
			count := int64(0)

			if err := tx.db.
				Model(&Device{}).
				Where("member_public_key != ? AND public_key == ?", memberPK, devicePK).
				Count(&count).
				Error; err != nil {
				return err
			}

			if count > 0 {
				return errcode.ErrDBWrite.Wrap(fmt.Errorf("the device already exists for another member"))
			}
		}

		return tx.db.
			Clauses(clause.OnConflict{DoNothing: true}).
			Create(&Device{
				PublicKey:       devicePK,
				MemberPublicKey: memberPK,
			}).
			Error
	}); err != nil {
		return nil, err
	}

	return d.getDeviceByPK(devicePK)
}

func (d *dbWrapper) updateContact(contact Contact) error {
	if contact.PublicKey == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("no public key specified"))
	}

	return d.tx(func(tx *dbWrapper) error {
		count := int64(0)
		if err := d.db.Model(&Contact{}).Where(&Contact{PublicKey: contact.PublicKey}).Count(&count).Error; err != nil {
			return err
		}

		if count == 0 {
			return errcode.ErrInvalidInput.Wrap(fmt.Errorf("contact not found"))
		}

		return d.db.Updates(&contact).Error
	})
}

func (d *dbWrapper) addInteraction(i Interaction) (*Interaction, error) {
	ret := &Interaction{}

	if err := d.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&i).Error; err != nil {
		return nil, err
	}

	if err := d.db.Model(&Interaction{}).Preload(clause.Associations).First(&ret, &Interaction{CID: i.CID}).Error; err != nil {
		return nil, err
	}

	return ret, nil
}

func (d *dbWrapper) attributeBacklogInteractions(devicePK, groupPK, memberPK string) ([]*Interaction, error) {
	if devicePK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing device public key"))
	}

	if groupPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing conversation public key"))
	}

	if memberPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing member public key"))
	}

	var (
		backlog []*Interaction
		cids    []string
	)

	if err := d.tx(func(tx *dbWrapper) error {
		res := tx.db.
			Model(&Interaction{}).
			Where("device_public_key = ? AND conversation_public_key = ? AND member_public_key = \"\"", devicePK, groupPK).
			Order("ROWID asc")

		if err := res.
			Pluck("cid", &cids).
			Error; err != nil {
			return err
		}

		if len(cids) == 0 {
			return nil
		}

		if err := res.Update("member_public_key", memberPK).Error; err != nil {
			return err
		}

		if err := tx.db.Preload(clause.Associations).Order("ROWID asc").Find(&backlog, cids).Error; err != nil {
			return err
		}

		return nil
	}); err != nil {
		return nil, err
	}

	return backlog, nil
}

func (d *dbWrapper) addMember(memberPK, groupPK, displayName string) (*Member, error) {
	if memberPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("member public key cannot be empty"))
	}

	if groupPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("conversation public key cannot be empty"))
	}

	member := &Member{
		PublicKey:             memberPK,
		ConversationPublicKey: groupPK,
	}

	if err := d.tx(func(tx *dbWrapper) error {
		// Check if member already exists for another conversation
		{
			count := int64(0)

			if err := tx.db.
				Model(&Member{}).
				Where("public_key == ? AND conversation_public_key != ?", memberPK, groupPK).
				Count(&count).
				Error; err != nil {
				return err
			}

			if count > 0 {
				return errcode.ErrDBAddConversation.Wrap(fmt.Errorf("a conversation already exists for this contact"))
			}
		}

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

		member.DisplayName = displayName

		return tx.db.Clauses(&onConflict).Create(&member).Error
	}); err != nil {
		return nil, err
	}

	return member, nil
}

func (d *dbWrapper) setConversationIsOpenStatus(conversationPK string, status bool) (*Conversation, bool, error) {
	conversation, err := d.getConversationByPK(conversationPK)
	if err != nil {
		return nil, false, err
	}

	if conversation.IsOpen == status {
		return conversation, false, nil
	}

	conversation.IsOpen = status
	values := map[string]interface{}{
		"is_open": status,
	}

	if status {
		conversation.UnreadCount = 0
		values["unread_count"] = 0
	}

	if err := d.db.
		Model(&Conversation{}).
		Where(&Conversation{PublicKey: conversationPK}).
		Updates(values).
		Error; err != nil {
		return nil, false, err
	}

	return conversation, true, err
}

func (d *dbWrapper) isConversationOpened(conversationPK string) (bool, error) {
	var ret int64

	err := d.db.
		Model(&Conversation{}).
		Where(&Conversation{PublicKey: conversationPK, IsOpen: true}).
		Count(&ret).Error

	return ret == 1, err
}

type dbLogWrapper struct {
	logger.Interface
}

func (d *dbLogWrapper) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	// Mute gorm.ErrRecordNotFound errors
	if err == gorm.ErrRecordNotFound {
		err = nil
	}

	d.Interface.Trace(ctx, begin, fc, err)
}

func (d *dbWrapper) addServiceToken(accountPK string, serviceToken *bertytypes.ServiceToken) error {
	if len(serviceToken.SupportedServices) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("no services specified"))
	}

	if err := d.tx(func(tx *dbWrapper) error {
		for _, s := range serviceToken.SupportedServices {
			res := tx.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&ServiceToken{
				AccountPK:         accountPK,
				TokenID:           serviceToken.TokenID(),
				ServiceType:       s.ServiceType,
				AuthenticationURL: serviceToken.AuthenticationURL,
				Expiration:        serviceToken.Expiration,
			})

			if err := res.Error; err != nil {
				return errcode.ErrDBWrite.Wrap(err)
			}
		}

		return nil
	}); err != nil {
		return err
	}

	return nil
}
