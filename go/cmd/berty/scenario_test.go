package main

import (
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"berty.tech/berty/v2/go/internal/bertylinks"
	"github.com/stretchr/testify/require"
	"moul.io/u"
)

func TestPersistentIdentity(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("disabled on windows")
	}

	// create tempdir for the test
	tempdir := t.TempDir()

	var (
		pathBerty1 = filepath.Join(tempdir, "berty1")
		pathBerty2 = filepath.Join(tempdir, "berty2")
		pathExport = filepath.Join(tempdir, "export.tar")
	)

	// berty1: init a new account
	var key1 string
	{
		closer, err := u.CaptureStdout()
		require.NoError(t, err)
		err = runMain([]string{
			"share-invite",
			"-log.filters=none",
			"-store.dir", pathBerty1,
			"-no-qr",
		})
		require.NoError(t, err)
		key1 = strings.TrimSpace(closer())
		require.NotEmpty(t, key1)
		require.Contains(t, key1, "https://berty.tech/id")
	}

	link1, err := bertylinks.UnmarshalLink(key1, nil)
	require.NoError(t, err)
	t.Log("link1", link1)

	// berty1: export account
	{
		err := runMain([]string{
			"export",
			"-log.filters=none",
			"-store.dir", pathBerty1,
			"-export-path", pathExport,
		})
		require.NoError(t, err)
	}

	// berty2: init a new account from export
	{
		closer, err := u.CaptureStdout()
		require.NoError(t, err)
		err = runMain([]string{
			"share-invite",
			"-log.filters=none",
			"-store.dir", pathBerty2,
			"-node.restore-export-path", pathExport,
			"-no-qr",
		})
		require.NoError(t, err)
		key2 := strings.TrimSpace(closer())
		require.NotEmpty(t, key2)

		link2, err := bertylinks.UnmarshalLink(key2, nil)
		require.NoError(t, err)
		t.Log("link2", link2)

		// FIXME: don't know why the rdv seed changes
		require.Equal(t, link1.BertyID.AccountPK, link2.BertyID.AccountPK)
		require.Equal(t, link1.BertyID.DisplayName, link2.BertyID.DisplayName)
	}
}
