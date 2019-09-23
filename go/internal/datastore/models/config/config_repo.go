package config

import (
	"context"
	"crypto/rand"
	"errors"

	"berty.tech/go/pkg/iface"
	"github.com/jinzhu/gorm"
)

const KeyPublicRendezvousPointSeed = "PUBLIC_RENDEZVOUS_POINT_SEED"
const KeyPublicRendezvousPointEnabled = "PUBLIC_RENDEZVOUS_POINT_ENABLED"

type repository struct {
	db *gorm.DB
}

func (r *repository) get(ctx context.Context, key string) ([]byte, error) {
	var config Config

	err := r.db.First(&config, "key = ?", key).Error

	return config.Value, err
}

func (r *repository) set(ctx context.Context, key string, value []byte) ([]byte, error) {
	var config Config

	if err := r.db.Update(&config, "key = ?, value = ?", key, value).Error; err != nil {
		return nil, err
	}

	return config.Value, nil
}

func (r *repository) delete(ctx context.Context, key string) error {
	var config Config

	if err := r.db.Delete(&config, "key = ?", key).Error; err != nil {
		return err
	}

	return nil
}

func (r *repository) GetPublicRendezvousPointSeed(ctx context.Context) ([]byte, error) {
	return r.get(ctx, KeyPublicRendezvousPointSeed)
}

func (r *repository) ResetPublicRendezvousPointSeed(ctx context.Context) ([]byte, error) {
	seed := make([]byte, 32)
	length, err := rand.Read(seed)
	if err != nil {
		return nil, err
	}

	if length != 32 {
		return nil, errors.New("unable to generate enough data")
	}

	return r.set(ctx, KeyPublicRendezvousPointSeed, seed)
}

func (r *repository) IsPublicRendezvousPointEnabled(ctx context.Context) (bool, error) {
	val, err := r.get(ctx, KeyPublicRendezvousPointEnabled)

	return val[0] == 1, err
}

func (r *repository) EnablePublicRendezvousPoint(ctx context.Context) (bool, error) {
	val, err := r.set(ctx, KeyPublicRendezvousPointEnabled, []byte{1})

	return val[0] == 1, err
}

func (r *repository) DisablePublicRendezvousPoint(ctx context.Context) (bool, error) {
	val, err := r.set(ctx, KeyPublicRendezvousPointEnabled, []byte{0})

	return val[0] == 1, err
}

func NewRepository(db *gorm.DB) iface.ConfigRepository {
	return &repository{
		db: db,
	}
}

var _ iface.ConfigRepository = (*repository)(nil)
