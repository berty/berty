package main

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/logutil"
)

func TestPersistentIdentity(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("disabled on windows")
	}

	// @FIXME(gfanton): avoid write error caused by grpc logger
	logutil.ReplaceGRPCLogger(zap.NewNop())

	// create tempdir for the test
	var tempdir string
	{
		var err error
		tempdir, err = ioutil.TempDir("", "berty-main")
		require.NoError(t, err)
		defer os.RemoveAll(tempdir)
	}
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
		require.Equal(t, key1, key2)
	}
}
