package config

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGenWorks(t *testing.T) {
	require.NotNil(t, Config.Berty.Contacts)
	for _, contact := range []string{"betabot", "testbot"} {
		require.NotNil(t, Config.Berty.Contacts[contact])
		require.NotEmpty(t, Config.Berty.Contacts[contact].Link)
	}
	require.NotNil(t, Config.P2P.RDVP)
	require.NotEmpty(t, Config.P2P.RDVP[0].Maddr)
}
