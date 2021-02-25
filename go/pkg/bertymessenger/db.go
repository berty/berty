package bertymessenger

import (
	"context"
	"errors"
	"fmt"
	"time"

	sqlite3 "github.com/mattn/go-sqlite3"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type dbWrapper struct {
	db  *gorm.DB
	log *zap.Logger
}

func newDBWrapper(db *gorm.DB, log *zap.Logger) *dbWrapper {
	if log == nil {
		log = zap.NewNop()
	}

	if db.Logger != nil {
		db.Logger = &dbLogWrapper{Interface: db.Logger}
	}

	return &dbWrapper{
		db:  db,
		log: log,
	}
}

func getDBModels() []interface{} {
	return []interface{}{
		&messengertypes.Conversation{},
		&messengertypes.Account{},
		&messengertypes.ServiceToken{},
		&messengertypes.Contact{},
		&messengertypes.Interaction{},
		&messengertypes.Member{},
		&messengertypes.Device{},
		&messengertypes.ConversationReplicationInfo{},
		&messengertypes.Media{},
	}
}

func (d *dbWrapper) initDB(replayer func(d *dbWrapper) error) error {
	if err := d.getUpdatedDB(getDBModels(), replayer, d.log); err != nil {
		return err
	}

	return nil
}

func (d *dbWrapper) getUpdatedDB(models []interface{}, replayer func(db *dbWrapper) error, logger *zap.Logger) error {
	if err := ensureSeamlessDBUpdate(d.db, models); err != nil {
		logger.Info("couldn't update db sql schema automatically", zap.Error(err))

		currentState := keepDatabaseLocalState(d.db, logger)

		if err := dropAllTables(d.db); err != nil {
			return errcode.ErrDBDestroy.Wrap(err)
		}

		if err := d.db.AutoMigrate(models...); err != nil {
			return errcode.ErrDBMigrate.Wrap(err)
		}

		if err := replayer(d); err != nil {
			return errcode.ErrDBReplay.Wrap(err)
		}

		if err := restoreDatabaseLocalState(d, currentState); err != nil {
			return errcode.ErrDBRestore.Wrap(err)
		}
	}

	return nil
}

func (d *dbWrapper) dbModelRowsCount(model interface{}) (int64, error) {
	var count int64
	return count, d.db.Model(model).Count(&count).Error
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

func (d *dbWrapper) addConversationForContact(groupPK, contactPK string) (*messengertypes.Conversation, error) {
	if groupPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no conversation public key specified"))
	}

	if contactPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no contact public key specified"))
	}

	if err := d.tx(func(tx *dbWrapper) error {
		conversation := &messengertypes.Conversation{
			PublicKey:        groupPK,
			ContactPublicKey: contactPK,
			Type:             messengertypes.Conversation_ContactType,
			DisplayName:      "", // empty on account conversations
			Link:             "", // empty on account conversations
			CreatedDate:      timestampMs(time.Now()),
		}

		// Check if a conversation already exists for this contact with another pk (or for this conversation pk and another contact)
		{
			count := int64(0)

			if err := tx.db.
				Model(&messengertypes.Conversation{}).
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

func (d *dbWrapper) addConversation(groupPK string) (*messengertypes.Conversation, error) {
	if groupPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a conversation public key is required"))
	}

	conversation := &messengertypes.Conversation{
		PublicKey:   groupPK,
		Type:        messengertypes.Conversation_MultiMemberType,
		CreatedDate: timestampMs(time.Now()),
	}

	if err := d.db.Create(&conversation).Error; err != nil {
		if isSQLiteError(err, sqlite3.ErrConstraint) {
			return nil, errcode.ErrDBEntryAlreadyExists.Wrap(err)
		}

		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return d.getConversationByPK(groupPK)
}

func (d *dbWrapper) updateConversation(c messengertypes.Conversation) (bool, error) {
	if c.PublicKey == "" {
		return false, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a conversation public key is required"))
	}

	isNew := false
	_, err := d.getConversationByPK(c.GetPublicKey())
	if err == gorm.ErrRecordNotFound {
		isNew = true
	} else if err != nil {
		return isNew, err
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

	db := d.db

	if len(columns) > 0 {
		db = db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "public_key"}},
			DoUpdates: clause.AssignmentColumns(columns),
		})
	} else if !isNew { // no update needed
		return false, nil
	}

	if err := db.Create(&c).Error; err != nil {
		return isNew, errcode.ErrInternal.Wrap(err)
	}

	return isNew, nil
}

func (d *dbWrapper) updateConversationReadState(pk string, newUnread bool, eventDate time.Time) error {
	if pk == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("a conversation public key is required"))
	}

	updates := map[string]interface{}{
		"last_update": timestampMs(eventDate),
	}

	// if conv is not open, increment the unread_count
	if newUnread {
		updates["unread_count"] = gorm.Expr("unread_count + 1")
	}

	replyOptionsCID, err := d.getReplyOptionsCIDForConversation(pk)
	if err != nil {
		return err
	}

	updates["reply_options_cid"] = replyOptionsCID

	// db update
	tx := d.db.Model(&messengertypes.Conversation{}).Where(&messengertypes.Conversation{PublicKey: pk}).Updates(updates)

	if tx.Error != nil {
		return tx.Error
	}

	if tx.RowsAffected == 0 {
		return errcode.ErrDBWrite.Wrap(fmt.Errorf("record not found"))
	}

	return nil
}

