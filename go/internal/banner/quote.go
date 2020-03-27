package banner

import (
	"fmt"
	mrand "math/rand"
	"time"
)

type Quote struct {
	Author string
	Text   string
}

var quotes = []Quote{
	{"Albert Camus", "A free press can be good or bad, but, most certainly, without freedom a press will never be anything but bad."},
	{"Bruce Schneier", "Cryptography products may be declared illegal, but the information will never be."},
	{"Bruce Schneier", "If you think technology can solve your security problems, then you don't understand the problems and you don't understand the technology."},
	{"David Brin", "When it comes to privacy and accountability, people always demand the former for themselves and the latter for everyone else."},
	{"Edmund Burke", "Better be despised for too anxious apprehensions, than ruined by too confident security."},
	{"Gary Kovacs", "Privacy is not an option, and it shouldn’t be the price we accept for just getting on the Internet."},
	{"Harry Belafonte", "You can cage the singer but not the song."},
	{"John Perry Barlow", "When cryptography is outlawed, bayl bhgynjf jvyy unir cevinpl."},
	{"Noam Chomsky", "If we don't believe in freedom of expression for people we despise, we don't believe in it at all."},
	{"Robbie Sinclair", "Security is always excessive until it’s not enough."},
	{"Tom Smothers", "The only valid censorship of ideas is the right of people not to listen."},
	{"Voltaire", "We have a natural right to make use of our pens as of our tongue, at our peril, risk and hazard."},
}

func RandomQuote() Quote {
	return quotes[mrand.Intn(len(quotes))]
}

func QOTD() Quote {
	base := time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC) // FIXME: use local timezone if available
	seed := time.Since(base).Hours() / 24
	r := mrand.New(mrand.NewSource(int64(seed)))
	return quotes[r.Intn(len(quotes))]
}

func (q Quote) String() string {
	return fmt.Sprintf(`"%s" --%s`, q.Text, q.Author)
}
