package chatdb

import (
	"berty.tech/go/internal/chatdb/migrations"
	"berty.tech/go/internal/gormutil"
	"berty.tech/go/pkg/chatmodel"
	"berty.tech/go/pkg/errcode"
	"github.com/bwmarrin/snowflake"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

// Init configures an active gorm connection
func Init(db *gorm.DB, snowflakeNode *snowflake.Node, logger *zap.Logger) (*gorm.DB, error) {
	var err error
	db, err = gormutil.Init(db, logger)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	db.Callback().Create().Before("gorm:create").Register("bertychat_before_create", beforeCreate(snowflakeNode))
	return db, nil
}

// Migrate runs migrations
func Migrate(db *gorm.DB, forceViaMigrations bool) error {
	return gormutil.Migrate(db, migrations.GetMigrations(), chatmodel.AllModels(), forceViaMigrations)
}

// InitMigrate is an alias for Init() and Migrate()
func InitMigrate(db *gorm.DB, snowflakeNode *snowflake.Node, logger *zap.Logger) (*gorm.DB, error) {
	db, err := Init(db, snowflakeNode, logger)
	if err != nil {
		return nil, err
	}

	err = Migrate(db, false)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// DropDatabase drops all the tables of a database
func DropDatabase(db *gorm.DB) error {
	return gormutil.DropDatabase(db, chatmodel.AllTables())
}

func beforeCreate(snowflakeNode *snowflake.Node) func(*gorm.Scope) {
	return func(scope *gorm.Scope) {
		id := snowflakeNode.Generate().Int64()
		err := scope.SetColumn("ID", id)
		if err != nil {
			panic(err) // FIXME: avoid this
		}
	}
}
