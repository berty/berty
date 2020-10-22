package banner

import (
	"fmt"
	mrand "math/rand"
	"time"
)

// Quote is a data type that stores the text of the quote and its author
type Quote struct {
	Author string
	Text   string
}

var quotes = []Quote{
	{"Albert Camus", "A free press can be good or bad, but, most certainly, without freedom a press will never be anything but bad."},
	{"Bruce Schneier", "Cryptography products may be declared illegal, but the information will never be."},
	{"Bruce Schneier", "If you think technology can solve your security problems, then you don't understand the problems and you don't understand the technology."},
	{"Bruce Schneier", "It is insufficient to protect ourselves with laws; we need to protect ourselves with mathematics. Encryption is too important to be left solely to governments."},
	{"Bruce Schneier", "Liberty requires security without intrusion, security plus privacy."},
	{"Cəlil Məmmədquluzadə", "Freedom and Liberty is like air, when you don't receive it, you suffer."},
	{"David Brin", "When it comes to privacy and accountability, people always demand the former for themselves and the latter for everyone else."},
	{"Earl Warren", "The fantastic advances in the field of electronic communication constitute a greater danger to the privacy of the individual."},
	{"Edmund Burke", "Better be despised for too anxious apprehensions, than ruined by too confident security."},
	{"Edward Snowden", "Arguing that you don't care about privacy because you have nothing to hide is no different than saying you don't care about free speech because you have nothing to say."},
	{"Evelyn Hall", "I disapprove of what you say, but I will defend to the death your right to say it."},
	{"Gabriel García Márquez", "All human beings have three lives: public, private, and secret."},
	{"Gary Kovacs", "Privacy is not an option, and it shouldn’t be the price we accept for just getting on the Internet."},
	{"George Orwell", "If liberty means anything at all, it means the right to tell people what they do not want to hear."},
	{"Harry Belafonte", "You can cage the singer but not the song."},
	{"Henry Stimson", "Gentlemen do not read each other's mail."},
	{"Jacob Appelbaum", "Cryptography shifts the balance of power from those with a monopoly on violence to those who comprehend mathematics and security design."},
	{"John Perry Barlow", "When cryptography is outlawed, bayl bhgynjf jvyy unir cevinpl."},
	{"Lawrence Samuels", "Decentralized systems are the quintessential patrons of simplicity. They allow complexity to rise to a level at which it is sustainable, and no higher."},
	{"Noam Chomsky", "If we don't believe in freedom of expression for people we despise, we don't believe in it at all."},
	{"Phil Zimmermann", "If privacy is outlawed, only outlaws will have privacy."},
	{"Robbie Sinclair", "Security is always excessive until it’s not enough."},
	{"Stephen King", "Friends don’t spy; true friendship is about privacy, too."},
	{"Tim Cook", "Right to privacy is really important. You pull that brick out and another and pretty soon the house falls."},
	{"Tom Smothers", "The only valid censorship of ideas is the right of people not to listen."},
	{"Ursula K. Le Guin", "Privacy, in fact, was almost as desirable for physics as it was for sex."},
	{"Voltaire", "We have a natural right to make use of our pens as of our tongue, at our peril, risk and hazard."},
}

// RandomQuote returns a random quote from the quote list.
// For the quote of the day, use the function QOTD instead.
func RandomQuote() Quote {
	return quotes[mrand.Intn(len(quotes))] // nolint:gosec
}

// QOTD returns the quote of the day for display in banners or other graphics.
// This is calculated by using the number of days (24 hr periods) since a
// fixed time as the seed for a random number generator.
// This will result in the same quote being returned during a 24 hr period
// even after subsequent calls.
// UTC time is used by default if local time is not available.
//
// BUG: The Go language cannot get local the local time on Android and iOS.
// This is a confirmed upstream issue, so mobile will always default to UTC.
func QOTD() Quote {
	base := time.Date(2000, time.January, 1, 0, 0, 0, 0, time.Local)
	seed := time.Since(base).Hours() / 24
	r := mrand.New(mrand.NewSource(int64(seed))) // nolint:gosec
	return quotes[r.Intn(len(quotes))]
}

func (q Quote) String() string {
	return fmt.Sprintf(`"%s" --%s`, q.Text, q.Author)
}
