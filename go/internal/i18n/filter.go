package i18n

import (
	"strings"

	"golang.org/x/text/language"
)

type notSupported struct {
	lang  language.Tag
	forms []string
}

// since `validForm` method is not exposed by plural package, we need to do this
// manually
var NotSupportedForm = []notSupported{
	{
		lang:  language.Japanese,
		forms: []string{"one"},
	},
	{
		lang:  language.Chinese,
		forms: []string{"one"},
	},
}

func supported(form string, lang language.Tag) bool {
	blang, conf := lang.Base()
	if conf == language.No {
		return false
	}

	form = strings.ToLower(form)
	for _, s := range NotSupportedForm {
		nlang, _ := s.lang.Base()
		if nlang.String() == blang.String() {
			for _, f := range s.forms {
				if f == form {
					return false
				}
			}
		}
	}

	return true
}
