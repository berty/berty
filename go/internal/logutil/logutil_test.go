package logutil_test

import (
	"bufio"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"moul.io/u"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/logutil"
)

func TestTypeStd(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("unittest not consistent on windows, skipping.")
	}

	closer, err := u.CaptureStdoutAndStderr()
	require.NoError(t, err)

	logger, cleanup, err := logutil.NewLogger(
		logutil.NewStdStream("*", "light-console", "stdout"),
	)
	require.NoError(t, err)
	defer cleanup()

	logger.Info("hello world!")
	logger.Warn("hello world!")
	logger.Sync()
	lines := strings.Split(strings.TrimSpace(closer()), "\n")
	require.Equal(t, 2, len(lines))
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:34\thello world!", lines[0])
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:35\thello world!", lines[1])
}

func TestTypeRing(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("unittest not consistent on windows, skipping.")
	}

	closer, err := u.CaptureStdoutAndStderr()
	require.NoError(t, err)

	ring := zapring.New(10 * 1024 * 1024) // 10MB ring-buffer
	defer ring.Close()

	logger, cleanup, err := logutil.NewLogger(
		logutil.NewRingStream("*", "light-console", ring),
	)
	defer cleanup()
	require.NoError(t, err)

	logger.Info("hello world!")
	logger.Warn("hello world!")
	logger.Sync()

	require.Empty(t, closer())

	r, w := io.Pipe()
	go func() {
		_, err := ring.WriteTo(w)
		require.True(t, err == nil || err == io.EOF)
		w.Close()
	}()
	scanner := bufio.NewScanner(r)
	scanner.Scan()
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:60\thello world!", scanner.Text())
	scanner.Scan()
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:61\thello world!", scanner.Text())
}

func TestTypeFile(t *testing.T) {
	t.Run("fullpath", func(t *testing.T) {
		if runtime.GOOS == "windows" {
			t.Skip("unittest not consistent on windows, skipping.")
		}

		tempdir, err := ioutil.TempDir("", "logutil-file")
		require.NoError(t, err)

		filename := filepath.Join(tempdir, "test.log")

		closer, err := u.CaptureStdoutAndStderr()
		require.NoError(t, err)

		logger, cleanup, err := logutil.NewLogger(
			logutil.NewFileStream("*", "light-console", filename, ""),
		)
		require.NoError(t, err)
		defer cleanup()

		logger.Info("hello world!")
		logger.Warn("hello world!")
		logger.Sync()

		require.Empty(t, closer())

		content, err := ioutil.ReadFile(filename)
		require.NoError(t, err)
		lines := strings.Split(string(content), "\n")
		require.Equal(t, 3, len(lines))
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:99\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:100\thello world!", lines[1])
		require.Equal(t, "", lines[2])
	})

	t.Run("pattern", func(t *testing.T) {
		if runtime.GOOS == "windows" {
			t.Skip("unittest not consistent on windows, skipping.")
		}

		tempdir, err := ioutil.TempDir("", "logutil-file")
		require.NoError(t, err)

		closer, err := u.CaptureStdoutAndStderr()
		require.NoError(t, err)

		logger, cleanup, err := logutil.NewLogger(
			logutil.NewFileStream("*", "light-console", tempdir, "just.a.test"),
		)
		require.NoError(t, err)
		defer cleanup()

		logger.Info("hello world!")
		logger.Warn("hello world!")
		logger.Sync()

		require.Empty(t, closer())

		files, err := ioutil.ReadDir(tempdir)
		require.NoError(t, err)
		require.Len(t, files, 1)

		content, err := ioutil.ReadFile(filepath.Join(tempdir, files[0].Name()))
		require.NoError(t, err)
		lines := strings.Split(string(content), "\n")
		require.Equal(t, 3, len(lines))
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:131\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:132\thello world!", lines[1])
		require.Equal(t, "", lines[2])
	})
}

func TestMultiple(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("unittest not consistent on windows, skipping.")
	}

	tempdir, err := ioutil.TempDir("", "logutil-file")
	require.NoError(t, err)
	defer os.RemoveAll(tempdir)

	// ring
	ring := zapring.New(10 * 1024 * 1024) // 10MB ring-buffer
	defer ring.Close()

	closer, err := u.CaptureStdoutAndStderr()
	require.NoError(t, err)

	logger, cleanup, err := logutil.NewLogger(
		logutil.NewFileStream("*", "light-console", filepath.Join(tempdir, "test.log"), ""),
		logutil.NewRingStream("*", "light-console", ring),
		logutil.NewStdStream("*", "light-console", "stdout"),
	)
	require.NoError(t, err)
	defer cleanup()

	logger.Info("hello world!")
	logger.Warn("hello world!")
	logger.Sync()

	// std
	{
		lines := strings.Split(strings.TrimSpace(closer()), "\n")
		require.Equal(t, 2, len(lines))
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:175\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:176\thello world!", lines[1])
	}

	// file
	{
		content, err := ioutil.ReadFile(filepath.Join(tempdir, "test.log"))
		require.NoError(t, err)
		lines := strings.Split(string(content), "\n")
		require.Equal(t, 3, len(lines))
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:175\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:176\thello world!", lines[1])
		require.Equal(t, "", lines[2])
	}

	// ring
	{
		r, w := io.Pipe()
		go func() {
			_, err := ring.WriteTo(w)
			require.True(t, err == nil || err == io.EOF)
			w.Close()
		}()
		scanner := bufio.NewScanner(r)
		scanner.Scan()
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:175\thello world!", scanner.Text())
		scanner.Scan()
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:176\thello world!", scanner.Text())
	}

	// FIXME: test that each logger can have its own format and filters
}

// FIXME: add unit test for NewCustomStream
