package logutil_test

import (
	"bufio"
	"io"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	lumberjack "gopkg.in/natefinch/lumberjack.v2"
	"moul.io/u"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/logutil"
)

func TestTypeStd(t *testing.T) {
	closer, err := u.CaptureStdoutAndStderr()

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
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:29\thello world!", lines[0])
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:30\thello world!", lines[1])
}

func TestTypeRing(t *testing.T) {
	closer, err := u.CaptureStdoutAndStderr()

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
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:50\thello world!", scanner.Text())
	scanner.Scan()
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:51\thello world!", scanner.Text())
}

func TestTypeLumberjack(t *testing.T) {
	tempdir, err := ioutil.TempDir("", "logutil-lumberjack")
	require.NoError(t, err)

	closer, err := u.CaptureStdoutAndStderr()
	logger, cleanup, err := logutil.NewLogger(
		logutil.NewLumberjackStream("*", "light-console", &lumberjack.Logger{
			Filename: path.Join(tempdir, "test.log"),
		}),
	)
	require.NoError(t, err)
	defer cleanup()

	logger.Info("hello world!")
	logger.Warn("hello world!")
	logger.Sync()

	require.Empty(t, closer())

	content, err := ioutil.ReadFile(path.Join(tempdir, "test.log"))
	require.NoError(t, err)
	lines := strings.Split(string(content), "\n")
	require.Equal(t, 3, len(lines))
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:82\thello world!", lines[0])
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:83\thello world!", lines[1])
	require.Equal(t, "", lines[2])
}

func TestMultiple(t *testing.T) {
	// lumberjack
	tempdir, err := ioutil.TempDir("", "logutil-lumberjack")
	require.NoError(t, err)
	defer os.RemoveAll(tempdir)

	// ring
	ring := zapring.New(10 * 1024 * 1024) // 10MB ring-buffer
	defer ring.Close()

	closer, err := u.CaptureStdoutAndStderr()
	logger, cleanup, err := logutil.NewLogger(
		logutil.NewLumberjackStream("*", "light-console", &lumberjack.Logger{
			Filename: path.Join(tempdir, "test.log"),
		}),
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
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:118\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:119\thello world!", lines[1])
	}

	// lumberjack
	{
		content, err := ioutil.ReadFile(path.Join(tempdir, "test.log"))
		require.NoError(t, err)
		lines := strings.Split(string(content), "\n")
		require.Equal(t, 3, len(lines))
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:118\thello world!", lines[0])
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:119\thello world!", lines[1])
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
		require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:118\thello world!", scanner.Text())
		scanner.Scan()
		require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:119\thello world!", scanner.Text())
	}

	// FIXME: test that each logger can have its own format and filters
}
