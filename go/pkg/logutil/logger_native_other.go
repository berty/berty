//go:build !darwin && !android
// +build !darwin,!android

package logutil

import (
	"fmt"
	"os"

	"go.uber.org/zap/zapcore"
)

func NativeLog(logLevel zapcore.Level, namespace string, message string) {
	fmt.Fprintf(os.Stderr, "[%s] [%s] %s\n", logLevel.CapitalString(), namespace, message)
}
