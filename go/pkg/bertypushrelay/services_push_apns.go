package bertypushrelay

import (
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/sideshow/apns2"
	"github.com/sideshow/apns2/certificate"
	"github.com/sideshow/apns2/payload"
	"github.com/sideshow/apns2/token"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/v2/pkg/logutil"
)

const (
	asn1UID              = "0.9.2342.19200300.100.1.1"
	appleCertDevNamePart = "Apple Sandbox Push Services"
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
		return nil, errcode.ErrCode_ErrPushInvalidServerConfig
	}

	bundleID := ""
	for _, kv := range cert.Leaf.Subject.Names {
		if kv.Type.String() == asn1UID {
			bundleID = kv.Value.(string)
			break
		}
	}

	if bundleID == "" {
		return nil, errcode.ErrCode_ErrPushMissingBundleID
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

// APNSAuthKeyConfig configures token-based authentication with APNs, using an
// APNs auth key (.p8) instead of a per-app certificate (.p12). Unlike a
// certificate, one key can be used for several apps and for both APNs
// environments, so the apps to serve are listed per environment.
type APNSAuthKeyConfig struct {
	// KeyPath is the path of the .p8 key file.
	KeyPath string
	// KeyID is the 10-character identifier of the key.
	KeyID string
	// TeamID is the identifier of the Apple developer team owning the key.
	TeamID string
	// ProductionBundleIDs are the apps whose notifications go through the APNs production environment.
	ProductionBundleIDs []string
	// SandboxBundleIDs are the apps whose notifications go through the APNs sandbox environment.
	SandboxBundleIDs []string
}

func (c APNSAuthKeyConfig) isEmpty() bool {
	return c.KeyPath == "" && c.KeyID == "" && c.TeamID == "" &&
		len(c.ProductionBundleIDs) == 0 && len(c.SandboxBundleIDs) == 0
}

// PushDispatcherLoadAPNSAuthKey returns one APNs dispatcher per configured
// bundle ID, all authenticated with the same .p8 key. It returns no dispatcher
// if the config is empty.
func PushDispatcherLoadAPNSAuthKey(logger *zap.Logger, cfg APNSAuthKeyConfig) ([]PushDispatcher, error) {
	if cfg.isEmpty() {
		return nil, nil
	}

	if cfg.KeyPath == "" || cfg.KeyID == "" || cfg.TeamID == "" {
		return nil, errcode.ErrCode_ErrPushInvalidServerConfig.Wrap(fmt.Errorf("apns auth key: the key path, key ID and team ID are all required"))
	}

	if len(cfg.ProductionBundleIDs) == 0 && len(cfg.SandboxBundleIDs) == 0 {
		return nil, errcode.ErrCode_ErrPushInvalidServerConfig.Wrap(fmt.Errorf("apns auth key: at least one bundle ID is required"))
	}

	authKey, err := token.AuthKeyFromFile(cfg.KeyPath)
	if err != nil {
		return nil, errcode.ErrCode_ErrPushInvalidServerConfig.Wrap(fmt.Errorf("apns auth key: %w", err))
	}

	// shared by both clients, it renews the JWT before it expires
	authToken := &token.Token{
		AuthKey: authKey,
		KeyID:   cfg.KeyID,
		TeamID:  cfg.TeamID,
	}

	logger = logger.Named("apns")
	dispatchers := make([]PushDispatcher, 0, len(cfg.ProductionBundleIDs)+len(cfg.SandboxBundleIDs))
	seen := make(map[string]struct{})

	for _, env := range []struct {
		bundleIDs []string
		client    func() *apns2.Client
	}{
		{cfg.ProductionBundleIDs, func() *apns2.Client { return apns2.NewTokenClient(authToken).Production() }},
		{cfg.SandboxBundleIDs, func() *apns2.Client { return apns2.NewTokenClient(authToken).Development() }},
	} {
		if len(env.bundleIDs) == 0 {
			continue
		}

		client := env.client()
		for _, bundleID := range env.bundleIDs {
			if bundleID == "" {
				return nil, errcode.ErrCode_ErrPushInvalidServerConfig.Wrap(fmt.Errorf("apns auth key: empty bundle ID"))
			}
			if _, ok := seen[bundleID]; ok {
				return nil, errcode.ErrCode_ErrPushInvalidServerConfig.Wrap(fmt.Errorf("apns auth key: bundle ID %s listed twice", bundleID))
			}
			seen[bundleID] = struct{}{}

			dispatchers = append(dispatchers, &pushDispatcherAPNS{
				logger:   logger,
				bundleID: bundleID,
				client:   client,
			})
		}
	}

	return dispatchers, nil
}

func (d *pushDispatcherAPNS) Dispatch(data []byte, receiver *pushtypes.PushServiceReceiver) error {
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
		return errcode.ErrCode_ErrPushProvider.Wrap(err)
	} else if response.StatusCode != 200 {
		return errcode.ErrCode_ErrPushProvider.Wrap(fmt.Errorf("apns: status %d, reason %s", response.StatusCode, response.Reason))
	}

	return nil
}

func (d *pushDispatcherAPNS) BundleID() string {
	return d.bundleID
}
