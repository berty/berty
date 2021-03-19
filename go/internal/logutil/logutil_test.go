package logutil_test

import (
	"bufio"
	"io"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"moul.io/u"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/logutil"
)

func TestTypeStd(t *testing.T) {
	closer, err := u.CaptureStdoutAndStderr()

	logger, cleanup, err := logutil.NewLogger(
		logutil.NewStdStream("*", "light-console", "stdout"),
	)
	defer cleanup()
	if err != nil {
		panic(err)
	}

	require.NoError(t, err)
	logger.Info("hello world!")
	logger.Warn("hello world!")
	logger.Sync()
	lines := strings.Split(strings.TrimSpace(closer()), "\n")
	require.Equal(t, 2, len(lines))
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:28\thello world!", lines[0])
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:29\thello world!", lines[1])
}

func TestTypeRing(t *testing.T) {
	closer, err := u.CaptureStdoutAndStderr()
	ring := zapring.New(10 * 1024 * 1024) // 10MB ring-buffer
	defer ring.Close()
	logger, cleanup, err := logutil.NewLogger(
		logutil.NewRingStream("*", "light-console", ring),
	)
	defer cleanup()
	if err != nil {
		panic(err)
	}

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
