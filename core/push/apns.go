package push

import (
	"berty.tech/core/pkg/errorcodes"
	"encoding/base64"
	"github.com/sideshow/apns2"
	"github.com/sideshow/apns2/certificate"
	"github.com/sideshow/apns2/payload"
	"strings"
)

const asn1UID = "0.9.2342.19200300.100.1.1"
const appleCertDevNamePart = "Apple Development IOS Push Services"

type APNSDispatcher struct {
	bundleID string
	client   *apns2.Client
}

var _ Dispatcher = &APNSDispatcher{}

func NewAPNSDispatcher(path string) (Dispatcher, error) {
	cert, err := certificate.FromP12File(path, "")

	if err != nil {
		return nil, errorcodes.ErrPushInvalidServerConfig.Wrap(err)
	}

	bundleID := ""

	for _, kv := range cert.Leaf.Subject.Names {
		if kv.Type.String() == asn1UID {
			bundleID = kv.Value.(string)
			break
		}
	}

	if bundleID == "" {
		return nil, errorcodes.ErrPushMissingBundleId.New()
	}

	production := !strings.Contains(cert.Leaf.Subject.CommonName, appleCertDevNamePart)

	client := apns2.NewClient(cert)

	if production {
		client = client.Production()
	} else {
		client = client.Development()
	}

	dispatcher := &APNSDispatcher{
		bundleID: bundleID,
		client:   client,
	}

	return dispatcher, nil
}

func (d *APNSDispatcher) CanDispatch(pushAttrs *PushData, pushDestination *PushDestination) bool {
	if pushDestination.PushType != DevicePushType_APNS {
		return false
	}

	apnsIdentifier := &PushNativeIdentifier{}
	if err := apnsIdentifier.Unmarshal(pushAttrs.PushIdentifier); err != nil {
		return false
	}

	if d.bundleID != apnsIdentifier.PackageID {
		return false
	}

	return true
}

func (d *APNSDispatcher) Dispatch(pushAttrs *PushData, pushDestination *PushDestination) error {
	apnsIdentifier := &PushNativeIdentifier{}
	if err := apnsIdentifier.Unmarshal(pushDestination.PushId); err != nil {
		return errorcodes.ErrPushUnknownDestination.Wrap(err)
	}

	pushPayload := payload.NewPayload().Custom("berty-envelope", base64.StdEncoding.EncodeToString(pushAttrs.Envelope))
	if pushAttrs.Priority == Priority_Normal {
		pushPayload = pushPayload.Badge(1)
	}

	notification := &apns2.Notification{}
	notification.DeviceToken = apnsIdentifier.DeviceToken
	notification.Topic = "chat.berty"
	notification.Payload = pushPayload

	_, err := d.client.Push(notification)

	if err != nil {
		return errorcodes.ErrPushProvider.Wrap(err)
	}

	return nil
}
