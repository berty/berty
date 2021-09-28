package bertyprotocol

import (
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/sideshow/apns2"
	"github.com/sideshow/apns2/certificate"
	"github.com/sideshow/apns2/payload"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

const (
	asn1UID              = "0.9.2342.19200300.100.1.1"
	appleCertDevNamePart = "Apple Development IOS Push Services"
)

type pushDispatcherAPNS struct {
	client   *apns2.Client
	bundleID string
}

func (d *pushDispatcherAPNS) TokenType() pushtypes.PushServiceTokenType {
	return pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService
}

func PushDispatcherLoadAPNSCertificates(input *string) ([]PushDispatcher, error) {
	if input == nil || *input == "" {
		return nil, nil
	}

	paths := strings.Split(*input, ",")
	dispatchers := make([]PushDispatcher, len(paths))
	for i, path := range paths {
		var err error
		dispatchers[i], err = pushDispatcherLoadAPNSCertificate(path)
		if err != nil {
			return nil, err
		}
	}

	return dispatchers, nil
}

func pushDispatcherLoadAPNSCertificate(path string) (PushDispatcher, error) {
	cert, err := certificate.FromP12File(path, "")
	if err != nil {
		return nil, errcode.ErrPushInvalidServerConfig
	}

	bundleID := ""
	for _, kv := range cert.Leaf.Subject.Names {
		if kv.Type.String() == asn1UID {
			bundleID = kv.Value.(string)
			break
		}
	}

	if bundleID == "" {
		return nil, errcode.ErrPushMissingBundleID
	}

	production := !strings.Contains(cert.Leaf.Subject.CommonName, appleCertDevNamePart)

	client := apns2.NewClient(cert)

	if production {
		client = client.Production()
	} else {
		client = client.Development()
	}

	return &pushDispatcherAPNS{
		bundleID: bundleID,
		client:   client,
	}, nil
}

func (d *pushDispatcherAPNS) Dispatch(data []byte, receiver *protocoltypes.PushServiceReceiver) error {
	pushPayload := payload.NewPayload()
	pushPayload.Custom(ServicePushPayloadKey, base64.RawURLEncoding.EncodeToString(data))
	pushPayload.ContentAvailable()
	notification := &apns2.Notification{}
	notification.DeviceToken = string(receiver.Token)
	notification.Topic = d.bundleID
	notification.Payload = pushPayload

	response, err := d.client.Push(notification)

	if err != nil {
		return errcode.ErrPushProvider.Wrap(err)
	} else if response.StatusCode != 200 {
		return errcode.ErrPushProvider.Wrap(fmt.Errorf("apns: status %d, reason %s", response.StatusCode, response.Reason))
	}

	return nil
}

func (d *pushDispatcherAPNS) BundleID() string {
	return d.bundleID
}
