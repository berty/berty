package bertypush

import (
	"fmt"
	"sync"

	"go.uber.org/zap"
	"golang.org/x/text/language"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/localization"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type (
	DecryptedPush pushtypes.DecryptedPush
	FormatedPush  pushtypes.FormatedPush
)

const (
	ServicePushPayloadKey = pushtypes.ServicePushPayloadKey
	StorageKeyName        = accountutils.StorageKeyName
)

var (
	mulang      sync.RWMutex
	currentLang = language.MustParse("en-US")
)

func SetLanguage(slang string) error {
	mulang.Lock()
	defer mulang.Lock()

	lang, err := language.Parse(slang)
	if err != nil {
		return fmt.Errorf("unable to parse language `%s`: %w", lang, err)
	}

	currentLang = lang
	return nil
}

func PushDecryptStandaloneWithLogger(p Printer, rootDir string, inputB64 string, storageKey []byte) (*FormatedPush, error) {
	logger := newLogger(p)
	return pushDecryptStandalone(logger, rootDir, inputB64, storageKey)
}

func PushDecryptStandalone(rootDir string, inputB64 string, storageKey []byte) (*FormatedPush, error) {
	logger := zap.NewNop()
	return pushDecryptStandalone(logger, rootDir, inputB64, storageKey)
}

func pushDecryptStandalone(logger *zap.Logger, rootDir string, inputB64 string, storageKey []byte) (*FormatedPush, error) {
	decrypted, err := bertypush.PushDecryptStandalone(logger, rootDir, inputB64, storageKey)
	if err != nil {
		return nil, err
	}

	catalog := localization.Catalog()

	mulang.RLock()
	p := catalog.NewPrinter(currentLang)
	mulang.RUnlock()

	formated := bertypush.FormatDecryptedPush(decrypted, p)
	return (*FormatedPush)(formated), err
}
