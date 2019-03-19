package node

import (
	"context"
	"encoding/base64"
	"fmt"

	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/push"

	"github.com/gofrs/uuid"
	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/sigchain"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	"berty.tech/core/pkg/zapring"
)

func WithRing(ring *zapring.Ring) NewNodeOption {
	return func(n *Node) {
		n.ring = ring
	}
}

func WithInitConfig() NewNodeOption {
	return func(n *Node) {
		tracer := tracing.EnterFunc(n.rootContext)
		defer tracer.Finish()
		ctx := tracer.Context()

		// get config from sql
		config, err := n.Config(ctx)
		if err != nil {
			ID, err := uuid.NewV4()

			if err != nil {
				logger().Error("node.WithInitConfig", zap.Error(errors.Wrap(err, "failed to save empty config")))
				return
			}

			fmt.Printf("\n\nCreating new config\n\n\n")

			config = &entity.Config{
				ID:                         ID.String(),
				PushRelayPubkeyAPNS:        push.DefaultPushRelayPubkeys[push.DevicePushType_APNS],
				PushRelayPubkeyFCM:         push.DefaultPushRelayPubkeys[push.DevicePushType_FCM],
				NotificationsEnabled:       false,
				NotificationsPreviews:      true,
				DebugNotificationVerbosity: entity.DebugVerbosity_VERBOSITY_LEVEL_ERROR,
			}

			if err = n.sql(ctx).Create(config).Error; err != nil {
				logger().Error("node.WithInitConfig", zap.Error(errors.Wrap(err, "failed to save empty config")))
				return
			}
		}

		n.config = config
	}
}

func WithConfig() NewNodeOption {
	return func(n *Node) {
		tracer := tracing.EnterFunc(n.rootContext)
		defer tracer.Finish()
		ctx := tracer.Context()

		// get config from sql
		config, err := n.Config(ctx)

		if err != nil {
			zap.Error(errors.Wrap(err, "failed to load existing config"))

			return
		}

		if config.Validate() != nil {
			logger().Debug("config is missing from sql, creating a new one")
			if _, err = n.initConfig(ctx); err != nil {
				zap.Error(errors.Wrap(err, "failed to initialize config"))

				return
			}
		}

		config, err = n.Config(ctx)

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

func (n *Node) initConfig(ctx context.Context) (*entity.Config, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	if n.crypto == nil {
		return nil, errorcodes.ErrCrypto.Wrap(errors.New("unable to get crypto instance"))
	}

	pubBytes, err := n.crypto.GetPubKey()

	if err != nil {
		return nil, errorcodes.ErrCryptoKey.Wrap(err)
	}

	sc := sigchain.SigChain{}

	if err := sc.Init(n.crypto, pubBytes); err != nil {
		return nil, errorcodes.ErrCryptoSigchain.Wrap(err)
	}

	scBytes, err := proto.Marshal(&sc)
	if err != nil {
		return nil, errorcodes.ErrCryptoSigchain.Wrap(err)
	}

	myself := &entity.Contact{
		ID:          base64.StdEncoding.EncodeToString(pubBytes),
		DisplayName: n.initDevice.Username(),
		Status:      entity.Contact_Myself,
		Sigchain:    scBytes,
	}

	if err := n.sql(ctx).Create(myself).Error; err != nil {
		return nil, errorcodes.ErrDbCreate.Wrap(err)
	}

	// db object
	currentDevice := &entity.Device{
		Status:     entity.Device_Myself,
		ID:         base64.StdEncoding.EncodeToString(pubBytes),
		Name:       n.initDevice.Name,
		ApiVersion: p2p.Version,
		ContactID:  myself.ID,
	}

	if err := n.sql(ctx).Create(currentDevice).Error; err != nil {
		return nil, errorcodes.ErrDbCreate.Wrap(err)
	}

	n.config.CurrentDevice = currentDevice
	n.config.CurrentDeviceID = n.config.CurrentDevice.ID
	n.config.Myself = myself
	n.config.MyselfID = n.config.Myself.ID

	if err := n.sql(ctx).
		Save(&n.config).
		Error; err != nil {
		return nil, errorcodes.ErrDbCreate.Wrap(err)
	}

	return n.config, nil
}

// Config gets config from database
func (n *Node) Config(ctx context.Context) (*entity.Config, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	var config []*entity.Config

	if err := n.sql(ctx).Preload("CurrentDevice").Preload("Myself").Preload("Myself.Devices").Find(&config, &entity.Config{}).Error; err != nil {
		// if err := n.sql.First(config).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	if len(config) == 0 {

		return nil, errorcodes.ErrDbNothingFound.New()
	}

	n.config = config[0]

	return n.config, nil
}
