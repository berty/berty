package node

import (
	"context"
	"crypto/x509"
	"encoding/base64"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	"berty.tech/core/push"
	"github.com/google/uuid"
)

func (n *Node) DevicePushConfigList(ctx context.Context, input *node.Void) (*node.DevicePushConfigListOutput, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()

	n.handleMutex(ctx)()

	var devicePushConfigs []*entity.DevicePushConfig
	if err := n.sql(ctx).Model(entity.DevicePushConfig{}).Find(&devicePushConfigs).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return &node.DevicePushConfigListOutput{Edges: devicePushConfigs}, nil
}

func (n *Node) DevicePushConfigCreate(ctx context.Context, input *node.DevicePushConfigCreateInput) (*entity.DevicePushConfig, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	if input.PushType == push.DevicePushType_UnknownDevicePushType {
		return nil, errorcodes.ErrPushInvalidType.New()
	}

	if input.RelayPubkey == "" {
		config, err := n.Config(ctx)
		if err != nil {
			return nil, errorcodes.ErrDbNothingFound.Wrap(err)
		}

		if input.PushType == push.DevicePushType_APNS {
			input.RelayPubkey = config.PushRelayPubkeyAPNS
		} else if input.PushType == push.DevicePushType_FCM {
			input.RelayPubkey = config.PushRelayPubkeyFCM
		}
	}

	pubKeyBytes, err := base64.StdEncoding.DecodeString(input.RelayPubkey)
	if err != nil {
		return nil, errorcodes.ErrCryptoKeyDecode.Wrap(err)
	}

	if _, err := x509.ParsePKIXPublicKey(pubKeyBytes); err != nil {
		return nil, errorcodes.ErrCryptoKeyDecode.Wrap(err)
	}

	pushConfig := &entity.DevicePushConfig{
		ID:          uuid.New().String(),
		DeviceID:    n.config.CurrentDeviceID,
		RelayPubkey: input.RelayPubkey,
		PushID:      input.PushID,
		PushType:    input.PushType,
	}

	if err := n.sql(ctx).Save(pushConfig).Error; err != nil {
		return nil, errorcodes.ErrDbCreate.New()
	}

	if err := n.broadcastDevicePushConfig(ctx); err != nil {
		return nil, errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	return pushConfig, nil
}

func (n *Node) DevicePushConfigRemove(ctx context.Context, devicePushConfig *entity.DevicePushConfig) (*entity.DevicePushConfig, error) {
	tracer := tracing.EnterFunc(ctx, devicePushConfig)
	defer tracer.Finish()
	ctx = tracer.Context()

	var err error

	// get devicePushConfig
	if err = n.sql(ctx).First(devicePushConfig, &entity.DevicePushConfig{ID: devicePushConfig.ID}).Error; err != nil {
		return nil, errorcodes.ErrDbNothingFound.Wrap(err)
	}

	if devicePushConfig == nil {
		return nil, errorcodes.ErrDbNothingFound.New()
	}

	// remove devicePushConfig
	if err = n.sql(ctx).Delete(devicePushConfig).Error; err != nil {
		return nil, errorcodes.ErrDbDelete.Wrap(err)
	}

	if err := n.broadcastDevicePushConfig(ctx); err != nil {
		return nil, errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	return devicePushConfig, nil
}

func (n *Node) DevicePushConfigUpdate(ctx context.Context, input *entity.DevicePushConfig) (*entity.DevicePushConfig, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	var err error
	var devicePushConfig *entity.DevicePushConfig

	// get devicePushConfig
	if err = n.sql(ctx).First(input, devicePushConfig).Error; err != nil {
		return nil, errorcodes.ErrDbNothingFound.Wrap(err)
	}

	if len(input.RelayPubkey) > 0 {
		devicePushConfig.RelayPubkey = input.RelayPubkey
	}

	if len(input.PushID) > 0 {
		devicePushConfig.PushID = input.PushID
	}

	if input.PushType != push.DevicePushType_UnknownDevicePushType {
		devicePushConfig.PushType = input.PushType
	}

	if err = n.sql(ctx).Save(devicePushConfig).Error; err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	if err := n.broadcastDevicePushConfig(ctx); err != nil {
		return nil, errorcodes.ErrNet.Wrap(err)
	}

	return devicePushConfig, nil
}

func (n *Node) broadcastDevicePushConfig(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	contacts, err := n.allTrustedContacts(ctx)

	if err != nil {
		return errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	var devicePushConfigs []*entity.DevicePushConfig

	if err := n.sql(ctx).Model(entity.DevicePushConfig{}).Find(&devicePushConfigs).Error; err != nil {
		return errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	for _, contact := range contacts {
		device := n.config.CurrentDevice.Filtered().WithPushInformation(n.sql(ctx))

		evt := n.NewContactEvent(ctx, contact, p2p.Kind_DeviceUpdatePushConfig)
		if err := evt.SetDeviceUpdatePushConfigAttrs(&p2p.DeviceUpdatePushConfigAttrs{Device: device}); err != nil {
			return errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
		}

		if err := n.EnqueueOutgoingEvent(ctx, evt); err != nil {
			return errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
		}
	}

	return nil
}

func (n *Node) DevicePushConfigNativeRegister(ctx context.Context, void *node.Void) (*node.Void, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()

	if err := n.notificationDriver.Register(); err != nil {
		return nil, errorcodes.ErrPushProvider.Wrap(err)
	}

	return void, nil
}

func (n *Node) DevicePushConfigNativeUnregister(ctx context.Context, void *node.Void) (*node.Void, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()

	if err := n.notificationDriver.Unregister(); err != nil {
		return nil, errorcodes.ErrPushProvider.Wrap(err)
	}

	return void, nil
}
