package push

import (
	"berty.tech/core/pkg/errorcodes"
	"encoding/base64"
	"github.com/NaySoftware/go-fcm"
	"strings"
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
	if err := fcmIdentifier.Unmarshal(pushAttrs.PushIdentifier); err != nil {
		return false
	}

	if d.appID != fcmIdentifier.PackageID {
		return false
	}

	return true
}

func (d *FCMDispatcher) Dispatch(pushAttrs *PushData, pushDestination *PushDestination) error {
	fcmIdentifier := &PushNativeIdentifier{}
	if err := fcmIdentifier.Unmarshal(pushAttrs.PushIdentifier); err != nil {
		return errorcodes.ErrPushUnknownDestination.Wrap(err)
	}

	payload := map[string]interface{}{
		"berty-envelope": base64.StdEncoding.EncodeToString(pushAttrs.Envelope),
	}

	deviceToken := fcmIdentifier.DeviceToken

	if _, err := d.client.NewFcmMsgTo(deviceToken, payload).Send(); err != nil {
		return errorcodes.ErrPushProvider.Wrap(err)
	}

	return nil
}

var _ Dispatcher = &FCMDispatcher{}
