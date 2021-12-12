package bertybridge

import (
	"context"
	"fmt"
	"runtime"
	"time"

	push "berty.tech/berty/v2/go/framework/bertypush"
	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

const (
	ServicePushPayloadKey = pushtypes.ServicePushPayloadKey
	StorageKeyName        = accountutils.StorageKeyName
)

type (
	DecryptedPush pushtypes.DecryptedPush
	FormatedPush  pushtypes.FormatedPush
)

type PushConfig struct {
	p *push.Config
}

func NewPushConfig() *PushConfig {
	return &PushConfig{
		p: &push.Config{},
	}
}

func (c *PushConfig) SetPreferredLanguages(lang string) { c.p.SetPreferredLanguages(lang) }
func (c *PushConfig) SetDriverLogger(logger NativeLoggerDriver) {
	l := newLogger(logger)
	c.p.SetLogger(l)
}

type PushStandalone struct {
	p *push.PushStandalone
}

func NewPushStandalone(c *PushConfig) *PushStandalone {
	s := push.NewPushStandalone(c.p)
	return &PushStandalone{s}
}

func (s *PushStandalone) Decrypt(rootDir string, inputB64 string, ks NativeKeystoreDriver) (*FormatedPush, error) {
	f, err := s.p.Decrypt(rootDir, inputB64, ks)
	if err != nil {
		return nil, err
	}

	return (*FormatedPush)(f), nil
}

func (b *Bridge) PushDecrypt(inputB64 string) (*FormatedPush, error) {
	if b == nil || b.serviceAccount == nil {
		return nil, fmt.Errorf("unable to call push receive on an empty bridge/serviceAccount instance")
	}

	var pushType pushtypes.PushServiceTokenType
	switch runtime.GOOS {
	case "android":
		pushType = pushtypes.PushServiceTokenType_PushTokenFirebaseCloudMessaging
	case "ios", "darwin":
		pushType = pushtypes.PushServiceTokenType_PushTokenApplePushNotificationService
	default:
		pushType = pushtypes.PushServiceTokenType_PushTokenUndefined
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	res, err := b.serviceAccount.PushReceive(ctx, &accounttypes.PushReceive_Request{
		Payload:   inputB64,
		TokenType: pushType,
	})
	if err != nil {
		return nil, err
	}

	formatpush := res.GetPush()
	return (*FormatedPush)(formatpush), nil
}
