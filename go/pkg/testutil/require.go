package testutil

import (
	"io"
	"testing"

	"github.com/stretchr/testify/require"
)

func Close(t *testing.T, closer io.Closer) {
	t.Helper()
	require.NoError(t, closer.Close())
}
