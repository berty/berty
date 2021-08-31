package bertypush

import (
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type DecryptedPush pushtypes.DecryptedPush

const ServicePushPayloadKey = pushtypes.ServicePushPayloadKey

func PushDecryptStandaloneWithLogger(p Printer, rootDir string, inputB64 string) (*DecryptedPush, error) {
	logger := newLogger(p)
	return pushDecryptStandalone(logger, rootDir, inputB64)
}

func PushDecryptStandalone(rootDir string, inputB64 string) (*DecryptedPush, error) {
	logger := zap.NewNop()
	return pushDecryptStandalone(logger, rootDir, inputB64)
}

func pushDecryptStandalone(logger *zap.Logger, rootDir string, inputB64 string) (*DecryptedPush, error) {
	decrypted, err := bertypush.PushDecryptStandalone(logger, rootDir, inputB64)
	if err != nil {
		return nil, err
	}

	return (*DecryptedPush)(decrypted), nil
}
