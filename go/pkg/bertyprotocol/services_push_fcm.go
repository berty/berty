package bertyprotocol

import (
	"encoding/base64"
	"strings"

	"github.com/appleboy/go-fcm"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type pushDispatcherFCM struct {
	client *fcm.Client
	appID  string
}

func (d *pushDispatcherFCM) TokenType() pushtypes.PushServiceTokenType {
	return pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging
}

func PushDispatcherLoadFirebaseAPIKey(input *string) ([]PushDispatcher, error) {
	if input == nil || *input == "" {
		return nil, nil
	}

	apiKeys := strings.Split(*input, ",")
	dispatchers := make([]PushDispatcher, len(apiKeys))
	for i, apiKeyDetails := range apiKeys {
		var err error
		dispatchers[i], err = pushDispatcherLoadFCMAPIKey(apiKeyDetails)
		if err != nil {
			return nil, err
		}
	}

	return dispatchers, nil
}

func pushDispatcherLoadFCMAPIKey(apiKeyDetails string) (PushDispatcher, error) {
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
	}

	return dispatcher, nil
}

func (d *pushDispatcherFCM) Dispatch(payload []byte, receiver *protocoltypes.PushServiceReceiver) error {
	msg := &fcm.Message{
		To: string(receiver.Token),
		Data: map[string]interface{}{
			ServicePushPayloadKey: base64.RawURLEncoding.EncodeToString(payload),
		},
	}

	if _, err := d.client.Send(msg); err != nil {
		return errcode.ErrPushProvider.Wrap(err)
	}

	return errcode.ErrNotImplemented
}

func (d *pushDispatcherFCM) BundleID() string {
	return d.appID
}
