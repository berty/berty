package push

import (
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
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

func (n *FCMDispatcher) CanDispatch(push *p2p.DevicePushToAttrs, pushDestination *p2p.DevicePushToDecrypted) bool {
	if pushDestination.PushType != entity.DevicePushType_FCM {
		return false
	}

	fcmIdentifier := &p2p.PushNativeIdentifier{}
	if err := fcmIdentifier.Unmarshal(push.PushIdentifier); err != nil {
		return false
	}

	if n.appID != fcmIdentifier.PackageID {
		return false
	}

	return true
}

func (n *FCMDispatcher) Dispatch(push *p2p.DevicePushToAttrs, pushDestination *p2p.DevicePushToDecrypted) error {
	fcmIdentifier := &p2p.PushNativeIdentifier{}
	if err := fcmIdentifier.Unmarshal(push.PushIdentifier); err != nil {
		return errorcodes.ErrPushUnknownDestination.Wrap(err)
	}

	payload := map[string]interface{}{
		"berty-envelope": base64.StdEncoding.EncodeToString(push.Envelope),
	}

	deviceToken := string(fcmIdentifier.DeviceToken)

	if _, err := n.client.NewFcmMsgTo(deviceToken, payload).Send(); err != nil {
		return errorcodes.ErrPushProvider.Wrap(err)
	}

	return nil
}

var _ Dispatcher = &FCMDispatcher{}
