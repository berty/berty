package gormutils

import (
	"fmt"
	"io/ioutil"
	"os"
	"testing"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite" // we'll test migrations using sqlite and this is required
	"github.com/smartystreets/goconvey/convey"
)

type ColumnInfo struct {
	ColumnID  string
	Name      string
	Type      string
	NotNull   *string
	DfltValue *string
	PK        string
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
			foundErrors = append(foundErrors, fmt.Errorf("field %s was not found or type mismatch in %s", firstField.Name, tableName))
		}
	}

	return foundErrors
}

func GetDbTablesSchemas(db *gorm.DB) (map[string][]*ColumnInfo, error) {
	type NameSQL struct {
		Name string
		SQL  string
	}

	schemas := map[string][]*ColumnInfo{}
	tableNamesAndSQL := []NameSQL{}

	err := db.Raw("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").Scan(&tableNamesAndSQL).Error
	if err != nil {
		return nil, err
	}

	for _, tableNameAndSQL := range tableNamesAndSQL {
		tableInfos := []*ColumnInfo{}
		rows, err := db.Raw("PRAGMA table_info(" + tableNameAndSQL.Name + ");").Rows()
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
			return nil, fmt.Errorf("no columns found for table %s", tableNameAndSQL.Name)
		}

		schemas[tableNameAndSQL.Name] = tableInfos
	}

	return schemas, nil
}

func TestAllTables(t *testing.T, initFunc func(db *gorm.DB) (*gorm.DB, error), migrateFunc func(db *gorm.DB, forceViaMigrations bool) error, expectedColumns []string) {
	convey.Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		convey.So(err, convey.ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := gorm.Open("sqlite3", tmpFile.Name())
		convey.So(err, convey.ShouldBeNil)
		convey.So(db, convey.ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = initFunc(db)
		convey.So(err, convey.ShouldBeNil)
		convey.So(db, convey.ShouldNotBeNil)

		err = migrateFunc(db, false)
		convey.So(err, convey.ShouldBeNil)

		schemas, err := GetDbTablesSchemas(db)
		convey.So(err, convey.ShouldBeNil)

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

	convey.Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		convey.So(err, convey.ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := gorm.Open("sqlite3", tmpFile.Name())
		convey.So(err, convey.ShouldBeNil)
		convey.So(db, convey.ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = initFunc(db)
		convey.So(err, convey.ShouldBeNil)
		convey.So(db, convey.ShouldNotBeNil)

		err = migrateFunc(db, false)
		convey.So(err, convey.ShouldBeNil)

		tablesSchemes, err = GetDbTablesSchemas(db)
		convey.So(err, convey.ShouldBeNil)
	})

	convey.Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		convey.So(err, convey.ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := gorm.Open("sqlite3", tmpFile.Name())
		convey.So(err, convey.ShouldBeNil)
		convey.So(db, convey.ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = initFunc(db)
		convey.So(err, convey.ShouldBeNil)
		convey.So(db, convey.ShouldNotBeNil)

		err = migrateFunc(db, true)
		convey.So(err, convey.ShouldBeNil)

		migratedTablesSchemes, err := GetDbTablesSchemas(db)
		convey.So(err, convey.ShouldBeNil)

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
	convey.Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		convey.So(err, convey.ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := gorm.Open("sqlite3", tmpFile.Name())
		convey.So(err, convey.ShouldBeNil)
		convey.So(db, convey.ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = Init(db)
		convey.So(err, convey.ShouldBeNil)
		convey.So(db, convey.ShouldNotBeNil)

		err = migrateFunc(db, false)
		convey.So(err, convey.ShouldBeNil)

		err = dropDatabaseFunc(db)
		convey.So(err, convey.ShouldBeNil)

		tables, err := GetDbTablesSchemas(db)
		convey.So(err, convey.ShouldBeNil)
		convey.So(len(tables), convey.ShouldEqual, 0)
	})
}
