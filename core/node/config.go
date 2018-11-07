package node

import (
	"encoding/base64"

	"go.uber.org/zap"

	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/sigchain"
	"berty.tech/core/entity"
	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
)

func WithInitConfig() NewNodeOption {
	return func(n *Node) {
		// get config from sql
		config, err := n.Config()
		if err != nil {
			ID, err := uuid.NewV4()

			if err != nil {
				logger().Error("node.WithInitConfig", zap.Error(errors.Wrap(err, "failed to save empty config")))
				return
			}

			config = &entity.Config{
				ID: ID.String(),
			}

			if err = n.sql.Create(config).Error; err != nil {
				logger().Error("node.WithInitConfig", zap.Error(errors.Wrap(err, "failed to save empty config")))
				return
			}
		}

		n.config = config
	}
}

func WithConfig() NewNodeOption {
	return func(n *Node) {
		// get config from sql
		config, err := n.Config()

		if err != nil {
			zap.Error(errors.Wrap(err, "failed to load existing config"))

			return
		}

		if config.Validate() != nil {
			logger().Debug("config is missing from sql, creating a new one")
			if _, err = n.initConfig(); err != nil {
				zap.Error(errors.Wrap(err, "failed to initialize config"))

				return
			}
		}

		config, err = n.Config()

		if err != nil {
			logger().Error("WithConfig", zap.Error(errors.Wrap(err, "unable to load node config")))
			return
		}

		if err = config.Validate(); err != nil {
			logger().Error("WithConfig", zap.Error(errors.Wrap(err, "node config is invalid")))
			return
		}

		n.config = config
	}
}

func (n *Node) initConfig() (*entity.Config, error) {
	if n.crypto == nil {
		return nil, errors.New("unable to get crypto instance")
	}

	pubBytes, err := n.crypto.GetPubKey()

	if err != nil {
		return nil, errors.Wrap(err, "unable to init config")
	}

	sc := sigchain.SigChain{}

	if err := sc.Init(n.crypto, pubBytes); err != nil {
		return nil, errors.Wrap(err, "failed to initialize sigchain")
	}

	scBytes, err := proto.Marshal(&sc)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal sigchain")
	}

	myself := &entity.Contact{
		ID:          base64.StdEncoding.EncodeToString(pubBytes),
		DisplayName: n.initDevice.Username(),
		Status:      entity.Contact_Myself,
		Sigchain:    scBytes,
	}

	if err := n.sql.Create(myself).Error; err != nil {
		return nil, errors.Wrap(err, "unable to save myself")
	}

	// db object
	currentDevice := &entity.Device{
		Status:     entity.Device_Myself,
		ID:         base64.StdEncoding.EncodeToString(pubBytes),
		Name:       n.initDevice.Name,
		ApiVersion: p2p.Version,
		ContactID:  myself.ID,
	}

	if err := n.sql.Create(currentDevice).Error; err != nil {
		return nil, errors.Wrap(err, "unable to save config")
	}

	n.config.CurrentDevice = currentDevice
	n.config.CurrentDeviceID = n.config.CurrentDevice.ID
	n.config.Myself = myself
	n.config.MyselfID = n.config.Myself.ID

	if err := n.sql.
		Save(&n.config).
		Error; err != nil {
		return nil, errors.Wrap(err, "failed to save config")
	}

	return n.config, nil
}

// Config gets config from database
func (n *Node) Config() (*entity.Config, error) {
	var config []*entity.Config

	if err := n.sql.Preload("CurrentDevice").Preload("Myself").Preload("Myself.Devices").Find(&config, &entity.Config{}).Error; err != nil {
		// if err := n.sql.First(config).Error; err != nil {
		return nil, errors.Wrap(err, "unable to get config")
	}

	if len(config) == 0 {
		return nil, errors.New("config not found")
	}

	n.config = config[0]

	return n.config, nil
}
