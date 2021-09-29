package messengerdb

import (
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func keepDisplayName(db *gorm.DB, logger *zap.Logger) string {
	return keepAccountStringField(db, "display_name", logger)
}

func keepAccountBoolField(db *gorm.DB, flagName string, defaultValue bool, logger *zap.Logger) bool {
	if logger == nil {
		logger = zap.NewNop()
	}

	result := int64(0)
	count := int64(0)

	if err := db.Table("accounts").Count(&count).Order("ROWID").Limit(1).Pluck(flagName, &result).Error; err == nil {
		if count != 1 {
			logger.Warn("expected one result", zap.Int64("count", count))
		}

		if count > 0 {
			return result != 0
		}
	} else {
		logger.Warn("attempt at retrieving value failed", zap.Error(err))
	}

	logger.Warn("nothing found returning a default value")

	return defaultValue
}

func keepAutoReplicateFlag(db *gorm.DB, logger *zap.Logger) bool {
	return keepAccountBoolField(db, "replicate_new_groups_automatically", true, logger)
}

func keepConversationsLocalData(db *gorm.DB, logger *zap.Logger) []*messengertypes.LocalConversationState {
	if logger == nil {
		logger = zap.NewNop()
	}

	result := []*messengertypes.LocalConversationState{}

	err := db.Table("conversations").Scan(&result).Error

	if err == nil {
		return result
	}

	logger.Warn("attempt at retrieving conversation information", zap.Error(err))

	return nil
}

func keepAccountStringField(db *gorm.DB, field string, logger *zap.Logger) string {
	if logger == nil {
		logger = zap.NewNop()
	}

	result := ""
	count := int64(0)

	if err := db.Table("accounts").Count(&count).Order("ROWID").Limit(1).Pluck(field, &result).Error; err == nil {
		if count != 1 {
			logger.Warn("expected one result", zap.Int64("count", count))
		}

		if result != "" && count > 0 {
			return result
		}
	} else {
		logger.Warn("attempt at retrieving field failed", zap.String("field-name", field), zap.Error(err))
	}

	logger.Warn("nothing found returning an empty value")

	return ""
}

func keepDatabaseLocalState(db *gorm.DB, logger *zap.Logger) *messengertypes.LocalDatabaseState {
	return &messengertypes.LocalDatabaseState{
		PublicKey:               keepAccountStringField(db, "public_key", logger),
		DisplayName:             keepDisplayName(db, logger),
		ReplicateFlag:           keepAutoReplicateFlag(db, logger),
		LocalConversationsState: keepConversationsLocalData(db, logger),
		AccountLink:             keepAccountStringField(db, "link", logger),
		AutoSharePushTokenFlag:  keepAccountBoolField(db, "auto_share_push_token_flag", true, logger),
	}
}
