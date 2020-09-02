package banner

import (
	"testing"
)

func TestNoDoubleQuote(t *testing.T) {
	// Only store text no author.
	seenQuotes := []string{}
	for _, v := range quotes {
		for _, sv := range seenQuotes {
			if v.Text == sv {
				t.Errorf("Quote : \"%s\" is being seen multiple times.", sv)
			}
		}
		seenQuotes = append(seenQuotes, v.Text)
	}
}