func (d *dbWrapper) addAccount(pk, link string) error {
	if pk == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("an account public key is required"))
	}

	if err := d.db.
		Model(&messengertypes.Account{}).
		FirstOrCreate(
			&messengertypes.Account{},
			&messengertypes.Account{PublicKey: pk, Link: link},
		).
		Error; err != nil && !isSQLiteError(err, sqlite3.ErrConstraint) {
		return err
	}

	return nil
}

func (d *dbWrapper) updateAccount(pk, url, displayName, avatarCID string) (*messengertypes.Account, error) {
	if pk == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("an account public key is required"))
	}

	acc := &messengertypes.Account{}

	values := map[string]interface{}{}
	if url != "" {
		values["link"] = url
	}
	if displayName != "" {
		values["display_name"] = displayName
	}
	if avatarCID != "" {
		values["avatar_cid"] = avatarCID
	}

	tx := d.db.Model(&messengertypes.Account{}).Where(&messengertypes.Account{PublicKey: pk}).Updates(values).First(&acc)
	if tx.Error != nil {
		return nil, tx.Error
	}

	return acc, nil
}

func (d *dbWrapper) getAccount() (*messengertypes.Account, error) {
	var (
		account = &messengertypes.Account{}
		count   int64
	)

	d.db.Model(&messengertypes.Account{}).Count(&count)
	if count > 1 {
		return nil, errcode.ErrDBMultipleRecords
	}

	return account, d.db.Model(&messengertypes.Account{}).Preload("ServiceTokens").First(&account).Error
}

func (d *dbWrapper) getDeviceByPK(publicKey string) (*messengertypes.Device, error) {
	if publicKey == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a device public key is required"))
	}

	device := &messengertypes.Device{}

	if err := d.db.First(&device, &messengertypes.Device{PublicKey: publicKey}).Error; err != nil {
		return nil, err
	}

	return device, nil
}

func (d *dbWrapper) getContactByPK(publicKey string) (*messengertypes.Contact, error) {
	if publicKey == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a contact public key is required"))
	}

	contact := &messengertypes.Contact{}

	if err := d.db.First(&contact, &messengertypes.Contact{PublicKey: publicKey}).Error; err != nil {
		return nil, err
	}

	return contact, nil
}

