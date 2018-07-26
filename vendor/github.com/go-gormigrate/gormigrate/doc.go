// Package gormigrate is a migration helper for Gorm (http://jinzhu.me/gorm/).
// Gorm already have useful migrate functions
// (http://jinzhu.me/gorm/database.html#migration), just misses
// proper schema versioning and rollback cababilities.
//
// Example:
//
//  package main
//
//  import (
//      "log"
//
//      "github.com/go-gormigrate/gormigrate"
//      "github.com/jinzhu/gorm"
//      _ "github.com/jinzhu/gorm/dialects/sqlite"
//  )
//
//  type Person struct {
//      gorm.Model
//      Name string
//  }
//
//  type Pet struct {
//      gorm.Model
//      Name     string
//      PersonID int
//  }
//
//  func main() {
//      db, err := gorm.Open("sqlite3", "mydb.sqlite3")
//      if err != nil {
//          log.Fatal(err)
//      }
//      if err = db.DB().Ping(); err != nil {
//          log.Fatal(err)
//      }
//
//      db.LogMode(true)
//
//      m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
//          {
//              ID: "201608301400",
//              Migrate: func(tx *gorm.DB) error {
//                  return tx.AutoMigrate(&Person{}).Error
//              },
//              Rollback: func(tx *gorm.DB) error {
//                  return tx.DropTable("people").Error
//              },
//          },
//          {
//              ID: "201608301430",
//              Migrate: func(tx *gorm.DB) error {
//                  return tx.AutoMigrate(&Pet{}).Error
//              },
//              Rollback: func(tx *gorm.DB) error {
//                  return tx.DropTable("pets").Error
//              },
//          },
//      })
//
//      err = m.Migrate()
//      if err == nil {
//          log.Printf("Migration did run successfully")
//      } else {
//          log.Printf("Could not migrate: %v", err)
//      }
//  }
package gormigrate
