package bertypushrelay

import (
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/sideshow/apns2"
	"github.com/sideshow/apns2/certificate"
	"github.com/sideshow/apns2/payload"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

const (
	asn1UID              = "0.9.2342.19200300.100.1.1"
	appleCertDevNamePart = "Apple Development IOS Push Services"
)

type pushDispatcherAPNS struct {
	logger   *zap.Logger
	client   *apns2.Client
	bundleID string
}

func (d *pushDispatcherAPNS) TokenType() pushtypes.PushServiceTokenType {
	return pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService
}

func PushDispatcherLoadAPNSCertificates(logger *zap.Logger, input *string) ([]PushDispatcher, error) {
	if input == nil || *input == "" {
		return nil, nil
	}

	paths := strings.Split(*input, ",")
	dispatchers := make([]PushDispatcher, len(paths))
	for i, path := range paths {
		var err error
		dispatchers[i], err = pushDispatcherLoadAPNSCertificate(logger, path)
		if err != nil {
			return nil, err
		}
	}

	return dispatchers, nil
}

func pushDispatcherLoadAPNSCertificate(logger *zap.Logger, path string) (PushDispatcher, error) {
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
		logger:   logger.Named("apns"),
		bundleID: bundleID,
		client:   client,
	}, nil
}

func (d *pushDispatcherAPNS) Dispatch(data []byte, receiver *protocoltypes.PushServiceReceiver) error {
	token := hex.EncodeToString(receiver.Token)
	secretToken := fmt.Sprintf("%.10s...", token)

	pushPayload := payload.NewPayload()
	pushPayload.Custom(pushtypes.ServicePushPayloadKey, base64.RawURLEncoding.EncodeToString(data))
	pushPayload.MutableContent()
	pushPayload.AlertLocKey("BertyPushMessage")
	// @TODO(gfanton): maybe add a body message ?

	notification := &apns2.Notification{}
	notification.DeviceToken = token
	notification.Topic = d.bundleID
	notification.Payload = pushPayload
	notification.PushType = apns2.PushTypeAlert

	d.logger.Debug("apns notification",
		logutil.PrivateString("token device", secretToken),
		zap.String("bundleid", d.bundleID))

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
