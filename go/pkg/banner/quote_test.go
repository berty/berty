package banner

import (
	"testing"
)

func TestQuotes(t *testing.T) {
	// Only store text no author.
	seenQuotes := []string{}
	for i, v := range quotes {
		if v.Text == "" {
			t.Errorf("Quote id : %d is empty.", i)
		}
		{
			var r rune
			for i, strv := range v.Text {
				if i == 0 && isNotIn(strv, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
					t.Errorf("Quote : %q doesn't start with right format.", v.Text)
				}
				r = strv
			}
			if isNotIn(r, ".!?") {
				t.Errorf("Quote : %q doesn't end with right format.", v.Text)
			}
		}
		for _, sv := range seenQuotes {
			if v.Text == sv {
				t.Errorf("Quote : %q is being seen multiple times.", sv)
			}
		}
		seenQuotes = append(seenQuotes, v.Text)
	}
}

func isNotIn(test rune, set string) bool {
	for _, v := range set {
		if test == v {
			return false
		}
	}
	return true
}
