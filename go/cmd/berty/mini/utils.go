package mini

import (
	"encoding/base64"
	"strings"

	"github.com/juju/fslock"

	"berty.tech/berty/go/pkg/bertyprotocol"
)

func openGroupFromString(data string) (*bertyprotocol.Group, error) {
	// Read invitation (as base64 on stdin)
	iB64, err := base64.StdEncoding.DecodeString(strings.TrimSpace(data))
	if err != nil {
		return nil, err
	}

	grp := &bertyprotocol.Group{}
	err = grp.Unmarshal(iB64)
	if err != nil {
		return nil, err
	}

	return grp, nil
}

func unlockFS(l *fslock.Lock) {
	if l == nil {
		return
	}

	err := l.Unlock()
	if err != nil {
		panic(err)
	}
}

func panicUnlockFS(err error, l *fslock.Lock) {
	unlockFS(l)
	panic(err)
}

func pkAsShortID(pk []byte) string {
	if len(pk) > 24 {
		return base64.StdEncoding.EncodeToString(pk)[0:8]
	}

	return "--------"
}
