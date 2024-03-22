package bertypush

import (
	"strings"

	"go.uber.org/zap"
	"golang.org/x/text/language"
	"golang.org/x/text/message"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/localization"
	"berty.tech/berty/v2/go/pkg/bertypush"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/pkg/logutil"
)

type FormatedPush pushtypes.FormatedPush

const (
	ServicePushPayloadKey = pushtypes.ServicePushPayloadKey
	StorageKeyName        = accountutils.StorageKeyName
)

type Config struct {
	languages []string
	logger    *zap.Logger
}

func NewConfig() *Config {
	return &Config{
		languages: []string{},
		logger:    zap.NewNop(),
	}
}

func (c *Config) SetLogger(l *zap.Logger)           { c.logger = l }
func (c *Config) SetLoggerDriver(p LoggerDriver)    { c.logger = newLogger(p) }
func (c *Config) SetPreferredLanguages(lang string) { c.languages = strings.Split(lang, ",") }

type PushStandalone struct {
	logger  *zap.Logger
	printer *message.Printer
}

func NewPushStandalone(c *Config) *PushStandalone {
	if c.logger == nil {
		c.logger = logutil.NewNativeLogger("bertybridge")

		// @NOTE(gfanton): replace grpc logger as soon as possible to avoid DATA_RACE
		logutil.ReplaceGRPCLogger(c.logger.Named("grpc"))
	}

	tags := []language.Tag{}
	fields := []string{}
	for _, lang := range c.languages {
		tag, err := language.Parse(lang)
		if err != nil {
			c.logger.Warn("unable to parse language", zap.String("lang", lang), zap.Error(err))
			continue
		}

		fields = append(fields, tag.String())
		tags = append(tags, tag)
	}
	c.logger.Info("user preferred language loaded", zap.Strings("language", fields))

	catalog := localization.Catalog()
	return &PushStandalone{
		printer: catalog.NewPrinter(tags...),
		logger:  c.logger,
	}
}

type NativeKeystoreDriver interface {
	accountutils.NativeKeystore
}

func (s *PushStandalone) Decrypt(rootDir string, inputB64 string, ks NativeKeystoreDriver) (*FormatedPush, error) {
	decrypted, err := bertypush.PushDecryptStandalone(s.logger, rootDir, inputB64, ks)
	if err != nil {
		return nil, err
	}

	formated := bertypush.FormatDecryptedPush(decrypted, s.printer)
	return (*FormatedPush)(formated), err
}
