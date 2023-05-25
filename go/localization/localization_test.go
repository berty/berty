package localization

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestLoadCatalog(t *testing.T) {
	_, err := loadCatalog()
	require.NoError(t, err)
}
