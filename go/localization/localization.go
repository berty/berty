package localization

import (
	"embed"
	"fmt"
	"sync"

	"golang.org/x/text/language"

	"berty.tech/berty/v2/go/internal/i18n"
)

//go:embed locales
var locales embed.FS

var defaultlang = language.MustParse("en-US")

var (
	muCatalog sync.Mutex
	catalog   *i18n.Catalog
)

func loadCatalog() (*i18n.Catalog, error) {
	if catalog != nil {
		return catalog, nil
	}

	cat := i18n.NewCatalog(defaultlang)
	if err := cat.Populate(locales); err != nil {
		return nil, fmt.Errorf("unable to populate catalog: %w", err)
	}

	return cat, nil
}

func Catalog() *i18n.Catalog {
	muCatalog.Lock()
	defer muCatalog.Unlock()

	if catalog != nil {
		return catalog
	}

	cat, err := loadCatalog()
	if err != nil {
		panic(err)
	}

	return cat
}
