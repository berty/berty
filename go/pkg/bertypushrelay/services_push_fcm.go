package bertypushrelay

import (
	"encoding/base64"
	"strings"

	"github.com/appleboy/go-fcm"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type pushDispatcherFCM struct {
	client *fcm.Client
	appID  string
	logger *zap.Logger
}

func (d *pushDispatcherFCM) TokenType() pushtypes.PushServiceTokenType {
	return pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging
}

func PushDispatcherLoadFirebaseAPIKey(logger *zap.Logger, input *string) ([]PushDispatcher, error) {
	if input == nil || *input == "" {
		return nil, nil
	}

	apiKeys := strings.Split(*input, ",")
	dispatchers := make([]PushDispatcher, len(apiKeys))
	for i, apiKeyDetails := range apiKeys {
		var err error
		dispatchers[i], err = pushDispatcherLoadFCMAPIKey(logger, apiKeyDetails)
		if err != nil {
			return nil, err
		}
	}

	return dispatchers, nil
}

func pushDispatcherLoadFCMAPIKey(logger *zap.Logger, apiKeyDetails string) (PushDispatcher, error) {
	splitResult := strings.SplitN(apiKeyDetails, ":", 2)
	if len(splitResult) != 2 {
		return nil, errcode.ErrPushInvalidServerConfig
	}

	appID := splitResult[0]
	apiKey := splitResult[1]

	client, err := fcm.NewClient(apiKey)
	if err != nil {
		return nil, errcode.ErrPushInvalidServerConfig.Wrap(err)
	}

	dispatcher := &pushDispatcherFCM{
		client: client,
		appID:  appID,
		logger: logger,
	}

	return dispatcher, nil
}

func (d *pushDispatcherFCM) Dispatch(payload []byte, receiver *protocoltypes.PushServiceReceiver) error {
	msg := &fcm.Message{
		To: string(receiver.Token),
		Data: map[string]interface{}{
			pushtypes.ServicePushPayloadKey: base64.RawURLEncoding.EncodeToString(payload),
		},
	}

	res, err := d.client.Send(msg)
	if err != nil {
		return errcode.ErrPushProvider.Wrap(err)
	}

	if res.Error != nil {
		return errcode.ErrPushProvider.Wrap(res.Error)
	}

	return nil
}

func (d *pushDispatcherFCM) BundleID() string {
	return d.appID
}
