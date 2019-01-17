package node

import (
	"berty.tech/core/entity"
	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/push"
	"bytes"
	"context"
	"go.uber.org/zap"
)

func WithPushManager(pushManager *push.Manager) NewNodeOption {
	return func(n *Node) {
		n.pushManager = pushManager
	}
}

func WithPushTokenSubscriber() NewNodeOption {
	return func(n *Node) {
		var err error
		ctx := context.Background()

		packageID := deviceinfo.PackageID()

		go func() {
			tokenSubscription := n.notificationDriver.SubscribeToken()

			for token := range tokenSubscription {
				currentToken := &entity.DevicePushConfig{}

				if err = n.sql(ctx).First(&currentToken, &entity.DevicePushConfig{PushType: token.Type}).Error; err != nil {
					logger().Error("unable to get push token", zap.Error(err))
				}

				pushID := &push.PushNativeIdentifier{
					PackageID:   packageID,
					DeviceToken: token.Hash(),
				}

				pushIDBytes, err := pushID.Marshal()
				if err != nil {
					logger().Error("unable to serialize push id", zap.Error(err))
					continue
				}

				if len(token.Value) > 0 && bytes.Compare(currentToken.PushID, pushIDBytes) == 0 {
					continue
				}

				if len(currentToken.PushID) > 0 {
					_, err = n.DevicePushConfigRemove(ctx, currentToken)

					logger().Error("unable to delete existing push token", zap.Error(err))
				}

				if len(token.Value) > 0 {
					_, err = n.DevicePushConfigCreate(ctx, &entity.DevicePushConfig{
						RelayID:  []byte{},
						PushID:   pushIDBytes,
						PushType: token.Type,
					})

					logger().Error("unable to create push token", zap.Error(err))
				}
			}
		}()
	}
}
