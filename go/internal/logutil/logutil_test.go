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
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"moul.io/u"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/zapcoregorm"
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
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:38\thello world!", lines[0])
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:39\thello world!", lines[1])
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
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:64\thello world!", scanner.Text())
	scanner.Scan()
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:65\thello world!", scanner.Text())
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
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:103\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:104\thello world!", lines[1])
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
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:135\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:136\thello world!", lines[1])
		require.Equal(t, "", lines[2])
	})
}

func TestTypeSQLite(t *testing.T) {
	key := []byte("42424242424242424242424242424242")
	const kind = "just.a.test"

	t.Run("fullpath", func(t *testing.T) {
		if runtime.GOOS == "windows" {
			t.Skip("unittest not consistent on windows, skipping.")
		}

		tempdir, err := ioutil.TempDir("", "logutil-sqlite")
		require.NoError(t, err)

		filename := filepath.Join(tempdir, "test.sqlite")

		closer, err := u.CaptureStdoutAndStderr()
		require.NoError(t, err)

		logger, cleanup, err := logutil.NewLogger(
			logutil.NewSQLiteStream("*", "light-console", filename, kind, key),
		)
		require.NoError(t, err)
		defer cleanup()

		testMessage := "hello world!"
		logger.Info(testMessage)
		logger.Warn(testMessage)
		logger.Sync()

		require.Empty(t, closer())

		db, closeDB, err := accountutils.GetGormDBForPath(filename, key, zap.NewNop())
		require.NoError(t, err)
		defer closeDB()

		sessions, err := zapcoregorm.LogSessionList(db)
		require.NoError(t, err)
		require.Len(t, sessions, 1)
		require.Equal(t, kind, sessions[0].Kind)
		require.Equal(t, uint(1), sessions[0].ID)

		entries, err := zapcoregorm.LogEntriesList(db, sessions[0].ID)
		require.NoError(t, err)
		require.Equal(t, 2, len(entries))

		require.Equal(t, testMessage, entries[0].Message)
		require.Equal(t, "bty", entries[0].LoggerName)
		require.Equal(t, zapcore.InfoLevel, entries[0].Level)
		require.True(t, strings.HasSuffix(entries[0].File, "logutil_test.go"))
		require.Equal(t, 179, entries[0].Line)

		require.Equal(t, testMessage, entries[1].Message)
		require.Equal(t, "bty", entries[1].LoggerName)
		require.Equal(t, zapcore.WarnLevel, entries[1].Level)
		require.True(t, strings.HasSuffix(entries[1].File, "logutil_test.go"))
		require.Equal(t, 180, entries[1].Line)
	})

	t.Run("pattern", func(t *testing.T) {
		if runtime.GOOS == "windows" {
			t.Skip("unittest not consistent on windows, skipping.")
		}

		tempdir, err := ioutil.TempDir("", "logutil-sqlite")
		require.NoError(t, err)

		filename := filepath.Join(tempdir, "test2.sqlite")

		closer, err := u.CaptureStdoutAndStderr()
		require.NoError(t, err)

		logger, cleanup, err := logutil.NewLogger(
			logutil.NewSQLiteStream("*", "light-console", filename, kind, key),
		)
		require.NoError(t, err)
		defer cleanup()

		testMessage := "hello world !"
		logger.Info(testMessage)
		logger.Warn(testMessage)
		logger.Sync()

		require.Empty(t, closer())

		db, closeDB, err := accountutils.GetGormDBForPath(filename, key, zap.NewNop())
		require.NoError(t, err)
		defer closeDB()

		sessions, err := zapcoregorm.LogSessionList(db)
		require.NoError(t, err)
		require.Len(t, sessions, 1)
		require.Equal(t, kind, sessions[0].Kind)
		require.Equal(t, uint(1), sessions[0].ID)

		entries, err := zapcoregorm.LogEntriesList(db, sessions[0].ID)
		require.NoError(t, err)
		require.Equal(t, 2, len(entries))

		require.Equal(t, testMessage, entries[0].Message)
		require.Equal(t, "bty", entries[0].LoggerName)
		require.Equal(t, zapcore.InfoLevel, entries[0].Level)
		require.True(t, strings.HasSuffix(entries[0].File, "logutil_test.go"))
		require.Equal(t, 232, entries[0].Line)

		require.Equal(t, testMessage, entries[1].Message)
		require.Equal(t, "bty", entries[1].LoggerName)
		require.Equal(t, zapcore.WarnLevel, entries[1].Level)
		require.True(t, strings.HasSuffix(entries[1].File, "logutil_test.go"))
		require.Equal(t, 233, entries[1].Line)
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
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:290\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:291\thello world!", lines[1])
	}

	// file
	{
		content, err := ioutil.ReadFile(filepath.Join(tempdir, "test.log"))
		require.NoError(t, err)
		lines := strings.Split(string(content), "\n")
		require.Equal(t, 3, len(lines))
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:290\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:291\thello world!", lines[1])
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
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:290\thello world!", scanner.Text())
		scanner.Scan()
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:291\thello world!", scanner.Text())
	}

	// FIXME: test that each logger can have its own format and filters
}

// FIXME: add unit test for NewCustomStream
