package initutil

import (
	"fmt"

	"github.com/jeandeaual/go-locale"
	"golang.org/x/text/language"
)

func GetSystemLanguages() []language.Tag {
	languageTags := []language.Tag(nil)
	userLocales, err := locale.GetLocales()
	if err != nil || len(userLocales) == 0 {
		if err != nil {
			fmt.Println(err.Error())
		}

		userLocales = []string{"en-US"}
	}

	for _, lang := range userLocales {
		tag, err := language.Parse(lang)
		if err != nil {
			continue
		}

		languageTags = append(languageTags, tag)
	}

	return languageTags
}
