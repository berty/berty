package messengerdb

import (
	"fmt"
	"time"

	sqlite "github.com/flyingtime/gorm-sqlcipher"
	"go.uber.org/multierr"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type ColumnInfo struct {
	ColumnID  string
	Name      string
	Type      string
	NotNull   *string
	DfltValue *string
	PK        string
}

func ensureSeamlessDBUpdate(db *gorm.DB, models []interface{}) error {
	if err := db.AutoMigrate(models...); err != nil {
		return err
	}

	schemasDisk, err := getDBTablesSchemas(db)
	if err != nil {
		return err
	}

	schemasExpected, err := getExpectedDBSchemaForModels(models)
	if err != nil {
		return err
	}

	return compareDBSchema(schemasDisk, schemasExpected)
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

func getExpectedDBSchemaForModels(models []interface{}) (map[string][]*ColumnInfo, error) {
	db, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:schema_compare_%d?mode=memory&cache=shared", time.Now().UnixNano())), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return nil, err
	}

	d, err := db.DB()
	if err != nil {
		return nil, err
	}

	defer func() { _ = d.Close() }()

	if err := db.AutoMigrate(models...); err != nil {
		return nil, err
	}

	return getDBTablesSchemas(db)
}

func compareDBSchema(dbA map[string][]*ColumnInfo, dbB map[string][]*ColumnInfo) error {
	var errs error

	if len(dbA) != len(dbB) {
		return fmt.Errorf("an extraneous table is present")
	}

	for tableName, tableA := range dbA {
		tableB, ok := dbB[tableName]
		if !ok {
			errs = multierr.Append(errs, fmt.Errorf("missing table in second DB %s", tableName))
			continue
		}

		if err := compareTableSchemas(tableA, tableB, tableName); err != nil {
			errs = multierr.Append(errs, err)
		}
	}

	for tableName := range dbB {
		if _, ok := dbA[tableName]; !ok {
			errs = multierr.Append(errs, fmt.Errorf("missing table in first DB %s", tableName))
		}
	}

	return errs
}

func restoreDatabaseLocalState(db *DBWrapper, state *messengertypes.LocalDatabaseState) error {
	if state == nil {
		return nil
	}

	if res := db.db.
		Table("accounts").
		Where("public_key", state.PublicKey).
		Updates(map[string]interface{}{
			"display_name":                       state.DisplayName,
			"link":                               state.AccountLink,
			"replicate_new_groups_automatically": state.ReplicateFlag,
			"auto_share_push_token_flag":         state.AutoSharePushTokenFlag,
		}); res.Error != nil {
		return errcode.ErrInternal.Wrap(fmt.Errorf("unable to update account: %w", res.Error))
	} else if res.RowsAffected == 0 {
		return errcode.ErrInternal.Wrap(fmt.Errorf("unable to update account: account not found"))
	}

	for _, c := range state.LocalConversationsState {
		if res := db.db.
			Table("conversations").
			Where("public_key", c.PublicKey).
			Updates(map[string]interface{}{
				"is_open":      c.IsOpen,
				"unread_count": c.UnreadCount,
			}); res.Error != nil {
			return errcode.ErrInternal.Wrap(fmt.Errorf("unable to update conversation: %w", res.Error))
		} else if res.RowsAffected == 0 {
			return errcode.ErrInternal.Wrap(fmt.Errorf("unable to update conversation: conversation not found"))
		}
	}

	return nil
}

func getDBTablesSchemas(db *gorm.DB) (map[string][]*ColumnInfo, error) {
	type NameSQL struct {
		Name string
		SQL  string
	}

	schemas := map[string][]*ColumnInfo{}
	tableNamesAndSQL := []NameSQL{}

	err := db.Raw("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%_fts%';").Scan(&tableNamesAndSQL).Error
	if err != nil {
		return nil, err
	}

	for _, tableNameAndSQL := range tableNamesAndSQL {
		tableInfos := []*ColumnInfo{}
		rows, err := db.Raw("PRAGMA table_info(" + tableNameAndSQL.Name + ");").Rows()
		if err != nil {
			return nil, err
		}

		defer func() { _ = rows.Close() }()

		for {
			if !rows.Next() {
				break
			}

			columnInfo := ColumnInfo{}

			err = rows.Scan(
				&columnInfo.ColumnID,
				&columnInfo.Name,
				&columnInfo.Type,
				&columnInfo.NotNull,
				&columnInfo.DfltValue,
				&columnInfo.PK,
			)
			if err != nil {
				return nil, err
			}

			tableInfos = append(tableInfos, &columnInfo)
		}

		if len(tableInfos) == 0 {
			return nil, fmt.Errorf("no columns found for table %s", tableNameAndSQL.Name)
		}

		schemas[tableNameAndSQL.Name] = tableInfos
	}

	return schemas, nil
}

// compareTableSchemas all fields from first must be in second
func compareTableSchemas(first []*ColumnInfo, second []*ColumnInfo, tableName string) error {
	var errs error

	for _, firstField := range first {
		isFound := false

		for _, secondField := range second {
			if firstField.Equals(secondField) {
				isFound = true
				break
			}
		}

		if !isFound {
			errs = multierr.Append(errs, fmt.Errorf("field %s was not found or type mismatch in %s", firstField.Name, tableName))
		}
	}

	return errs
}

func (t *ColumnInfo) Equals(other *ColumnInfo) bool {
	return t.Name == other.Name && t.Type == other.Type && *t.NotNull == *other.NotNull && t.PK == other.PK
}
