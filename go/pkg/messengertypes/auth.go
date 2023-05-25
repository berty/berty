package messengertypes

import (
	fmt "fmt"

	"github.com/gofrs/uuid"
)

func (m *AppMessage_ServiceAddToken) TokenID() string {
	return uuid.NewV5(uuid.NamespaceURL, fmt.Sprintf("%s/%s", m.AuthenticationURL, m.Token)).String()
}
