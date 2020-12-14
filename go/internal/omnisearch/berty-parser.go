package omnisearch

import (
	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type bertyParser struct{}

func NewParser() Parser {
	return bertyParser{}
}

func (p bertyParser) Parse(previous *ResultReturn) *ResultReturn {
	str, ok := previous.Object.(string)
	if ok {
		r, err := bertylinks.UnmarshalLink(str, nil)
		if err != nil {
			return nil
		}
		switch r.Kind {
		case messengertypes.BertyLink_ContactInviteV1Kind:
			return &ResultReturn{
				Object:   r.BertyID,
				Finder:   p,
				Previous: previous,
			}
		case messengertypes.BertyLink_GroupV1Kind:
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
