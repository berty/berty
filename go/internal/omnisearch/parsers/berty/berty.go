package berty

import (
	"berty.tech/berty/v2/go/internal/omnisearch"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
)

type bertyParser struct{}

func New() omnisearch.Parser {
	return bertyParser{}
}

func (p bertyParser) Parse(previous *omnisearch.ResultReturn) *omnisearch.ResultReturn {
	str, ok := previous.Object.(string)
	if ok {
		r, err := bertymessenger.DecodeDeepLink(&bertymessenger.ParseDeepLink_Request{
			Link: str,
		})
		if err != nil {
			return nil
		}
		switch r.Kind {
		case bertymessenger.ParseDeepLink_BertyID:
			return &omnisearch.ResultReturn{
				Object:   r.BertyID,
				Finder:   p,
				Previous: previous,
			}
		case bertymessenger.ParseDeepLink_BertyGroup:
			return &omnisearch.ResultReturn{
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
