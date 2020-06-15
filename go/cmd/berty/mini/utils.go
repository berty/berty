package mini

import (
	"encoding/base64"

	"fmt"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/juju/fslock"
)

func openGroupFromString(data string) (*bertytypes.Group, error) {
	query, method, err := bertymessenger.NormalizeDeepLinkURL(data)

	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	} else if method != "/group" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected a /group URL, got %s instead", method))
	}

	res, err := bertymessenger.ParseGroupInviteURLQuery(query)
	if err != nil {
		return nil, err
	}

	return res.BertyGroup.Group, nil
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