func (d *dbWrapper) getConversationByPK(publicKey string) (*messengertypes.Conversation, error) {
	if publicKey == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a conversation public key is required"))
	}

	conversation := &messengertypes.Conversation{}

	if err := d.db.
		Preload("ReplyOptions").
		Preload("ReplicationInfo").
		First(
			&conversation,
			&messengertypes.Conversation{PublicKey: publicKey},
		).
		Error; err != nil {
		return nil, err
	}

	return conversation, nil
}

func (d *dbWrapper) getMemberByPK(publicKey string, convPK string) (*messengertypes.Member, error) {
	if publicKey == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("member public key cannot be empty"))
	}
	if convPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("conversation public key cannot be empty"))
	}

	member := &messengertypes.Member{}

	if err := d.db.First(&member, &messengertypes.Member{PublicKey: publicKey, ConversationPublicKey: convPK}).Error; err != nil {
		return nil, err
	}

	return member, nil
}

func (d *dbWrapper) getAllConversations() ([]*messengertypes.Conversation, error) {
	convs := []*messengertypes.Conversation(nil)

	return convs, d.db.Preload("ReplyOptions").Preload("ReplicationInfo").Find(&convs).Error
}

func (d *dbWrapper) getAllMembers() ([]*messengertypes.Member, error) {
	members := []*messengertypes.Member(nil)

	return members, d.db.Find(&members).Error
}

func (d *dbWrapper) getAllContacts() ([]*messengertypes.Contact, error) {
	contacts := []*messengertypes.Contact(nil)

	return contacts, d.db.Find(&contacts).Error
}

func (d *dbWrapper) getContactsByState(state messengertypes.Contact_State) ([]*messengertypes.Contact, error) {
	contacts := []*messengertypes.Contact(nil)

	return contacts, d.db.Where(&messengertypes.Contact{State: state}).Find(&contacts).Error
}

func (d *dbWrapper) getAllInteractions() ([]*messengertypes.Interaction, error) {
	interactions := []*messengertypes.Interaction(nil)

	return interactions, d.db.Preload(clause.Associations).Find(&interactions).Error
}

func (d *dbWrapper) getPaginatedInteractions(opts *messengertypes.PaginatedInteractionsOptions) ([]*messengertypes.Interaction, []*messengertypes.Media, error) {
	if opts == nil {
		opts = &messengertypes.PaginatedInteractionsOptions{}
	}

	if opts.Amount <= 0 {
		opts.Amount = 5
	}

	var conversationPks, cids []string
	interactions := []*messengertypes.Interaction(nil)
	medias := []*messengertypes.Media(nil)
	previousInteraction := (*messengertypes.Interaction)(nil)

	if opts.ConversationPK != "" {
		conversationPks = []string{opts.ConversationPK}
	} else if err := d.db.Model(&messengertypes.Conversation{}).Pluck("public_key", &conversationPks).Error; err != nil {
		return nil, nil, errcode.ErrDBRead.Wrap(fmt.Errorf("unable to list conversation ids: %w", err))
	}

	if opts.RefCID != "" {
		var err error
		previousInteraction, err = d.getInteractionByCID(opts.RefCID)
		if err != nil {
			return nil, nil, errcode.ErrDBRead.Wrap(fmt.Errorf("unable to retrieve specified interaction: %w", err))
		}

		if opts.ConversationPK != "" && previousInteraction.ConversationPublicKey != opts.ConversationPK {
			return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("specified interaction cid and conversation pk doesn't match"))
		}

		conversationPks = []string{previousInteraction.ConversationPublicKey}
	}

	for _, pk := range conversationPks {
		var cidsForConv []string
		query := d.db.
			Model(&messengertypes.Interaction{}).
			Where(&messengertypes.Interaction{ConversationPublicKey: pk})

		if previousInteraction != nil {
			if opts.OldestToNewest {
				query = query.Where("sent_date > ?", previousInteraction.SentDate)
			} else {
				query = query.Where("sent_date < ?", previousInteraction.SentDate)
			}
		}

		query = query.Limit(int(opts.Amount))

		if opts.OldestToNewest {
			query = query.Order("sent_date")
		} else {
			query = query.Order("sent_date DESC")
		}

		if err := query.
			Pluck("cid", &cidsForConv).
			Error; err != nil {
			return nil, nil, errcode.ErrDBRead.Wrap(fmt.Errorf("unable to list latest cids for conversation: %w", err))
		}

		cids = append(cids, cidsForConv...)
	}

	if len(cids) == 0 {
		return nil, nil, nil
	}

	if err := d.db.
		Preload(clause.Associations).
		Find(&interactions, cids).
		Error; err != nil {
		return nil, nil, errcode.ErrDBRead.Wrap(fmt.Errorf("unable to fetch interactions: %w", err))
	}

	if !opts.ExcludeMedias {
		if err := d.db.
			Preload(clause.Associations).
			Model(&messengertypes.Media{}).
			Where("media.interaction_cid IN (?)", cids).
			Find(&medias).
			Error; err != nil {
			return nil, nil, errcode.ErrDBRead.Wrap(fmt.Errorf("unable to fetch medias: %w", err))
		}
	}

	return interactions, medias, nil
}

