[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/go-gormigrate/gormigrate/blob/master/LICENSE)
[![GoDoc](https://godoc.org/gopkg.in/gormigrate.v1?status.svg)](https://godoc.org/gopkg.in/gormigrate.v1)
[![Go Report Card](https://goreportcard.com/badge/gopkg.in/gormigrate.v1)](https://goreportcard.com/report/gopkg.in/gormigrate.v1)
[![Build Status](https://travis-ci.org/go-gormigrate/gormigrate.svg?branch=master)](https://travis-ci.org/go-gormigrate/gormigrate)

# Gormigrate

[![Join the chat at https://gitter.im/go-gormigrate/gormigrate](https://badges.gitter.im/go-gormigrate/gormigrate.svg)](https://gitter.im/go-gormigrate/gormigrate?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Gormigrate is a migration helper for [Gorm][gorm].
Gorm already have useful [migrate functions][gormmigrate], just misses
proper schema versioning and rollback cababilities.

## Supported databases

It supports the databases [Gorm supports][gormdatabases]:

- PostgreSQL
- MySQL
- SQLite
- Microsoft SQL Server

## Installing

```bash
go get -u gopkg.in/gormigrate.v1
```

## Usage

```go
package main

import (
	"log"

	"gopkg.in/gormigrate.v1"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

func main() {
	db, err := gorm.Open("sqlite3", "mydb.sqlite3")
	if err != nil {
		log.Fatal(err)
	}
	if err = db.DB().Ping(); err != nil {
		log.Fatal(err)
	}

	db.LogMode(true)

	m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
		// create persons table
		{
			ID: "201608301400",
			Migrate: func(tx *gorm.DB) error {
				// it's a good pratice to copy the struct inside the function,
				// so side effects are prevented if the original struct changes during the time
				type Person struct {
					gorm.Model
					Name string
				}
				return tx.AutoMigrate(&Person{}).Error
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.DropTable("people").Error
			},
		},
		// add age column to persons
		{
			ID: "201608301415",
			Migrate: func(tx *gorm.DB) error {
				// when table already exists, it just adds fields as columns
				type Person struct {
					Age int
				}
				return tx.AutoMigrate(&Person{}).Error
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Table("people").DropColumn("age").Error
			},
		},
		// add pets table
		{
			ID: "201608301430",
			Migrate: func(tx *gorm.DB) error {
				type Pet struct {
					gorm.Model
					Name     string
					PersonID int
				}
				return tx.AutoMigrate(&Pet{}).Error
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.DropTable("pets").Error
			},
		},
	})

	if err = m.Migrate(); err != nil {
		log.Fatalf("Could not migrate: %v", err)
	}
	log.Printf("Migration did run successfully")
}
```

## Having a separated function for initializing the schema

If you have a lot of migrations, it can be a pain to run all them, as example,
when you are deploying a new instance of the app, in a clean database.
To prevent this, you can set a function that will run if no migration was run
before (in a new clean database). Remember to create everything here, all tables,
foreign keys and what more you need in your app.

```go
type Person struct {
	gorm.Model
	Name string
	Age int
}

type Pet struct {
	gorm.Model
	Name     string
	PersonID int
}

m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
    // you migrations here
})

m.InitSchema(func(tx *gorm.DB) error {
	err := tx.AutoMigrate(
		&Person{},
		&Pet{},
		// all other tables of you app
	)
	if err != nil {
		return err
	}

	if err := tx.Model(Pet{}).AddForeignKey("person_id", "people (id)", "RESTRICT", "RESTRICT").Error; err != nil {
		return err
	}
	// all other foreign keys...
	return nil
})
```

## Options

This is the options struct, in case you don't want the defaults:

```go
type Options struct {
	// Migrations table name. Default to "migrations".
	TableName string
	// The of the column that stores the id of migrations. Defaults to "id".
	IDColumnName string
	// UseTransaction makes Gormigrate execute migrations inside a single transaction.
	// Keep in mind that not all databases support DDL commands inside transactions.
	// Defaults to false.
	UseTransaction bool
}
```

[gorm]: http://jinzhu.me/gorm/
[gormmigrate]: http://jinzhu.me/gorm/database.html#migration
[gormdatabases]: http://jinzhu.me/gorm/database.html#connecting-to-a-database
