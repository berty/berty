package i18n

import (
	"fmt"
	"sync"

	"go.uber.org/zap"

	"github.com/gobuffalo/packr/v2"
	goI18n "github.com/nicksnyder/go-i18n/v2/i18n"
	"golang.org/x/text/language"
	yaml "gopkg.in/yaml.v2"
)

type singleton struct {
	bundle   *goI18n.Bundle
	language *language.Tag
}

var instance *singleton
var once sync.Once

var languages = []string{"en", "fr"}

func i18n() *singleton {
	once.Do(func() {
		bundle := &goI18n.Bundle{
			DefaultLanguage: language.English,
		}

		bundle.RegisterUnmarshalFunc("yaml", yaml.Unmarshal)

		box := packr.New("Locales", "./locales")

		for _, lang := range languages {
			fileName := fmt.Sprintf("active.%s.yaml", lang)
			locBytes, err := box.Find(fileName)

			if err != nil {
				logger().Error(fmt.Sprintf("unable to load translation file for lang %s", lang), zap.Error(err))
			}

			if _, err := bundle.ParseMessageFileBytes(locBytes, fileName); err != nil {
				logger().Error("unable to load translation files", zap.Error(err))
			}
		}

		instance = &singleton{
			bundle:   bundle,
			language: &language.English,
		}
	})

	return instance
}

func SetLanguage(tag *language.Tag) {
	i18n().language = tag
}

func T(messageID string, templateData interface{}) string {
	return TCount(messageID, 1, templateData)
}

func TCount(messageID string, count int, templateData interface{}) string {
	i18nInstance := i18n()

	localizer := goI18n.NewLocalizer(i18nInstance.bundle, i18nInstance.language.String())

	t, err := localizer.Localize(&goI18n.LocalizeConfig{
		DefaultMessage: &goI18n.Message{
			ID: messageID,
		},
		TemplateData: templateData,
	})

	if err != nil {
		logger().Debug(fmt.Sprintf("unable to translate message %s in lang %s", messageID, i18nInstance.language))

		return messageID
	}

	return t
}
