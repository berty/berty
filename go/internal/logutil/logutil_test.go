package logutil_test

import (
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
	require.Equal(t, "INFO \tbty               \tlogutil/logutil_test.go:26\thello world!", lines[0])
	require.Equal(t, "WARN \tbty               \tlogutil/logutil_test.go:27\thello world!", lines[1])
}

func TestTypeRing(t *testing.T) {
	closer, err := u.CaptureStdoutAndStderr()
	ring := zapring.New(10 * 1024 * 1024) // 10MB ring-buffer
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
}
