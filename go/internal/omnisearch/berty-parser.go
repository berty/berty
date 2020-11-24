package omnisearch

import (
	"berty.tech/berty/v2/go/pkg/bertymessenger"
)

type bertyParser struct{}

func NewParser() Parser {
	return bertyParser{}
}

func (p bertyParser) Parse(previous *ResultReturn) *ResultReturn {
	str, ok := previous.Object.(string)
	if ok {
		r, err := bertymessenger.DecodeDeepLink(str)
		if err != nil {
			return nil
		}
		switch r.Kind {
		case bertymessenger.ParseDeepLink_BertyID:
			return &ResultReturn{
				Object:   r.BertyID,
				Finder:   p,
				Previous: previous,
			}
		case bertymessenger.ParseDeepLink_BertyGroup:
			return &ResultReturn{
				Object:   r.BertyGroup,
				Finder:   p,
				Previous: previous,
			}
		}
	}
	return nil
}

func (bertyParser) Name() string {
	return "Berty Parser"
}

func (p bertyParser) String() string {
	return p.Name()
}
