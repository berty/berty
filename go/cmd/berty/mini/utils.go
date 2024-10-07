package mini

import (
	"encoding/base64"
	"fmt"

	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

func openGroupFromString(url string) (*protocoltypes.Group, error) {
	link, err := bertylinks.UnmarshalLink(url, nil) // FIXME: support passing an optional passphrase to decrypt the link
	if err != nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(err)
	}
	if !link.IsGroup() {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("expected a group URL, got %q instead", link.GetKind()))
	}
	return link.GetBertyGroup().GetGroup(), nil
}

func pkAsShortID(pk []byte) string {
	if len(pk) > 24 {
		return base64.StdEncoding.EncodeToString(pk)[0:8]
	}

	return "--------"
}

func shortStringID(pk string) string {
	if len(pk) > 8 {
		return pk[0:8]
	}

	return pk
}
