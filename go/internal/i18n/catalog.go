package i18n

import (
	"encoding/json"
	"io/fs"
	"path/filepath"
	"strings"

	"golang.org/x/text/language"
	"golang.org/x/text/message"
	"golang.org/x/text/message/catalog"
)

type Catalog struct {
	fallback language.Tag
	Builder  *catalog.Builder
}

func NewCatalog(defaultlang language.Tag) *Catalog {
	builder := catalog.NewBuilder(catalog.Fallback(defaultlang))
	return &Catalog{
		Builder:  builder,
		fallback: defaultlang,
	}
}

func (c *Catalog) NewPrinter(preferedlang ...language.Tag) *message.Printer {
	var cat catalog.Catalog = c.Builder
	preferedlang = append(preferedlang, c.fallback)
	tag, _, _ := cat.Matcher().Match(preferedlang...)
	return message.NewPrinter(tag, message.Catalog(cat))
}

func (c *Catalog) Populate(f fs.FS) error {
	const targetfile = "localization.json" // @TODO(gfanton): make this more customizable
	err := fs.WalkDir(f, ".", func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if entry.IsDir() {
			return nil
		}

		if filename := filepath.Base(path); strings.Compare(filename, targetfile) != 0 {
			// @NOTE(gfanton): skip invalid file or return an error ?
			return nil
		}

		lang := filepath.Base(filepath.Dir(path))
		content, err := fs.ReadFile(f, path)
		if err != nil {
			return err
		}

		tag := language.MustParse(lang)
		local := &localizationsJSON{
			Lang:    tag,
			Builder: c.Builder,
		}

		if err = json.Unmarshal(content, &local); err != nil {
			return err
		}

		return nil
	})

	return err
}