func (d *dbWrapper) getInteractionByCID(cid string) (*messengertypes.Interaction, error) {
	if cid == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("an interaction cid is required"))
	}

	interaction := &messengertypes.Interaction{}
	return interaction, d.db.Preload(clause.Associations).First(&interaction, &messengertypes.Interaction{CID: cid}).Error
}

func (d *dbWrapper) addContactRequestOutgoingEnqueued(contactPK, displayName, convPK string) (*messengertypes.Contact, error) {
	if contactPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a contact public key is required"))
	}

	ec, err := d.getContactByPK(contactPK)
	if err == nil {
		return ec, errcode.ErrDBEntryAlreadyExists
	} else if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	contact := &messengertypes.Contact{
		PublicKey:             contactPK,
		DisplayName:           displayName,
		State:                 messengertypes.Contact_OutgoingRequestEnqueued,
		CreatedDate:           timestampMs(time.Now()),
		ConversationPublicKey: convPK,
	}

	tx := d.db.Where(&messengertypes.Contact{PublicKey: contactPK}).Create(&contact)

	// if tx.Error == nil && tx.RowsAffected == 0 {
	// Maybe update DisplayName in some cases?
	// TODO: better handle case where the state is "IncomingRequest", should end up as in "Established" state in this case IMO
	// }

	return contact, tx.Error
}

func (d *dbWrapper) addContactRequestOutgoingSent(contactPK string) (*messengertypes.Contact, error) {
	if contactPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a contact public key is required"))
	}

	contact := &messengertypes.Contact{}

	if res := d.db.
		Where(&messengertypes.Contact{
			PublicKey: contactPK,
			State:     messengertypes.Contact_OutgoingRequestEnqueued,
		}).
		Updates(&messengertypes.Contact{
			SentDate: timestampMs(time.Now()),
			State:    messengertypes.Contact_OutgoingRequestSent,
		}); res.Error != nil {
		return nil, res.Error
	} else if res.RowsAffected == 0 {
		return nil, errcode.ErrDBAddContactRequestOutgoingSent.Wrap(fmt.Errorf("nothing found"))
	}

	return contact, d.db.Where(&messengertypes.Contact{PublicKey: contactPK}).First(&contact).Error
}

func (d *dbWrapper) addContactRequestIncomingReceived(contactPK, displayName, groupPk string) (*messengertypes.Contact, error) {
	if contactPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a contact public key is required"))
	}

	ec, err := d.getContactByPK(contactPK)
	if err == nil {
		return ec, errcode.ErrDBEntryAlreadyExists
	} else if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	if err := d.db.
		Create(&messengertypes.Contact{
			DisplayName:           displayName,
			PublicKey:             contactPK,
			State:                 messengertypes.Contact_IncomingRequest,
			CreatedDate:           timestampMs(time.Now()),
			ConversationPublicKey: groupPk,
		}).
		Error; err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return d.getContactByPK(contactPK)
}

