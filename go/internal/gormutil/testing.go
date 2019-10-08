package gormutil

import (
	"reflect"
	"sort"
	"testing"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite" // we'll test migrations using sqlite and this is required
	"go.uber.org/zap"
	"gopkg.in/gormigrate.v1"
)

type columnInfo struct {
	ColumnID  string
	Name      string
	Type      string
	NotNull   *string
	DfltValue *string
	PK        string
}

func (t *columnInfo) Equals(other *columnInfo) bool {
	return t.Name == other.Name &&
		t.Type == other.Type &&
		*t.NotNull == *other.NotNull
}

func testingGetDBSchemas(t *testing.T, db *gorm.DB) map[string][]*columnInfo {
	t.Helper()

	type NameSQL struct {
		Name string
		SQL  string
	}

	schemas := map[string][]*columnInfo{}
	tableNamesAndSQL := []NameSQL{}

	err := db.Raw("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").Scan(&tableNamesAndSQL).Error
	if err != nil {
		t.Fatalf("failed to query sqlite_master: %v", err)
	}

	for _, tableNameAndSQL := range tableNamesAndSQL {
		tableInfos := []*columnInfo{}
		rows, err := db.Raw("PRAGMA table_info(" + tableNameAndSQL.Name + ");").Rows()
		if err != nil {
			t.Fatalf("failed to call PRAGMA table_info: %v", err)
		}

		for rows.Next() {
			columnInfo := columnInfo{}

			err = rows.Scan(
				&columnInfo.ColumnID,
				&columnInfo.Name,
				&columnInfo.Type,
				&columnInfo.NotNull,
				&columnInfo.DfltValue,
				&columnInfo.PK,
			)
			if err != nil {
				t.Fatalf("failed to scan table info: %v", err)
			}

			tableInfos = append(tableInfos, &columnInfo)
		}

		if len(tableInfos) == 0 {
			t.Fatalf("no columns found for table %s", tableNameAndSQL.Name)
		}

		schemas[tableNameAndSQL.Name] = tableInfos
	}

	return schemas
}

// TestingHasExpectedTables checks that the databases has all and only the expected tables
func TestingHasExpectedTables(t *testing.T, db *gorm.DB, expectedTables []string) {
	t.Helper()

	actualTables := TestingGetTableNames(t, db)
	sort.Strings(expectedTables)
	if !reflect.DeepEqual(expectedTables, actualTables) {
		t.Fatalf("Expectd %v, got %v.", expectedTables, actualTables)
	}
}

// TestingGetTableNames returns the existing table names of a database
func TestingGetTableNames(t *testing.T, db *gorm.DB) []string {
	t.Helper()

	schemas := testingGetDBSchemas(t, db)

	actualTables := []string{}
	for tableName := range schemas {
		actualTables = append(actualTables, tableName)
	}

	sort.Strings(actualTables)

	return actualTables
}

// TestingSqliteDB returns a configured in-memory gorm.DB without any tables
func TestingSqliteDB(t *testing.T, logger *zap.Logger) *gorm.DB {
	t.Helper()

	db, err := gorm.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to initialize in-memory sqlite srever: %v", err)
	}

	db, err = Init(db, logger)
	if err != nil {
		t.Fatalf("failed to configure database: %v", err)
	}

	return db
}

// TestingMigrationsVSAutoMigrate is a testing helper
func TestingMigrationsVSAutoMigrate(t *testing.T, migrations []*gormigrate.Migration, models []interface{}, logger *zap.Logger) {
	db1 := TestingSqliteDB(t, logger)
	defer db1.Close()
	db2 := TestingSqliteDB(t, logger)
	defer db2.Close()

	if err := Migrate(db1, migrations, models, true); err != nil {
		t.Fatalf("failed to run migrations: %v", err)
	}
	if err := Migrate(db2, migrations, models, false); err != nil {
		t.Fatalf("failed to run migrations: %v", err)
	}

	schemas1 := testingGetDBSchemas(t, db1)
	schemas2 := testingGetDBSchemas(t, db2)

	if !reflect.DeepEqual(schemas1, schemas2) {
		t.Fatalf("Results of running Migrations and AutoMigrate differ: %v != %v", schemas1, schemas2)
	}
}
