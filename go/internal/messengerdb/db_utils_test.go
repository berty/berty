package messengerdb

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/require"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/internal/testutil"
)

type modelAccountV1 struct {
	PublicKey                       string `gorm:"primaryKey"`
	DisplayName                     string
	Link                            string
	ReplicateNewGroupsAutomatically sql.NullBool `gorm:"default:true"`
	AutoSharePushTokenFlag          sql.NullBool `gorm:"default:true"`
}

type modelConversationV1 struct {
	PublicKey   string `gorm:"primaryKey"`
	IsOpen      bool
	DisplayName string
	UnreadCount int32
}

type (
	modelAccountV2      modelAccountV1
	modelConversationV2 modelConversationV1
	modelInteractionV2  struct {
		CID     string `gorm:"primaryKey;column:cid"`
		Payload []byte
	}
)

type (
	modelAccountV3      modelAccountV2
	modelConversationV3 modelConversationV2
)

type modelAccountV4 struct {
	PublicKey                       string `gorm:"primaryKey"`
	DisplayName                     string
	Link                            string
	OtherField                      string
	ReplicateNewGroupsAutomatically bool `gorm:"default:true"`
	AutoSharePushTokenFlag          bool `gorm:"default:true"`
}
type modelConversationV4 modelConversationV3

type (
	modelAccountV5      modelAccountV4
	modelConversationV5 modelConversationV4
)

type (
	modelAccountV6      modelAccountV5
	modelConversationV6 struct {
		ID          int32 `gorm:"primaryKey,autoIncrement"`
		PublicKey   string
		IsOpen      bool
		DisplayName string
		UnreadCount int32
	}
)

func (modelAccountV1) TableName() string      { return "accounts" }
func (modelAccountV2) TableName() string      { return "accounts" }
func (modelAccountV3) TableName() string      { return "accounts" }
func (modelAccountV4) TableName() string      { return "accounts" }
func (modelAccountV5) TableName() string      { return "accounts" }
func (modelAccountV6) TableName() string      { return "accounts" }
func (modelConversationV1) TableName() string { return "conversations" }
func (modelConversationV2) TableName() string { return "conversations" }
func (modelConversationV3) TableName() string { return "conversations" }
func (modelConversationV4) TableName() string { return "conversations" }
func (modelConversationV5) TableName() string { return "conversations" }
func (modelConversationV6) TableName() string { return "conversations" }
func (modelInteractionV2) TableName() string  { return "interactions" }

func Test_ensureSeamlessDBUpdate(t *testing.T) {
	db, _, dispose := GetInMemoryTestDB(t, GetInMemoryTestDBOptsNoInit, GetInMemoryTestDBOptsNoFTS)
	defer dispose()

	log, loggerCleanup := testutil.Logger(t)
	defer loggerCleanup()

	replayer := func(db *DBWrapper) error {
		require.NoError(t, db.db.Create(&modelAccountV1{
			PublicKey: "pk_account_1",
		}).Error)

		require.NoError(t, db.db.Create(&modelConversationV1{
			PublicKey: "pk_conversation_1",
		}).Error)

		require.NoError(t, db.db.Create(&modelConversationV1{
			PublicKey: "pk_conversation_2",
		}).Error)

		return nil
	}

	initialPlay := func(db *DBWrapper) error {
		require.NoError(t, db.db.Create(&modelAccountV1{
			PublicKey:                       "pk_account_1",
			DisplayName:                     "user_display_name_1",
			ReplicateNewGroupsAutomatically: sql.NullBool{Bool: false, Valid: true},
		}).Error)

		require.NoError(t, db.db.Create(&modelConversationV1{
			PublicKey:   "pk_conversation_1",
			DisplayName: "conversation_display_name_1",
			UnreadCount: 1000,
			IsOpen:      true,
		}).Error)

		require.NoError(t, db.db.Create(&modelConversationV1{
			PublicKey:   "pk_conversation_2",
			DisplayName: "conversation_display_name_2",
			UnreadCount: 2000,
			IsOpen:      false,
		}).Error)

		return nil
	}

	hasExpectedValues := func(db *gorm.DB) {
		require.True(t, hasRecord(db.Table("accounts").Where("public_key = ? AND display_name = ? AND replicate_new_groups_automatically = ?", "pk_account_1", "user_display_name_1", false), log))
		require.True(t, hasRecord(db.Table("conversations").Where("public_key = ? AND unread_count = ? AND is_open = ?", "pk_conversation_1", 1000, true), log))
		require.True(t, hasRecord(db.Table("conversations").Where("public_key = ? AND unread_count = ? AND is_open = ?", "pk_conversation_2", 2000, false), log))
	}

	// Case 1 : Model created, no mig
	require.NoError(t, db.getUpdatedDB([]interface{}{&modelAccountV1{}, &modelConversationV1{}}, noopReplayer, log))
	require.NoError(t, initialPlay(db))
	hasExpectedValues(db.db)

	// Case 2 : Model added
	require.NoError(t, db.getUpdatedDB([]interface{}{&modelAccountV2{}, &modelConversationV2{}, &modelInteractionV2{}}, replayer, log))
	hasExpectedValues(db.db)

	// Case 3 : Model removed
	require.NoError(t, db.getUpdatedDB([]interface{}{&modelAccountV3{}, &modelConversationV3{}}, replayer, log))
	hasExpectedValues(db.db)

	// Case 4 : Field added
	require.NoError(t, db.getUpdatedDB([]interface{}{&modelAccountV4{}, &modelConversationV4{}}, replayer, log))
	hasExpectedValues(db.db)

	// Case 5 : Field removed
	require.NoError(t, db.getUpdatedDB([]interface{}{&modelAccountV5{}, &modelConversationV5{}}, replayer, log))
	hasExpectedValues(db.db)

	// Case 6 : Introduce some conflict
	require.NoError(t, db.getUpdatedDB([]interface{}{&modelAccountV6{}, &modelConversationV6{}}, replayer, log))
	hasExpectedValues(db.db)
}
