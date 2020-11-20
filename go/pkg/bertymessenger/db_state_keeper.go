package bertymessenger

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func keepDisplayName(db *gorm.DB, logger *zap.Logger) string {
	if logger == nil {
		logger = zap.NewNop()
	}

	result := ""
	count := int64(0)

	if err := db.Table("accounts").Count(&count).Order("ROWID").Limit(1).Pluck("display_name", &result).Error; err == nil {
		if count != 1 {
			logger.Warn("expected one result", zap.Int64("count", count))
		}

		if result != "" && count > 0 {
			return result
		}
	} else {
		logger.Warn("attempt at retrieving display name failed", zap.Error(err))
	}

	logger.Warn("nothing found returning an empty value")

	return ""
}

func keepAutoReplicateFlag(db *gorm.DB, logger *zap.Logger) bool {
	if logger == nil {
		logger = zap.NewNop()
	}

	result := int64(0)
	count := int64(0)

	if err := db.Table("accounts").Count(&count).Order("ROWID").Limit(1).Pluck("replicate_new_groups_automatically", &result).Error; err == nil {
		if count != 1 {
			logger.Warn("expected one result", zap.Int64("count", count))
		}

		if count > 0 {
			return result != 0
		}
	} else {
		logger.Warn("attempt at retrieving display name failed", zap.Error(err))
	}

	logger.Warn("nothing found returning a default value")

	return true
}

func keepConversationsLocalData(db *gorm.DB, logger *zap.Logger) []*LocalConversationState {
	if logger == nil {
		logger = zap.NewNop()
	}

	result := []*LocalConversationState{}

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

func keepDatabaseLocalState(db *gorm.DB, logger *zap.Logger) *LocalDatabaseState {
	return &LocalDatabaseState{
		PublicKey:               keepAccountStringField(db, "public_key", logger),
		DisplayName:             keepDisplayName(db, logger),
		ReplicateFlag:           keepAutoReplicateFlag(db, logger),
		LocalConversationsState: keepConversationsLocalData(db, logger),
		AccountLink:             keepAccountStringField(db, "link", logger),
	}
}