func (d *dbWrapper) addContactRequestIncomingAccepted(contactPK, groupPK string) (*messengertypes.Contact, error) {
	if contactPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(errors.New("a contact public key is required"))
	}

	if groupPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(errors.New("a conversation public key is required"))
	}

	contact, err := d.getContactByPK(contactPK)
	if err != nil {
		return nil, err
	}

	if contact.State != messengertypes.Contact_IncomingRequest {
		return nil, errcode.ErrInvalidInput.Wrap(errors.New("no incoming request"))
	}

	if err := d.db.Transaction(func(db *gorm.DB) error {
		contact.State = messengertypes.Contact_Accepted
		contact.ConversationPublicKey = groupPK

		if err := db.Save(&contact).Error; err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		return db.
			Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "public_key"}},
				DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
			}).
			Error
	}); err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return contact, nil
}

func (d *dbWrapper) markInteractionAsAcknowledged(cid string) (*messengertypes.Interaction, error) {
	if cid == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("an interaction cid is required"))
	}

	count := int64(0)

	if err := d.db.Model(&messengertypes.Interaction{}).Where(map[string]interface{}{"cid": cid}).Count(&count).Error; err != nil {
		return nil, err
	}

	if count == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	res := d.db.Model(&messengertypes.Interaction{}).Where(map[string]interface{}{"cid": cid, "acknowledged": false}).Update("acknowledged", true)

	if res.Error != nil {
		return nil, res.Error
	}

	if res.RowsAffected == 0 {
		return nil, nil
	}

	return d.getInteractionByCID(cid)
}

func (d *dbWrapper) getAcknowledgementsCIDsForInteraction(cid string) ([]string, error) {
	if cid == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("an interaction cid is required"))
	}

	var cids []string

	if err := d.db.Model(&messengertypes.Interaction{}).Where(&messengertypes.Interaction{
		Type:      messengertypes.AppMessage_TypeAcknowledge,
		TargetCID: cid,
	}).Pluck("cid", &cids).Error; err != nil {
		return nil, err
	}

	return cids, nil
}

func (d *dbWrapper) deleteInteractions(cids []string) error {
	if len(cids) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("a list of cids is required"))
	}

	return d.db.Model(&messengertypes.Interaction{}).Delete(&messengertypes.Interaction{}, &cids).Error
}

func (d *dbWrapper) getDBInfo() (*messengertypes.SystemInfo_DB, error) {
	var err, errs error
	infos := &messengertypes.SystemInfo_DB{}

	infos.Accounts, err = d.dbModelRowsCount(messengertypes.Account{})
	errs = multierr.Append(errs, err)

	infos.Contacts, err = d.dbModelRowsCount(messengertypes.Contact{})
	errs = multierr.Append(errs, err)

	infos.Interactions, err = d.dbModelRowsCount(messengertypes.Interaction{})
	errs = multierr.Append(errs, err)

	infos.Conversations, err = d.dbModelRowsCount(messengertypes.Conversation{})
	errs = multierr.Append(errs, err)

	infos.Members, err = d.dbModelRowsCount(messengertypes.Member{})
	errs = multierr.Append(errs, err)

	infos.Devices, err = d.dbModelRowsCount(messengertypes.Device{})
	errs = multierr.Append(errs, err)

	infos.ServiceTokens, err = d.dbModelRowsCount(messengertypes.ServiceToken{})
	errs = multierr.Append(errs, err)

	infos.ConversationReplicationInfo, err = d.dbModelRowsCount(messengertypes.ConversationReplicationInfo{})
	errs = multierr.Append(errs, err)

	return infos, errs
}

