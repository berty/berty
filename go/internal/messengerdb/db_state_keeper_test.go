package messengerdb

import (
	"testing"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func Test_keepUsername(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t, GetInMemoryTestDBOptsNoInit)
	defer dispose()

	log := zap.NewNop()

	require.Equal(t, "", keepDisplayName(db.db, nil))

	// table schema on 2020_10_13
	require.NoError(t, db.db.Exec("CREATE TABLE accounts (public_key text, display_name text, link text, replicate_new_groups_automatically numeric DEFAULT true,PRIMARY KEY (public_key))").Error)

	require.Equal(t, "", keepDisplayName(db.db, log))

	require.NoError(t, db.db.Exec(`INSERT INTO accounts (public_key, display_name, link, replicate_new_groups_automatically) VALUES ("pk_1", "display_name_1", "http://display_name_1/", true)`).Error)
	require.Equal(t, "display_name_1", keepDisplayName(db.db, log))

	require.NoError(t, db.db.Exec(`INSERT INTO accounts (public_key, display_name, link, replicate_new_groups_automatically) VALUES ("pk_2", "display_name_2", "http://display_name_2/", true)`).Error)
	require.Equal(t, "display_name_1", keepDisplayName(db.db, log))
}

func Test_keepAutoReplicateFlag(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t, GetInMemoryTestDBOptsNoInit)
	defer dispose()

	log := zap.NewNop()

	require.Equal(t, true, keepAutoReplicateFlag(db.db, nil))

	// table schema on 2020_10_13
	require.NoError(t, db.db.Exec("CREATE TABLE accounts (public_key text, display_name text, link text, replicate_new_groups_automatically numeric DEFAULT true,PRIMARY KEY (public_key))").Error)

	require.Equal(t, true, keepAutoReplicateFlag(db.db, log))

	require.NoError(t, db.db.Exec(`INSERT INTO accounts (public_key, display_name, link, replicate_new_groups_automatically) VALUES ("pk_1", "display_name_1", "http://display_name_1/", false)`).Error)
	require.Equal(t, false, keepAutoReplicateFlag(db.db, log))

	require.NoError(t, db.db.Exec(`INSERT INTO accounts (public_key, display_name, link, replicate_new_groups_automatically) VALUES ("pk_2", "display_name_2", "http://display_name_2/", true)`).Error)
	require.Equal(t, false, keepAutoReplicateFlag(db.db, log))

	require.NoError(t, db.db.Exec(`UPDATE accounts SET replicate_new_groups_automatically = true WHERE public_key = "pk_1"`).Error)
	require.Equal(t, true, keepAutoReplicateFlag(db.db, log))
}

func Test_keepConversationsUnreadCounts(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t, GetInMemoryTestDBOptsNoInit)
	defer dispose()

	log := zap.NewNop()

	res := keepConversationsLocalData(db.db, nil)
	require.Empty(t, res)

	require.NoError(t, db.db.Exec("CREATE TABLE `conversations` (`public_key` text,`type` integer,`is_open` numeric,`display_name` text,`link` text,`unread_count` integer,`last_update` integer,`contact_public_key` text,`account_member_public_key` text,`local_device_public_key` text,`created_date` integer,`reply_options_cid` text,PRIMARY KEY (`public_key`))").Error)

	res = keepConversationsLocalData(db.db, log)
	require.Empty(t, res)

	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_1", true, 1000)`).Error)
	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_2", false, 2000)`).Error)
	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_3", true, 3000)`).Error)

	res = keepConversationsLocalData(db.db, log)
	expectedValues := map[string]*messengertypes.LocalConversationState{
		"pk_1": {IsOpen: true, UnreadCount: 1000},
		"pk_2": {IsOpen: false, UnreadCount: 2000},
		"pk_3": {IsOpen: true, UnreadCount: 3000},
	}

	require.Len(t, res, len(expectedValues))
	for _, found := range res {
		expected, ok := expectedValues[found.PublicKey]
		require.True(t, ok)

		require.Equal(t, expected.UnreadCount, found.UnreadCount)
		require.Equal(t, expected.IsOpen, found.IsOpen)
	}
}

