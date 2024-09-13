package bertypushrelay

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"go.uber.org/zap"
	"google.golang.org/api/option"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type pushDispatcherFCM struct {
	ctx    context.Context
	client *messaging.Client
	appID  string
	logger *zap.Logger
}

func (d *pushDispatcherFCM) TokenType() pushtypes.PushServiceTokenType {
	return pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging
}

// PushDispatcherLoadFirebaseAPIKey creates the FCM clients.
// If the `GOOGLE_APPLICATION_CREDENTIALS` env var is set, it will be used to create only one client.
// Otherwise, the `keys` parameter will be used, formatted like app_id:api_key.json and comma-separated to create the corresponding clients.
func PushDispatcherLoadFirebaseAPIKey(ctx context.Context, logger *zap.Logger, bundleInput, keys *string) ([]PushDispatcher, error) {
	var err error

	if os.Getenv("GOOGLE_APPLICATION_CREDENTIALS") != "" {
		if bundleInput == nil || *bundleInput == "" {
			return nil, errcode.ErrCode_ErrPushMissingBundleID
		}

		bundleIDs := strings.Split(*bundleInput, ",")
		dispatchers := make([]PushDispatcher, len(bundleIDs))
		for i, id := range bundleIDs {
			var err error
			dispatchers[i], err = pushDispatcherLoadFCMAPIKey(ctx, logger, id)
			if err != nil {
				return nil, err
			}
		}
		return dispatchers, err
	}

	if keys == nil || *keys == "" {
		return nil, nil
	}

	apiKeys := strings.Split(*keys, ",")
	dispatchers := make([]PushDispatcher, len(apiKeys))
	for i, apiKeyDetails := range apiKeys {
		splitResult := strings.SplitN(apiKeyDetails, ":", 2)
		if len(splitResult) != 2 {
			return nil, errcode.ErrCode_ErrPushInvalidServerConfig
		}

		appID := splitResult[0]
		apiKey := splitResult[1]
		opt := option.WithCredentialsFile(apiKey)
		dispatchers[i], err = pushDispatcherLoadFCMAPIKey(ctx, logger, appID, opt)
		if err != nil {
			return nil, err
		}
	}

	return dispatchers, nil
}

func pushDispatcherLoadFCMAPIKey(ctx context.Context, logger *zap.Logger, bundleID string, opts ...option.ClientOption) (PushDispatcher, error) {
	app, err := firebase.NewApp(ctx, nil, opts...)
	if err != nil {
		return nil, errcode.ErrCode_ErrPushInvalidServerConfig.Wrap(err)
	}

	// Access messaging service from the default app
	client, err := app.Messaging(ctx)
	if err != nil {
		return nil, errcode.ErrCode_ErrPushInvalidServerConfig.Wrap(err)
	}

	dispatcher := &pushDispatcherFCM{
		ctx:    ctx,
		client: client,
		appID:  bundleID,
		logger: logger,
	}

	return dispatcher, nil
}

func (d *pushDispatcherFCM) Dispatch(payload []byte, receiver *pushtypes.PushServiceReceiver) error {
	msg := &messaging.Message{
		Token: string(receiver.Token),
		Data: map[string]string{
			pushtypes.ServicePushPayloadKey: base64.RawURLEncoding.EncodeToString(payload),
		},
	}

	res, err := d.client.Send(d.ctx, msg)
	if err != nil {
		return errcode.ErrCode_ErrPushProvider.Wrap(err)
	}

	if res == "" {
		return errcode.ErrCode_ErrPushProvider.Wrap(fmt.Errorf("FMC messaging client failed to send push notification"))
	}

	return nil
}

func (d *pushDispatcherFCM) BundleID() string {
	return d.appID
}
