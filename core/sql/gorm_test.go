package sql

import (
	"fmt"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"io/ioutil"
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"berty.tech/core/sql/sqlcipher"
)

type ColumnInfo struct {
	ColumnID  string
	Name      string
	Type      string
	NotNull   *string
	DfltValue *string
	PK        string
}

func TestInit(t *testing.T) {
	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := sqlcipher.Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = Init(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = Migrate(db, false)
		So(err, ShouldBeNil)
		So(db.HasTable("contact"), ShouldBeTrue)
		So(db.HasTable("config"), ShouldBeTrue)
		So(db.HasTable("event"), ShouldBeTrue)
		So(db.HasTable("device"), ShouldBeTrue)
	})
}

func TestDropDatabase(t *testing.T) {
	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := sqlcipher.Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = Init(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = Migrate(db, false)
		So(err, ShouldBeNil)

		err = DropDatabase(db)
		So(err, ShouldBeNil)

		tables, err := getDbTablesSchemas(db)
		So(err, ShouldBeNil)
		So(len(tables), ShouldEqual, 0)
	})
}

func TestAllTables(t *testing.T) {
	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := sqlcipher.Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = Init(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = Migrate(db, false)
		So(err, ShouldBeNil)

		schemas, err := getDbTablesSchemas(db)
		So(err, ShouldBeNil)

		allTables := AllTables()
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

func TestAllMigrations(t *testing.T) {
	tablesSchemes := map[string][]*ColumnInfo{}

	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := sqlcipher.Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = Init(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = Migrate(db, false)
		So(err, ShouldBeNil)

		tablesSchemes, err = getDbTablesSchemas(db)
		So(err, ShouldBeNil)
	})

	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := sqlcipher.Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = Init(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = Migrate(db, true)
		So(err, ShouldBeNil)

		migratedTablesSchemes, err := getDbTablesSchemas(db)
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

func getDbTablesSchemas(db *gorm.DB) (map[string][]*ColumnInfo, error) {
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

func (t *ColumnInfo) Equals(other *ColumnInfo) bool {
	return t.Name == other.Name && t.Type == other.Type && *t.NotNull == *other.NotNull
}
