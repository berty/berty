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
	{"Bruce Schneier", "Liberty requires security without intrusion, security plus privacy."},
	{"Bruce Schneier", "It is insufficient to protect ourselves with laws; we need to protect ourselves with mathematics. Encryption is too important to be left solely to governments."},
	{"Cəlil Məmmədquluzadə", "Freedom and Liberty is like air, when you don't receive it, you suffer."},
	{"David Brin", "When it comes to privacy and accountability, people always demand the former for themselves and the latter for everyone else."},
	{"Edmund Burke", "Better be despised for too anxious apprehensions, than ruined by too confident security."},
	{"Edward Snowden", "Arguing that you don't care about privacy because you have nothing to hide is no different than saying you don't care about free speech because you have nothing to say."},
	{"Evelyn Hall", "I disapprove of what you say, but I will defend to the death your right to say it."},
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
	{"Tim Cook", "Right to privacy is really important. You pull that brick out and another and pretty soon the house falls."},
	{"Tom Smothers", "The only valid censorship of ideas is the right of people not to listen."},
	{"Voltaire", "We have a natural right to make use of our pens as of our tongue, at our peril, risk and hazard."},
}

func RandomQuote() Quote {
	return quotes[mrand.Intn(len(quotes))] // nolint:gosec
}

func QOTD() Quote {
	base := time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC) // FIXME: use local timezone if available
	seed := time.Since(base).Hours() / 24
	r := mrand.New(mrand.NewSource(int64(seed))) // nolint:gosec
	return quotes[r.Intn(len(quotes))]
}

func (q Quote) String() string {
	return fmt.Sprintf(`"%s" --%s`, q.Text, q.Author)
}
