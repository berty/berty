package main

import (
	"testing"

	"github.com/stretchr/testify/require"
	"moul.io/u"
)

func Test(t *testing.T) {
	cleanup, err := u.CaptureStderr()
	require.NoError(t, err)

	err = runMain([]string{"-h"})
	stderr := cleanup()
	require.Contains(t, err.Error(), "flag: help requested")

	require.Contains(t, stderr, "berty [global flags]")
}