func (d *dbWrapper) addDevice(devicePK string, memberPK string) (*messengertypes.Device, error) {
	if devicePK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a device public key is required"))
	}

	if memberPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a member public key is required"))
	}

	if err := d.tx(func(tx *dbWrapper) error {
		// Check if this device already exists for another member
		{
			count := int64(0)

			if err := tx.db.
				Model(&messengertypes.Device{}).
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
			Create(&messengertypes.Device{
				PublicKey:       devicePK,
				MemberPublicKey: memberPK,
			}).
			Error
	}); err != nil {
		return nil, err
	}

	return d.getDeviceByPK(devicePK)
}

func (d *dbWrapper) updateContact(pk string, contact messengertypes.Contact) error {
	if pk == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("no public key specified"))
	}

	count := int64(0)
	if err := d.db.Model(&messengertypes.Contact{}).Where(&messengertypes.Contact{PublicKey: pk}).Count(&count).Error; err != nil {
		return err
	}

	if count == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("contact not found"))
	}

	return d.db.Model(&messengertypes.Contact{PublicKey: pk}).Updates(&contact).Error
}

func (d *dbWrapper) addInteraction(rawInte messengertypes.Interaction) (*messengertypes.Interaction, bool, error) {
	if rawInte.CID == "" {
		return nil, false, errcode.ErrInvalidInput.Wrap(fmt.Errorf("an interaction cid is required"))
	}

	_, err := d.getInteractionByCID(rawInte.CID)
	isNew := false
	if err == gorm.ErrRecordNotFound {
		if err := d.db.Create(&rawInte).Error; err != nil {
			return nil, true, err
		}
		isNew = true
	} else if err != nil {
		return nil, false, err
	}

	i, err := d.getInteractionByCID(rawInte.CID)
	return i, isNew, err
}

func (d *dbWrapper) getReplyOptionsCIDForConversation(pk string) (string, error) {
	if pk == "" {
		return "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("a conversation public key is required"))
	}

	cid := ""

	if err := d.db.Model(&messengertypes.Interaction{}).
		Raw(`SELECT cid
			FROM interactions
			WHERE conversation_public_key = ?
			AND ROWID >
				IFNULL ((
					SELECT MAX(ROWID)
					FROM interactions
					WHERE conversation_public_key = ?
					AND is_mine = true
				), 0)
			AND is_mine = false
			AND type = ?
			ORDER BY ROWID DESC
			LIMIT 1
		`, pk, pk, messengertypes.AppMessage_TypeReplyOptions).Scan(&cid).Error; err != nil {
		return "", err
	}

	return cid, nil
}

func (d *dbWrapper) attributeBacklogInteractions(devicePK, groupPK, memberPK string) ([]*messengertypes.Interaction, error) {
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
		backlog []*messengertypes.Interaction
		cids    []string
	)

	if err := d.tx(func(tx *dbWrapper) error {
		res := tx.db.
			Model(&messengertypes.Interaction{}).
			Where("device_public_key = ? AND conversation_public_key = ? AND member_public_key = \"\"", devicePK, groupPK).
			Order("sent_date asc")

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

func (d *dbWrapper) addMember(memberPK, groupPK, displayName, avatarCID string, isMe bool, isCreator bool) (*messengertypes.Member, error) {
	if memberPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("member public key cannot be empty"))
	}

	if groupPK == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("conversation public key cannot be empty"))
	}

	member := &messengertypes.Member{
		PublicKey:             memberPK,
		ConversationPublicKey: groupPK,
		AvatarCID:             avatarCID,
		IsCreator:             isCreator,
		IsMe:                  isMe,
	}

	if err := d.tx(func(tx *dbWrapper) error {
		// Check if member already exists
		if m, err := tx.getMemberByPK(memberPK, groupPK); err == nil {
			member = m
			return errcode.ErrDBEntryAlreadyExists
		} else if err != nil && err != gorm.ErrRecordNotFound {
			return err
		}

		// Ensure a display name
		if displayName == "" {
			nameSuffix := "1337"
			if len(memberPK) >= 4 {
				nameSuffix = memberPK[:4]
			}
			displayName = "anon#" + nameSuffix
		}
		member.DisplayName = displayName

		return tx.db.Create(&member).Error
	}); errcode.Is(err, errcode.ErrDBEntryAlreadyExists) {
		return member, err
	} else if err != nil {
		return nil, err
	}

	return member, nil
}

