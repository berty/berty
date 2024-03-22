package i18n

import (
	"encoding/json"
	"fmt"
	"strings"

	"golang.org/x/text/feature/plural"
	"golang.org/x/text/language"
	"golang.org/x/text/message/catalog"
)

type ContentKind int

const (
	ContentKindMessage ContentKind = iota
	ContentKindNested
)

type ContentNode struct {
	Kind ContentKind

	Message string
	Nested  map[string]*ContentNode
}

func (n *ContentNode) UnmarshalJSON(b []byte) error {
	var value string
	if err := json.Unmarshal(b, &value); err == nil {
		n.Kind = ContentKindMessage
		n.Message = value
		return nil
	}

	node := make(map[string]*ContentNode)
	if err := json.Unmarshal(b, &node); err == nil {
		n.Kind = ContentKindNested
		n.Nested = node
		return nil
	}

	return fmt.Errorf("unable to parse content node")
}

type localizationsJSON struct {
	Builder *catalog.Builder
	Lang    language.Tag
}

func (l *localizationsJSON) UnmarshalJSON(b []byte) error {
	tree := make(map[string]*ContentNode)
	if err := json.Unmarshal(b, &tree); err != nil {
		return fmt.Errorf("unable to parse tree: %w", err)
	}

	if err := l.generateCatalog("", tree); err != nil {
		return fmt.Errorf("unable to populate catalog: %w", err)
	}

	return nil
}

type pcases struct {
	// Specific include Form such as `Zero` `One` `Two` `Few` `Many`, ``x=`, `x<`
	specific []interface{}
	// other is the last fallback
	other []interface{}
}

// other should always be set as last item
func (p *pcases) getSelectCases() []interface{} { return append(p.specific, p.other...) }

func (l *localizationsJSON) generateCatalog(root string, tree map[string]*ContentNode) error {
	selector := make(map[string]*pcases)
	for k, value := range tree {
		keys := strings.Split(k, "_")
		if len(keys) == 0 {
			return fmt.Errorf("cannot use empty key")
		}

		// format key
		var key string
		if root != "" {
			key = fmt.Sprintf("%s.%s", root, keys[0])
		} else {
			key = keys[0]
		}

		// is it nested ?
		if value.Kind == ContentKindNested {
			if err := l.generateCatalog(key, value.Nested); err != nil {
				return err
			}

			continue
		}

		if value.Message == "" {
			continue // skip empty value
		}

		// is it regular message ?
		if len(keys) == 1 {
			if err := l.Builder.SetString(l.Lang, key, value.Message); err != nil {
				return fmt.Errorf("unable to set string key `%s`: %w", key, err)
			}
			continue
		}

		form := keys[1]
		if !supported(form, l.Lang) {
			continue
		}

		// add it has plurals
		cases, ok := selector[key]
		if !ok {
			cases = &pcases{
				specific: []interface{}{},
				other:    []interface{}{},
			}
		}

		if strings.ToLower(form) == "other" {
			cases.other = []interface{}{form, value.Message}
		} else {
			cases.specific = []interface{}{form, value.Message}
		}

		selector[key] = cases
	}

	for key, cases := range selector {
		list := cases.getSelectCases()
		if err := l.Builder.Set(l.Lang, key, plural.Selectf(1, "", list...)); err != nil {
			return fmt.Errorf("unable to set plural key `%s`: %w", key, err)
		}
	}

	return nil
}
