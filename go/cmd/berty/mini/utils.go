package mini

import (
	"encoding/base64"
	"fmt"

	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func openGroupFromString(url string) (*protocoltypes.Group, error) {
	link, err := bertylinks.UnmarshalLink(url, nil) // FIXME: support passing an optional passphrase to decrypt the link
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
