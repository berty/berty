package i18n

import (
	"embed"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
	"golang.org/x/text/message/catalog"
)

//go:embed locales_test
var locales_test embed.FS

func TestBasic(t *testing.T) {
	defaultLang := language.MustParse("en-US")
	const testKey = "testkey1"
	const testMessage = "testmessage1"

	builder := catalog.NewBuilder(catalog.Fallback(defaultLang))
	builder.SetString(defaultLang, testKey, testMessage)

	var c catalog.Catalog = builder
	p := message.NewPrinter(defaultLang, message.Catalog(c))

	msg := p.Sprintf(testKey)
	require.Equal(t, testMessage, msg)
}

func args(a ...interface{}) []interface{} { return a }

func TestLocalizationFiles(t *testing.T) {
	enUS := language.MustParse("en-US")
	frFR := language.MustParse("fr-FR")
	frCA := language.MustParse("fr-CA")
	esES := language.MustParse("es-ES")

	cases := []struct {
		lang     language.Tag
		key      string
		args     []interface{}
		result   string
		equality assert.ComparisonAssertionFunc
	}{
		{enUS, "key1", nil, "message1", assert.Equal},
		{enUS, "key2", nil, "message2", assert.Equal},
		{enUS, "nested.key1", nil, "nested_message_1", assert.Equal},
		{enUS, "keyWithValue", args("bart"), "bart just connected", assert.Equal},
		{enUS, "keyWithMultipleValue", args("bart", "lisa"), "bart and lisa just connected", assert.Equal},
		{enUS, "keyWithPluralCount", args(1), "there is one star in the sky", assert.Equal},
		{enUS, "keyWithPluralCount", args(10), "there are 10 stars in the sky", assert.Equal},
		{frFR, "keyWithPluralCount", args(11), "il y'a 11 etoiles dans le ciel", assert.Equal},
		{frCA, "keyWithPluralCount", args(11), "il y'a 11 etoiles dans le ciel", assert.Equal},
		{esES, "nested.key1", args(11), "nested_message_1", assert.Equal},
	}

	cat := NewCatalog(enUS)
	cat.Populate(locales_test)
	for _, tc := range cases {
		p := cat.NewPrinter(tc.lang)
		args := tc.args
		if args == nil {
			args = []interface{}{}
		}

		msg := p.Sprintf(tc.key, args...)
		tc.equality(t, tc.result, msg)
	}
}
