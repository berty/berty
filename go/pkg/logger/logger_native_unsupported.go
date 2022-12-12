//go:build !darwin && !android
// +build !darwin,!android

package logger

import (
	"fmt"
	"os"

	"go.uber.org/zap/zapcore"
)

func NativeLog(level zapcore.Level, namespace string, message string) {
	fmt.Fprintln(os.Stderr, message)
}
