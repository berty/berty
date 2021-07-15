package testing

import (
	"infratesting/config"
)

type Group struct {
	Name  string
	Tests []config.Test
	Peers []*Peer
}