func (d *dbWrapper) upsertMember(memberPK, groupPK string, m messengertypes.Member) (*messengertypes.Member, bool, error) {
	if memberPK == "" {
		return nil, false, errcode.ErrInvalidInput.Wrap(fmt.Errorf("member public key cannot be empty"))
	}
	if groupPK == "" {
		return nil, false, errcode.ErrInvalidInput.Wrap(fmt.Errorf("conversation public key cannot be empty"))
	}

	isNew := false
	em, err := d.getMemberByPK(memberPK, groupPK)
	if err == gorm.ErrRecordNotFound {
		isNew = true
	} else if err != nil {
		return nil, isNew, errcode.ErrDBRead.Wrap(err)
	}

	if em.GetDisplayName() == "" && m.DisplayName == "" {
		nameSuffix := "1337"
		if len(memberPK) >= 4 {
			nameSuffix = memberPK[:4]
		}
		m.DisplayName = "anon#" + nameSuffix
	}

	if isNew {
		err := d.db.Create(&m).Error
		if err != nil {
			return nil, isNew, errcode.ErrDBWrite.Wrap(err)
		}
	} else {
		err := d.db.Model(em).Updates(&m).Error
		if err != nil {
			return nil, false, errcode.ErrDBWrite.Wrap(err)
		}
	}

	um, err := d.getMemberByPK(memberPK, groupPK)
	if err != nil {
		return nil, false, errcode.ErrDBRead.Wrap(err)
	}

	return um, isNew, nil
}

func (d *dbWrapper) setConversationIsOpenStatus(conversationPK string, status bool) (*messengertypes.Conversation, bool, error) {
	if conversationPK == "" {
		return nil, false, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a conversation public key is required"))
	}

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
		Model(&messengertypes.Conversation{}).
		Where(&messengertypes.Conversation{PublicKey: conversationPK}).
		Updates(values).
		Error; err != nil {
		return nil, false, err
	}

	return conversation, true, err
}

func (d *dbWrapper) isConversationOpened(conversationPK string) (bool, error) {
	if conversationPK == "" {
		return false, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a conversation public key is required"))
	}

	var ret int64

	err := d.db.
		Model(&messengertypes.Conversation{}).
		Where(&messengertypes.Conversation{PublicKey: conversationPK, IsOpen: true}).
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

func (d *dbWrapper) addServiceToken(accountPK string, serviceToken *protocoltypes.ServiceToken) error {
	if accountPK == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("an account public key is required"))
	}

	if len(serviceToken.SupportedServices) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("no services specified"))
	}

	if err := d.tx(func(tx *dbWrapper) error {
		for _, s := range serviceToken.SupportedServices {
			res := tx.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&messengertypes.ServiceToken{
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

func (d *dbWrapper) accountSetReplicationAutoEnable(pk string, enabled bool) error {
	updates := map[string]interface{}{
		"replicate_new_groups_automatically": enabled,
	}

	// db update
	tx := d.db.Model(&messengertypes.Account{}).Where(&messengertypes.Account{PublicKey: pk}).Updates(updates)

	if tx.Error != nil {
		return tx.Error
	}

	if tx.RowsAffected == 0 {
		return errcode.ErrDBWrite.Wrap(fmt.Errorf("record not found"))
	}

	return nil
}

func (d *dbWrapper) saveConversationReplicationInfo(c messengertypes.ConversationReplicationInfo) error {
	if c.CID == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("an interaction cid is required"))
	}

	tx := d.db.Clauses(clause.OnConflict{DoNothing: true}).Create(c)
	if tx.Error != nil {
		return errcode.ErrDBWrite.Wrap(tx.Error)
	}

	return nil
}

func (d *dbWrapper) addMedias(medias []*messengertypes.Media) ([]bool, error) {
	if len(medias) == 0 {
		return []bool{}, nil
	}
	for _, m := range medias {
		if err := ensureValidBase64CID(m.GetCID()); err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}
	}

	var dbMedias []*messengertypes.Media
	cids := make([]string, len(medias))
	for i, m := range medias {
		cids[i] = m.GetCID()
	}
	err := d.db.Model(&messengertypes.Media{}).Where("cid IN ?", cids).Find(&dbMedias).Error
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	willAdd := make([]bool, len(medias))
	for i, m := range medias {
		found := false
		for _, n := range dbMedias {
			if m.GetCID() == n.GetCID() {
				found = true
				break
			}
		}
		if !found {
			willAdd[i] = true
		}
	}

	if err := d.db.Clauses(clause.OnConflict{DoNothing: true}).Create(medias).Error; err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return willAdd, nil
}

func (d *dbWrapper) getMedias(cids []string) ([]*messengertypes.Media, error) {
	if len(cids) == 0 {
		return nil, nil
	}
	for _, c := range cids {
		if err := ensureValidBase64CID(c); err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}
	}

	var dbMedias []*messengertypes.Media
	err := d.db.Model(&messengertypes.Media{}).Where("cid IN ?", cids).Find(&dbMedias).Error
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	medias := make([]*messengertypes.Media, len(cids))
	for i, cid := range cids {
		medias[i] = &messengertypes.Media{CID: cid}
		for _, dbMedia := range dbMedias {
			if dbMedia.GetCID() == cid {
				medias[i] = dbMedia
			}
		}
	}
	return medias, nil
}

