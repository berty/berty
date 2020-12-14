package protocoltypes

import (
	fmt "fmt"

	"github.com/gofrs/uuid"
)

func (m *ServiceToken) TokenID() string {
	return uuid.NewV5(uuid.NamespaceURL, fmt.Sprintf("%s/%s", m.AuthenticationURL, m.Token)).String()
}
