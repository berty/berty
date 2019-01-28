package push

import (
	"encoding/base64"
	"strings"

	"berty.tech/core/chunk"
	"berty.tech/core/pkg/errorcodes"
	fcm "github.com/NaySoftware/go-fcm"
)

type FCMDispatcher struct {
	client *fcm.FcmClient
	appID  string
}

func NewFCMDispatcher(appIDApiKey string) (Dispatcher, error) {
	splitResult := strings.SplitN(appIDApiKey, ":", 2)
	if len(splitResult) != 2 {
		return nil, errorcodes.ErrPushInvalidServerConfig.New()
	}

	appID := splitResult[0]
	apiKey := splitResult[1]

	client := fcm.NewFcmClient(apiKey)

	dispatcher := &FCMDispatcher{
		client: client,
		appID:  appID,
	}

	return dispatcher, nil
}

func (d *FCMDispatcher) CanDispatch(pushAttrs *PushData, pushDestination *PushDestination) bool {
	if pushDestination.PushType != DevicePushType_FCM {
		return false
	}

	fcmIdentifier := &PushNativeIdentifier{}
	if err := fcmIdentifier.Unmarshal(pushDestination.PushId); err != nil {
		return false
	}

	if d.appID != fcmIdentifier.PackageID {
		return false
	}

	return true
}

func (d *FCMDispatcher) Dispatch(pushAttrs *PushData, pushDestination *PushDestination) error {
	fcmIdentifier := &PushNativeIdentifier{}
	if err := fcmIdentifier.Unmarshal(pushDestination.PushId); err != nil {
		return errorcodes.ErrPushUnknownDestination.Wrap(err)
	}

	chunks, err := chunk.SplitMarshal(pushAttrs.Envelope, 2000)
	if err != nil {
		return err
	}
	for _, chunk := range chunks {
		payload := Payload{Chunk: base64.StdEncoding.EncodeToString(chunk)}

		deviceToken := fcmIdentifier.DeviceToken

		if _, err := d.client.NewFcmMsgTo(deviceToken, payload).Send(); err != nil {
			return errorcodes.ErrPushProvider.Wrap(err)
		}
	}

	return nil
}

var _ Dispatcher = &FCMDispatcher{}
