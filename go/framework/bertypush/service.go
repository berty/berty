package bertypush

import (
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type DecryptedPush pushtypes.DecryptedPush

const (
	ServicePushPayloadKey = pushtypes.ServicePushPayloadKey
	StorageKeyName        = accountutils.StorageKeyName
)

func PushDecryptStandaloneWithLogger(p Printer, rootDir string, inputB64 string, storageKey []byte) (*DecryptedPush, error) {
	logger := newLogger(p)
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
