package bertybridge

import (
	"context"
	"fmt"
	"runtime"
	"time"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type DecryptedPush pushtypes.DecryptedPush

const (
	ServicePushPayloadKey = pushtypes.ServicePushPayloadKey
	StorageKeyName        = accountutils.StorageKeyName
)

func PushDecryptStandaloneWithLogger(p Printer, rootDir string, inputB64 string, storageKey []byte) (*DecryptedPush, error) {
	logger := newPrinterLogger(p)
	return pushDecryptStandalone(logger, rootDir, inputB64, storageKey)
}

func PushDecryptStandalone(rootDir string, inputB64 string, storageKey []byte) (*DecryptedPush, error) {
	logger := zap.NewNop()
	return pushDecryptStandalone(logger, rootDir, inputB64, storageKey)
}

func pushDecryptStandalone(logger *zap.Logger, rootDir string, inputB64 string, storageKey []byte) (*DecryptedPush, error) {
	decrypted, err := bertypush.PushDecryptStandalone(logger, rootDir, inputB64, storageKey)
	if err != nil {
		return nil, err
	}

	return (*DecryptedPush)(decrypted), nil
}

func (b *Bridge) PushDecrypt(inputB64 string) (*DecryptedPush, error) {
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

	decrypt := res.GetPushData()
	return (*DecryptedPush)(decrypt), nil
}
