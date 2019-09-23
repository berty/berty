package gormutils

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"testing"

	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"go.uber.org/zap"
	"gopkg.in/gormigrate.v1"

	"github.com/jinzhu/gorm"
	. "github.com/smartystreets/goconvey/convey"
)

type ColumnInfo struct {
	ColumnID  string
	Name      string
	Type      string
	NotNull   *string
	DfltValue *string
	PK        string
}

// Init configures an active gorm connection
func Init(db *gorm.DB) (*gorm.DB, error) {
	db = db.Set("gorm:auto_preload", true)
	db = db.Set("gorm:association_autoupdate", false)
	db.SetLogger(&zapLogger{logger: zap.L().Named("vendor.gorm")})
	db.SingularTable(true)
	db.BlockGlobalUpdate(true)
	db.LogMode(true)
	// FIXME: configure hard delete
	return db, nil
}

func Migrate(db *gorm.DB, migrationsGetter func() []*gormigrate.Migration, modelsGetter func() []interface{}, forceViaMigrations bool) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, migrationsGetter())

	if !forceViaMigrations {
		m.InitSchema(func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				modelsGetter()...,
			).Error
		})
	}

	if err := m.Migrate(); err != nil {
		return err
	}

	return nil
}

func DropDatabase(db *gorm.DB, tableNamesGetter func() []string) error {
	var tables []interface{}
	for _, table := range tableNamesGetter() {
		tables = append(tables, table)
	}
	return db.DropTableIfExists(tables...).Error
}

func (t *ColumnInfo) Equals(other *ColumnInfo) bool {
	return t.Name == other.Name && t.Type == other.Type && *t.NotNull == *other.NotNull
}

// compareTableSchemas all fields from first must be in second
func compareTableSchemas(first []*ColumnInfo, second []*ColumnInfo, tableName string) []error {
	foundErrors := []error{}

	for _, firstField := range first {
		isFound := false

		for _, secondField := range second {
			if firstField.Equals(secondField) {
				isFound = true
				break
			}
		}

		if isFound == false {
			foundErrors = append(foundErrors, errors.New(fmt.Sprintf("field %s was not found or type mismatch in %s", firstField.Name, tableName)))
		}
	}

	return foundErrors
}

func GetDbTablesSchemas(db *gorm.DB) (map[string][]*ColumnInfo, error) {
	type NameSQL struct {
		Name string
		Sql  string
	}

	schemas := map[string][]*ColumnInfo{}
	tableNamesAndSQL := []NameSQL{}

	err := db.Raw("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").Scan(&tableNamesAndSQL).Error
	if err != nil {
		return nil, err
	}

	for _, tableNameAndSql := range tableNamesAndSQL {
		tableInfos := []*ColumnInfo{}
		rows, err := db.Raw("PRAGMA table_info(" + tableNameAndSql.Name + ");").Rows()
		if err != nil {
			return nil, err
		}

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
			return nil, errors.New(fmt.Sprintf("No columns found for table %s", tableNameAndSql.Name))
		}

		schemas[tableNameAndSql.Name] = tableInfos
	}

	return schemas, nil
}

func TestAllTables(t *testing.T, initFunc func(db *gorm.DB) (*gorm.DB, error), migrateFunc func(db *gorm.DB, forceViaMigrations bool) error, expectedColumns []string) {
	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := gorm.Open("sqlite3", tmpFile.Name())
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = initFunc(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = migrateFunc(db, false)
		So(err, ShouldBeNil)

		schemas, err := GetDbTablesSchemas(db)
		So(err, ShouldBeNil)

		allTables := expectedColumns
		foundTables := map[string]bool{}
		for _, tableName := range allTables {
			foundTables[tableName] = false
		}

		for tableName := range schemas {
			_, ok := foundTables[tableName]
			if !ok {
				t.Errorf("Table %s was found in db but not listed in AllTables", tableName)
			}

			foundTables[tableName] = true
		}

		for tableName, found := range foundTables {
			if found == false {
				t.Errorf("Table %s was not found in db but listed in AllTables", tableName)
			}
		}
	})
}

func TestAllMigrations(t *testing.T, initFunc func(db *gorm.DB) (*gorm.DB, error), migrateFunc func(db *gorm.DB, forceViaMigrations bool) error) {
	tablesSchemes := map[string][]*ColumnInfo{}

	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := gorm.Open("sqlite3", tmpFile.Name())
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = initFunc(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = migrateFunc(db, false)
		So(err, ShouldBeNil)

		tablesSchemes, err = GetDbTablesSchemas(db)
		So(err, ShouldBeNil)
	})

	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := gorm.Open("sqlite3", tmpFile.Name())
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = initFunc(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = migrateFunc(db, true)
		So(err, ShouldBeNil)

		migratedTablesSchemes, err := GetDbTablesSchemas(db)
		So(err, ShouldBeNil)

		for tableName, tableScheme := range tablesSchemes {
			_, ok := migratedTablesSchemes[tableName]
			if ok == false {
				t.Errorf("Table %s was found when DB was created from scratch but not after migrate", tableName)
			}

			errs := compareTableSchemas(tableScheme, migratedTablesSchemes[tableName], tableName)
			for _, err := range errs {
				t.Errorf(err.Error())
			}
		}
	})
}

func TestDropDatabase(t *testing.T, migrateFunc func(db *gorm.DB, forceViaMigrations bool) error, dropDatabaseFunc func(db *gorm.DB) error) {
	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := gorm.Open("sqlite3", tmpFile.Name())
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = Init(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = migrateFunc(db, false)
		So(err, ShouldBeNil)

		err = dropDatabaseFunc(db)
		So(err, ShouldBeNil)

		tables, err := GetDbTablesSchemas(db)
		So(err, ShouldBeNil)
		So(len(tables), ShouldEqual, 0)
	})
}
