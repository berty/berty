package mini

import (
	"encoding/base64"
	"fmt"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func openGroupFromString(url string) (*bertytypes.Group, error) {
	link, err := bertymessenger.UnmarshalLink(url)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}
	if !link.IsGroup() {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected a group URL, got %q instead", link.GetKind()))
	}
	return link.GetBertyGroup().GetGroup(), nil
}

func pkAsShortID(pk []byte) string {
	if len(pk) > 24 {
		return base64.StdEncoding.EncodeToString(pk)[0:8]
	}

	return "--------"
}
