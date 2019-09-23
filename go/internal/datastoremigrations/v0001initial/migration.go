package v0001initial

import (
	"errors"
	"github.com/jinzhu/gorm"
	"gopkg.in/gormigrate.v1"
	"time"
)

type Config struct {
	Key                  string    `protobuf:"bytes,1,opt,name=key,proto3" json:"key,omitempty" gorm:"primary_key;unique"`
	Value                []byte    `protobuf:"bytes,2,opt,name=value,proto3" json:"value,omitempty"`
	CreatedAt            time.Time `protobuf:"bytes,3,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt            time.Time `protobuf:"bytes,4,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
	XXX_NoUnkeyedLiteral struct{}  `json:"-"`
	XXX_unrecognized     []byte    `json:"-"`
	XXX_sizecache        int32     `json:"-"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "0001_initial",
		Migrate: func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				Config{},
			).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return errors.New("not implemented")
		},
	}
}