func (d *dbWrapper) getAllMedias() ([]*messengertypes.Media, error) {
	var medias []*messengertypes.Media
	err := d.db.Find(&medias).Error
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}
	return medias, nil
}

func (d *dbWrapper) getMemberPKFromDevicePK(dpk string) (string, error) {
	var dev messengertypes.Device
	err := d.db.Where("public_key = ?", dpk).First(&dev).Error
	switch err {
	case nil:
		if len(dev.PublicKey) == 0 {
			return "", errcode.ErrNotFound
		}
		return dev.PublicKey, nil
	case gorm.ErrRecordNotFound:
		return "", errcode.ErrNotFound
	default:
		return "", errcode.ErrDBRead.Wrap(err)
	}
}

type nextMediaOpts struct {
	fileNames []string
	mimeTypes []string
}

func (d *dbWrapper) getNextMedia(lastCID string, opts nextMediaOpts) (*messengertypes.Media, error) {
	cid := ""
	media := &messengertypes.Media{}

	query := `
		SELECT media.cid
		FROM interactions
		JOIN media ON media.interaction_cid = interactions.cid
		JOIN (
			SELECT conversation_public_key, sent_date
			FROM interactions
			WHERE cid = (
				SELECT interaction_cid FROM media WHERE cid = ?
			)
		) as ctx_ref
		WHERE interactions.conversation_public_key = ctx_ref.conversation_public_key
		AND interactions.sent_date > ctx_ref.sent_date`

	queryArgs := []interface{}{lastCID}

	if len(opts.mimeTypes) > 0 {
		query += `
		AND media.mime_type IN ?`
		queryArgs = append(queryArgs, opts.mimeTypes)
	}

	if len(opts.fileNames) > 0 {
		query += `
		AND media.filename IN ?`
		queryArgs = append(queryArgs, opts.fileNames)
	}

	query += `
	LIMIT 1`

	if err := d.db.Model(&messengertypes.Media{}).Raw(query, queryArgs...).Scan(&cid).Error; err != nil {
		return nil, err
	}

	if cid == "" {
		return nil, errcode.ErrNotFound
	}

	if err := d.db.Model(&messengertypes.Media{}).First(&media, &messengertypes.Media{CID: cid}).Error; err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	return media, nil
}