func Test_keepDatabaseState_restoreDatabaseState(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t, GetInMemoryTestDBOptsNoInit)
	defer dispose()

	log := zap.NewNop()

	// Schema 2021_07_27
	require.NoError(t, db.db.Exec("CREATE TABLE accounts (public_key text, display_name text, link text, replicate_new_groups_automatically numeric DEFAULT true,auto_share_push_token_flag numeric DEFAULT true,PRIMARY KEY (public_key))").Error)
	require.NoError(t, db.db.Exec(`INSERT INTO accounts (public_key, display_name, link, replicate_new_groups_automatically, auto_share_push_token_flag) VALUES ("pk_1", "display_name_1", "http://display_name_1/", false, false)`).Error)
	require.NoError(t, db.db.Exec(`INSERT INTO accounts (public_key, display_name, link, replicate_new_groups_automatically, auto_share_push_token_flag) VALUES ("pk_2", "display_name_2", "http://display_name_2/", true, true)`).Error)
	require.NoError(t, db.db.Exec("CREATE TABLE `conversations` (`public_key` text,`type` integer,`is_open` numeric,`display_name` text,`link` text,`unread_count` integer,`last_update` integer,`contact_public_key` text,`account_member_public_key` text,`local_device_public_key` text,`created_date` integer,`reply_options_cid` text,PRIMARY KEY (`public_key`))").Error)
	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_1", true, 1000)`).Error)
	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_2", false, 2000)`).Error)
	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_3", true, 3000)`).Error)

	state := keepDatabaseLocalState(db.db, log)

	require.NoError(t, dropAllTables(db.db))

	tables := []string(nil)
	require.NoError(t, db.db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&tables).Error)
	require.Len(t, tables, 0)

	// Schema 2020_10_13
	require.NoError(t, db.db.Exec("CREATE TABLE accounts (public_key text, display_name text, link text, replicate_new_groups_automatically numeric DEFAULT true, auto_share_push_token_flag numeric DEFAULT true ,PRIMARY KEY (public_key))").Error)
	require.NoError(t, db.db.Exec("CREATE TABLE `conversations` (`public_key` text,`type` integer,`is_open` numeric,`display_name` text,`link` text,`unread_count` integer,`last_update` integer,`contact_public_key` text,`account_member_public_key` text,`local_device_public_key` text,`created_date` integer,`reply_options_cid` text,PRIMARY KEY (`public_key`))").Error)
	require.NoError(t, db.db.Exec("CREATE TABLE `conversation_replication_infos` (`cid` text,`conversation_public_key` text, PRIMARY KEY (`cid`))").Error)

	require.NoError(t, db.db.Exec(`INSERT INTO accounts (public_key, display_name, link, replicate_new_groups_automatically, auto_share_push_token_flag) VALUES ("pk_1", "", "", true, true)`).Error)
	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_1", false, 0)`).Error)
	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_2", false, 0)`).Error)
	require.NoError(t, db.db.Exec(`INSERT INTO conversations (public_key, is_open, unread_count) VALUES ("pk_3", false, 0)`).Error)

	require.NoError(t, restoreDatabaseLocalState(NewDBWrapper(db.db, zap.NewNop()), state))

	require.True(t, hasRecord(db.db.Table("accounts").Where("public_key = ? AND display_name = ? AND replicate_new_groups_automatically = ? AND auto_share_push_token_flag = ?", "pk_1", "display_name_1", false, false), log))
	require.True(t, hasRecord(db.db.Table("conversations").Where("public_key = ? AND unread_count = ? AND is_open = ?", "pk_1", 1000, true), log))
	require.True(t, hasRecord(db.db.Table("conversations").Where("public_key = ? AND unread_count = ? AND is_open = ?", "pk_2", 2000, false), log))
	require.True(t, hasRecord(db.db.Table("conversations").Where("public_key = ? AND unread_count = ? AND is_open = ?", "pk_3", 3000, true), log))
}

func hasRecord(query *gorm.DB, logger *zap.Logger) bool {
	count := int64(0)

	if err := query.Count(&count).Error; err != nil {
		logger.Error("unable to check if entry exists", zap.Error(err))
	}

	return count == 1
}
