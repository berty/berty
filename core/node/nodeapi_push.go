package node

import (
	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	"context"
	"github.com/google/uuid"
	"github.com/pkg/errors"
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

func (n *Node) DevicePushConfigCreateNative(ctx context.Context, input *node.DevicePushConfigCreateInput) (*entity.DevicePushConfig, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	if len(input.DeviceToken) == 0 || (input.PushType != entity.DevicePushType_APNS && input.PushType != entity.DevicePushType_FCM) {
		return nil, errorcodes.ErrValidation.Wrap(errors.New("token type is not suitable"))
	}

	pushID := &p2p.PushNativeIdentifier{
		PackageID:   input.PackageID,
		DeviceToken: input.DeviceToken,
	}

	pushIDBytes, err := pushID.Marshal()

	if err != nil {
		return nil, errorcodes.ErrSerialization.Wrap(err)
	}

	return n.DevicePushConfigCreate(ctx, &entity.DevicePushConfig{
		PushID:   pushIDBytes,
		PushType: input.PushType,
		RelayID:  input.RelayID,
	})
}

func (n *Node) DevicePushConfigCreate(ctx context.Context, devicePushConfig *entity.DevicePushConfig) (*entity.DevicePushConfig, error) {
	tracer := tracing.EnterFunc(ctx, devicePushConfig)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	if devicePushConfig.PushType == entity.DevicePushType_UnknownDevicePushType {
		return nil, errorcodes.ErrPushInvalidType.New()
	}

	if len(devicePushConfig.RelayID) == 0 {
		if devicePushConfig.PushType == entity.DevicePushType_FCM {
			devicePushConfig.RelayID = n.config.PushRelayIDAPNS
		} else if devicePushConfig.PushType == entity.DevicePushType_FCM {
			devicePushConfig.RelayID = n.config.PushRelayIDAPNS
		}
	}

	devicePushConfig.ID = uuid.New().String()
	devicePushConfig.DeviceID = n.config.CurrentDeviceID

	if err := n.sql(ctx).Save(devicePushConfig).Error; err != nil {
		return nil, errorcodes.ErrDbCreate.New()
	}

	if err := n.broadcastDevicePushConfig(ctx); err != nil {
		return nil, errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	return devicePushConfig, nil
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

	if len(input.RelayID) > 0 {
		devicePushConfig.RelayID = input.RelayID
	}

	if len(input.PushID) > 0 {
		devicePushConfig.PushID = input.PushID
	}

	if input.PushType != entity.DevicePushType_UnknownDevicePushType {
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
		device := *n.config.CurrentDevice
		device.PushIdentifiers = []*entity.DevicePushIdentifier{}

		for _, devicePushConfig := range devicePushConfigs {
			pushIdentifier, err := p2p.CreateDevicePushIdentifier(devicePushConfig)

			if err != nil {
				return errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
			}

			device.PushIdentifiers = append(device.PushIdentifiers, pushIdentifier)
		}

		evt := n.NewContactEvent(ctx, contact, p2p.Kind_DeviceUpdatePushConfig)
		if err := evt.SetDeviceUpdatePushConfigAttrs(&p2p.DeviceUpdatePushConfigAttrs{Device: &device}); err != nil {
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
