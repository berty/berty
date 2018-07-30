package node

import (
	uuid "github.com/satori/go.uuid"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
)

func (n *Node) initConfig() (*entity.Config, error) {
	deviceID := uuid.Must(uuid.NewV4()).String() // FIXME: use sigchain.ID()

	currentDevice := &entity.Device{
		Status:     entity.Device_Myself,
		ID:         deviceID,
		Name:       n.initDevice.Name,
		ApiVersion: p2p.Version,
	}

	config := entity.Config{
		Myself: &entity.Contact{
			ID:          deviceID,
			Devices:     []*entity.Device{currentDevice},
			DisplayName: n.initDevice.Username(),
			Status:      entity.Contact_Myself,
		},
		CurrentDevice: currentDevice,
	}

	if err := n.sql.Set("gorm:association_autoupdate", true).Save(&config).Error; err != nil {
		return nil, err
	}
	return n.Config()
}

// Config gets config from database
func (n *Node) Config() (*entity.Config, error) {
	var config entity.Config
	return &config, n.sql.First(&config).Error
}
